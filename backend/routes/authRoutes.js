const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Регистрация нового пользователя
router.post('/register', register);

// Вход в систему
router.post('/login', login);

// Получение профиля пользователя (требует аутентификации)
router.get('/profile', auth, getProfile);

module.exports = router; 