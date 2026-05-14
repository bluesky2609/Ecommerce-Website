const express = require('express');
const router = express.Router();
const { getPublic, applyVoucher } = require('../controllers/voucherController');

// Public – no auth required
router.get('/', getPublic);
router.post('/apply', applyVoucher);

module.exports = router;
