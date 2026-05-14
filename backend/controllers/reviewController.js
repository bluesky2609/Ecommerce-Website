const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @route   GET /api/products/:productId/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ product: productId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ product: productId }),
    ]);

    // Thống kê phân bổ sao
    const ratingDist = await Review.aggregate([
      { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(productId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDist.forEach((r) => { distribution[r._id] = r.count; });

    res.json({
      success: true,
      data: reviews,
      distribution,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/products/:productId/reviews
// @access  Private (đã mua sản phẩm)
exports.createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment, images, orderId } = req.body;
    const userId = req.user._id;

    // Kiểm tra đơn hàng tồn tại, thuộc user, đã giao, chứa sản phẩm này
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      orderStatus: 'delivered',
      'items.product': productId,
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể đánh giá sản phẩm đã mua và đã nhận hàng.',
      });
    }

    // Kiểm tra đã đánh giá sản phẩm này trong đơn này chưa
    const existed = await Review.findOne({ product: productId, user: userId, order: orderId });
    if (existed) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đánh giá sản phẩm này rồi.',
      });
    }

    const review = await Review.create({
      product: productId,
      user: userId,
      order: orderId,
      rating,
      comment: comment || '',
      images: images || [],
      isVerifiedPurchase: true,
    });

    await review.populate('user', 'name avatar');

    res.status(201).json({ success: true, data: review, message: 'Cảm ơn bạn đã đánh giá!' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi.' });
    }
    next(err);
  }
};

// @route   DELETE /api/products/:productId/reviews/:reviewId
// @access  Private (chủ review hoặc admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Không có quyền xóa đánh giá này.' });
    }

    await Review.findByIdAndDelete(reviewId);
    res.json({ success: true, message: 'Đã xóa đánh giá.' });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/products/:productId/reviews/can-review
// @access  Private
exports.canReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Tìm đơn hàng đã giao có chứa sản phẩm này và chưa được review
    const deliveredOrders = await Order.find({
      user: userId,
      orderStatus: 'delivered',
      'items.product': productId,
    }).select('_id orderCode');

    const reviewedOrderIds = (
      await Review.find({ product: productId, user: userId }).select('order')
    ).map((r) => r.order.toString());

    const pendingOrders = deliveredOrders.filter(
      (o) => !reviewedOrderIds.includes(o._id.toString())
    );

    res.json({
      success: true,
      canReview: pendingOrders.length > 0,
      pendingOrders: pendingOrders.map((o) => ({ id: o._id, orderCode: o.orderCode })),
    });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/orders/sync-sold
// @access  Admin — Đồng bộ số lượng đã bán từ orders thực tế
exports.syncSold = async (req, res, next) => {
  try {
    const pipeline = [
      { $match: { orderStatus: { $in: ['delivered', 'confirmed', 'shipping'] } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
    ];

    const soldData = await Order.aggregate(pipeline);
    let updated = 0;

    for (const { _id, totalSold } of soldData) {
      await Product.findByIdAndUpdate(_id, { sold: totalSold });
      updated++;
    }

    res.json({ success: true, message: `Đã đồng bộ sold cho ${updated} sản phẩm.` });
  } catch (err) {
    next(err);
  }
};
