require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Product = require('./models/Product');

async function test() {
  await connectDB();
  const cats = await Category.find({});
  let active = 0;
  cats.forEach(c => {
     if(c.isActive) active++;
  });
  console.log(`Active categories: ${active}/${cats.length}`);
  
  const products = await Product.find({}).populate('category');
  products.forEach(p => {
    // console.log(`${p.name} - ${p.category ? p.category.name : 'NULL'}`);
  });
  process.exit(0);
}
test();
