const { Order, Product, Customer, Review, sequelize } = require('../models');
const { Op } = require('sequelize');

// Получение общей статистики
const getGeneralStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Статистика по заказам
        const orderStats = await Order.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('order_id')), 'total_orders'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue']
            ],
            where: {
                order_date: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            }
        });

        // Количество клиентов
        const customerCount = await Customer.count();

        // Товары с низким запасом (меньше 5 штук)
        const lowStockProducts = await Product.count({
            where: {
                stock_quantity: {
                    [Op.lt]: 5
                }
            }
        });

        // Средний рейтинг
        const avgRating = await Review.findAll({
            attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating']
            ]
        });

        res.json({
            monthly_orders: orderStats[0].dataValues.total_orders || 0,
            monthly_revenue: orderStats[0].dataValues.total_revenue || 0,
            total_customers: customerCount,
            low_stock_products: lowStockProducts,
            average_rating: avgRating[0].dataValues.average_rating || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Получение статистики продаж по времени
const getSalesTimeline = async (req, res) => {
    try {
        const { period = 'month' } = req.query;
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

        const sales = await Order.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('order_date')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('order_id')), 'orders'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
            ],
            where: {
                order_date: {
                    [Op.gte]: startDate
                }
            },
            group: [sequelize.fn('DATE', sequelize.col('order_date'))],
            order: [[sequelize.fn('DATE', sequelize.col('order_date')), 'ASC']]
        });

        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Получение топ продаваемых товаров
const getTopProducts = async (req, res) => {
    try {
        const topProducts = await Product.findAll({
            attributes: [
                'product_id',
                'format',
                [sequelize.fn('SUM', sequelize.col('OrderItems.quantity')), 'total_sold']
            ],
            include: [{
                model: OrderItem,
                attributes: []
            }],
            group: ['Product.product_id'],
            order: [[sequelize.fn('SUM', sequelize.col('OrderItems.quantity')), 'DESC']],
            limit: 10
        });

        res.json(topProducts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getGeneralStats,
    getSalesTimeline,
    getTopProducts
}; 