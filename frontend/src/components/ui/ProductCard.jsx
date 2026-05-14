import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star, ShoppingCart } from 'lucide-react'
import { formatPriceShort } from '../../utils/formatPrice.js'
import { colors } from '../../data/mock/products.js'
import useWishlistStore from '../../stores/wishlistStore.js'
import useCartStore from '../../stores/cartStore.js'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {
  const { toggle, isWishlisted } = useWishlistStore()
  const { addItem } = useCartStore()
  const wishlisted = isWishlisted(product.id)

  const productColors = product.colorOptions?.length
    ? product.colorOptions
    : colors.filter(c => (product.colors || []).map(String).includes(String(c.id)))

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const firstVariant = product.variants?.[0]
    if (firstVariant) {
      addItem(product, firstVariant, 1)
      toast.success('Đã thêm vào giỏ hàng!')
    }
  }

  const handleToggleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(product)
    toast.success(wishlisted ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích!')
  }

  return (
    <div className="product-card group relative">
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-[3/4] bg-gray-100">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Hover second image */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={product.name}
            className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
          />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount > 0 && (
            <span className="badge-discount">-{product.discount}%</span>
          )}
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">MỚI</span>
          )}
          {product.isBestSeller && (
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded">HOT</span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          aria-label="Yêu thích"
        >
          <Heart size={16} className={wishlisted ? 'fill-primary text-primary' : 'text-gray-400'} />
        </button>

        {/* Quick add to cart */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 bg-primary text-white py-2 text-sm font-semibold flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        >
          <ShoppingCart size={16} />
          Thêm vào giỏ
        </button>
      </Link>

      {/* Info */}
      <div className="p-3">
        {/* Color swatches */}
        {productColors.length > 0 && (
          <div className="flex gap-1 mb-2">
            {productColors.slice(0, 5).map(color => (
              <div
                key={color.id}
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {productColors.length > 5 && (
              <span className="text-xs text-gray-400">+{productColors.length - 5}</span>
            )}
          </div>
        )}

        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-800 hover:text-primary transition-colors line-clamp-2 mb-1">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold text-sm">{formatPriceShort(product.salePrice)}</span>
          {product.originalPrice > product.salePrice && (
            <span className="text-gray-400 text-xs line-through">{formatPriceShort(product.originalPrice)}</span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1">
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-gray-500">{product.rating} ({product.reviewCount})</span>
          <span className="text-xs text-gray-400 ml-1">· Đã bán {product.sold.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
