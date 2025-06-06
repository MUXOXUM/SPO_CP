const { Supplier } = require('../models');

// Получение списка всех поставщиков
const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.findAll({
            order: [['name', 'ASC']]
        });

        const formattedSuppliers = suppliers.map(supplier => ({
            id: supplier.supplier_id,
            name: supplier.name,
            contactPerson: supplier.contact_person,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address
        }));

        res.json(formattedSuppliers);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ error: 'Ошибка при получении списка поставщиков' });
    }
};

// Создание нового поставщика
const createSupplier = async (req, res) => {
    try {
        const { name, contactPerson, email, phone, address } = req.body;

        // Проверка обязательных полей
        if (!name || !contactPerson || !email || !phone || !address) {
            return res.status(400).json({
                error: 'Validation Error',
                details: 'Все поля обязательны для заполнения'
            });
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Validation Error',
                details: 'Неверный формат email'
            });
        }

        // Валидация телефона (простая проверка на наличие только цифр и некоторых спецсимволов)
        const phoneRegex = /^[+\d\s()-]+$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                error: 'Validation Error',
                details: 'Неверный формат телефона'
            });
        }

        // Проверка на существование поставщика с таким же email
        const existingSupplier = await Supplier.findOne({ where: { email } });
        if (existingSupplier) {
            return res.status(400).json({
                error: 'Validation Error',
                details: 'Поставщик с таким email уже существует'
            });
        }

        const supplier = await Supplier.create({
            name,
            contact_person: contactPerson,
            email,
            phone,
            address
        });

        res.status(201).json({
            id: supplier.supplier_id,
            name: supplier.name,
            contactPerson: supplier.contact_person,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address
        });
    } catch (error) {
        console.error('Error creating supplier:', error);
        
        // Обработка ошибок валидации Sequelize
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Validation Error',
                details: error.errors.map(err => err.message).join(', ')
            });
        }

        // Обработка ошибок уникальности Sequelize
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                error: 'Validation Error',
                details: 'Поставщик с такими данными уже существует'
            });
        }

        res.status(500).json({ 
            error: 'Ошибка при создании поставщика',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
};

// Обновление информации о поставщике
const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contactPerson, email, phone, address } = req.body;

        const supplier = await Supplier.findByPk(id);

        if (!supplier) {
            return res.status(404).json({ error: 'Поставщик не найден' });
        }

        await supplier.update({
            name,
            contact_person: contactPerson,
            email,
            phone,
            address
        });

        res.json({
            id: supplier.supplier_id,
            name: supplier.name,
            contactPerson: supplier.contact_person,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address
        });
    } catch (error) {
        console.error('Error updating supplier:', error);
        res.status(500).json({ error: 'Ошибка при обновлении данных поставщика' });
    }
};

// Удаление поставщика
const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;

        const supplier = await Supplier.findByPk(id);

        if (!supplier) {
            return res.status(404).json({ error: 'Поставщик не найден' });
        }

        await supplier.destroy();

        res.json({ message: 'Поставщик успешно удален' });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        res.status(500).json({ error: 'Ошибка при удалении поставщика' });
    }
};

module.exports = {
    getAllSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier
}; 