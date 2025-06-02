const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

// Все маршруты требуют аутентификации
router.use(authenticateToken);

// Создание нового заказа
router.post('/', orderController.createOrder);

// Получение списка заказов пользователя
router.get('/', orderController.getUserOrders);

// Получение деталей заказа
router.get('/:id', orderController.getOrderDetails);

module.exports = router; 