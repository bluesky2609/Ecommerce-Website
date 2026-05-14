const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true, maxlength: 1000 },
    images: [{ type: String }],
    isVerifiedPurchase: { type: Boolean, default: true },
    helpful: { type: Number, default: 0 },
    adminReply: { type: String, default: '', trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// Mỗi user chỉ đánh giá 1 lần cho 1 sản phẩm trong 1 đơn hàng
reviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true });

// Tự động cập nhật rating và reviewCount cho sản phẩm sau khi lưu review
reviewSchema.post('save', async function () {
  await updateProductStats(this.product);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await updateProductStats(doc.product);
});

async function updateProductStats(productId) {
  const Review = mongoose.model('Review');
  const Product = mongoose.model('Product');
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { rating: 0, reviewCount: 0 });
  }
}

module.exports = mongoose.model('Review', reviewSchema);
