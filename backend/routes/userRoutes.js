const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updatePassword,
  getUsersByRole
} = require('../controller/userController');
const { protect, authorize } = require('../middleware/authmiddleware');

// Get all users (Admin only)
router.get('/', protect, authorize('admin'), getAllUsers);

// Get users by role (Admin only)
router.get('/role/:role', protect, authorize('admin'), getUsersByRole);

// Get single user
router.get('/:id', protect, getUser);

// Update user
router.put('/:id', protect, updateUser);

// Delete user (Admin only)
router.delete('/:id', protect, authorize('admin'), deleteUser);

// Update password
router.put('/:id/password', protect, updatePassword);

module.exports = router;