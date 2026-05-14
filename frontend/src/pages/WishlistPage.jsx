import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2 } from 'lucide-react'
import useWishlistStore from '../stores/wishlistStore.js'
import ProductCard from '../components/ui/ProductCard.jsx'
import toast from 'react-hot-toast'

const WishlistPage = () => {
  const { items, removeItem } = useWishlistStore()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-20">
          <Heart size={80} className="mx-auto text-gray-200 mb-6" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Danh sách yêu thích trống</h2>
          <p className="text-gray-400 mb-8">Hãy thêm sản phẩm yêu thích của bạn</p>
          <Link to="/" className="btn-primary">Khám phá sản phẩm</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black">Yêu thích ({items.length})</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default WishlistPage
