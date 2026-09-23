const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getDashboardStatistics,
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getAIStatus,
  getAIConfig,
  updateAIConfig,
  testAIConnection,
  updateAdminProfile,
  changeAdminPassword
} = require('../controllers/adminController');

// All admin routes require both JWT authentication and ADMIN role authorization
router.use(protect);
router.use(adminOnly);

// Statistics
router.get('/statistics', getDashboardStatistics);

// User Management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.patch('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// AI Monitoring & Configuration
router.get('/ai/status', getAIStatus);
router.get('/ai/config', getAIConfig);
router.put('/ai/config', updateAIConfig);
router.post('/ai/test', testAIConnection);

// Admin Profile & Settings
router.put('/profile', updateAdminProfile);
router.put('/change-password', changeAdminPassword);

module.exports = router;
