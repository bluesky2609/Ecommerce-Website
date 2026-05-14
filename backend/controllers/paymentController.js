const PayOS = require('@payos/node');
const Order = require('../models/Order');

// Khởi tạo PayOS client
const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

/* ───────────────────────────────────────────────
   Helper: sinh orderCode số nguyên từ timestamp
   PayOS yêu cầu orderCode là số nguyên dương
─────────────────────────────────────────────── */
function genNumericOrderCode() {
  // Lấy 9 chữ số cuối của timestamp (tránh vượt quá MAX_SAFE_INTEGER)
  return parseInt(Date.now().toString().slice(-9));
}

/* ───────────────────────────────────────────────
   POST /api/payment/payos/create
   Tạo Order + payment link PayOS, trả về checkoutUrl
─────────────────────────────────────────────── */
exports.createPayOSLink = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      note,
      couponCode,
      couponDiscount,
    } = req.body;

    // 1. Tính tổng tiền (server tự tính lại để tránh gian lận)
    const Product = require('../models/Product');
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ success: false, message: `Sản phẩm ${item.productId} không tồn tại` });

      const price = product.salePrice || product.price;
      subtotal += price * item.quantity;

      // Tìm tên màu và ảnh
      const colorVariant = product.variants?.find(v => v.colorId === item.colorId);
      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: (colorVariant?.images?.[0] || product.images?.[0] || ''),
        colorId: item.colorId,
        colorName: item.colorName || colorVariant?.colorName || '',
        size: item.size,
        quantity: item.quantity,
        price,
      });
    }

    const shippingFee = subtotal >= 299000 ? 0 : 30000;
    const discount = couponDiscount || 0;
    const total = subtotal + shippingFee - discount;

    // 2. Sinh numeric orderCode cho PayOS
    const numericCode = genNumericOrderCode();

    // 3. Tạo Order trong DB (status pending, chờ webhook xác nhận)
    const order = await Order.create({
      user: req.user._id,
      orderCode: 'HD' + numericCode,
      items: orderItems,
      shippingAddress,
      paymentMethod: 'payos',
      paymentStatus: 'pending',
      subtotal,
      shippingFee,
      discount,
      total,
      couponCode: couponCode || '',
      note: note || '',
    });

    // 4. Tạo danh sách items gửi lên PayOS (mỗi item cần name, quantity, price)
    const payosItems = orderItems.map(i => ({
      name: i.productName.substring(0, 50), // PayOS giới hạn 50 ký tự
      quantity: i.quantity,
      price: Math.round(i.price),
    }));

    // 5. Gọi PayOS API
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const paymentBody = {
      orderCode: numericCode,
      amount: Math.round(total),
      description: `HODY ${order.orderCode}`.substring(0, 25), // max 25 ký tự
      items: payosItems,
      returnUrl: `${frontendUrl}/payment/return`,
      cancelUrl: `${frontendUrl}/payment/return?cancelled=1`,
    };

    const paymentLinkRes = await payOS.createPaymentLink(paymentBody);

    // 6. Lưu payosPaymentLinkId vào order
    order.payosPaymentLinkId = paymentLinkRes.paymentLinkId;
    await order.save();

    return res.json({
      success: true,
      data: {
        checkoutUrl: paymentLinkRes.checkoutUrl,
        orderId: order._id,
        orderCode: order.orderCode,
      },
    });
  } catch (err) {
    console.error('[PayOS] createPayOSLink error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Tạo link thanh toán thất bại' });
  }
};

/* ───────────────────────────────────────────────
   POST /api/payment/payos/webhook
   Nhận webhook từ PayOS, xác minh và cập nhật order
─────────────────────────────────────────────── */
exports.payosWebhook = async (req, res) => {
  try {
    // Xác minh webhook signature
    const webhookData = payOS.verifyPaymentWebhookData(req.body);

    const { orderCode, code, desc } = webhookData;
    console.log('[PayOS Webhook]', { orderCode, code, desc });

    // Tìm order theo orderCode (HD + numericCode)
    const order = await Order.findOne({ orderCode: `HD${orderCode}` });
    if (!order) {
      console.warn('[PayOS Webhook] Order không tìm thấy:', orderCode);
      return res.json({ success: true }); // vẫn trả 200 để PayOS không retry
    }

    if (code === '00') {
      // Thanh toán thành công
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      await order.save();
      console.log('[PayOS Webhook] Đã cập nhật order:', order.orderCode, '→ paid/confirmed');
    } else {
      // Thanh toán thất bại hoặc bị huỷ
      order.paymentStatus = 'failed';
      order.orderStatus = 'cancelled';
      await order.save();
      console.log('[PayOS Webhook] Order bị huỷ/thất bại:', order.orderCode);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('[PayOS Webhook] Lỗi xác minh:', err.message);
    return res.status(400).json({ success: false, message: 'Webhook verification failed' });
  }
};

/* ───────────────────────────────────────────────
   GET /api/payment/payos/status/:orderCode
   Truy vấn trạng thái payment từ PayOS (dùng ở returnUrl)
─────────────────────────────────────────────── */
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;
    // orderCode từ query string là dạng số (numeric)
    const numericCode = parseInt(orderCode);
    if (isNaN(numericCode)) {
      return res.status(400).json({ success: false, message: 'orderCode không hợp lệ' });
    }

    const paymentInfo = await payOS.getPaymentLinkInformation(numericCode);

    // Tìm và đồng bộ DB nếu trạng thái thay đổi
    const order = await Order.findOne({ orderCode: `HD${numericCode}` });
    if (order) {
      if (paymentInfo.status === 'PAID' && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.orderStatus = 'confirmed';
        await order.save();
      } else if (paymentInfo.status === 'CANCELLED' && order.orderStatus !== 'cancelled') {
        order.paymentStatus = 'failed';
        order.orderStatus = 'cancelled';
        await order.save();
      }
    }

    return res.json({
      success: true,
      data: {
        status: paymentInfo.status,
        amount: paymentInfo.amount,
        orderCode: paymentInfo.orderCode,
        order: order ? {
          _id: order._id,
          orderCode: order.orderCode,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          total: order.total,
        } : null,
      },
    });
  } catch (err) {
    console.error('[PayOS] getPaymentStatus error:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Không thể truy vấn trạng thái' });
  }
};
