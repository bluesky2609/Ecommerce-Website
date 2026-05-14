import React from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import ProductCard from '../ui/ProductCard.jsx'
import { ProductCardSkeleton } from '../ui/Skeleton.jsx'
import 'swiper/css'
import 'swiper/css/navigation'

/**
 * ProductSection
 * Props:
 *   title        - Section heading
 *   products     - Array of product objects
 *   loading      - Boolean
 *   viewAllHref  - Link for "Xem tất cả"
 *   banner       - Optional banner image above section
 *   columns      - Number of columns (2-8, defaults to 5)
 *   rows         - Number of rows (1-4, defaults to 1 = swiper)
 */
const ProductSection = ({ title, products, loading, viewAllHref, banner, columns = 5, rows = 1 }) => {
  const count = columns * rows
  const displayProducts = products.slice(0, count)
  const useGrid = rows > 1

  return (
    <section className="py-8">
      <div className="container-custom">
        {banner && (
          <div className="mb-6">
            <Link to={viewAllHref || '#'}>
              <img src={banner} alt={title} className="w-full h-32 sm:h-48 object-cover rounded-lg" />
            </Link>
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">{title}</h2>
          {viewAllHref && (
            <Link to={viewAllHref} className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
              Xem tất cả →
            </Link>
          )}
        </div>

        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: '16px',
            }}
          >
            {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : useGrid ? (
          /* Grid layout */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: '16px',
            }}
          >
            {displayProducts.map(product => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        ) : (
          /* Swiper layout (single row) */
          <Swiper
            modules={[Navigation]}
            navigation
            slidesPerView={2}
            spaceBetween={16}
            breakpoints={{
              480: { slidesPerView: Math.min(2, columns) },
              640: { slidesPerView: Math.min(3, columns) },
              768: { slidesPerView: Math.min(4, columns) },
              1024: { slidesPerView: columns },
            }}
          >
            {products.map(product => (
              <SwiperSlide key={product.id || product._id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  )
}

export default ProductSection
