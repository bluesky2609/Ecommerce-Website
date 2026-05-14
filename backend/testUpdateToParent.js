require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const Category = require('./models/Category');

async function updateProductsToParentCategories() {
  await connectDB();
  const products = await Product.find({}).populate('category');
  let updatedCount = 0;
  
  for (const product of products) {
    if (product.category && product.category.parent) {
      // Find the parent category
      const parentCat = await Category.findById(product.category.parent);
      if (parentCat) {
        product.category = parentCat._id;
        await product.save();
        updatedCount++;
      }
    }
  }
  console.log(`Updated ${updatedCount} products to their parent categories.`);
  process.exit(0);
}
updateProductsToParentCategories();
