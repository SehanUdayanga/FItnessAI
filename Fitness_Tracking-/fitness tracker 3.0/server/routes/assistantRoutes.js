const express = require('express');
const router = express.Router();
const { chatWithAssistant } = require('../controllers/assistantController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/assistant/chat
// @desc    Send a message to FitTrack AI Chatbot
// @access  Private
router.post('/chat', protect, chatWithAssistant);

module.exports = router;
