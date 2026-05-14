const router = require('express').Router();
const {
  getBlogs,
  getRecentBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');
const { protect, adminOnly } = require('../middleware/auth');

const deprecateAdminRoute = (req, res, next) => {
  res.setHeader('X-API-Deprecated', 'true');
  res.setHeader('X-API-Replacement', `/api/admin/blogs${req.path}`);
  next();
};

router.get('/', getBlogs);
router.get('/recent', getRecentBlogs);
router.get('/:slug', getBlogBySlug);
router.post('/', protect, adminOnly, deprecateAdminRoute, createBlog);
router.put('/:id', protect, adminOnly, deprecateAdminRoute, updateBlog);
router.delete('/:id', protect, adminOnly, deprecateAdminRoute, deleteBlog);

module.exports = router;
