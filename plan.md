# PLAN: HODY E-Commerce – Fix & Feature Implementation

## Tổng quan
Website đã connect MongoDB ↔ Backend ↔ Frontend. Cần fix 4 critical bugs, thêm Admin Panel, Image Upload (Cloudinary), Payment (COD thật + VNPay sandbox), và hardening bảo mật.

---

## Bugs Tìm Được

| # | Severity | File | Vấn đề |
|---|----------|------|---------|
| B1 | 🔴 Critical | `frontend/src/pages/CheckoutPage.jsx:46-56` | `handlePlaceOrder` chỉ fake `setTimeout` — không có đơn hàng nào lưu vào DB |
| B2 | 🔴 Critical | `frontend/src/pages/CartPage.jsx:76-79` | Nút "Áp dụng" coupon hardcoded `toast.error(...)`, không gọi API |
| B3 | 🟡 High | `frontend/src/pages/ProductDetailPage.jsx:42` | `getRelated(p.id, p.categoryId)` — backend dùng `slug`, gọi này fail |
| B4 | 🟠 Medium | `backend/controllers/orderController.js` | Không validate stock trước khi tạo đơn |

---

## Phase 1 – Critical Bug Fixes

**Bước 1** – `CheckoutPage.jsx`
- Xóa `setTimeout` simulation
- Map cart items → order payload: `{ items, shippingAddress, paymentMethod, couponCode, shippingFee, total }`
- Gọi `orderService.create(orderData)` → hiện real `order.code` ở trang success

**Bước 2** – `CartPage.jsx`
- Thay `toast.error(...)` bằng gọi `orderService.applyCoupon(couponCode, subtotal)`
- Thành công → hiện số tiền giảm, lưu state `discountAmount`
- Thất bại → hiện lỗi từ API

**Bước 3** – `ProductDetailPage.jsx` + `productService.js`
- Đổi `getRelated(p.id, p.categoryId)` → `getRelated(slug)`
- `productService`: `getRelated(slug)` → `GET /api/products/:slug/related`

---

## Phase 2 – Admin Panel

### Backend
**Bước 4** – Thêm `GET /api/orders/admin/stats` (adminOnly) vào `routes/orders.js` **trước** `/:id`
- Controller: tổng đơn theo status, doanh thu (sum paid), tổng sản phẩm, tổng users, 5 đơn gần nhất

### Frontend – Tạo mới `src/pages/admin/`
**Bước 5** – `AdminRoute` guard trong `AppRouter.jsx`
- Check `isAuthenticated && user.role === 'admin'`, redirect `/` nếu không đủ quyền

**Bước 6** – Các trang admin:
- `AdminLayout.jsx` — sidebar + topbar
- `DashboardPage.jsx` — stat cards từ stats API
- `ProductsAdminPage.jsx` — bảng CRUD sản phẩm + modal form + upload ảnh
- `OrdersAdminPage.jsx` — bảng đơn hàng + update status dropdown
- `CategoriesAdminPage.jsx` — tree parent/child + thêm/sửa/xóa
- `BlogsAdminPage.jsx` — bảng blog + form rich text
- `UsersAdminPage.jsx` — danh sách user (read-only)

**Bước 7** – `Header.jsx`: thêm link "Admin" trong user dropdown khi `user?.role === 'admin'`

---

## Phase 3 – Image Upload (Cloudinary)

### Backend
**Bước 8** – Cài đặt: `cloudinary`, `multer-storage-cloudinary`
**Bước 9** – Tạo `backend/config/cloudinary.js` — config từ `.env`:
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
**Bước 10** – Tạo `backend/controllers/uploadController.js` + `backend/routes/upload.js`
- Route: `POST /api/upload/image` (protect + adminOnly), nhận `multipart/form-data`
- Đăng ký trong `server.js`

### Frontend
**Bước 11** – Tạo `src/components/admin/ImageUpload.jsx` — drag & drop, preview, xóa ảnh
**Bước 12** – Tạo `src/services/uploadService.js` — `uploadImage(file)` → POST `/api/upload/image`
**Bước 13** – Tích hợp vào form sản phẩm trong `ProductsAdminPage.jsx`

---

## Phase 4A – COD Checkout (My Orders)

**Bước 14** – Tạo `src/pages/OrdersPage.jsx` — danh sách đơn hàng của user, status badge
**Bước 15** – Tạo `src/pages/OrderDetailPage.jsx` — chi tiết đơn: items, địa chỉ, status timeline
**Bước 16** – Thêm routes `/orders` + `/orders/:id` trong `AppRouter.jsx`
**Bước 17** – Header: link "Đơn hàng của tôi" trong user dropdown

---

## Phase 4B – VNPay Sandbox

### Backend
**Bước 18** – Tạo `backend/config/vnpay.js` — config từ `.env`:
- `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_URL`, `VNPAY_RETURN_URL`
**Bước 19** – Tạo `backend/controllers/paymentController.js`:
- `createVnpayPayment(orderId)` → build URL signed HMAC-SHA512 → trả về `{ paymentUrl }`
- `vnpayReturn(req, res)` → verify chữ ký → update `order.paymentStatus = 'paid'`
- `vnpayIPN(req, res)` → webhook server-side từ VNPay
**Bước 20** – Tạo `backend/routes/payment.js`:
- `POST /api/payment/vnpay/create` (protect)
- `GET /api/payment/vnpay/return` (public)
- `POST /api/payment/vnpay/ipn` (public)

### Frontend
**Bước 21** – `CheckoutPage.jsx` nếu chọn VNPay:
  1. Tạo order trước (status `pending`, paymentMethod `vnpay`)
  2. Gọi `/api/payment/vnpay/create` → redirect đến VNPay URL
**Bước 22** – Tạo `src/pages/PaymentReturnPage.jsx` — parse URL query params sau redirect

---

## Phase 5 – Security Hardening

**Bước 23** – Cài `express-rate-limit` + `helmet`:
- `POST /api/auth/login`: 5 req/15min
- `POST /api/auth/register`: 3 req/hour
- `app.use(helmet())` trong `server.js`

**Bước 24** – CORS từ env: thay hardcode bằng `process.env.CORS_ORIGIN?.split(',')`

**Bước 25** – Cài `express-validator`:
- Register: validate email format, password min 6 ký tự
- Order create: validate items array, quantities > 0, address fields bắt buộc

**Bước 26** – `orderController.js`: check stock từng variant trước khi tạo đơn

---

## File Changes Summary

### Backend – Sửa
- `server.js` — thêm routes, helmet, CORS env
- `routes/orders.js` — thêm stats route (trước `/:id`)
- `routes/auth.js` — rate limiting + validators
- `controllers/orderController.js` — validation + stock check
- `package.json` — thêm deps

### Backend – Tạo mới
- `config/cloudinary.js`
- `config/vnpay.js`
- `routes/upload.js`
- `routes/payment.js`
- `controllers/uploadController.js`
- `controllers/paymentController.js`

### Frontend – Sửa
- `pages/CheckoutPage.jsx`
- `pages/CartPage.jsx`
- `pages/ProductDetailPage.jsx`
- `services/productService.js`
- `routes/AppRouter.jsx`
- `components/layout/Header.jsx`

### Frontend – Tạo mới
- `pages/admin/AdminLayout.jsx`
- `pages/admin/DashboardPage.jsx`
- `pages/admin/ProductsAdminPage.jsx`
- `pages/admin/OrdersAdminPage.jsx`
- `pages/admin/CategoriesAdminPage.jsx`
- `pages/admin/BlogsAdminPage.jsx`
- `pages/admin/UsersAdminPage.jsx`
- `pages/OrdersPage.jsx`
- `pages/OrderDetailPage.jsx`
- `pages/PaymentReturnPage.jsx`
- `components/admin/ImageUpload.jsx`
- `services/uploadService.js`

---

## Verification Checklist

- [ ] Đặt COD → order xuất hiện trong MongoDB `orders` collection
- [ ] Login `demo@hody.vn` → vào `/admin` bị redirect về trang chủ
- [ ] Login `admin@hody.vn` → vào `/admin` thấy dashboard đầy đủ
- [ ] Upload ảnh sản phẩm từ admin → URL Cloudinary lưu vào `product.images`
- [ ] Nhập mã `HODY10` ở CartPage → hiển thị giảm 10% đúng số tiền
- [ ] Chọn VNPay checkout → redirect tới trang VNPay test → hoàn tất → `paymentStatus = paid`
- [ ] Spam login 6 lần → nhận 429 Too Many Requests
- [ ] Related products trên trang chi tiết sản phẩm hiển thị đúng

---

## Env Variables Cần Thêm vào `.env`

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# VNPay (sandbox)
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5173/payment/return

# CORS
CORS_ORIGIN=http://localhost:5173