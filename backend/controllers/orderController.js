const { Order, OrderItem, Product, Album, User, Artist } = require('../models');

// Создание нового заказа
const createOrder = async (req, res) => {
    try {
        const { items, paymentMethod, shippingAddress } = req.body;
        const userId = req.user.userId;

        // Создаем заказ
        const order = await Order.create({
            user_id: userId,
            order_date: new Date(),
            status: 'new',
            payment_method: paymentMethod,
            shipping_address: shippingAddress,
            total_amount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        });

        // Добавляем товары в заказ
        for (const item of items) {
            await OrderItem.create({
                order_id: order.order_id,
                product_id: item.productId,
                quantity: item.quantity,
                price: item.price
            });

            // Обновляем количество товара на складе
            const product = await Product.findByPk(item.productId);
            if (product) {
                await product.update({
                    stock_quantity: product.stock_quantity - item.quantity
                });
            }
        }

        res.status(201).json({
            message: 'Заказ успешно создан',
            orderId: order.order_id
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Ошибка при создании заказа' });
    }
};

// Получение списка заказов пользователя
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.userId;

        const orders = await Order.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: OrderItem,
                    include: [
                        {
                            model: Product,
                            include: [Album]
                        }
                    ]
                }
            ],
            order: [['order_date', 'DESC']]
        });

        const formattedOrders = orders.map(order => ({
            id: order.order_id,
            date: order.order_date,
            status: order.status,
            items: order.OrderItems.map(item => ({
                id: item.order_item_id,
                quantity: item.quantity,
                price: parseFloat(item.price),
                product: {
                    id: item.Product.product_id,
                    format: item.Product.format,
                    albumTitle: item.Product.Album.title,
                    artist: item.Product.Album.artist
                }
            })),
            total: order.OrderItems.reduce((sum, item) => 
                sum + (parseFloat(item.price) * item.quantity), 0)
        }));

        res.json(formattedOrders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ error: 'Ошибка при получении заказов' });
    }
};

// Получение деталей конкретного заказа
const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const order = await Order.findOne({
            where: { 
                order_id: id,
                user_id: userId
            },
            include: [
                {
                    model: OrderItem,
                    include: [
                        {
                            model: Product,
                            include: [Album]
                        }
                    ]
                },
                {
                    model: User,
                    attributes: ['first_name', 'last_name', 'email', 'phone', 'address']
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        const formattedOrder = {
            id: order.order_id,
            date: order.order_date,
            status: order.status,
            customer: {
                name: `${order.User.first_name} ${order.User.last_name}`,
                email: order.User.email,
                phone: order.User.phone,
                address: order.User.address
            },
            items: order.OrderItems.map(item => ({
                id: item.order_item_id,
                quantity: item.quantity,
                price: parseFloat(item.price),
                product: {
                    id: item.Product.product_id,
                    format: item.Product.format,
                    albumTitle: item.Product.Album.title,
                    artist: item.Product.Album.artist
                }
            })),
            total: order.OrderItems.reduce((sum, item) => 
                sum + (parseFloat(item.price) * item.quantity), 0)
        };

        res.json(formattedOrder);
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ error: 'Ошибка при получении деталей заказа' });
    }
};

// Получение списка всех заказов
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: User,
                    as: 'customer',
                    attributes: ['first_name', 'last_name', 'email', 'phone']
                },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{
                        model: Product,
                        as: 'product',
                        include: [{
                            model: Album,
                            include: [{
                                model: Artist,
                                attributes: ['name']
                            }],
                            attributes: ['title']
                        }]
                    }]
                }
            ],
            order: [['order_date', 'DESC']]
        });

        const formattedOrders = orders.map(order => ({
            id: order.order_id,
            orderDate: order.order_date,
            totalAmount: order.total_amount,
            status: order.status,
            customer: {
                firstName: order.customer.first_name,
                lastName: order.customer.last_name,
                email: order.customer.email,
                phone: order.customer.phone
            },
            items: order.items.map(item => ({
                id: item.order_item_id,
                quantity: item.quantity,
                price: item.price,
                product: {
                    name: `${item.product.Album.Artist.name} - ${item.product.Album.title} (${item.product.format})`
                }
            }))
        }));

        res.json(formattedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Ошибка при получении списка заказов' });
    }
};

// Обновление статуса заказа
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        await order.update({ status });

        res.json({ message: 'Статус заказа успешно обновлен' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Ошибка при обновлении статуса заказа' });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderDetails,
    getAllOrders,
    updateOrderStatus
}; 