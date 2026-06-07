require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Product = require('../models/Product');

// ── Helper ────────────────────────────────────────────────────────────────────
const slugify = (str) =>
  str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

const UNSPLASH_IMAGES = {
  'ao-nam': [
    'photo-1622445275463-afa2ab738c34',
    'photo-1625910513969-4dcaf428e5fe',
    'photo-1586363104862-3a5e2ab60d99',
    'photo-1588359348347-9bc6cbbb689e',
    'photo-1521572163474-6864f9cf17ab',
    'photo-1583743814966-8936f5b7be1a',
    'photo-1576566588028-4147f3842f27',
    'photo-1562157873-818bc0726f68',
    'photo-1618354691373-d851c5c3a990',
    'photo-1596755094514-f87e34085b2c',
    'photo-1603252109303-2751441dd157',
    'photo-1602810318383-e386cc2a3ccf',
    'photo-1593032465175-481ac7f401a0'
  ],
  'ao-khoac-nam': [
    'photo-1551028719-00167b16eac5',
    'photo-1608063615781-e2ef8c73d114',
    'photo-1591047139829-d91aecb6caea',
    'photo-1544923246-77307dd270ce',
    'photo-1483985988355-763728e1935b',
    'photo-1551488831-00ddcb6c6bd3'
  ],
  'quan-nam': [
    'photo-1542272604-787c3835535d',
    'photo-1473966968600-fa801b869a1a',
    'photo-1624378439575-d8705ad7ae80',
    'photo-1541099649105-f69ad21f3246',
    'photo-1591195853828-11db59a44f6b',
    'photo-1560243563-062bfc001d68'
  ],
  'do-the-thao-nam': [
    'photo-1517838277536-f5f99be501cd',
    'photo-1476480862126-209bfaa8edc8',
    'photo-1506126613408-eca07ce68773',
    'photo-1518310383802-640c2de311b2',
    'photo-1534438327276-14e5300c3a48'
  ],
  'ao-nu': [
    'photo-1586790170083-2f9ceadc732d',
    'photo-1618354691229-88d47f285158',
    'photo-1594938298603-c8148c4dae35',
    'photo-1583496661160-fb5886a0aaaa',
    'photo-1554568218-0f1715e72254',
    'photo-1503342217505-b0a15ec3261c',
    'photo-1602810318383-e386cc2a3ccf',
    'photo-1556821840-3a63f95609a7',
    'photo-1578768079470-0a4536cc4e03'
  ],
  'quan-nu': [
    'photo-1541099649105-f69ad21f3246',
    'photo-1604176354204-9268737828e4',
    'photo-1584308666744-24d5c474f2ae',
    'photo-1509631179647-0177331693ae',
    'photo-1485462537746-965f33f7f6a7'
  ],
  'vay-dam': [
    'photo-1515372039744-b8f02a3ae446',
    'photo-1566479179817-073e36a7e0d2',
    'photo-1572804013309-59a88b7e92f1',
    'photo-1614786269829-d24616faf56d',
    'photo-1595777457583-95e059d581b8',
    'photo-1496747611176-843222e1e57c'
  ],
  'ao-tre-em': [
    'photo-1519238263530-99bdd11df2ea',
    'photo-1503944583220-79d8926ad5e2',
    'photo-1622290291468-a28f7a7dc6a8',
    'photo-1471286174890-9c112ffca5b4',
    'photo-1519457431-44ccd64a579b',
    'photo-1514090458221-65bb69cf63e6'
  ],
  'quan-tre-em': [
    'photo-1622290291468-a28f7a7dc6a8',
    'photo-1519457431-44ccd64a579b',
    'photo-1503944583220-79d8926ad5e2',
    'photo-1519238263530-99bdd11df2ea'
  ],
  'mu-non': [
    'photo-1576871337622-98d48d1cf531',
    'photo-1556306535-0f09a537f0a3',
    'photo-1588850561407-ed78c334e67a',
    'photo-1521369909029-2afed882baee'
  ],
  'tui-ba-lo': [
    'photo-1553062407-98eeb64c6a62',
    'photo-1547949003-9792a18a2601',
    'photo-1584917865442-de89df76afd3',
    'photo-1590874103328-eac38a683ce7'
  ]
};

const getHashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const getUnsplashImages = (catSlug, seedString, count = 2) => {
  const pool = UNSPLASH_IMAGES[catSlug] || UNSPLASH_IMAGES['ao-nam'];
  const hash = getHashCode(seedString);
  const images = [];
  for (let i = 0; i < count; i++) {
    const imgId = pool[(hash + i) % pool.length];
    images.push(`https://images.unsplash.com/${imgId}?w=600&h=800&fit=crop&q=80`);
  }
  return images;
};

const COLORS_MALE = [
  { id: 'white', name: 'Trắng', hex: '#FFFFFF' },
  { id: 'black', name: 'Đen', hex: '#000000' },
  { id: 'navy', name: 'Xanh Navy', hex: '#1a2a5e' },
  { id: 'gray', name: 'Xám', hex: '#808080' },
  { id: 'olive', name: 'Xanh Rêu', hex: '#556B2F' },
  { id: 'brown', name: 'Nâu', hex: '#8B4513' },
  { id: 'beige', name: 'Be', hex: '#F5F5DC' },
  { id: 'blue', name: 'Xanh Dương', hex: '#2563EB' },
  { id: 'red', name: 'Đỏ', hex: '#E31837' },
  { id: 'khaki', name: 'Khaki', hex: '#C3B091' },
];

const COLORS_FEMALE = [
  { id: 'white', name: 'Trắng', hex: '#FFFFFF' },
  { id: 'black', name: 'Đen', hex: '#000000' },
  { id: 'pink', name: 'Hồng', hex: '#FFB6C1' },
  { id: 'lavender', name: 'Tím Lavender', hex: '#E6E6FA' },
  { id: 'sky', name: 'Xanh Nhạt', hex: '#87CEEB' },
  { id: 'beige', name: 'Be', hex: '#F5F5DC' },
  { id: 'mint', name: 'Xanh Mint', hex: '#98FF98' },
  { id: 'floral', name: 'Hoa Nhí', hex: '#FF69B4' },
  { id: 'gray', name: 'Xám', hex: '#808080' },
  { id: 'navy', name: 'Xanh Navy', hex: '#1a2a5e' },
];

const COLORS_KIDS = [
  { id: 'yellow', name: 'Vàng', hex: '#FFD700' },
  { id: 'mint', name: 'Xanh Mint', hex: '#98FF98' },
  { id: 'pink', name: 'Hồng', hex: '#FFB6C1' },
  { id: 'white', name: 'Trắng', hex: '#FFFFFF' },
  { id: 'blue', name: 'Xanh Dương', hex: '#2563EB' },
  { id: 'red', name: 'Đỏ', hex: '#FF4500' },
  { id: 'purple', name: 'Tím', hex: '#9B59B6' },
];

const SIZES_AO = ['S', 'M', 'L', 'XL', '2XL'];
const SIZES_QUAN = ['28', '29', '30', '31', '32', '33', '34'];
const SIZES_KIDS = ['2', '3', '4', '5', '6', '7', '8'];
const SIZES_FREE = ['FREE SIZE'];

const makeVariants = (colors, sizes) =>
  colors.flatMap((c) =>
    sizes.map((s) => ({
      colorId: c.id,
      colorName: c.name,
      colorHex: c.hex,
      size: s,
      stock: rand(5, 50),
    }))
  );

const pickColors = (pool, n) => pool.slice(0, n);

// ── Product definitions (scraped from yody.vn) ──────────────────────────────
// Format: [name, originalPrice, salePrice, catSlug, sizes, colorPool, tags, isNew, isBestSeller, isFeatured]
const RAW = [
  // ── ÁO NAM ──────────────────────────────────────────────────────────────
  ['Áo Polo Nam Basic HODY Vải Siêu Co Giãn Bo Cổ Dệt', 299000, 299000, 'ao-nam', SIZES_AO, COLORS_MALE, 4, ['polo', 'nam', 'co gian'], false, true, true],
  ['Áo Polo Nam Nẹp Che Cúc Regular Fit', 299000, 299000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['polo', 'nam', 'basic'], false, false, true],
  ['Áo Polo Nam Waffle Siêu Co Giãn', 299000, 299000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['polo', 'nam', 'waffle'], true, false, false],
  ['Áo Polo Nam Mắt Chim Cơ Bản Dáng Suông', 299000, 299000, 'ao-nam', SIZES_AO, COLORS_MALE, 4, ['polo', 'nam', 'suong'], false, true, true],
  ['Áo Polo Nam S.Cafe Dệt Tổ Ong Phối Cổ', 299000, 299000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['polo', 'nam', 'cafe', 'to ong'], true, false, false],
  ['Áo Polo Nam S.Cafe Dệt Tổ Ong Bo Cổ Kẻ', 149000, 149000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['polo', 'nam', 'ke'], false, false, false],
  ['Áo Polo Nam S.Cafe Dệt Tổ Ong Basic', 399000, 399000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['polo', 'nam', 'basic'], false, true, false],
  ['Áo Polo Nam Regular Họa Tiết Kẻ Ngang', 399000, 399000, 'ao-nam', SIZES_AO, COLORS_MALE, 4, ['polo', 'nam', 'ke ngang'], true, false, false],
  ['Áo Polo Nam Nẹp Bốn Cúc Classic', 349000, 249000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['polo', 'nam', 'classic'], false, false, false],
  ['Áo Polo Nam Hoạ Tiết Kẻ Premium', 369000, 369000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['polo', 'nam', 'hoa tiet'], true, false, true],
  ['Áo Thun Nam Cổ Tròn Basic Cotton 100%', 199000, 199000, 'ao-nam', SIZES_AO, COLORS_MALE, 5, ['thun', 'nam', 'basic', 'cotton'], false, true, true],
  ['Áo Thun Nam Tay Lỡ Oversize', 199000, 199000, 'ao-nam', SIZES_AO, COLORS_MALE, 4, ['thun', 'nam', 'oversize', 'tay lo'], true, false, true],
  ['Áo Thun Nam Họa Tiết Kẻ To Streetwear', 299000, 299000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['thun', 'nam', 'streetwear', 'ke to'], true, false, false],
  ['Áo Phông Nam Cổ Nẹp Cúc', 149000, 149000, 'ao-nam', SIZES_AO, COLORS_MALE, 4, ['phong', 'nam', 'nep cuc'], false, false, false],
  ['Áo Hoodie Nam Nỉ Bông Dáng Thụng', 549000, 449000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['hoodie', 'nam', 'ni bong'], false, true, true],
  ['Áo Hoodie Nam Fleece Giữ Nhiệt', 499000, 399000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['hoodie', 'nam', 'fleece'], true, false, false],
  ['Áo Sơ Mi Nam Ngắn Tay Asymmetrical', 449000, 449000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['so mi', 'nam', 'ngan tay'], true, false, false],
  ['Áo Sơ Mi Nam Ngắn Tay Raglan Collection', 399000, 399000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['so mi', 'nam', 'raglan'], false, false, false],
  ['Áo Sơ Mi Nam Ngắn Tay Relax Fit', 449000, 449000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['so mi', 'nam', 'relax fit'], false, true, false],
  ['Áo Sơ Mi Nam Regular Fit Pleat', 499000, 499000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['so mi', 'nam', 'regular fit'], false, false, true],
  ['Áo Sơ Mi Nam Dài Tay Relax Fit Collection', 529000, 264500, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['so mi', 'nam', 'dai tay', 'sale'], false, false, false],
  ['Áo Sơ Mi Nam Ngắn Tay Có Túi Ngực 3M', 469000, 469000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['so mi', 'nam', 'tui nguc'], false, false, false],
  ['Áo Sơ Mi Nam Ngắn Tay Kẻ Caro', 399000, 399000, 'ao-nam', SIZES_AO, COLORS_MALE, 4, ['so mi', 'nam', 'ke caro'], true, false, false],
  ['Áo Sơ Mi Nam Dài Tay Knit Kẻ Sọc', 399000, 299000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['so mi', 'nam', 'knit', 'ke soc'], true, false, false],
  ['Áo Sơ Mi Nam Túi Ngực 3M Premium', 499000, 499000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['so mi', 'nam', 'premium'], false, true, false],
  ['Áo Sơ Mi Nam Dài Tay Cafe Chống Nhăn', 499000, 499000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['so mi', 'nam', 'cafe', 'chong nhan'], false, false, true],
  ['Áo Sơ Mi Nam Dài Tay Họa Tiết Pattern', 499000, 299000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['so mi', 'nam', 'hoa tiet'], false, false, false],
  ['Áo Sơ Mi Nam Dài Tay Sợi Tre Quốc Dân', 399000, 399000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['so mi', 'nam', 'soi tre'], false, true, false],
  ['Áo Ba Lỗ Nam Thể Thao Co Giãn 4 Chiều', 149000, 149000, 'ao-nam', SIZES_AO, COLORS_MALE, 3, ['ba lo', 'nam', 'the thao'], false, false, false],

  // ── ÁO KHOÁC NAM ────────────────────────────────────────────────────────
  ['Áo Khoác Jacket Nam 2 Lớp Chống Gió', 699000, 549000, 'ao-khoac-nam', SIZES_AO, COLORS_MALE, 3, ['jacket', 'khoac', 'nam', 'chong gio'], true, true, true],
  ['Áo Khoác Chống Nắng Nam Có Mũ', 599000, 599000, 'ao-khoac-nam', SIZES_AO, COLORS_MALE, 3, ['chong nang', 'nam', 'co mu'], false, false, true],
  ['Áo Khoác Chống Nắng Nam Có Mũ Premium', 799000, 799000, 'ao-khoac-nam', SIZES_AO, COLORS_MALE, 3, ['chong nang', 'nam', 'premium'], false, true, false],
  ['Áo Khoác Chống Nắng Toàn Thân Nam', 549000, 549000, 'ao-khoac-nam', SIZES_AO, COLORS_MALE, 3, ['chong nang', 'nam', 'toan than'], true, false, false],
  ['Áo Khoác Chống Nắng Siêu Thoải Mái Nam', 449000, 359200, 'ao-khoac-nam', SIZES_AO, COLORS_MALE, 3, ['chong nang', 'nam', 'thoai mai', 'sale'], false, false, false],
  ['Áo Phao Nam 4S Chống Lạnh', 899000, 749000, 'ao-khoac-nam', SIZES_AO, COLORS_MALE, 3, ['phao', 'nam', '4s', 'chong lanh'], true, true, true],
  ['Áo Gió Nam Đa Năng Chống Nước', 699000, 599000, 'ao-khoac-nam', SIZES_AO, COLORS_MALE, 3, ['gio', 'nam', 'da nang', 'chong nuoc'], true, false, true],
  ['Áo Giữ Nhiệt Nam XTRA-HEAT™', 499000, 399000, 'ao-khoac-nam', SIZES_AO, COLORS_MALE, 3, ['giu nhiet', 'nam', 'xtra heat'], false, true, false],
  ['Áo Vest Nam Business Casual', 899000, 749000, 'ao-khoac-nam', SIZES_AO, COLORS_MALE, 3, ['vest', 'nam', 'business', 'casual'], false, false, true],

  // ── QUẦN NAM ────────────────────────────────────────────────────────────
  ['Quần Jean Nam Regular Denim Like', 599000, 599000, 'quan-nam', SIZES_QUAN, COLORS_MALE, 3, ['jean', 'nam', 'regular', 'denim'], false, true, true],
  ['Quần Jean Nam Regular Siêu Nhẹ Co Giãn', 549000, 439200, 'quan-nam', SIZES_QUAN, COLORS_MALE, 3, ['jean', 'nam', 'co gian', 'sale'], false, true, false],
  ['Quần Jeans Nam Ống Suông Cạp Chun Mỏng Nhẹ', 379000, 379000, 'quan-nam', SIZES_QUAN, COLORS_MALE, 3, ['jean', 'nam', 'ong suong', 'cap chun'], true, false, false],
  ['Quần Jeans Suông Gai Xanh Cao Cấp', 399000, 399000, 'quan-nam', SIZES_QUAN, COLORS_MALE, 3, ['jean', 'nam', 'suong', 'gai xanh'], false, false, false],
  ['Quần Khaki Nam Casual Phom Relax', 499000, 499000, 'quan-nam', SIZES_QUAN, COLORS_MALE, 4, ['khaki', 'nam', 'casual', 'relax'], false, false, true],
  ['Quần Khaki Nam Túi Ốp Business', 699000, 699000, 'quan-nam', SIZES_QUAN, COLORS_MALE, 3, ['khaki', 'nam', 'business', 'tui op'], false, true, true],
  ['Quần Khaki Nam Business Đai Sườn Cài Cúc', 699000, 699000, 'quan-nam', SIZES_QUAN, COLORS_MALE, 3, ['khaki', 'nam', 'business', 'dai suon'], false, false, false],
  ['Quần Short Jeans Nam Cạp Phối Cúc', 399000, 399000, 'quan-nam', SIZES_QUAN, COLORS_MALE, 3, ['short', 'jean', 'nam', 'cap phoi cuc'], true, false, false],
  ['Quần Shorts Nam Đũi Cạp Chun Dây Rút', 369000, 369000, 'quan-nam', SIZES_AO, COLORS_MALE, 3, ['shorts', 'nam', 'dui', 'cap chun'], false, false, false],
  ['Quần Sooc Nam Túi Cạnh Sườn 4 Túi', 599000, 599000, 'quan-nam', SIZES_AO, COLORS_MALE, 3, ['sooc', 'nam', 'tui canh suon'], false, true, false],
  ['Quần Âu Nam Cạp Di Động Ống Đứng', 549000, 549000, 'quan-nam', SIZES_QUAN, COLORS_MALE, 3, ['au', 'nam', 'cap di dong', 'ong dung'], false, false, true],
  ['Quần Âu Nam Ngang Mắt Cá Chân Khóa Kéo', 399000, 399000, 'quan-nam', SIZES_QUAN, COLORS_MALE, 3, ['au', 'nam', 'mat ca chan'], false, false, false],
  ['Quần Âu Nam Cạp Di Động Phom Regular', 569000, 569000, 'quan-nam', SIZES_QUAN, COLORS_MALE, 3, ['au', 'nam', 'regular', 'cap di dong'], false, true, false],
  ['Quần Âu Nam Nano Mắt Cá Chân Cao Cấp', 499000, 249500, 'quan-nam', SIZES_QUAN, COLORS_MALE, 3, ['au', 'nam', 'nano', 'sale'], false, false, false],
  ['Quần Âu Nam Slim Fit Cạp Chun Siêu Phẳng', 499000, 499000, 'quan-nam', SIZES_QUAN, COLORS_MALE, 3, ['au', 'nam', 'slim fit', 'cap chun'], false, false, false],
  ['Quần Âu Nam Cạp Chun Daily Pant', 499000, 249500, 'quan-nam', SIZES_QUAN, COLORS_MALE, 4, ['au', 'nam', 'daily', 'cap chun', 'sale'], false, true, false],
  ['Quần Âu Nam Cạp Chun Ốp Sport', 499000, 399200, 'quan-nam', SIZES_QUAN, COLORS_MALE, 3, ['au', 'nam', 'sport', 'cap chun op'], true, false, false],
  ['Quần Âu Nam Baggy Xếp Ly Trước Trendy', 449000, 224500, 'quan-nam', SIZES_QUAN, COLORS_MALE, 3, ['au', 'nam', 'baggy', 'xep ly', 'sale'], true, false, true],

  // ── ĐỒ THỂ THAO NAM ─────────────────────────────────────────────────────
  ['Áo Polo Thể Thao Nam Co Giãn 4 Chiều', 349000, 299000, 'do-the-thao-nam', SIZES_AO, COLORS_MALE, 3, ['polo', 'the thao', 'nam', 'co gian'], false, false, true],
  ['Quần Thể Thao Nam Co Giãn Thoáng Khí', 299000, 249000, 'do-the-thao-nam', SIZES_AO, COLORS_MALE, 3, ['the thao', 'nam', 'thoang khi'], false, true, false],
  ['Áo Thun Thể Thao Nam Dry-Fit Thoáng Mát', 249000, 199000, 'do-the-thao-nam', SIZES_AO, COLORS_MALE, 3, ['thun', 'the thao', 'nam', 'dry fit'], true, false, false],
  ['Bộ Thể Thao Nam Áo + Quần Phối Màu', 599000, 499000, 'do-the-thao-nam', SIZES_AO, COLORS_MALE, 3, ['bo the thao', 'nam', 'phoi mau'], false, false, false],

  // ── ÁO NỮ ───────────────────────────────────────────────────────────────
  ['Áo Polo Nữ Vải Siêu Co Giãn Bo Cổ Dệt', 299000, 299000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 4, ['polo', 'nu', 'co gian'], false, true, true],
  ['Áo Polo Nữ Cơ Bản Dáng Suông', 299000, 299000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 3, ['polo', 'nu', 'suong', 'basic'], false, false, true],
  ['Áo Polo Nữ S.Cafe Dệt Tổ Ong Phối Cổ', 299000, 299000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 3, ['polo', 'nu', 'cafe', 'to ong'], true, false, false],
  ['Áo Polo Nữ Mắt Chim Phối Bo', 249000, 249000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 3, ['polo', 'nu', 'mat chim'], false, false, false],
  ['Áo Polo Nữ Kẻ Dáng Suông Cổ V', 369000, 369000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 3, ['polo', 'nu', 'ke', 'co v'], false, true, false],
  ['Áo Thun Nữ Slim Fit Cổ Tròn Cotton Mềm', 169000, 169000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 5, ['thun', 'nu', 'slim fit', 'cotton'], false, true, true],
  ['Áo Thun Nữ Slim Fit Cổ Rộng Thoáng Mát', 299000, 299000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 4, ['thun', 'nu', 'slim fit', 'co rong'], false, false, true],
  ['Áo Phông Nữ Regular Cổ Tim', 169000, 169000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 4, ['phong', 'nu', 'co tim'], false, false, false],
  ['Áo Phông Nữ Crop Top Thun Rib Trẻ Trung', 299000, 299000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 4, ['croptop', 'nu', 'thun rib'], true, false, true],
  ['Áo Ba Lỗ Nữ In Hình Đệm Ngực Liền', 299000, 299000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 4, ['ba lo', 'nu', 'in hinh'], true, false, false],
  ['Áo Ba Lỗ Nữ Đệm Ngực Liền Basic', 129000, 129000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 4, ['ba lo', 'nu', 'dem nguc'], false, false, false],
  ['Áo Sơ Mi Nữ Nano Dài Tay Slim Fit', 299000, 299000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 3, ['so mi', 'nu', 'nano', 'slim fit'], false, false, true],
  ['Áo Sơ Mi Nữ Ngắn Tay Asymmetrical', 449000, 449000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 3, ['so mi', 'nu', 'ngan tay'], true, false, false],
  ['Áo Sơ Mi Tay Dài Nữ Knit Suông Kẻ', 399000, 299000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 3, ['so mi', 'nu', 'knit', 'ke'], true, false, false],
  ['Áo Hoodie Nữ Nỉ Bông Dáng Rộng', 499000, 399000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 3, ['hoodie', 'nu', 'ni bong'], false, true, false],
  ['Áo Croptop Nữ Năng Động Trẻ Trung', 249000, 199000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 4, ['croptop', 'nu', 'nang dong'], true, false, false],
  ['Áo Phông Basic Regular Unisex', 199000, 199000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 5, ['phong', 'basic', 'unisex'], false, true, true],

  // ── ÁO KHOÁC NỮ ─────────────────────────────────────────────────────────
  ['Áo Khoác Chống Nắng Nữ Đa Năng Anti UV', 369000, 369000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 3, ['chong nang', 'nu', 'anti uv'], false, true, true],
  ['Áo Khoác Chống Nắng Nữ Đa Năng Premium', 449000, 359200, 'ao-nu', SIZES_AO, COLORS_FEMALE, 3, ['chong nang', 'nu', 'premium', 'sale'], false, false, false],
  ['Áo Chống Nắng Nữ Đa Năng Anti UV Versatile', 549000, 549000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 3, ['chong nang', 'nu', 'anti uv', 'versatile'], true, false, false],
  ['Áo Chống Nắng Nữ Dáng Suông Chống UV', 549000, 499000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 3, ['chong nang', 'nu', 'suong'], false, false, true],
  ['Áo Phao Nữ 4S Giữ Ấm Cao Cấp', 799000, 649000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 3, ['phao', 'nu', '4s', 'giu am'], false, true, true],
  ['Áo Gió Nữ Đa Năng Nhẹ Thoáng', 599000, 499000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 3, ['gio', 'nu', 'da nang', 'nhe thoang'], true, false, false],
  ['Áo Giữ Nhiệt Nữ XTRA-HEAT™', 449000, 349000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 3, ['giu nhiet', 'nu', 'xtra heat'], false, true, false],
  ['Áo Măng Tô Nữ Dáng Dài Thanh Lịch', 1199000, 999000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 3, ['mang to', 'nu', 'thanh lich'], false, false, true],
  ['Áo Vest Nữ Dáng Suông Business', 799000, 699000, 'ao-nu', SIZES_AO, COLORS_FEMALE, 3, ['vest', 'nu', 'business', 'suong'], false, false, false],

  // ── QUẦN NỮ ─────────────────────────────────────────────────────────────
  ['Quần Jeans Nữ Barrel Light Weight', 499000, 499000, 'quan-nu', SIZES_QUAN, COLORS_FEMALE, 3, ['jean', 'nu', 'barrel', 'light weight'], true, false, true],
  ['Quần Jeans Nữ Ống Suông Cạp Chun Mỏng', 379000, 379000, 'quan-nu', SIZES_QUAN, COLORS_FEMALE, 3, ['jean', 'nu', 'suong', 'cap chun'], false, true, false],
  ['Quần Kaki Nữ Lưng Cao Ống Ôm Co Giãn', 599000, 599000, 'quan-nu', SIZES_QUAN, COLORS_FEMALE, 3, ['kaki', 'nu', 'lung cao', 'ong om'], false, false, true],
  ['Quần Khaki Baggy Nữ Cạp Bán Chun', 399000, 399000, 'quan-nu', SIZES_QUAN, COLORS_FEMALE, 3, ['khaki', 'nu', 'baggy', 'cap ban chun'], true, false, false],
  ['Quần Short Jeans Ngắn Chữ A Chiết Ly Túi Ốp', 399000, 399000, 'quan-nu', SIZES_QUAN, COLORS_FEMALE, 3, ['short', 'jean', 'nu', 'chu a', 'chiet ly'], false, false, false],
  ['Quần Tây Nữ Straight Essential', 399000, 399000, 'quan-nu', SIZES_QUAN, COLORS_FEMALE, 3, ['tay', 'nu', 'straight', 'essential'], false, true, false],
  ['Quần Âu Nữ Baggy Essential Thời Trang', 399000, 399000, 'quan-nu', SIZES_QUAN, COLORS_FEMALE, 3, ['au', 'nu', 'baggy', 'essential'], false, false, true],
  ['Quần Âu Nữ Regular Tôn Dáng', 399000, 399000, 'quan-nu', SIZES_QUAN, COLORS_FEMALE, 3, ['au', 'nu', 'regular', 'ton dang'], false, false, false],
  ['Quần Âu Nữ Côn Túi Tam Giác Trendy', 449000, 449000, 'quan-nu', SIZES_QUAN, COLORS_FEMALE, 3, ['au', 'nu', 'con', 'tui tam giac'], true, false, true],
  ['Quần Âu Nữ Baggy Trang Trí Đai Cạp', 549000, 549000, 'quan-nu', SIZES_QUAN, COLORS_FEMALE, 3, ['au', 'nu', 'baggy', 'day cap'], false, true, false],
  ['Quần Âu Nữ Loe Cúc Bọc Cạp Chun Đáp', 549000, 384300, 'quan-nu', SIZES_QUAN, COLORS_FEMALE, 3, ['au', 'nu', 'loe', 'sale'], false, false, false],
  ['Quần Tây Nữ Suông Đứng Cạp Trang Trí Đai', 549000, 384300, 'quan-nu', SIZES_QUAN, COLORS_FEMALE, 3, ['tay', 'nu', 'suong dung', 'sale'], false, false, true],

  // ── VÁY ĐẦM ─────────────────────────────────────────────────────────────
  ['Váy Liền Thân Nữ Thiết Kế Hiện Đại', 399000, 319000, 'vay-dam', SIZES_AO, COLORS_FEMALE, 3, ['vay', 'nu', 'lien than'], true, false, true],
  ['Đầm Nữ Dáng Xòe Hoa Nhí Dịu Dàng', 549000, 449000, 'vay-dam', SIZES_AO, COLORS_FEMALE, 3, ['dam', 'nu', 'xoe', 'hoa nhi'], true, true, true],
  ['Chân Váy Nữ Mini Dáng Chữ A', 399000, 299000, 'vay-dam', SIZES_AO, COLORS_FEMALE, 3, ['chan vay', 'nu', 'mini', 'chu a'], true, false, false],
  ['Chân Váy Nữ Midi Pleated Thanh Lịch', 499000, 399000, 'vay-dam', SIZES_AO, COLORS_FEMALE, 3, ['chan vay', 'nu', 'midi', 'pleated'], false, true, false],
  ['Đầm Maxi Hoa In Mềm Bay', 599000, 499000, 'vay-dam', SIZES_AO, COLORS_FEMALE, 3, ['dam maxi', 'nu', 'hoa in', 'mem bay'], false, false, true],

  // ── ÁO TRẺ EM ───────────────────────────────────────────────────────────
  ['Áo Thun Trẻ Em HODY Kids Cotton 100%', 149000, 119000, 'ao-tre-em', SIZES_KIDS, COLORS_KIDS, 4, ['ao thun', 'tre em', 'kids', 'cotton'], false, true, true],
  ['Áo Polo Trẻ Em Thoáng Khí', 199000, 159000, 'ao-tre-em', SIZES_KIDS, COLORS_KIDS, 3, ['polo', 'tre em', 'thoang khi'], false, false, true],
  ['Áo Sơ Mi Trẻ Em Nhẹ Nhàng', 169000, 139000, 'ao-tre-em', SIZES_KIDS, COLORS_KIDS, 3, ['so mi', 'tre em', 'nhe nhang'], true, false, false],
  ['Áo Hoodie Nỉ Trẻ Em In Hình Cute', 299000, 249000, 'ao-tre-em', SIZES_KIDS, COLORS_KIDS, 4, ['hoodie', 'tre em', 'in hinh', 'cute'], false, true, false],
  ['Áo Khoác Chống Nắng Trẻ Em Anti UV', 399000, 349000, 'ao-tre-em', SIZES_KIDS, COLORS_KIDS, 3, ['chong nang', 'tre em', 'anti uv'], false, false, true],
  ['Áo Len Trẻ Em Ấm Áp Mùa Đông', 249000, 199000, 'ao-tre-em', SIZES_KIDS, COLORS_KIDS, 3, ['len', 'tre em', 'am ap'], false, false, false],

  // ── QUẦN TRẺ EM ─────────────────────────────────────────────────────────
  ['Quần Short Trẻ Em Thể Thao', 149000, 119000, 'quan-tre-em', SIZES_KIDS, COLORS_KIDS, 4, ['short', 'tre em', 'the thao'], false, true, false],
  ['Quần Dài Trẻ Em Cotton Mềm Mại', 179000, 149000, 'quan-tre-em', SIZES_KIDS, COLORS_KIDS, 3, ['quan dai', 'tre em', 'cotton'], false, false, false],
  ['Quần Jeans Trẻ Em Slim Fit', 299000, 249000, 'quan-tre-em', SIZES_KIDS, COLORS_KIDS, 3, ['jean', 'tre em', 'slim fit'], true, false, false],
  ['Quần Kaki Trẻ Em Năng Động', 249000, 199000, 'quan-tre-em', SIZES_KIDS, COLORS_KIDS, 3, ['kaki', 'tre em', 'nang dong'], false, false, true],

  // ── MŨ/NÓN ──────────────────────────────────────────────────────────────
  ['Mũ Bucket HODY Streetwear Thêu Logo', 199000, 159000, 'mu-non', SIZES_FREE, COLORS_MALE, 3, ['mu', 'bucket', 'phu kien', 'streetwear'], true, false, false],
  ['Nón Kết HODY Classic Logo', 199000, 169000, 'mu-non', SIZES_FREE, COLORS_MALE, 3, ['non ket', 'phu kien', 'classic'], false, true, false],
  ['Mũ Nỉ Beanie Mùa Đông Ấm Áp', 149000, 119000, 'mu-non', SIZES_FREE, COLORS_MALE, 4, ['beanie', 'mu ni', 'phu kien', 'am ap'], false, false, false],

  // ── TÚI/BA LÔ ───────────────────────────────────────────────────────────
  ['Túi Tote Canvas HODY Thời Trang', 249000, 199000, 'tui-ba-lo', SIZES_FREE, COLORS_MALE, 3, ['tui tote', 'canvas', 'phu kien'], true, false, false],
  ['Ba Lô HODY Mini Compact Đi Học', 499000, 399000, 'tui-ba-lo', SIZES_FREE, COLORS_MALE, 3, ['ba lo', 'mini', 'phu kien', 'di hoc'], false, true, false],
];

// ── Seed function ─────────────────────────────────────────────────────────────
const seed = async () => {
  await connectDB();

  // Build category map: slug → _id
  const cats = await Category.find({});
  const catMap = {};
  cats.forEach((c) => { catMap[c.slug] = c._id; });

  const missing = [];
  RAW.forEach(([, , , catSlug]) => {
    if (!catMap[catSlug]) missing.push(catSlug);
  });
  if (missing.length) {
    const unique = [...new Set(missing)];
    console.error('\n❌ Missing categories in DB:', unique.join(', '));
    console.error('   Run the main seed.js first to create parent categories.\n');
    process.exit(1);
  }

  // Remove old products (only those with HODY or Yody in name to avoid re-seeding collisions)
  const existing = await Product.countDocuments({});
  if (existing > 0) {
    console.log(`⚠️  Found ${existing} existing products. Deleting all before re-seeding...`);
    await Product.deleteMany({});
  }

  // Build product docs
  const usedSlugs = new Set();
  const docs = RAW.map(([name, originalPrice, salePrice, catSlug, sizes, colorPool, nColors, tags, isNew, isBestSeller, isFeatured]) => {
    const colors = pickColors(colorPool, nColors);
    const slug_base = slugify(name);
    let slug = slug_base;
    let suffix = 2;
    while (usedSlugs.has(slug)) { slug = `${slug_base}-${suffix++}`; }
    usedSlugs.add(slug);

    const discount = originalPrice > salePrice
      ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
      : 0;

    return {
      name,
      slug,
      description: `${name} - Sản phẩm chất lượng cao từ HODY. Chất liệu cao cấp, thiết kế hiện đại, phù hợp nhiều phong cách.`,
      category: catMap[catSlug],
      images: getUnsplashImages(catSlug, name, 2),
      colors: colors.map((c) => ({ id: c.id, name: c.name, hex: c.hex, images: getUnsplashImages(catSlug, name + ' ' + c.name, 2) })),
      sizes,
      variants: makeVariants(colors, sizes),
      originalPrice,
      salePrice,
      discount,
      rating: 0,
      reviewCount: 0,
      sold: 0,
      isNew,
      isBestSeller,
      isFeatured,
      isActive: true,
      tags,
    };
  });

  // Insert many in batch
  const BATCH = 20;
  let count = 0;
  for (let i = 0; i < docs.length; i += BATCH) {
    const batch = docs.slice(i, i + BATCH);
    await Product.insertMany(batch, { ordered: false });
    count += batch.length;
    console.log(`   Inserted ${count}/${docs.length} products...`);
  }

  console.log(`\n✅ Done! Seeded ${docs.length} products from Yody into MongoDB.`);
  console.log(`   Categories used: ${[...new Set(RAW.map((r) => r[3]))].join(', ')}`);
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
