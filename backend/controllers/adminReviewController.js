const Review = require('../models/Review');

// @route GET /api/admin/reviews
// @access Private (admin)
exports.getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, rating, search } = req.query;
    const mongoose = require('mongoose');

    const matchStage = {};
    if (rating) matchStage.rating = Number(rating);

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    ];

    // Tìm kiếm theo tên sản phẩm
    if (search) {
      pipeline.push({
        $match: {
          'product.name': { $regex: search, $options: 'i' },
        },
      });
    }

    // Project chỉ lấy các field cần thiết
    pipeline.push({
      $project: {
        comment: 1,
        rating: 1,
        adminReply: 1,
        createdAt: 1,
        'product._id': 1,
        'product.name': 1,
        'product.images': 1,
        'product.slug': 1,
        'user._id': 1,
        'user.name': 1,
        'user.email': 1,
        'user.avatar': 1,
      },
    });

    // Count tổng trước pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Review.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Lấy dữ liệu có phân trang
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: (Number(page) - 1) * Number(limit) });
    pipeline.push({ $limit: Number(limit) });

    const reviews = await Review.aggregate(pipeline);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/admin/reviews/:id/reply
// @access Private (admin)
exports.replyToReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Đánh giá không tồn tại' });
    }

    review.adminReply = reply;
    await review.save();

    const updatedReview = await Review.findById(id)
        .populate('product', 'name images slug')
        .populate('user', 'name email avatar');

    res.json({ success: true, message: 'Đã lưu câu trả lời', data: updatedReview });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/admin/reviews/:id
// @access Private (admin)
exports.deleteReviewAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Đánh giá không tồn tại' });
    }

    await review.deleteOne();
    res.json({ success: true, message: 'Đã xóa đánh giá thành công' });
  } catch (err) {
    next(err);
  }
};
