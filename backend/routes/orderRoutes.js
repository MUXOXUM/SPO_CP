const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getOrderDetails } = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

// Все маршруты требуют аутентификации
router.use(auth);

// Создание нового заказа
router.post('/', createOrder);

// Получение списка заказов пользователя
router.get('/', getUserOrders);

// Получение деталей заказа
router.get('/:id', getOrderDetails);

module.exports = router; 