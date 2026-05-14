const Coupon = require('../models/Coupon');

// ─── ADMIN ────────────────────────────────────────────────────
// GET /api/admin/vouchers  – list all vouchers
const getAll = async (req, res, next) => {
  try {
    const vouchers = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: vouchers });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/vouchers  – create voucher
const create = async (req, res, next) => {
  try {
    const { code, type, value, minOrder, maxDiscount, usageLimit, startDate, endDate, isActive } = req.body;
    if (!code || !value || !endDate) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (code, value, endDate)' });
    }
    const voucher = await Coupon.create({ code, type, value, minOrder, maxDiscount, usageLimit, startDate, endDate, isActive });
    res.status(201).json({ success: true, data: voucher });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Mã voucher đã tồn tại' });
    }
    next(err);
  }
};

// PUT /api/admin/vouchers/:id  – update voucher
const update = async (req, res, next) => {
  try {
    const voucher = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher không tồn tại' });
    res.json({ success: true, data: voucher });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/vouchers/:id  – delete voucher
const remove = async (req, res, next) => {
  try {
    const voucher = await Coupon.findByIdAndDelete(req.params.id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher không tồn tại' });
    res.json({ success: true, message: 'Đã xoá voucher' });
  } catch (err) {
    next(err);
  }
};

// ─── PUBLIC ───────────────────────────────────────────────────
// GET /api/vouchers  – list active & not-expired vouchers for users
const getPublic = async (req, res, next) => {
  try {
    const now = new Date();
    const vouchers = await Coupon.find({
      isActive: true,
      endDate: { $gte: now },
      startDate: { $lte: now },
    }).select('-usedCount -__v').sort({ createdAt: -1 });
    res.json({ success: true, data: vouchers });
  } catch (err) {
    next(err);
  }
};

// POST /api/vouchers/apply  – validate & return discount info
const applyVoucher = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Vui lòng nhập mã voucher' });

    const now = new Date();
    const voucher = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    if (!voucher) return res.status(400).json({ success: false, message: 'Mã voucher không hợp lệ hoặc đã hết hạn' });
    if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ success: false, message: 'Voucher đã hết lượt sử dụng' });
    }
    if (orderTotal < voucher.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu ${voucher.minOrder.toLocaleString('vi-VN')}đ để sử dụng voucher này`,
      });
    }

    let discount = 0;
    if (voucher.type === 'percent') {
      discount = Math.round((orderTotal * voucher.value) / 100);
      if (voucher.maxDiscount > 0) discount = Math.min(discount, voucher.maxDiscount);
    } else {
      discount = voucher.value;
    }
    discount = Math.min(discount, orderTotal);

    res.json({
      success: true,
      data: {
        voucherId: voucher._id,
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        discount,
        finalTotal: orderTotal - discount,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, remove, getPublic, applyVoucher };
