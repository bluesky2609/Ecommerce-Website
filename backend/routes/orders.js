const router = require('express').Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  applyCoupon,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

const deprecateAdminRoute = (req, res, next) => {
  res.setHeader('X-API-Deprecated', 'true');
  res.setHeader('X-API-Replacement', `/api/admin/orders${req.path}`);
  next();
};

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.post('/apply-coupon', protect, applyCoupon);
router.get('/', protect, adminOnly, deprecateAdminRoute, getAllOrders);
router.put('/:id/status', protect, adminOnly, deprecateAdminRoute, updateOrderStatus);
router.get('/:id', protect, getOrder);

module.exports = router;
