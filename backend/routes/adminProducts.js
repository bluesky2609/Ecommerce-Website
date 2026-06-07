const router = require('express').Router();
const productController = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// GET all products for admin (including inactive)
router.get('/', async (req, res, next) => {
  const Product = require('../models/Product');
  const Category = require('../models/Category');
  try {
    const { page = 1, limit = 20, search, category, sort = 'createdAt', order = 'desc' } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
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
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name slug').sort({ [sort]: order === 'asc' ? 1 : -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);
    res.json({ success: true, data: products, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
  } catch (err) { next(err); }
});

router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;

