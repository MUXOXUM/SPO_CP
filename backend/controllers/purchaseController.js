const { Purchase, PurchaseItem, Product, Supplier, Employee, sequelize } = require('../models');

// Создание новой поставки
const createPurchase = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { supplier_id, items } = req.body;
        const employee = await Employee.findOne({
            where: { user_id: req.user.user_id }
        });

        if (!employee) {
            await t.rollback();
            return res.status(404).json({ error: 'Employee profile not found' });
        }

        // Проверяем существование поставщика
        const supplier = await Supplier.findByPk(supplier_id);
        if (!supplier) {
            await t.rollback();
            return res.status(404).json({ error: 'Supplier not found' });
        }

        // Рассчитываем общую сумму
        let total_amount = 0;
        const purchaseItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.product_id);
            if (!product) {
                await t.rollback();
                return res.status(404).json({
                    error: `Product with id ${item.product_id} not found`
                });
            }

            total_amount += item.unit_price * item.quantity;
            purchaseItems.push({
                product,
                quantity: item.quantity,
                unit_price: item.unit_price
            });
        }

        // Создаем поставку
        const purchase = await Purchase.create({
            supplier_id,
            employee_id: employee.employee_id,
            total_amount,
            status: 'pending'
        }, { transaction: t });

        // Создаем позиции поставки и обновляем количество товаров
        for (const item of purchaseItems) {
            await PurchaseItem.create({
                purchase_id: purchase.purchase_id,
                product_id: item.product.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price
            }, { transaction: t });

            // Обновляем количество товара
            await item.product.update({
                stock_quantity: item.product.stock_quantity + item.quantity
            }, { transaction: t });
        }

        await t.commit();

        // Получаем поставку с деталями
        const purchaseWithDetails = await Purchase.findByPk(purchase.purchase_id, {
            include: [{
                model: PurchaseItem,
                include: [Product]
            }, {
                model: Supplier
            }, {
                model: Employee
            }]
        });

        res.status(201).json(purchaseWithDetails);
    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: error.message });
    }
};

// Получение списка всех поставок
const getAllPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.findAll({
            include: [{
                model: PurchaseItem,
                include: [Product]
            }, {
                model: Supplier
            }, {
                model: Employee
            }],
            order: [['purchase_date', 'DESC']]
        });

        res.json(purchases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Обновление статуса поставки
const updatePurchaseStatus = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { status } = req.body;

        const purchase = await Purchase.findByPk(id, {
            include: [{
                model: PurchaseItem,
                include: [Product]
            }]
        });

        if (!purchase) {
            await t.rollback();
            return res.status(404).json({ error: 'Purchase not found' });
        }

        await purchase.update({ status }, { transaction: t });

        await t.commit();
        res.json(purchase);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createPurchase,
    getAllPurchases,
    updatePurchaseStatus
}; 