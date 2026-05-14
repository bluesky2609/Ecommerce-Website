const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
require('dotenv').config();

async function debug() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('\n=== ALL CATEGORIES (with parent info) ===');
  const allCats = await Category.find({}).populate('parent', 'name slug').sort({ parent: 1, order: 1 });
  allCats.forEach(c => {
    console.log(`  [${c.isActive ? 'ACTIVE' : 'INACTIVE'}] "${c.name}" slug="${c.slug}" id=${c._id} parent=${c.parent ? `"${c.parent.slug}"` : 'NULL'}`);
  });

  console.log('\n=== TREE: parent=null categories and their children ===');
  const parents = await Category.find({ parent: null }).populate({ path: 'children' });
  for (const p of parents) {
    console.log(`\nParent: "${p.name}" (slug="${p.slug}", id=${p._id})`);
    for (const ch of (p.children || [])) {
      const prodCount = await Product.countDocuments({ category: ch._id, isActive: true });
      console.log(`  Child: "${ch.name}" (slug="${ch.slug}", id=${ch._id}) → ${prodCount} products`);
    }
    const parentProdCount = await Product.countDocuments({ category: p._id, isActive: true });
    console.log(`  Direct products in parent "${p.name}": ${parentProdCount}`);
  }

  console.log('\n=== SAMPLE PRODUCTS (first 5) with category info ===');
  const prods = await Product.find({ isActive: true }).populate('category', 'name slug parent').limit(5);
  prods.forEach(p => {
    console.log(`  "${p.name}" → category: "${p.category?.name}" (slug="${p.category?.slug}", parent=${p.category?.parent})`);
  });

  console.log('\n=== TEST: products matching slug "ao-nam" (recursive) ===');
  const aoCat = await Category.findOne({ slug: 'ao-nam' });
  if (aoCat) {
    console.log(`Found category "ao-nam": id=${aoCat._id}`);
    const subs = await Category.find({ parent: aoCat._id });
    console.log(`  Subcategories of ao-nam:`, subs.map(s => s.slug));
    const catIds = [aoCat._id, ...subs.map(s => s._id)];
    const count = await Product.countDocuments({ category: { $in: catIds }, isActive: true });
    console.log(`  Products matching ao-nam + subs: ${count}`);
  } else {
    console.log('  WARNING: Category with slug "ao-nam" NOT FOUND!');
  }

  console.log('\n=== ALL SLUGS in categories ===');
  allCats.forEach(c => process.stdout.write(`"${c.slug}" `));
  console.log('');

  await mongoose.disconnect();
}

debug().catch(console.error);
