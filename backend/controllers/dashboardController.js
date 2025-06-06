const { Order, Product, User, Review, OrderItem } = require('../models');
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Получение общей статистики
const getGeneralStats = async (req, res) => {
    console.log('[Dashboard] Getting general stats...');
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        console.log(`[Dashboard] Date range: ${startOfMonth.toISOString()} - ${endOfMonth.toISOString()}`);

        // Статистика по заказам
        console.log('[Dashboard] Fetching order statistics...');
        const orderStats = await Order.findAll({
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.col('order_id')), 'total_orders'],
                [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'total_revenue']
            ],
            where: {
                order_date: {
                    [Sequelize.Op.between]: [startOfMonth, endOfMonth]
                }
            }
        });
        console.log('[Dashboard] Order stats:', JSON.stringify(orderStats[0]?.dataValues || {}, null, 2));

        // Количество клиентов (только с ролью customer)
        console.log('[Dashboard] Counting active customers...');
        const customerCount = await User.count({
            where: {
                role: 'customer',
                is_active: true
            }
        });
        console.log(`[Dashboard] Active customers count: ${customerCount}`);

        // Товары с низким запасом (меньше 5 штук)
        console.log('[Dashboard] Checking low stock products...');
        const lowStockProducts = await Product.count({
            where: {
                stock_quantity: {
                    [Sequelize.Op.lt]: 5
                }
            }
        });
        console.log(`[Dashboard] Low stock products count: ${lowStockProducts}`);

        // Средний рейтинг
        console.log('[Dashboard] Calculating average rating...');
        const avgRating = await Review.findAll({
            attributes: [
                [Sequelize.fn('AVG', Sequelize.col('rating')), 'average_rating']
            ]
        });
        console.log('[Dashboard] Average rating:', JSON.stringify(avgRating[0]?.dataValues || {}, null, 2));

        const response = {
            monthly_orders: orderStats[0]?.dataValues.total_orders || 0,
            monthly_revenue: orderStats[0]?.dataValues.total_revenue || 0,
            total_customers: customerCount,
            low_stock_products: lowStockProducts,
            average_rating: Number(avgRating[0]?.dataValues.average_rating || 0).toFixed(2)
        };
        
        console.log('[Dashboard] Sending response:', JSON.stringify(response, null, 2));
        res.json(response);
    } catch (error) {
        console.error('[Dashboard] Error in getGeneralStats:', error);
        console.error('[Dashboard] Error stack:', error.stack);
        res.status(500).json({ error: error.message });
    }
};

// Получение статистики продаж по времени
const getSalesTimeline = async (req, res) => {
    console.log('[Dashboard] Getting sales timeline...');
    try {
        const { period = 'month' } = req.query;
        console.log(`[Dashboard] Requested period: ${period}`);
        
        const today = new Date();
        let startDate;

        switch (period) {
            case 'week':
                startDate = new Date(today.setDate(today.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(today.setMonth(today.getMonth() - 1));
                break;
            case 'year':
                startDate = new Date(today.setFullYear(today.getFullYear() - 1));
                break;
            default:
                startDate = new Date(today.setMonth(today.getMonth() - 1));
        }
        
        console.log(`[Dashboard] Calculated start date: ${startDate.toISOString()}`);

        console.log('[Dashboard] Fetching sales data...');
        const sales = await Order.findAll({
            attributes: [
                [Sequelize.fn('DATE', Sequelize.col('order_date')), 'date'],
                [Sequelize.fn('COUNT', Sequelize.col('order_id')), 'orders'],
                [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'revenue']
            ],
            where: {
                order_date: {
                    [Sequelize.Op.gte]: startDate
                }
            },
            group: [Sequelize.fn('DATE', Sequelize.col('order_date'))],
            order: [[Sequelize.fn('DATE', Sequelize.col('order_date')), 'ASC']]
        });

        console.log(`[Dashboard] Found ${sales.length} days with sales data`);
        console.log('[Dashboard] Sales data sample:', JSON.stringify(sales[0]?.dataValues || {}, null, 2));
        
        res.json(sales);
    } catch (error) {
        console.error('[Dashboard] Error in getSalesTimeline:', error);
        console.error('[Dashboard] Error stack:', error.stack);
        res.status(500).json({ error: error.message });
    }
};

// Получение статистики роста числа клиентов
const getCustomerGrowth = async (req, res) => {
    console.log('[Dashboard] Getting customer growth stats...');
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        
        console.log(`[Dashboard] Date range: ${startOfMonth.toISOString()} - ${today.toISOString()}`);

        const customerGrowth = await User.findAll({
            attributes: [
                [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
                [Sequelize.fn('COUNT', Sequelize.col('user_id')), 'new_customers']
            ],
            where: {
                role: 'customer',
                createdAt: {
                    [Sequelize.Op.between]: [startOfMonth, today]
                }
            },
            group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
            order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']],
            raw: true
        });

        console.log(`[Dashboard] Found customer growth data for ${customerGrowth.length} days`);
        console.log('[Dashboard] Growth data sample:', JSON.stringify(customerGrowth[0] || {}, null, 2));
        
        res.json(customerGrowth);
    } catch (error) {
        console.error('[Dashboard] Error in getCustomerGrowth:', error);
        console.error('[Dashboard] Error stack:', error.stack);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getGeneralStats,
    getSalesTimeline,
    getCustomerGrowth
}; 