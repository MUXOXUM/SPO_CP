const { Purchase, PurchaseItem, Product, Supplier, User } = require('../models');

// Создание новой поставки
const createPurchase = async (req, res) => {
    try {
        const { supplierId, items } = req.body;
        const userId = req.user.userId;

        // Создаем закупку
        const purchase = await Purchase.create({
            supplier_id: supplierId,
            user_id: userId,
            purchase_date: new Date(),
            status: 'pending'
        });

        // Добавляем товары в закупку
        for (const item of items) {
            await PurchaseItem.create({
                purchase_id: purchase.purchase_id,
                product_id: item.productId,
                quantity: item.quantity,
                price: item.price
            });

            // Обновляем количество товара на складе
            const product = await Product.findByPk(item.productId);
            if (product) {
                await product.update({
                    stock_quantity: product.stock_quantity + item.quantity
                });
            }
        }

        res.status(201).json({
            message: 'Закупка успешно создана',
            purchaseId: purchase.purchase_id
        });
    } catch (error) {
        console.error('Error creating purchase:', error);
        res.status(500).json({ error: 'Ошибка при создании закупки' });
    }
};

// Получение списка всех поставок
const getAllPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.findAll({
            include: [
                {
                    model: PurchaseItem,
                    include: [Product]
                },
                {
                    model: Supplier,
                    attributes: ['name', 'contact_person', 'phone']
                },
                {
                    model: User,
                    attributes: ['first_name', 'last_name']
                }
            ],
            order: [['purchase_date', 'DESC']]
        });

        const formattedPurchases = purchases.map(purchase => ({
            id: purchase.purchase_id,
            date: purchase.purchase_date,
            status: purchase.status,
            supplier: {
                name: purchase.Supplier.name,
                contactPerson: purchase.Supplier.contact_person,
                phone: purchase.Supplier.phone
            },
            manager: {
                name: `${purchase.User.first_name} ${purchase.User.last_name}`
            },
            items: purchase.PurchaseItems.map(item => ({
                id: item.purchase_item_id,
                quantity: item.quantity,
                price: parseFloat(item.price),
                product: {
                    id: item.Product.product_id,
                    format: item.Product.format,
                    title: item.Product.title
                }
            })),
            total: purchase.PurchaseItems.reduce((sum, item) => 
                sum + (parseFloat(item.price) * item.quantity), 0)
        }));

        res.json(formattedPurchases);
    } catch (error) {
        console.error('Error fetching purchases:', error);
        res.status(500).json({ error: 'Ошибка при получении списка закупок' });
    }
};

// Обновление статуса поставки
const updatePurchaseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const purchase = await Purchase.findByPk(id);
        if (!purchase) {
            return res.status(404).json({ error: 'Закупка не найдена' });
        }

        // Проверяем допустимость статуса
        const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Недопустимый статус' });
        }

        await purchase.update({ status });

        res.json({
            id: purchase.purchase_id,
            status: purchase.status,
            message: 'Статус закупки успешно обновлен'
        });
    } catch (error) {
        console.error('Error updating purchase status:', error);
        res.status(500).json({ error: 'Ошибка при обновлении статуса закупки' });
    }
};

module.exports = {
    createPurchase,
    getAllPurchases,
    updatePurchaseStatus
}; 