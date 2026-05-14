const router = require('express').Router({ mergeParams: true });
const { getReviews, createReview, deleteReview, canReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/', getReviews);
router.get('/can-review', protect, canReview);
router.post('/', protect, createReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
