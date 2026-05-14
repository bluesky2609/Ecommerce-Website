const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @route POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, note } = req.body;

    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ success: false, message: `Sản phẩm không tìm thấy` });

      const variant = product.variants.find(
        (v) => v.colorId === item.colorId && v.size === item.size
      );
      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `${product.name} không đủ số lượng trong kho` });
      }

      subtotal += product.salePrice * item.quantity;
      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.images[0] || '',
        colorId: item.colorId,
        colorName: item.colorName,
        size: item.size,
        quantity: item.quantity,
        price: product.salePrice,
      });
    }

    const shippingFee = subtotal >= 299000 ? 0 : 30000;
    let discount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.endDate > Date.now() && coupon.usedCount < coupon.usageLimit && subtotal >= coupon.minOrder) {
        discount = coupon.type === 'percent'
          ? Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || Infinity)
          : coupon.value;
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const total = subtotal + shippingFee - discount;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingFee,
      discount,
      total,
      couponCode,
      note,
    });

    // Decrement stock
    for (const item of items) {
      await Product.updateOne(
        { _id: item.productId, 'variants.colorId': item.colorId, 'variants.size': item.size },
        { $inc: { 'variants.$.stock': -item.quantity, sold: item.quantity } }
      );
    }

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name slug images');
    if (!order) return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/orders/apply-coupon
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ' });
    if (coupon.endDate < Date.now()) return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết hạn' });
    if (coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết lượt dùng' });
    if (subtotal < coupon.minOrder) return res.status(400).json({ success: false, message: `Đơn hàng tối thiểu ${coupon.minOrder.toLocaleString()}đ` });

    const discount = coupon.type === 'percent'
      ? Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || Infinity)
      : coupon.value;

    res.json({ success: true, data: { discount, coupon } });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/orders (admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = status ? { orderStatus: status } : {};
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);
    res.json({ success: true, data: orders, pagination: { page: Number(page), total } });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/orders/:id/status (admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/admin/orders/:id/payment-status (admin - COD only)
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
    if (order.paymentMethod !== 'cod') {
      return res.status(400).json({ success: false, message: 'Chỉ có thể cập nhật thủ công với đơn hàng COD' });
    }
    order.paymentStatus = req.body.paymentStatus;
    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};
