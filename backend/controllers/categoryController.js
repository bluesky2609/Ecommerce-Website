const Category = require('../models/Category');

// @route GET /api/categories
exports.getCategories = async (req, res, next) => {
  try {
    const { tree } = req.query;
    if (tree === 'true') {
      const parents = await Category.find({ parent: null, isActive: true })
        .sort('order')
        .populate({ path: 'children', match: { isActive: true }, options: { sort: { order: 1 } } });
      return res.json({ success: true, data: parents });
    }
    const categories = await Category.find({ isActive: true }).sort('order').populate('parent', 'name slug');
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/categories/:slug
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true }).populate({
      path: 'children',
      match: { isActive: true },
    });
    if (!category) return res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/categories (admin)
exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/categories/:id (admin)
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/categories/:id (admin)
exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã xóa danh mục' });
  } catch (err) {
    next(err);
  }
};
