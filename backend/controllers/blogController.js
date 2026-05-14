const Blog = require('../models/Blog');

// @route GET /api/blogs
exports.getBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 9, category, search } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .select('-content')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Blog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: blogs,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/blogs/recent
exports.getRecentBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ isPublished: true }).select('-content').sort({ createdAt: -1 }).limit(4);
    res.json({ success: true, data: blogs });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/blogs/:slug
exports.getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name avatar');
    if (!blog) return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
    res.json({ success: true, data: blog });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/blogs (admin)
exports.createBlog = async (req, res, next) => {
  try {
    const blog = await Blog.create({ ...req.body, author: req.user._id, authorName: req.user.name });
    res.status(201).json({ success: true, data: blog });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/blogs/:id (admin)
exports.updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
    res.json({ success: true, data: blog });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/blogs/:id (admin)
exports.deleteBlog = async (req, res, next) => {
  try {
    await Blog.findByIdAndUpdate(req.params.id, { isPublished: false });
    res.json({ success: true, message: 'Đã xóa bài viết' });
  } catch (err) {
    next(err);
  }
};
