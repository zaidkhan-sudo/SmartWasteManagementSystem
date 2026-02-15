const express = require('express');
const router = express.Router();
const {
  getAllSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule
} = require('../controller/scheduleController');
const { protect, authorize } = require('../middleware/authmiddleware');

router.route('/')
  .get(protect, getAllSchedules)
  .post(protect, authorize('admin'), createSchedule);

router.route('/:id')
  .get(protect, getSchedule)
  .put(protect, authorize('admin', 'collector'), updateSchedule)
  .delete(protect, authorize('admin'), deleteSchedule);

module.exports = router;