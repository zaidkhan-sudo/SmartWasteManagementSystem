const express = require('express');
const router = express.Router();
const {
  getAllReports,
  getReport,
  createReport,
  updateReport,
  deleteReport
} = require('../controller/reportController');
const { protect, authorize } = require('../middleware/authmiddleware');

router.route('/')
  .get(protect, getAllReports)
  .post(protect, createReport);

router.route('/:id')
  .get(protect, getReport)
  .put(protect, authorize('admin', 'collector'), updateReport)
  .delete(protect, authorize('admin'), deleteReport);

module.exports = router;
