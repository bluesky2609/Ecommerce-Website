import React, { useEffect, useState } from 'react'
import HeroBanner from '../components/home/HeroBanner.jsx'
import ProductSection from '../components/home/ProductSection.jsx'
import CollectionBanner from '../components/home/CollectionBanner.jsx'
import BlogPreview from '../components/home/BlogPreview.jsx'
import { productService } from '../services/productService.js'
import { homeConfigService } from '../services/homeConfigService.js'

const HomePage = () => {
  const [bestSellers, setBestSellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [homeConfig, setHomeConfig] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [best, newP, cfg] = await Promise.all([
          productService.getBestSellers(),
          productService.getNew(),
          homeConfigService.getConfig().catch(() => null),
        ])
        setBestSellers(best)
        setNewArrivals(newP)
        if (cfg?.data) setHomeConfig(cfg.data)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Parse config
  const activeBanners = homeConfig?.banners?.filter(b => b.isActive) || []
  
  // Create a mapping of section renderers
  const renderSection = (section, idx) => {
    if (section.enabled === false) return null;

    switch (section.type) {
      case 'bestSellers':
        return (
          <ProductSection
            key={idx}
            title={section.title || 'Nổi Bật'}
            products={bestSellers}
            loading={loading}
            viewAllHref={section.viewAllHref || '/best-sellers'}
            columns={section.columns || 5}
            rows={section.rows || 1}
          />
        );
      case 'newArrivals':
        return (
          <ProductSection
            key={idx}
            title={section.title || 'Hàng Mới Về'}
            products={newArrivals}
            loading={loading}
            viewAllHref={section.viewAllHref || '/search?sort=newest'}
            columns={section.columns || 5}
            rows={section.rows || 1}
          />
        );
      case 'collections':
        return <CollectionBanner key={idx} />;
      case 'promo':
        return (
          <section key={idx} className="py-8">
            <div className="container-custom">
              <div className="bg-primary rounded-2xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                  <div className="p-8 md:p-12 text-white">
                    <div className="text-xs font-bold uppercase tracking-wider mb-2 text-white/70">Ưu đãi đặc biệt</div>
                    <h2 className="text-3xl md:text-4xl font-black mb-4">Giảm đến 50%<br />Cho đơn đầu tiên</h2>
                    <p className="text-white/80 mb-6">Đăng ký thành viên ngay hôm nay và nhận ngay mã giảm giá 50k cho đơn hàng đầu tiên.</p>
                    <a href="/register" className="inline-block bg-white text-primary font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                      Đăng ký ngay
                    </a>
                  </div>
                  <div className="hidden md:block">
                    <img
                      src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop"
                      alt="Promo"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      case 'blogs':
        return <BlogPreview key={idx} />;
      default:
        return null;
    }
  };

  // If no sections from API yet, provide a fallback matching default config
  const sections = homeConfig?.sections?.length > 0 ? homeConfig.sections : [
    { title: 'Nổi Bật', type: 'bestSellers', enabled: true, columns: 5, rows: 1, viewAllHref: '/best-sellers' },
    { title: 'Khám phá các bộ sưu tập', type: 'collections', enabled: true },
    { title: 'Hàng Mới Về', type: 'newArrivals', enabled: true, columns: 5, rows: 1, viewAllHref: '/search?sort=newest' },
    { title: 'Ưu đãi đặc biệt', type: 'promo', enabled: true },
    { title: 'Blog & Tin Tức', type: 'blogs', enabled: true },
  ];

  return (
    <div>
      {/* Hero Banner - from DB config */}
      <HeroBanner banners={activeBanners} />

      {/* Dynamic Sections */}
      {sections.map((section, idx) => renderSection(section, idx))}
    </div>
  )
}

export default HomePage
