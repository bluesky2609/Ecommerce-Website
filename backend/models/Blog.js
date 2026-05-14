const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    category: { type: String, default: 'Tin tức' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    authorName: { type: String, default: 'HODY Team' },
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, locale: 'vi' });
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
