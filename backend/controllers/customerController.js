const { User } = require('../models');

// Получение списка всех покупателей
const getAllCustomers = async (req, res) => {
    try {
        const customers = await User.findAll({
            where: {
                role: 'customer'
            },
            attributes: [
                'user_id',
                'email',
                'first_name',
                'last_name',
                'phone',
                'address',
                'is_active'
            ]
        });

        const formattedCustomers = customers.map(customer => ({
            id: customer.user_id,
            email: customer.email,
            firstName: customer.first_name,
            lastName: customer.last_name,
            phone: customer.phone || '',
            address: customer.address || '',
            isActive: customer.is_active
        }));

        res.json(formattedCustomers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Ошибка при получении списка покупателей' });
    }
};

// Обновление информации о покупателе
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            firstName,
            lastName,
            phone,
            address,
            is_active
        } = req.body;

        const customer = await User.findOne({
            where: {
                user_id: id,
                role: 'customer'
            }
        });

        if (!customer) {
            return res.status(404).json({ error: 'Покупатель не найден' });
        }

        await customer.update({
            first_name: firstName,
            last_name: lastName,
            phone,
            address,
            is_active: is_active !== undefined ? is_active : customer.is_active
        });

        res.json({
            id: customer.user_id,
            email: customer.email,
            firstName: customer.first_name,
            lastName: customer.last_name,
            phone: customer.phone || '',
            address: customer.address || '',
            isActive: customer.is_active
        });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Ошибка при обновлении данных покупателя' });
    }
};

module.exports = {
    getAllCustomers,
    updateCustomer
}; 