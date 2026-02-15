const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getCollectionTrends
} = require('../controller/analyticController');
const { protect, authorize } = require('../middleware/authmiddleware');

router.get('/dashboard', protect, getDashboardStats);
router.get('/trends', protect, authorize('admin'), getCollectionTrends);

module.exports = router;