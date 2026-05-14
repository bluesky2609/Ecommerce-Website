import React, { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { Link } from 'react-router-dom'
import { homeConfigService } from '../../services/homeConfigService.js'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const HeroBanner = ({ banners: propBanners }) => {
  const [banners, setBanners] = useState(propBanners || [])

  // If no banners passed as prop, fetch from API (fallback for standalone use)
  useEffect(() => {
    if (propBanners && propBanners.length > 0) {
      setBanners(propBanners)
      return
    }
    homeConfigService.getConfig()
      .then(res => {
        const active = (res.data?.banners || []).filter(b => b.isActive)
        if (active.length > 0) setBanners(active)
      })
      .catch(() => {})
  }, [propBanners])

  if (!banners || banners.length === 0) return null

  return (
    <div className="w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={banners.length > 1}
        className="hero-swiper"
      >
        {banners.map((banner, idx) => (
          <SwiperSlide key={banner._id || idx}>
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden">
              <img
                src={banner.image}
                alt={banner.title || 'Banner'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center">
                <div className={`container-custom w-full ${banner.align === 'center' ? 'text-center' : banner.align === 'right' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block ${banner.align === 'center' ? '' : banner.align === 'right' ? 'ml-auto' : ''}`}>
                    {banner.title && (
                      <h2 className="text-white text-2xl sm:text-4xl lg:text-5xl font-black mb-2 drop-shadow-lg">
                        {banner.title}
                      </h2>
                    )}
                    {banner.subtitle && (
                      <p className="text-white/90 text-sm sm:text-lg mb-6 drop-shadow">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.cta && banner.href && (
                      <Link
                        to={banner.href}
                        className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded hover:bg-primary-600 transition-colors"
                      >
                        {banner.cta}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default HeroBanner
