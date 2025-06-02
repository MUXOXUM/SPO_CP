const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Регистрация нового пользователя
router.post('/register', authController.register);

// Вход в систему
router.post('/login', authController.login);

// Получение профиля пользователя (требует аутентификации)
router.get('/profile', authenticateToken, authController.getCurrentUser);

module.exports = router; 