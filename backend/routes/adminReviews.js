const router = require('express').Router();
const { getAllReviews, replyToReview, deleteReviewAdmin } = require('../controllers/adminReviewController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getAllReviews);
router.put('/:id/reply', protect, adminOnly, replyToReview);
router.delete('/:id', protect, adminOnly, deleteReviewAdmin);

module.exports = router;
