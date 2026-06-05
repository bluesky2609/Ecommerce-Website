require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use('/api/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/products/:productId/reviews', require('./routes/reviews'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/admin/products', require('./routes/adminProducts'));
app.use('/api/admin/categories', require('./routes/adminCategories'));
app.use('/api/admin/blogs', require('./routes/adminBlogs'));
app.use('/api/admin/orders', require('./routes/adminOrders'));
app.use('/api/admin/users', require('./routes/users'));
app.use('/api/admin/reviews', require('./routes/adminReviews'));
app.use('/api/admin/vouchers', require('./routes/adminVouchers'));
app.use('/api/admin/home-config', require('./routes/adminHomeConfig'));
app.use('/api/vouchers', require('./routes/vouchers'));
app.use('/api/home-config', require('./routes/homeConfig'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/chatbot', require('./routes/chatbot'));

// Sync sold counts from real orders (admin)
const { syncSold } = require('./controllers/reviewController');
const { protect, adminOnly } = require('./middleware/auth');
app.post('/api/admin/sync-sold', protect, adminOnly, syncSold);

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'HODY API is running' }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route không tồn tại' }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
