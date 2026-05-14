const router = require('express').Router();
const { getAllOrders, updateOrderStatus, updatePaymentStatus } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/', getAllOrders);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/payment-status', updatePaymentStatus);

module.exports = router;
