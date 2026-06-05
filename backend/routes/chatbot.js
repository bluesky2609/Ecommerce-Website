const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { sendMessage, getSuggestions } = require('../controllers/chatbotController');

// Rate limit: 20 requests per minute per IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Bạn đang gửi quá nhiều tin nhắn. Vui lòng đợi một chút.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/message', chatLimiter, sendMessage);
router.get('/suggestions', getSuggestions);

module.exports = router;
