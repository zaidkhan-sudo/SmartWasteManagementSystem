const express = require('express');
const router = express.Router();
const {
  getAllBins,
  getBin,
  createBin,
  updateBin,
  deleteBin
} = require('../controller/binController');
const { protect, authorize } = require('../middleware/authmiddleware');

router.route('/')
  .get(protect, getAllBins)
  .post(protect, authorize('admin'), createBin);

router.route('/:id')
  .get(protect, getBin)
  .put(protect, authorize('admin', 'collector'), updateBin)
  .delete(protect, authorize('admin'), deleteBin);

module.exports = router;
