require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

const run = async () => {
  await connectDB();
  const result = await Product.updateMany(
    {},
    { $set: { rating: 0, reviewCount: 0, sold: 0 } }
  );
  console.log(`✅ Reset xong: ${result.modifiedCount} sản phẩm — rating, reviewCount, sold về 0`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Lỗi:', err.message);
  process.exit(1);
});
