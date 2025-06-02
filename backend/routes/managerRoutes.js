const express = require('express');
const router = express.Router();
const { authenticateToken, isManager } = require('../middleware/auth');
const { getAllEmployees, addEmployee, updateEmployee } = require('../controllers/employeeController');
const { getAllCustomers, updateCustomer } = require('../controllers/customerController');
const { getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { getGeneralStats, getSalesTimeline, getTopProducts } = require('../controllers/dashboardController');

// Все маршруты требуют аутентификации и роль менеджера
router.use(authenticateToken);
router.use(isManager);

// Маршруты для работы с сотрудниками
router.get('/employees', getAllEmployees);
router.post('/employees', addEmployee);
router.put('/employees/:id', updateEmployee);

// Маршруты для работы с покупателями
router.get('/customers', getAllCustomers);
router.put('/customers/:id', updateCustomer);

// Маршруты для работы с заказами
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Маршруты для дашборда
router.get('/dashboard/stats', getGeneralStats);
router.get('/dashboard/sales', getSalesTimeline);
router.get('/dashboard/top-products', getTopProducts);

module.exports = router; 