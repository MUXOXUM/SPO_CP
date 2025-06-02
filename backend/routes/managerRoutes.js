const express = require('express');
const router = express.Router();
const { authenticateToken, isManager } = require('../middleware/auth');
const { getAllEmployees, addEmployee, updateEmployee } = require('../controllers/employeeController');
const { createPurchase, getAllPurchases, updatePurchaseStatus } = require('../controllers/purchaseController');
const { getGeneralStats, getSalesTimeline, getTopProducts } = require('../controllers/dashboardController');

// Все маршруты требуют аутентификации и роль менеджера
router.use(authenticateToken);
router.use(isManager);

// Маршруты для работы с сотрудниками
router.get('/employees', getAllEmployees);
router.post('/employees', addEmployee);
router.put('/employees/:id', updateEmployee);

// Маршруты для работы с поставками
router.post('/purchases', createPurchase);
router.get('/purchases', getAllPurchases);
router.put('/purchases/:id/status', updatePurchaseStatus);

// Маршруты для дашборда
router.get('/dashboard/stats', getGeneralStats);
router.get('/dashboard/sales', getSalesTimeline);
router.get('/dashboard/top-products', getTopProducts);

module.exports = router; 