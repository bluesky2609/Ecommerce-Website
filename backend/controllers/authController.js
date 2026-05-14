const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    let exists = await User.findOne({ email });

    // Thay vì chặn ngay lập tức, ta kiểm tra và cập nhật nếu tài khoản chưa xác thực.
    // Nếu có tài khoản đã xác thực, ta mới báo lỗi.
    if (exists && exists.isVerified) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    let user;
    if (exists && !exists.isVerified) {
      exists.name = name;
      exists.password = hashed;
      exists.phone = phone;
      exists.otp = otp;
      exists.otpExpiry = otpExpiry;
      await exists.save();
      user = exists;
    } else {
      user = await User.create({ name, email, password: hashed, phone, otp, otpExpiry, isVerified: false });
    }

    // Console log the OTP for testing purposes
    console.log(`[OTP cho ${email}]: ${otp}`);

    await sendEmail({
      to: email,
      subject: 'HODY - Xác nhận tài khoản',
      text: `Mã xác nhận OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút. Vui lòng không chia sẻ cho bất kỳ ai.`,
      html: `<h2>Xác nhận tài khoản HODY</h2><p>Mã OTP của bạn là: <strong>${otp}</strong>.</p><p>Mã có hiệu lực trong 5 phút.</p>`,
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công, vui lòng kiểm tra email để nhận mã OTP.',
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Tài khoản đã bị khóa' });
    }
    // Auto-verify legacy users (created before OTP feature)
    if (!user.isVerified && !user.otp && !user.otpExpiry) {
      user.isVerified = true;
      await user.save();
    } else if (!user.isVerified && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Tài khoản chưa được xác thực email. Vui lòng đăng ký lại để nhận mã.', code: 'UNVERIFIED' });
    }
    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar, addresses: user.addresses },
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/verify-otp
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Tài khoản đã được xác thực trước đó' });
    }
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Mã OTP không đúng' });
    }
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, message: 'Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Xác thực thành công!',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar, addresses: user.addresses },
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/resend-otp
exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Tài khoản đã được xác thực trước đó' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    await user.save();

    console.log(`[OTP cho ${email}]: ${otp}`);

    await sendEmail({
      to: email,
      subject: 'HODY - Mã OTP Mới',
      text: `Mã xác nhận OTP mới của bạn là: ${otp}. Mã có hiệu lực trong 5 phút. Vui lòng không chia sẻ cho bất kỳ ai.`,
      html: `<h2>Xác nhận tài khoản HODY</h2><p>Mã OTP mới của bạn là: <strong>${otp}</strong>.</p><p>Mã có hiệu lực trong 5 phút.</p>`,
    });

    res.json({ success: true, message: 'Mã OTP mới đã được gửi.' });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @route PUT /api/auth/me
exports.updateMe = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, user: updated });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/addresses
exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    // If it's the first address, or isDefault is true, make it default
    let isDefault = req.body.isDefault || false;
    if (user.addresses.length === 0) {
      isDefault = true;
    } else if (isDefault) {
      // Set all other addresses to not default
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    const newAddress = {
      fullName: req.body.fullName,
      phone: req.body.phone,
      province: req.body.province,
      district: req.body.district,
      ward: req.body.ward,
      street: req.body.street,
      isDefault
    };

    user.addresses.push(newAddress);
    await user.save();
    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/auth/addresses/:id
exports.updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);
    if (!address) {
       return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
    }

    address.fullName = req.body.fullName || address.fullName;
    address.phone = req.body.phone || address.phone;
    address.province = req.body.province || address.province;
    address.district = req.body.district || address.district;
    address.ward = req.body.ward || address.ward;
    address.street = req.body.street || address.street;

    if (req.body.isDefault && !address.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
      address.isDefault = true;
    }

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/auth/addresses/:id
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);
    if (!address) {
       return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
    }

    const wasDefault = address.isDefault;
    user.addresses.pull(req.params.id);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/auth/addresses/:id/default
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);
    if (!address) {
       return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
    }

    user.addresses.forEach(addr => addr.isDefault = false);
    address.isDefault = true;

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};
