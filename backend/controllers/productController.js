const Product = require('../models/Product');
const Category = require('../models/Category');

// @route GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const {
      category, // slug
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
      minPrice,
      maxPrice,
      color,
      size,
      isNew,
      isBestSeller,
      search,
      minSold,
    } = req.query;

    const filter = { isActive: true };

    // Category filter by slug - recursively include all descendants
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        // Recursively find all descendant category IDs
        const getAllDescendantIds = async (parentId) => {
          const children = await Category.find({ parent: parentId }).select('_id');
          if (children.length === 0) return [];
          const childIds = children.map((c) => c._id);
          const deeperIds = await Promise.all(childIds.map(getAllDescendantIds));
          return [...childIds, ...deeperIds.flat()];
        };
        const descendantIds = await getAllDescendantIds(cat._id);
        const catIds = [cat._id, ...descendantIds];
        filter.category = { $in: catIds };
      }
    }

    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice) filter.salePrice.$gte = Number(minPrice);
      if (maxPrice) filter.salePrice.$lte = Number(maxPrice);
    }

    if (color) filter['colors.id'] = color;
    if (size) filter.sizes = size;
    if (isNew === 'true') filter.isNew = true;
    if (isBestSeller === 'true') filter.isBestSeller = true;

    if (minSold || req.query.includeHot === 'true' || req.query.includeBestSellerLabel === 'true') {
      const orConditions = [];
      if (minSold) {
        orConditions.push({ sold: { $gte: Number(minSold) } });
      }
      if (req.query.includeHot === 'true') {
        orConditions.push({ tags: { $regex: /^hot$/i } });
      }
      if (req.query.includeBestSellerLabel === 'true') {
        orConditions.push({ isBestSeller: true });
      }
      if (orConditions.length > 0) {
        filter.$or = orConditions;
      }
    }

    if (search) {
      const searchOr = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchOr }];
        delete filter.$or;
      } else {
        filter.$or = searchOr;
      }
    }

    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
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

// @route GET /api/products/featured
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .limit(limit);
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/products/bestsellers
exports.getBestSellers = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const products = await Product.find({ isBestSeller: true, isActive: true })
      .populate('category', 'name slug')
      .sort({ sold: -1 })
      .limit(limit);
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/products/:slug
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
      'category',
      'name slug'
    );
    if (!product) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/products/:slug/related
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .populate('category', 'name slug')
      .limit(6);
    res.json({ success: true, data: related });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/products (admin)
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/products/:id (admin)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/products/:id (admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }
    res.json({ success: true, message: 'Đã xóa sản phẩm' });
  } catch (err) {
    next(err);
  }
};
