const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;

        // Проверяем существование и активность пользователя
        const user = await User.findByPk(decoded.userId);
        if (!user || !user.is_active) {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }

        next();
    } catch (error) {
        return res.status(403).json({ error: 'Недействительный токен' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Требуются права администратора' });
    }
    next();
};

const isManager = (req, res, next) => {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Требуются права менеджера' });
    }
    next();
};

const isCustomer = (req, res, next) => {
    if (req.user.role !== 'customer' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Требуются права покупателя' });
    }
    next();
};

module.exports = {
    authenticateToken,
    isAdmin,
    isManager,
    isCustomer
}; 