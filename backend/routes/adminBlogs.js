const router = require('express').Router();
const { createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.post('/', createBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);

module.exports = router;
