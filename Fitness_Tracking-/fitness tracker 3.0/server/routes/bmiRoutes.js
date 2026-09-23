const express = require('express');
const router = express.Router();
const { calculateBMI, getBMIHistory } = require('../controllers/bmiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/calculate', calculateBMI);
router.get('/history', getBMIHistory);

module.exports = router;
