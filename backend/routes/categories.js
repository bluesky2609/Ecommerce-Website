const router = require('express').Router();
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth');

const deprecateAdminRoute = (req, res, next) => {
  res.setHeader('X-API-Deprecated', 'true');
  res.setHeader('X-API-Replacement', `/api/admin/categories${req.path}`);
  next();
};

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', protect, adminOnly, deprecateAdminRoute, createCategory);
router.put('/:id', protect, adminOnly, deprecateAdminRoute, updateCategory);
router.delete('/:id', protect, adminOnly, deprecateAdminRoute, deleteCategory);

module.exports = router;
