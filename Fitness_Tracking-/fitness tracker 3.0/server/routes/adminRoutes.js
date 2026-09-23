const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminProtect } = require('../middleware/adminMiddleware');
const {
  getAdminStats,
  getAdminUsers,
  getUserActivity,
  resetUserPassword,
  deleteUser
} = require('../controllers/adminController');

// All admin routes require valid JWT authentication and admin role
router.use(protect);
router.use(adminProtect);

// Aggregated Platform Statistics
router.get('/stats', getAdminStats);

// Users Management
router.get('/users', getAdminUsers);
router.get('/users/:id/activity', getUserActivity);
router.post('/users/:id/reset-password', resetUserPassword);
router.delete('/users/:id', deleteUser);

module.exports = router;
