const express = require('express');
const router = express.Router();
const { getProgressData } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getProgressData);

module.exports = router;
