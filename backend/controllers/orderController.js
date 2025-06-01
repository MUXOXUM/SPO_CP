const { Order, OrderItem, Product, Customer, sequelize } = require('../models');

// Создание нового заказа
const createOrder = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { items, shipping_address } = req.body;
        const customer = await Customer.findOne({ 
            where: { user_id: req.user.user_id }
        });

        if (!customer) {
            await t.rollback();
            return res.status(404).json({ error: 'Customer profile not found' });
        }

        // Проверяем наличие товаров и рассчитываем общую сумму
        let total_amount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.product_id);
            if (!product) {
                await t.rollback();
                return res.status(404).json({ 
                    error: `Product with id ${item.product_id} not found` 
                });
            }

            if (product.stock_quantity < item.quantity) {
                await t.rollback();
                return res.status(400).json({ 
                    error: `Not enough stock for product ${product.product_id}` 
                });
            }

            total_amount += product.price * item.quantity;
            orderItems.push({
                product,
                quantity: item.quantity
            });
        }

        // Создаем заказ
        const order = await Order.create({
            customer_id: customer.customer_id,
            total_amount,
            shipping_address: shipping_address || customer.address,
            status: 'pending'
        }, { transaction: t });

        // Создаем позиции заказа и обновляем количество товаров
        for (const item of orderItems) {
            await OrderItem.create({
                order_id: order.order_id,
                product_id: item.product.product_id,
                quantity: item.quantity,
                unit_price: item.product.price
            }, { transaction: t });

            // Обновляем количество товара
            await item.product.update({
                stock_quantity: item.product.stock_quantity - item.quantity
            }, { transaction: t });
        }

        await t.commit();

        // Получаем заказ с деталями
        const orderWithDetails = await Order.findByPk(order.order_id, {
            include: [{
                model: OrderItem,
                include: [Product]
            }]
        });

        res.status(201).json(orderWithDetails);
    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: error.message });
    }
};

// Получение списка заказов пользователя
const getUserOrders = async (req, res) => {
    try {
        const customer = await Customer.findOne({ 
            where: { user_id: req.user.user_id } 
        });

        if (!customer) {
            return res.status(404).json({ error: 'Customer profile not found' });
        }

        const orders = await Order.findAll({
            where: { customer_id: customer.customer_id },
            include: [{
                model: OrderItem,
                include: [Product]
            }],
            order: [['order_date', 'DESC']]
        });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Получение деталей конкретного заказа
const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findOne({ 
            where: { user_id: req.user.user_id } 
        });

        if (!customer) {
            return res.status(404).json({ error: 'Customer profile not found' });
        }

        const order = await Order.findOne({
            where: { 
                order_id: id,
                customer_id: customer.customer_id
            },
            include: [{
                model: OrderItem,
                include: [Product]
            }]
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderDetails
}; 