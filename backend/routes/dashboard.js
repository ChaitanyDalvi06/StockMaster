const express = require('express');
const router = express.Router();
const {
  getDashboardKPIs,
  getDashboardStats,
  getLowStockAlerts,
  getRecentActivities
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/kpis', getDashboardKPIs);
router.get('/stats', getDashboardStats);
router.get('/low-stock-alerts', getLowStockAlerts);
router.get('/recent-activities', getRecentActivities);

module.exports = router;

