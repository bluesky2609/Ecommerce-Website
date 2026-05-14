const router = require('express').Router();
const {
  getProducts,
  getFeaturedProducts,
  getBestSellers,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

const deprecateAdminRoute = (req, res, next) => {
  res.setHeader('X-API-Deprecated', 'true');
  res.setHeader('X-API-Replacement', `/api/admin/products${req.path}`);
  next();
};

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/bestsellers', getBestSellers);
router.get('/:slug', getProductBySlug);
router.get('/:slug/related', getRelatedProducts);
router.post('/', protect, adminOnly, deprecateAdminRoute, createProduct);
router.put('/:id', protect, adminOnly, deprecateAdminRoute, updateProduct);
router.delete('/:id', protect, adminOnly, deprecateAdminRoute, deleteProduct);

module.exports = router;
