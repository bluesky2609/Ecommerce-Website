const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createPayOSLink,
  payosWebhook,
  getPaymentStatus,
} = require('../controllers/paymentController');

// POST /api/payment/payos/create  → tạo payment link (cần đăng nhập)
router.post('/payos/create', protect, createPayOSLink);

// POST /api/payment/payos/webhook → nhận webhook từ PayOS (public, không auth)
router.post('/payos/webhook', payosWebhook);

// GET  /api/payment/payos/status/:orderCode → kiểm tra trạng thái (cần đăng nhập)
router.get('/payos/status/:orderCode', protect, getPaymentStatus);

module.exports = router;
