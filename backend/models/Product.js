const mongoose = require('mongoose');
const slugify = require('slugify');

const variantSchema = new mongoose.Schema({
  colorId: { type: String, default: 'none' },
  colorName: { type: String, default: 'Mặc định' },
  colorHex: { type: String, default: '#000000' },
  size: { type: String, required: true },
  stock: { type: Number, default: 0 },
  sku: { type: String, default: '' },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }],
    colors: [
      {
        id: String,
        name: String,
        hex: String,
        images: [String],
      },
    ],
    sizes: [{ type: String }],
    variants: [variantSchema],
    originalPrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    isNew: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ salePrice: 1 });
productSchema.index({ sold: -1 });

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, locale: 'vi' });
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
