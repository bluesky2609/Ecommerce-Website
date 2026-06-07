require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Blog = require('../models/Blog');
const Coupon = require('../models/Coupon');

const seed = async () => {
  await connectDB();

  console.log('Clearing old data...');
  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    Product.deleteMany(),
    Blog.deleteMany(),
    Coupon.deleteMany(),
  ]);

  // ─── Users ──────────────────────────────────────────────
  console.log('Seeding users...');
  const adminPass = await bcrypt.hash('admin123', 10);
  const demoPass = await bcrypt.hash('123456', 10);
  const [admin, demoUser] = await User.insertMany([
    { name: 'Admin HODY', email: 'admin@hody.vn', password: adminPass, role: 'admin', isVerified: true, isActive: true },
    { name: 'Nguyễn Văn Demo', email: 'demo@hody.vn', password: demoPass, role: 'user', isVerified: true, isActive: true },
  ]);

  // ─── Categories ─────────────────────────────────────────
  console.log('Seeding categories...');
  const [nam, nu, treEm, phuKien] = await Category.insertMany([
    { name: 'Nam', slug: 'nam', order: 1, image: 'https://th.bing.com/th/id/OIP.p_yehQVwkuKIU17JdBFCzgHaJ4?w=208&h=277&c=7&r=0&o=5&dpr=1.3&pid=1.7' },
    { name: 'Nữ', slug: 'nu', order: 2, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
    { name: 'Trẻ Em', slug: 'tre-em', order: 3, image: 'https://images.unsplash.com/photo-1503917988258-f19772042ee5?w=400' },
    { name: 'Phụ Kiện', slug: 'phu-kien', order: 4, image: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfc?w=400' },
  ]);

  const subCats = await Category.insertMany([
    // Nam
    { name: 'Áo Nam', slug: 'ao-nam', parent: nam._id, order: 1 },
    { name: 'Quần Nam', slug: 'quan-nam', parent: nam._id, order: 2 },
    { name: 'Áo Khoác Nam', slug: 'ao-khoac-nam', parent: nam._id, order: 3 },
    { name: 'Đồ Mặc Nhà Nam', slug: 'do-mac-nha-nam', parent: nam._id, order: 4 },
    { name: 'Đồ Thể Thao Nam', slug: 'do-the-thao-nam', parent: nam._id, order: 5 },
    // Nữ
    { name: 'Áo Nữ', slug: 'ao-nu', parent: nu._id, order: 1 },
    { name: 'Quần Nữ', slug: 'quan-nu', parent: nu._id, order: 2 },
    { name: 'Váy/Đầm', slug: 'vay-dam', parent: nu._id, order: 3 },
    { name: 'Đồ Mặc Nhà Nữ', slug: 'do-mac-nha-nu', parent: nu._id, order: 4 },
    { name: 'Đồ Thể Thao Nữ', slug: 'do-the-thao-nu', parent: nu._id, order: 5 },
    // Trẻ Em
    { name: 'Áo Trẻ Em', slug: 'ao-tre-em', parent: treEm._id, order: 1 },
    { name: 'Quần Trẻ Em', slug: 'quan-tre-em', parent: treEm._id, order: 2 },
    { name: 'Bộ Trẻ Em', slug: 'bo-tre-em', parent: treEm._id, order: 3 },
    // Phụ Kiện
    { name: 'Mũ/Nón', slug: 'mu-non', parent: phuKien._id, order: 1 },
    { name: 'Túi/Ba Lô', slug: 'tui-ba-lo', parent: phuKien._id, order: 2 },
    { name: 'Tất/Vớ', slug: 'tat-vo', parent: phuKien._id, order: 3 },
  ]);

  const aoNam = subCats.find((c) => c.slug === 'ao-nam');
  const quanNam = subCats.find((c) => c.slug === 'quan-nam');
  const aoKhoacNam = subCats.find((c) => c.slug === 'ao-khoac-nam');
  const aoNu = subCats.find((c) => c.slug === 'ao-nu');
  const vayDam = subCats.find((c) => c.slug === 'vay-dam');
  const aoTreEm = subCats.find((c) => c.slug === 'ao-tre-em');
  const muNon = subCats.find((c) => c.slug === 'mu-non');

  // ─── Products ───────────────────────────────────────────
  console.log('Seeding products...');

  const sizes_ao = ['S', 'M', 'L', 'XL', '2XL'];
  const sizes_quan = ['28', '29', '30', '31', '32', '33', '34'];
  const sizes_kids = ['2', '3', '4', '5', '6', '7', '8'];

  const makeVariants = (colors, sizes) =>
    colors.flatMap((c) => sizes.map((s) => ({ colorId: c.id, colorName: c.name, colorHex: c.hex, size: s, stock: Math.floor(Math.random() * 30) + 5 })));

  // ── Real product images from Unsplash ──────────────────
  const IMG = {
    polo: [
      'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600',
      'https://images.unsplash.com/photo-1625910513969-4dcaf428e5fe?w=600',
      'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600',
      'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=600',
    ],
    tshirt: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600',
    ],
    pants: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600',
    ],
    jacket: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600',
      'https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?w=600',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
      'https://images.unsplash.com/photo-1544923246-77307dd270ce?w=600',
    ],
    shirt_female: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
    ],
    dress: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600',
      'https://images.unsplash.com/photo-1566479179817-073e36a7e0d2?w=600',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',
      'https://images.unsplash.com/photo-1614786269829-d24616faf56d?w=600',
    ],
    kids: [
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600',
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600',
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600',
      'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600',
    ],
    hat: [
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600',
      'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600',
      'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600',
    ],
    hoodie: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600',
      'https://images.unsplash.com/photo-1578768079470-0a4536cc4e03?w=600',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600',
      'https://images.unsplash.com/photo-1611911813383-67769b37a149?w=600',
    ],
    croptop: [
      'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600',
      'https://images.unsplash.com/photo-1618354691229-88d47f285158?w=600',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600',
    ],
    shorts: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600',
      'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600',
      'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=600',
      'https://images.unsplash.com/photo-1617952236317-0bd127407984?w=600',
    ],
    polo_premium: [
      'https://images.unsplash.com/photo-1625910513969-4dcaf428e5fe?w=600',
      'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600',
      'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=600',
      'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600',
    ],
  };
  const pick = (arr, n = 2) => arr.slice(0, n);

  const products = await Product.insertMany([
    {
      name: 'Áo Polo Nam Basic HODY',
      slug: 'ao-polo-nam-basic-hody',
      description: 'Áo Polo nam basic chất liệu cotton cao cấp, thoáng mát, phù hợp mặc đi làm và dạo phố.',
      category: aoNam._id,
      images: pick(IMG.polo),
      colors: [
        { id: 'white', name: 'Trắng', hex: '#FFFFFF', images: [IMG.polo[0]] },
        { id: 'black', name: 'Đen', hex: '#000000', images: [IMG.polo[1]] },
        { id: 'navy', name: 'Xanh Navy', hex: '#1a2a5e', images: [IMG.polo[2]] },
      ],
      sizes: sizes_ao,
      variants: makeVariants([
        { id: 'white', name: 'Trắng', hex: '#FFFFFF' },
        { id: 'black', name: 'Đen', hex: '#000000' },
        { id: 'navy', name: 'Xanh Navy', hex: '#1a2a5e' },
      ], sizes_ao),
      originalPrice: 299000,
      salePrice: 249000,
      discount: 17,
      rating: 0,
      reviewCount: 0,
      sold: 0,
      isNew: false,
      isBestSeller: true,
      isFeatured: true,
      tags: ['polo', 'nam', 'basic', 'cotton'],
    },
    {
      name: 'Áo Thun Nam Local Brand HODY',
      slug: 'ao-thun-nam-local-brand-hody',
      description: 'Áo thun nam phong cách local brand, chất cotton 100%, form oversize trẻ trung.',
      category: aoNam._id,
      images: pick(IMG.tshirt),
      colors: [
        { id: 'white', name: 'Trắng', hex: '#FFFFFF', images: [IMG.tshirt[0]] },
        { id: 'gray', name: 'Xám', hex: '#808080', images: [IMG.tshirt[1]] },
        { id: 'olive', name: 'Xanh Rêu', hex: '#556B2F', images: [IMG.tshirt[2]] },
      ],
      sizes: sizes_ao,
      variants: makeVariants([
        { id: 'white', name: 'Trắng', hex: '#FFFFFF' },
        { id: 'gray', name: 'Xám', hex: '#808080' },
        { id: 'olive', name: 'Xanh Rêu', hex: '#556B2F' },
      ], sizes_ao),
      originalPrice: 199000,
      salePrice: 159000,
      discount: 20,
      rating: 0,
      reviewCount: 0,
      sold: 0,
      isNew: true,
      isBestSeller: false,
      isFeatured: true,
      tags: ['thun', 'nam', 'oversize', 'local brand'],
    },
    {
      name: 'Quần Kaki Nam Slim Fit',
      slug: 'quan-kaki-nam-slim-fit',
      description: 'Quần kaki nam slim fit chất liệu cao cấp không nhăn, lịch sự và năng động.',
      category: quanNam._id,
      images: pick(IMG.pants),
      colors: [
        { id: 'beige', name: 'Be', hex: '#F5F5DC', images: [IMG.pants[0]] },
        { id: 'navy', name: 'Xanh Navy', hex: '#1a2a5e', images: [IMG.pants[1]] },
        { id: 'black', name: 'Đen', hex: '#000000', images: [IMG.pants[2]] },
      ],
      sizes: sizes_quan,
      variants: makeVariants([
        { id: 'beige', name: 'Be', hex: '#F5F5DC' },
        { id: 'navy', name: 'Xanh Navy', hex: '#1a2a5e' },
        { id: 'black', name: 'Đen', hex: '#000000' },
      ], sizes_quan),
      originalPrice: 450000,
      salePrice: 369000,
      discount: 18,
      rating: 0,
      reviewCount: 0,
      sold: 0,
      isNew: false,
      isBestSeller: true,
      isFeatured: true,
      tags: ['kaki', 'nam', 'slim fit'],
    },
    {
      name: 'Áo Khoác Jacket Nam HODY',
      slug: 'ao-khoac-jacket-nam-hody',
      description: 'Áo khoác jacket nam 2 lớp chống gió, giữ ấm tốt, phong cách thể thao năng động.',
      category: aoKhoacNam._id,
      images: pick(IMG.jacket),
      colors: [
        { id: 'black', name: 'Đen', hex: '#000000', images: [IMG.jacket[0]] },
        { id: 'navy', name: 'Xanh Navy', hex: '#1a2a5e', images: [IMG.jacket[1]] },
        { id: 'red', name: 'Đỏ', hex: '#E31837', images: [IMG.jacket[2]] },
      ],
      sizes: sizes_ao,
      variants: makeVariants([
        { id: 'black', name: 'Đen', hex: '#000000' },
        { id: 'navy', name: 'Xanh Navy', hex: '#1a2a5e' },
        { id: 'red', name: 'Đỏ', hex: '#E31837' },
      ], sizes_ao),
      originalPrice: 699000,
      salePrice: 549000,
      discount: 21,
      rating: 0,
      reviewCount: 0,
      sold: 0,
      isNew: true,
      isBestSeller: true,
      isFeatured: true,
      tags: ['jacket', 'khoác', 'nam', 'chống gió'],
    },
    {
      name: 'Áo Sơ Mi Nữ Công Sở HODY',
      slug: 'ao-so-mi-nu-cong-so-hody',
      description: 'Áo sơ mi nữ công sở chất liệu lụa mềm mại, lịch sự và thanh lịch.',
      category: aoNu._id,
      images: pick(IMG.shirt_female),
      colors: [
        { id: 'white', name: 'Trắng', hex: '#FFFFFF', images: [IMG.shirt_female[0]] },
        { id: 'pink', name: 'Hồng', hex: '#FFB6C1', images: [IMG.shirt_female[1]] },
        { id: 'sky', name: 'Xanh Nhạt', hex: '#87CEEB', images: [IMG.shirt_female[2]] },
      ],
      sizes: sizes_ao,
      variants: makeVariants([
        { id: 'white', name: 'Trắng', hex: '#FFFFFF' },
        { id: 'pink', name: 'Hồng', hex: '#FFB6C1' },
        { id: 'sky', name: 'Xanh Nhạt', hex: '#87CEEB' },
      ], sizes_ao),
      originalPrice: 349000,
      salePrice: 279000,
      discount: 20,
      rating: 0,
      reviewCount: 0,
      sold: 0,
      isNew: false,
      isBestSeller: false,
      isFeatured: true,
      tags: ['sơ mi', 'nữ', 'công sở'],
    },
    {
      name: 'Váy Liền Thân Nữ HODY',
      slug: 'vay-lien-than-nu-hody',
      description: 'Váy liền thân nữ thiết kế hiện đại, trẻ trung, phù hợp dạo phố và đi tiệc nhẹ.',
      category: vayDam._id,
      images: pick(IMG.dress),
      colors: [
        { id: 'floral', name: 'Hoa Nhí', hex: '#FF69B4', images: [IMG.dress[0]] },
        { id: 'black', name: 'Đen', hex: '#000000', images: [IMG.dress[1]] },
        { id: 'white', name: 'Trắng', hex: '#FFFFFF', images: [IMG.dress[2]] },
      ],
      sizes: sizes_ao,
      variants: makeVariants([
        { id: 'floral', name: 'Hoa Nhí', hex: '#FF69B4' },
        { id: 'black', name: 'Đen', hex: '#000000' },
        { id: 'white', name: 'Trắng', hex: '#FFFFFF' },
      ], sizes_ao),
      originalPrice: 399000,
      salePrice: 319000,
      discount: 20,
      rating: 0,
      reviewCount: 0,
      sold: 0,
      isNew: true,
      isBestSeller: false,
      isFeatured: false,
      tags: ['váy', 'nữ', 'liền thân'],
    },
    {
      name: 'Áo Thun Trẻ Em HODY Kids',
      slug: 'ao-thun-tre-em-hody-kids',
      description: 'Áo thun trẻ em chất liệu cotton 100% mềm mại, an toàn cho làn da bé.',
      category: aoTreEm._id,
      images: pick(IMG.kids),
      colors: [
        { id: 'yellow', name: 'Vàng', hex: '#FFD700', images: [IMG.kids[0]] },
        { id: 'mint', name: 'Xanh Mint', hex: '#98FF98', images: [IMG.kids[1]] },
        { id: 'pink', name: 'Hồng', hex: '#FFB6C1', images: [IMG.kids[2]] },
      ],
      sizes: sizes_kids,
      variants: makeVariants([
        { id: 'yellow', name: 'Vàng', hex: '#FFD700' },
        { id: 'mint', name: 'Xanh Mint', hex: '#98FF98' },
        { id: 'pink', name: 'Hồng', hex: '#FFB6C1' },
      ], sizes_kids),
      originalPrice: 149000,
      salePrice: 119000,
      discount: 20,
      rating: 0,
      reviewCount: 0,
      sold: 0,
      isNew: false,
      isBestSeller: true,
      isFeatured: true,
      tags: ['trẻ em', 'áo thun', 'kids', 'cotton'],
    },
    {
      name: 'Mũ Bucket HODY',
      slug: 'mu-bucket-hody',
      description: 'Mũ bucket phong cách streetwear, chống nắng, thêu logo HODY nổi bật.',
      category: muNon._id,
      images: pick(IMG.hat),
      colors: [
        { id: 'black', name: 'Đen', hex: '#000000', images: [IMG.hat[0]] },
        { id: 'beige', name: 'Be', hex: '#F5F5DC', images: [IMG.hat[1]] },
        { id: 'navy', name: 'Xanh Navy', hex: '#1a2a5e', images: [IMG.hat[2]] },
      ],
      sizes: ['FREE SIZE'],
      variants: makeVariants([
        { id: 'black', name: 'Đen', hex: '#000000' },
        { id: 'beige', name: 'Be', hex: '#F5F5DC' },
        { id: 'navy', name: 'Xanh Navy', hex: '#1a2a5e' },
      ], ['FREE SIZE']),
      originalPrice: 199000,
      salePrice: 159000,
      discount: 20,
      rating: 0,
      reviewCount: 0,
      sold: 0,
      isNew: true,
      isBestSeller: false,
      isFeatured: false,
      tags: ['mũ', 'bucket', 'phụ kiện', 'streetwear'],
    },
    {
      name: 'Áo Polo Nam Premium HODY',
      slug: 'ao-polo-nam-premium-hody',
      description: 'Áo polo nam premium chất liệu pique cao cấp, cổ bo chắc chắn, form chuẩn đẹp.',
      category: aoNam._id,
      images: pick(IMG.polo_premium),
      colors: [
        { id: 'white', name: 'Trắng', hex: '#FFFFFF', images: [IMG.polo_premium[0]] },
        { id: 'red', name: 'Đỏ', hex: '#E31837', images: [IMG.polo_premium[1]] },
        { id: 'green', name: 'Xanh Lá', hex: '#228B22', images: [IMG.polo_premium[2]] },
      ],
      sizes: sizes_ao,
      variants: makeVariants([
        { id: 'white', name: 'Trắng', hex: '#FFFFFF' },
        { id: 'red', name: 'Đỏ', hex: '#E31837' },
        { id: 'green', name: 'Xanh Lá', hex: '#228B22' },
      ], sizes_ao),
      originalPrice: 399000,
      salePrice: 329000,
      discount: 18,
      rating: 0,
      reviewCount: 0,
      sold: 0,
      isNew: false,
      isBestSeller: true,
      isFeatured: true,
      tags: ['polo', 'nam', 'premium', 'pique'],
    },
    {
      name: 'Quần Short Nam Thể Thao HODY',
      slug: 'quan-short-nam-the-thao-hody',
      description: 'Quần short nam thể thao co giãn 4 chiều, thoáng khí, thấm hút mồ hôi tốt.',
      category: quanNam._id,
      images: pick(IMG.shorts),
      colors: [
        { id: 'black', name: 'Đen', hex: '#000000', images: [IMG.shorts[0]] },
        { id: 'navy', name: 'Xanh Navy', hex: '#1a2a5e', images: [IMG.shorts[1]] },
        { id: 'gray', name: 'Xám', hex: '#808080', images: [IMG.shorts[2]] },
      ],
      sizes: sizes_ao,
      variants: makeVariants([
        { id: 'black', name: 'Đen', hex: '#000000' },
        { id: 'navy', name: 'Xanh Navy', hex: '#1a2a5e' },
        { id: 'gray', name: 'Xám', hex: '#808080' },
      ], sizes_ao),
      originalPrice: 249000,
      salePrice: 199000,
      discount: 20,
      rating: 0,
      reviewCount: 0,
      sold: 0,
      isNew: false,
      isBestSeller: false,
      isFeatured: false,
      tags: ['short', 'nam', 'thể thao'],
    },
    {
      name: 'Áo Croptop Nữ HODY',
      slug: 'ao-croptop-nu-hody',
      description: 'Áo croptop nữ năng động, trẻ trung, phù hợp phối đồ đi chơi và dạo phố.',
      category: aoNu._id,
      images: pick(IMG.croptop),
      colors: [
        { id: 'white', name: 'Trắng', hex: '#FFFFFF', images: [IMG.croptop[0]] },
        { id: 'black', name: 'Đen', hex: '#000000', images: [IMG.croptop[1]] },
        { id: 'lavender', name: 'Tím Lavender', hex: '#E6E6FA', images: [IMG.croptop[2]] },
      ],
      sizes: sizes_ao,
      variants: makeVariants([
        { id: 'white', name: 'Trắng', hex: '#FFFFFF' },
        { id: 'black', name: 'Đen', hex: '#000000' },
        { id: 'lavender', name: 'Tím Lavender', hex: '#E6E6FA' },
      ], sizes_ao),
      originalPrice: 249000,
      salePrice: 199000,
      discount: 20,
      rating: 0,
      reviewCount: 0,
      sold: 0,
      isNew: true,
      isBestSeller: false,
      isFeatured: false,
      tags: ['croptop', 'nữ', 'trẻ trung'],
    },
    {
      name: 'Áo Hoodie Nam HODY',
      slug: 'ao-hoodie-nam-hody',
      description: 'Áo hoodie nam nỉ bông dày dặn, giữ ấm tốt mùa đông, thiết kế clean basic.',
      category: aoNam._id,
      images: pick(IMG.hoodie),
      colors: [
        { id: 'black', name: 'Đen', hex: '#000000', images: [IMG.hoodie[0]] },
        { id: 'gray', name: 'Xám', hex: '#808080', images: [IMG.hoodie[1]] },
        { id: 'brown', name: 'Nâu', hex: '#8B4513', images: [IMG.hoodie[2]] },
      ],
      sizes: sizes_ao,
      variants: makeVariants([
        { id: 'black', name: 'Đen', hex: '#000000' },
        { id: 'gray', name: 'Xám', hex: '#808080' },
        { id: 'brown', name: 'Nâu', hex: '#8B4513' },
      ], sizes_ao),
      originalPrice: 549000,
      salePrice: 449000,
      discount: 18,
      rating: 0,
      reviewCount: 0,
      sold: 0,
      isNew: false,
      isBestSeller: true,
      isFeatured: true,
      tags: ['hoodie', 'nam', 'nỉ', 'giữ ấm'],
    },
  ]);

  // ─── Blogs ──────────────────────────────────────────────
  console.log('Seeding blogs...');
  await Blog.insertMany([
    {
      title: 'Hướng dẫn phối đồ với áo Polo nam chuẩn trend 2024',
      slug: 'huong-dan-phoi-do-voi-ao-polo-nam-chuan-trend-2024',
      excerpt: 'Áo polo là item không thể thiếu trong tủ đồ của nam giới. Hãy cùng HODY khám phá cách phối đồ với áo polo sao cho thật sự cuốn hút...',
      content: '<p>Áo polo từ lâu đã trở thành một trong những item thời trang không thể thiếu trong tủ đồ của nam giới hiện đại. Với thiết kế cổ bẻ thanh lịch, chất liệu cotton thoáng mát, áo polo phù hợp với nhiều hoàn cảnh khác nhau từ đi làm, đi chơi đến các buổi gặp gỡ thân mật.</p><h2>1. Áo polo + quần kaki slim fit</h2><p>Sự kết hợp kinh điển nhất của áo polo chính là với quần kaki slim fit. Chọn màu áo polo trung tính như trắng, đen, navy kết hợp với quần kaki màu be, xám hoặc navy tạo nên set đồ lịch sự, năng động...</p>',
      thumbnail: 'https://placehold.co/800x500/e8e8e8/555555?text=Blog+1',
      category: 'Phong Cách',
      authorName: 'HODY Team',
      tags: ['polo', 'phối đồ', 'thời trang nam'],
      views: 1250,
    },
    {
      title: 'Top 5 xu hướng thời trang nữ nổi bật mùa hè 2024',
      slug: 'top-5-xu-huong-thoi-trang-nu-noi-bat-mua-he-2024',
      excerpt: 'Mùa hè 2024 mang đến những làn gió mới trong thế giới thời trang nữ. Cùng điểm qua 5 xu hướng nổi bật nhất mà các nàng không thể bỏ lỡ...',
      content: '<p>Mùa hè 2024 chứng kiến sự bùng nổ của nhiều xu hướng thời trang nữ đa dạng và phong phú. Từ phong cách Y2K trở lại đến minimalism thanh lịch, mùa hè năm nay hứa hẹn sẽ mang đến nhiều lựa chọn thú vị cho các tín đồ thời trang...</p>',
      thumbnail: 'https://placehold.co/800x500/e8e8e8/555555?text=Blog+2',
      category: 'Xu Hướng',
      authorName: 'HODY Team',
      tags: ['nữ', 'xu hướng', 'mùa hè 2024'],
      views: 980,
    },
    {
      title: 'Cách chọn size áo cho bé yêu đúng chuẩn',
      slug: 'cach-chon-size-ao-cho-be-yeu-dung-chuan',
      excerpt: 'Việc chọn size quần áo cho trẻ em đôi khi khiến các bậc phụ huynh bối rối. Hãy để HODY Kids hướng dẫn bạn cách chọn size chuẩn nhất...',
      content: '<p>Khi mua quần áo cho bé, nhiều phụ huynh thường gặp khó khăn trong việc chọn đúng size. Trẻ em phát triển rất nhanh, vì vậy việc chọn size phù hợp không chỉ giúp bé thoải mái mà còn tiết kiệm chi phí...</p>',
      thumbnail: 'https://placehold.co/800x500/e8e8e8/555555?text=Blog+3',
      category: 'Hướng Dẫn',
      authorName: 'HODY Team',
      tags: ['trẻ em', 'chọn size', 'hướng dẫn'],
      views: 756,
    },
    {
      title: 'HODY ra mắt BST Thu Đông 2024 - Phong cách mới, cảm hứng mới',
      slug: 'hody-ra-mat-bst-thu-dong-2024',
      excerpt: 'BST Thu Đông 2024 của HODY chính thức ra mắt với hơn 50 thiết kế mới, lấy cảm hứng từ thiên nhiên và cuộc sống đô thị hiện đại...',
      content: '<p>Thương hiệu thời trang HODY vừa chính thức ra mắt Bộ Sưu Tập Thu Đông 2024 với chủ đề "Urban Nature" - Thiên Nhiên Đô Thị. BST gồm hơn 50 thiết kế độc đáo, kết hợp hài hòa giữa sự thoải mái của chất liệu tự nhiên và phong cách sống năng động của người thành thị...</p>',
      thumbnail: 'https://placehold.co/800x500/e8e8e8/555555?text=Blog+4',
      category: 'Tin Tức',
      authorName: 'HODY Team',
      tags: ['bộ sưu tập', 'thu đông 2024', 'tin tức HODY'],
      views: 2100,
    },
    {
      title: 'Bí quyết giữ màu quần áo tươi bền đẹp sau nhiều lần giặt',
      slug: 'bi-quyet-giu-mau-quan-ao-tuoi-ben-dep',
      excerpt: 'Quần áo sau nhiều lần giặt thường bị phai màu và mất đi vẻ đẹp ban đầu. Áp dụng những bí quyết sau để giữ cho trang phục của bạn luôn như mới...',
      content: '<p>Một trong những vấn đề phổ biến nhất khi chăm sóc quần áo là tình trạng phai màu sau nhiều lần giặt. Đặc biệt với những trang phục có màu sắc tươi sáng hoặc đậm, việc duy trì độ bền màu là thách thức không nhỏ...</p>',
      thumbnail: 'https://placehold.co/800x500/e8e8e8/555555?text=Blog+5',
      category: 'Hướng Dẫn',
      authorName: 'HODY Team',
      tags: ['chăm sóc quần áo', 'giặt ủi', 'mẹo hay'],
      views: 890,
    },
    {
      title: 'Local brand Việt Nam và hành trình chinh phục trái tim người Việt',
      slug: 'local-brand-viet-nam-va-hanh-trinh-chinh-phuc-trai-tim-nguoi-viet',
      excerpt: 'Những năm gần đây, phong trào ủng hộ hàng Việt Nam đã tạo ra làn sóng mạnh mẽ, đưa nhiều thương hiệu thời trang nội địa vươn lên...',
      content: '<p>Không còn bị xem là "hàng nội địa kém chất lượng", các thương hiệu thời trang Việt Nam ngày nay đang dần khẳng định vị thế của mình trong lòng người tiêu dùng trong nước và cả quốc tế...</p>',
      thumbnail: 'https://placehold.co/800x500/e8e8e8/555555?text=Blog+6',
      category: 'Tin Tức',
      authorName: 'HODY Team',
      tags: ['local brand', 'thương hiệu Việt', 'thời trang nội địa'],
      views: 1450,
    },
  ]);

  // ─── Coupons ────────────────────────────────────────────
  console.log('Seeding coupons...');
  await Coupon.insertMany([
    { code: 'HODY10', type: 'percent', value: 10, minOrder: 200000, maxDiscount: 50000, usageLimit: 1000, endDate: new Date('2025-12-31') },
    { code: 'WELCOME', type: 'fixed', value: 30000, minOrder: 150000, usageLimit: 500, endDate: new Date('2025-12-31') },
    { code: 'HODY20', type: 'percent', value: 20, minOrder: 500000, maxDiscount: 100000, usageLimit: 200, endDate: new Date('2025-12-31') },
    { code: 'FREESHIP', type: 'fixed', value: 30000, minOrder: 0, usageLimit: 999, endDate: new Date('2025-12-31') },
  ]);

  console.log('\n✅ Database seeded successfully!');
  console.log(`   Users: 2 (admin@hody.vn / admin123 | demo@hody.vn / 123456)`);
  console.log(`   Categories: ${2 + subCats.length} (4 parent + ${subCats.length} sub)`);
  console.log(`   Products: ${products.length}`);
  console.log(`   Blogs: 6`);
  console.log(`   Coupons: 4 (HODY10, WELCOME, HODY20, FREESHIP)`);

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
