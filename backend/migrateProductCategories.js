/**
 * Script migrate v2: Gán lại sản phẩm vào đúng subcategory
 * Cải tiến: dùng từng từ riêng lẻ thay vì cụm từ cứng
 * Run: node migrateProductCategories.js
 */
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
require('dotenv').config();

// Normalize Vietnamese text (bỏ dấu)
function normalize(str) {
  return str.toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd');
}

function hasAnyKeyword(name, keywords) {
  const normName = normalize(name);
  const origName = name.toLowerCase();
  return keywords.some(kw => normName.includes(normalize(kw)) || origName.includes(kw.toLowerCase()));
}

// Trả về slug đích cho sản phẩm dựa theo parentSlug + tên sản phẩm
function getTargetSlug(productName, parentSlug) {
  // Ưu tiên: specific trước, general sau

  // ===== NAM =====
  if (parentSlug === 'nam') {
    if (hasAnyKeyword(productName, ['khoác', 'jacket', 'phao', 'bomber', 'chống nắng', 'windbreaker'])) {
      // Áo phao có "phao" — nếu là áo chứ không phải quần thì khoác
      if (hasAnyKeyword(productName, ['quần'])) return 'quan-nam';
      return 'ao-khoac-nam';
    }
    if (hasAnyKeyword(productName, ['thể thao', 'the thao', 'gym', 'sport', 'ba lỗ', 'ba lo', 'running', 'training', 'yoga'])) {
      if (hasAnyKeyword(productName, ['quần', 'short', 'sooc', 'shorts'])) return 'do-the-thao-nam';
      if (hasAnyKeyword(productName, ['bộ', 'bo', 'set'])) return 'do-the-thao-nam';
      return 'do-the-thao-nam';
    }
    if (hasAnyKeyword(productName, ['mặc nhà', 'mac nha', 'đồ bộ', 'bo mac', 'pyjama'])) return 'do-mac-nha-nam';
    if (hasAnyKeyword(productName, ['quần', 'jean', 'jeans', 'jogger', 'chino', 'cargo', 'khaki', 'sooc', 'short', 'shorts', 'âu', 'au'])) return 'quan-nam';
    if (hasAnyKeyword(productName, ['áo', 'polo', 'thun', 'sơ mi', 'hoodie', 'sweater', 'len', 'vest', 'blazer', 'crop'])) return 'ao-nam';
  }

  // ===== NỮ =====
  if (parentSlug === 'nu') {
    if (hasAnyKeyword(productName, ['váy', 'đầm', 'chân váy', 'vay', 'dam', 'maxi', 'skirt', 'dress'])) return 'vay-dam';
    if (hasAnyKeyword(productName, ['thể thao', 'the thao', 'gym', 'sport', 'yoga', 'legging', 'running', 'training', 'ba lỗ'])) return 'do-the-thao-nu';
    if (hasAnyKeyword(productName, ['mặc nhà', 'mac nha', 'đồ bộ', 'pyjama', 'bộ nữ', 'bo nu'])) return 'do-mac-nha-nu';
    if (hasAnyKeyword(productName, ['quần', 'jean', 'jeans', 'jogger', 'short', 'shorts', 'sooc', 'legging', 'cargo', 'khaki'])) return 'quan-nu';
    if (hasAnyKeyword(productName, ['áo', 'polo', 'thun', 'sơ mi', 'hoodie', 'sweater', 'len', 'khoác', 'crop', 'blouse', 'phao', 'blazer'])) return 'ao-nu';
  }

  // ===== TRẺ EM =====
  if (parentSlug === 'tre-em') {
    if (hasAnyKeyword(productName, ['bộ', 'bo', 'set', 'combo', 'đồ bộ'])) return 'bo-tre-em';
    if (hasAnyKeyword(productName, ['quần', 'jean', 'short', 'legging', 'jogger'])) return 'quan-tre-em';
    if (hasAnyKeyword(productName, ['áo', 'polo', 'thun', 'sơ mi', 'hoodie', 'khoác', 'phao'])) return 'ao-tre-em';
  }

  // ===== PHỤ KIỆN =====
  if (parentSlug === 'phu-kien') {
    if (hasAnyKeyword(productName, ['mũ', 'nón', 'cap', 'hat', 'beanie', 'bucket'])) return 'mu-non';
    if (hasAnyKeyword(productName, ['túi', 'ba lô', 'balo', 'backpack', 'tote', 'bag'])) return 'tui-ba-lo';
    if (hasAnyKeyword(productName, ['tất', 'vớ', 'sock'])) return 'tat-vo';
  }

  return null;
}

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  // Build maps
  const allCats = await Category.find({});
  const slugToId = {};
  const idToSlug = {};
  const idToParentId = {};
  allCats.forEach(c => {
    slugToId[c.slug] = c._id;
    idToSlug[c._id.toString()] = c.slug;
    if (c.parent) idToParentId[c._id.toString()] = c.parent.toString();
  });

  // Get all products currently in PARENT (root) categories
  const rootCatIds = allCats.filter(c => !c.parent).map(c => c._id);
  const products = await Product.find({ category: { $in: rootCatIds } }).populate('category', 'slug name');

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Products still in root categories: ${products.length}`);
  console.log('Processing...\n');

  for (const product of products) {
    const parentSlug = product.category?.slug;
    const targetSlug = getTargetSlug(product.name, parentSlug);

    if (!targetSlug) {
      console.log(`  [SKIP] "${product.name}" (${parentSlug}) → no match`);
      skipped++;
      continue;
    }

    const targetId = slugToId[targetSlug];
    if (!targetId) {
      console.log(`  [FAIL] "${product.name}" → slug "${targetSlug}" not found`);
      failed++;
      continue;
    }

    await Product.findByIdAndUpdate(product._id, { category: targetId });
    console.log(`  [OK] "${product.name}"`);
    console.log(`       ${parentSlug} → ${targetSlug}`);
    updated++;
  }

  console.log(`\n=== MIGRATION COMPLETE ===`);
  console.log(`Updated : ${updated}`);
  console.log(`Skipped : ${skipped}`);
  console.log(`Failed  : ${failed}`);

  // Verify
  console.log('\n=== VERIFY: Product counts per subcategory ===');
  for (const cat of allCats) {
    const count = await Product.countDocuments({ category: cat._id, isActive: true });
    const parentSlug = cat.parent ? idToSlug[cat.parent.toString()] : null;
    const label = parentSlug ? `  └─ "${cat.name}" (${cat.slug})` : `\n"${cat.name}" [ROOT] (${cat.slug})`;
    if (count > 0) console.log(`${label}: ${count} sản phẩm`);
  }

  await mongoose.disconnect();
  console.log('\nDone!');
}

migrate().catch(console.error);
