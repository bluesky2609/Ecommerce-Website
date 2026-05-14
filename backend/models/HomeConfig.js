const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  image: { type: String, required: true },
  cta: { type: String, default: 'Khám phá ngay' },
  href: { type: String, default: '/' },
  align: { type: String, enum: ['left', 'center', 'right'], default: 'left' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const sectionConfigSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  type: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  columns: { type: Number, default: 5, min: 2, max: 8 },
  rows: { type: Number, default: 1, min: 1, max: 4 },
  viewAllHref: { type: String, default: '' },
});

const homeConfigSchema = new mongoose.Schema(
  {
    banners: [bannerSchema],
    sections: [sectionConfigSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomeConfig', homeConfigSchema);
