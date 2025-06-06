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

// Получение топ продаваемых товаров
const getTopProducts = async (req, res) => {
    console.log('[Dashboard] Getting top products...');
    try {
        console.log('[Dashboard] Executing query for top products...');
        const topProducts = await Product.findAll({
            attributes: [
                'product_id',
                'format',
                [Sequelize.fn('SUM', Sequelize.col('OrderItems.quantity')), 'total_sold'],
                [Sequelize.fn('SUM', 
                    Sequelize.literal('OrderItems.quantity * OrderItems.price')
                ), 'total_revenue']
            ],
            include: [{
                model: OrderItem,
                attributes: [],
                required: false
            }],
            group: ['Products.product_id', 'Products.format'],
            order: [[Sequelize.literal('total_sold DESC')]],
            limit: 10,
            raw: true
        });

        console.log(`[Dashboard] Found ${topProducts.length} top products`);
        console.log('[Dashboard] Top products sample:', JSON.stringify(topProducts[0] || {}, null, 2));
        
        res.json(topProducts);
    } catch (error) {
        console.error('[Dashboard] Error in getTopProducts:', error);
        console.error('[Dashboard] Error stack:', error.stack);
        console.error('[Dashboard] SQL Query:', error.sql);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getGeneralStats,
    getSalesTimeline,
    getTopProducts
}; 