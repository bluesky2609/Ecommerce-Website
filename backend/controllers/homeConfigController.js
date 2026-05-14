const HomeConfig = require('../models/HomeConfig');

// Default config if DB is empty
const DEFAULT_CONFIG = {
  banners: [
    {
      title: 'Bộ Sưu Tập Xuân Hè 2026',
      subtitle: 'Tươi mát, năng động cùng HODY',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=600&fit=crop',
      cta: 'Khám phá ngay',
      href: '/category/nu',
      align: 'left',
      order: 0,
      isActive: true,
    },
    {
      title: 'Thời Trang Nam Hiện Đại',
      subtitle: 'Phong cách lịch lãm, đẳng cấp',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&h=600&fit=crop',
      cta: 'Mua sắm ngay',
      href: '/category/nam',
      align: 'right',
      order: 1,
      isActive: true,
    },
    {
      title: 'Sale Đến 50%',
      subtitle: 'Hàng ngàn sản phẩm giảm giá mạnh',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1400&h=600&fit=crop',
      cta: 'Xem ưu đãi',
      href: '/search?q=sale',
      align: 'center',
      order: 2,
      isActive: true,
    },
  ],
  sections: [
    { title: 'Nổi Bật', type: 'bestSellers', enabled: true, columns: 5, rows: 1, viewAllHref: '/best-sellers' },
    { title: 'Khám phá các bộ sưu tập', type: 'collections', enabled: true },
    { title: 'Hàng Mới Về', type: 'newArrivals', enabled: true, columns: 5, rows: 1, viewAllHref: '/search?sort=newest' },
    { title: 'Ưu đãi đặc biệt', type: 'promo', enabled: true },
    { title: 'Blog & Tin Tức', type: 'blogs', enabled: true },
  ],
};

// GET /api/home-config  (public)
exports.getHomeConfig = async (req, res) => {
  try {
    let config = await HomeConfig.findOne();
    if (!config) {
      config = await HomeConfig.create(DEFAULT_CONFIG);
    }
    res.json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/home-config  (admin)
exports.updateHomeConfig = async (req, res) => {
  try {
    let config = await HomeConfig.findOne();
    if (!config) {
      config = new HomeConfig(DEFAULT_CONFIG);
    }
    const { banners, sections } = req.body;
    if (banners !== undefined) config.banners = banners;
    if (sections !== undefined) config.sections = sections;
    await config.save();
    res.json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
