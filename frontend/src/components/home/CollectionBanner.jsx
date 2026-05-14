import React from 'react'
import { Link } from 'react-router-dom'

const collections = [
  {
    title: 'Bộ sưu tập Nam',
    subtitle: 'Phong cách lịch lãm',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&h=600&fit=crop',
    href: '/category/nam',
    badge: 'Khám phá',
  },
  {
    title: 'Bộ sưu tập Nữ',
    subtitle: 'Quyến rũ, thanh lịch',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop',
    href: '/category/nu',
    badge: 'Khám phá',
  },
  {
    title: 'Thời trang Trẻ Em',
    subtitle: 'Năng động, đáng yêu',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&h=600&fit=crop',
    href: '/category/tre-em',
    badge: 'Khám phá',
  },
]

const CollectionBanner = () => {
  return (
    <section className="py-8">
      <div className="container-custom">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6 text-center">Khám phá các bộ sưu tập</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {collections.map(col => (
            <Link key={col.title} to={col.href} className="relative group overflow-hidden rounded-xl aspect-[4/3]">
              <img
                src={col.image}
                alt={col.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white font-black text-xl">{col.title}</h3>
                <p className="text-white/80 text-sm mb-3">{col.subtitle}</p>
                <span className="inline-block bg-white text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full w-fit group-hover:bg-primary group-hover:text-white transition-colors">
                  {col.badge}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CollectionBanner
