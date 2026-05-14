import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, ChevronRight } from 'lucide-react'
import { productService } from '../services/productService.js'
import ProductCard from '../components/ui/ProductCard.jsx'
import { ProductCardSkeleton } from '../components/ui/Skeleton.jsx'

const BestSellersPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBestSellers = async () => {
      setLoading(true)
      try {
        const res = await productService.getAll({ sort: 'best-seller', minSold: 1, includeHot: true, includeBestSellerLabel: true, limit: 50 })
        setProducts(res.data)
      } finally {
        setLoading(false)
      }
    }
    fetchBestSellers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="text-gray-900 font-medium">Nổi bật</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
            <Flame size={24} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">Sản phẩm bán chạy & Nổi bật</h1>
            <p className="text-gray-500 mt-1">Các sản phẩm được yêu thích, mua nhiều hoặc có nhãn HOT</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 15 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-red-100 mb-4 flex justify-center">
              <Flame size={64} fill="currentColor" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">Chưa có sản phẩm nào bán ra</h3>
            <p className="text-gray-500 mt-2">Hiện tại chưa có sản phẩm nào đạt đủ số lượng bán.</p>
            <Link to="/" className="inline-block mt-6 px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BestSellersPage
