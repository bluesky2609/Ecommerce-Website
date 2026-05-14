import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, Star, Truck, RotateCcw, Shield, Minus, Plus, ChevronRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs, FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import 'swiper/css/free-mode'
import { productService } from '../services/productService.js'
import { formatPriceShort } from '../utils/formatPrice.js'
import { categoryService } from '../services/categoryService.js'
import useCartStore from '../stores/cartStore.js'
import useWishlistStore from '../stores/wishlistStore.js'
import ProductCard from '../components/ui/ProductCard.jsx'
import ReviewSection from '../components/ui/ReviewSection.jsx'
import Breadcrumb from '../components/ui/Breadcrumb.jsx'
import toast from 'react-hot-toast'

const ProductDetailPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] = useState(null)
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [activeTab, setActiveTab] = useState('description')

  const { addItem } = useCartStore()
  const { toggle, isWishlisted } = useWishlistStore()

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const p = await productService.getBySlug(slug)
        setProduct(p)
        setSelectedColor(p.colors?.[0]?.id ? String(p.colors[0].id) : 'none')
        setSelectedSize(null)
        setQuantity(1)
        const relatedProducts = await productService.getRelated(p.slug)
        setRelated(relatedProducts)
        try {
          const cat = await categoryService.getBySlug(p.categorySlug)
          setCategory(cat)
        } catch (err) { }
      } catch (err) {
        navigate('/404', { replace: true })
      } finally {
        setLoading(false)
      }
    }
    fetch()
    window.scrollTo(0, 0)
  }, [slug])

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="bg-gray-200 aspect-square rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const productColors = product.colorOptions?.length
    ? product.colorOptions
    : colors.filter(c => (product.colors || []).map(String).includes(String(c.id)))
  const currentColor = productColors.find(c => String(c.id) === String(selectedColor))

  const getVariant = () => {
    const selectedColorKey = String(selectedColor || '')
    const selectedSizeKey = String(selectedSize || '')
    return product.variants?.find(v => String(v.colorId) === selectedColorKey && String(v.size) === selectedSizeKey)
  }

  const currentVariant = getVariant()
  const inStock = currentVariant ? currentVariant.stock > 0 : true

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Vui lòng chọn kích thước!')
      return
    }
    const variant = getVariant()
    if (!variant) {
      toast.error('Phiên bản sản phẩm không khả dụng!')
      return
    }
    addItem(product, variant, quantity)
    toast.success('Đã thêm vào giỏ hàng!')
  }

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error('Vui lòng chọn kích thước!')
      return
    }
    const variant = getVariant()
    if (!variant) {
      toast.error('Phiên bản sản phẩm không khả dụng!')
      return
    }
    addItem(product, variant, quantity)
    navigate('/checkout')
  }

  const breadcrumbItems = [
    { label: category?.name || product.categorySlug, href: `/category/${product.categorySlug}` },
    { label: product.name },
  ]

  return (
    <div className="min-h-screen">
      <div className="container-custom py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="container-custom py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
          {/* Image Gallery */}
          <div className="space-y-3">
            <Swiper
              modules={[Navigation, Thumbs]}
              navigation
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              className="rounded-xl overflow-hidden aspect-square"
            >
              {product.images.map((img, i) => (
                <SwiperSlide key={i}>
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </SwiperSlide>
              ))}
            </Swiper>
            <Swiper
              modules={[FreeMode, Thumbs]}
              onSwiper={setThumbsSwiper}
              spaceBetween={8}
              slidesPerView={4}
              freeMode
              watchSlidesProgress
            >
              {product.images.map((img, i) => (
                <SwiperSlide key={i}>
                  <div className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent swiper-slide-thumb-active:border-primary">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            <div>
              {product.isBestSeller && (
                <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded mb-2">
                  🔥 BÁN CHẠY
                </span>
              )}
              <h1 className="text-2xl font-black text-gray-900 leading-tight">{product.name}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                ))}
                <span className="ml-1 text-gray-600">{product.rating}</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">{product.reviewCount} đánh giá</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">Đã bán {product.sold.toLocaleString()}</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-primary">{formatPriceShort(product.salePrice)}</span>
              {product.originalPrice > product.salePrice && (
                <>
                  <span className="text-gray-400 text-lg line-through">{formatPriceShort(product.originalPrice)}</span>
                  <span className="badge-discount text-sm">-{product.discount}%</span>
                </>
              )}
            </div>

            {/* Color selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900">Màu sắc:</span>
                <span className="text-sm text-gray-500">{currentColor?.name}</span>
              </div>
              <div className="flex gap-3 flex-wrap">
                {productColors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => {
                      setSelectedColor(String(color.id))
                      setSelectedSize(null)
                    }}
                    className={`relative w-10 h-10 rounded-full border-2 transition-all ${String(selectedColor) === String(color.id) ? 'border-primary scale-110' : 'border-gray-200 hover:border-gray-400'}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {String(selectedColor) === String(color.id) && (
                      <span className="absolute inset-0 rounded-full border-2 border-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900">Kích cỡ:</span>
                <button className="text-sm text-primary hover:underline flex items-center gap-1">
                  Hướng dẫn chọn size <ChevronRight size={14} />
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(size => {
                  const variant = product.variants?.find(v => String(v.colorId) === String(selectedColor) && String(v.size) === String(size))
                  const outOfStock = variant && variant.stock === 0
                  return (
                    <button
                      key={size}
                      onClick={() => !outOfStock && setSelectedSize(size)}
                      disabled={outOfStock}
                      className={`min-w-[48px] h-11 px-3 rounded-lg border-2 text-sm font-medium transition-all ${selectedSize === size
                          ? 'border-primary bg-primary text-white'
                          : outOfStock
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                            : 'border-gray-200 hover:border-primary text-gray-700'
                        }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-900">Số lượng:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-2.5 hover:bg-gray-100 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => {
                    const limit = currentVariant ? currentVariant.stock : (product.countInStock ?? 9999);
                    if (q + 1 > limit) {
                      toast.error('số lượng sản phẩm khách hàng muốn mua vượt quá số lượng tồn kho', { id: 'stock-limit' });
                      return limit;
                    }
                    return q + 1;
                  })}
                  className="p-2.5 hover:bg-gray-100 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              {currentVariant && (
                <span className="text-sm text-gray-400">Còn {currentVariant.stock} sản phẩm</span>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 btn-outline py-3.5"
              >
                <ShoppingCart size={18} />
                Thêm vào giỏ
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 btn-primary py-3.5"
              >
                Mua ngay
              </button>
              <button
                onClick={() => { toggle(product); toast.success(isWishlisted(product.id) ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích!') }}
                className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded hover:border-primary transition-colors"
              >
                <Heart size={20} className={isWishlisted(product.id) ? 'fill-primary text-primary' : 'text-gray-400'} />
              </button>
            </div>

            {/* Commitments */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              {[
                { icon: Truck, text: 'Miễn phí vận chuyển cho đơn từ 299k' },
                { icon: RotateCcw, text: 'Đổi trả miễn phí trong vòng 60 ngày' },
                { icon: Shield, text: 'Sản phẩm chính hãng, cam kết chất lượng' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                  <Icon size={18} className="text-primary flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <div className="flex gap-6">
              {['description', 'review'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                >
                  {tab === 'description' ? 'Mô tả sản phẩm' : `Đánh giá (${product.reviewCount})`}
                </button>
              ))}
            </div>
          </div>
          <div className="py-6">
            {activeTab === 'description' ? (
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p>{product.description}</p>
                <h4 className="font-bold mt-4 mb-2">Chất liệu:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Cotton 100% tự nhiên, thoáng mát</li>
                  <li>Thấm hút mồ hôi tốt</li>
                  <li>Không phai màu sau nhiều lần giặt</li>
                </ul>
                <h4 className="font-bold mt-4 mb-2">Hướng dẫn bảo quản:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Giặt máy ở nhiệt độ 30°C</li>
                  <li>Không dùng chất tẩy mạnh</li>
                  <li>Phơi trong bóng mát</li>
                </ul>
              </div>
            ) : (
              <ReviewSection product={product} />
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-black mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {related.slice(0, 6).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetailPage
