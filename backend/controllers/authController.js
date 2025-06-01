const jwt = require('jsonwebtoken');
const { User, Customer } = require('../models');
const sequelize = require('../config/database');
require('dotenv').config();


const generateToken = (user) => {
    return jwt.sign(
        { user_id: user.user_id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
    );
};

const register = async (req, res) => {
    try {
        const { email, password, first_name, last_name, phone, address } = req.body;

        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Создаем транзакцию
        const result = await sequelize.transaction(async (t) => {
            // Создаем пользователя
            const user = await User.create({
                email,
                password,
                role: 'customer'
            }, { transaction: t });

            // Создаем профиль покупателя
            const customer = await Customer.create({
                user_id: user.user_id,
                first_name,
                last_name,
                email,
                phone,
                address
            }, { transaction: t });

            return { user, customer };
        });

        const token = generateToken(result.user);

        res.status(201).json({
            token,
            user: {
                user_id: result.user.user_id,
                email: result.user.email,
                role: result.user.role
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Находим пользователя
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Проверяем пароль
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Проверяем активность аккаунта
        if (!user.is_active) {
            return res.status(401).json({ error: 'Account is disabled' });
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id, {
            include: [{
                model: Customer,
                attributes: ['first_name', 'last_name', 'phone', 'address']
            }]
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    register,
    login,
    getProfile
}; 