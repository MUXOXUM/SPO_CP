const jwt = require('jsonwebtoken');
const { User } = require('../models');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Находим пользователя
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        // Проверяем пароль
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        // Проверяем активность аккаунта
        if (!user.is_active) {
            return res.status(403).json({ error: 'Аккаунт деактивирован' });
        }

        // Создаем JWT токен
        const token = jwt.sign(
            { 
                userId: user.user_id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Отправляем ответ
        res.json({
            token,
            user: {
                id: user.user_id,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Ошибка при входе в систему' });
    }
};

const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, address } = req.body;

        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        // Создаем нового пользователя
        const user = await User.create({
            email,
            password,
            first_name: firstName,
            last_name: lastName,
            phone,
            address,
            role: 'customer' // По умолчанию создаем клиента
        });

        // Создаем JWT токен
        const token = jwt.sign(
            { 
                userId: user.user_id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Отправляем ответ
        res.status(201).json({
            token,
            user: {
                id: user.user_id,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Ошибка при регистрации' });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json({
            id: user.user_id,
            email: user.email,
            role: user.role,
            firstName: user.first_name,
            lastName: user.last_name
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
    }
};

module.exports = {
    login,
    register,
    getCurrentUser
}; 