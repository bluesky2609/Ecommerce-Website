import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { useCart } from '../hooks/useCart.js'
import { formatPriceShort } from '../utils/formatPrice.js'
import { colors } from '../data/mock/products.js'
import toast from 'react-hot-toast'
import { orderService } from '../services/orderService.js'

const CartPage = () => {
  const { items, removeItem, updateQuantity, selectedItemsList, selectedTotalItems, selectedSubtotal, selectedItems, toggleItemSelection, toggleAllSelections } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const navigate = useNavigate()

  const shipping = selectedSubtotal >= 299000 || selectedItemsList.length === 0 ? 0 : 30000
  const total = selectedSubtotal + shipping - couponDiscount

  const getColorName = (item) => item.variant.colorName || colors.find(c => String(c.id) === String(item.variant.colorId))?.name || ''

  const handleRemove = (key, name) => {
    removeItem(key)
    toast.success(`Đã xóa ${name}!`)
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá!')
      return
    }

    setApplyingCoupon(true)
    try {
      const result = await orderService.applyCoupon(couponCode.trim(), selectedSubtotal)
      setCouponDiscount(result.discount || 0)
      toast.success('Áp dụng mã giảm giá thành công!')
    } catch (err) {
      setCouponDiscount(0)
      toast.error(err?.message || 'Mã giảm giá không hợp lệ!')
    } finally {
      setApplyingCoupon(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-20">
          <ShoppingBag size={80} className="mx-auto text-gray-200 mb-6" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-400 mb-8">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
          <Link to="/" className="btn-primary">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-black mb-8">Giỏ hàng ({items.length} sản phẩm)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
              <input
                type="checkbox"
                className="w-5 h-5 accent-primary cursor-pointer"
                checked={selectedItems?.length === items.length && items.length > 0}
                onChange={toggleAllSelections}
              />
              <span className="font-medium">Chọn tất cả ({items.length} sản phẩm)</span>
            </div>

            {items.map(item => (
              <div key={item.key} className="bg-white rounded-xl p-4 flex gap-4 shadow-sm items-center">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-primary cursor-pointer"
                  checked={selectedItems?.includes(item.key)}
                  onChange={() => toggleItemSelection(item.key)}
                />
                <Link to={`/product/${item.product.slug}`} className="flex-shrink-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-24 h-28 sm:w-28 sm:h-32 object-cover rounded-lg"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <Link to={`/product/${item.product.slug}`} className="font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2">
                      {item.product.name}
                    </Link>
                    <button
                      onClick={() => handleRemove(item.key, item.product.name)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                    <div>Màu: {getColorName(item)}</div>
                    <div>Size: {item.variant.size}</div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{formatPriceShort(item.product.salePrice * item.quantity)}</div>
                      {item.quantity > 1 && (
                        <div className="text-xs text-gray-400">{formatPriceShort(item.product.salePrice)} / cái</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Coupon */}
            {/* <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã giảm giá"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon}
                  className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {applyingCoupon ? 'Đang áp dụng...' : 'Áp dụng'}
                </button>
              </div>
            </div> */}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-20">
              <h2 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính ({selectedTotalItems} sản phẩm)</span>
                  <span>{formatPriceShort(selectedSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shipping === 0 ? 'Miễn phí' : formatPriceShort(shipping)}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Giảm giá</span>
                    <span>-{formatPriceShort(couponDiscount)}</span>
                  </div>
                )}
                {shipping > 0 && (
                  <div className="text-xs text-gray-400">
                    Mua thêm {formatPriceShort(299000 - selectedSubtotal)} để được miễn phí ship
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-base">
                  <span>Tổng cộng</span>
                  <span className="text-primary text-xl">{formatPriceShort(total)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                disabled={selectedItemsList.length === 0}
                className="w-full btn-primary mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiến hành thanh toán
                <ArrowRight size={18} />
              </button>

              <Link to="/" className="w-full text-center text-sm text-gray-500 hover:text-primary mt-3 flex items-center justify-center gap-1">
                ← Tiếp tục mua sắm
              </Link>

              {/* Payment icons */}
              <div className="mt-4 pt-4 border-t">
                <div className="text-xs text-gray-400 text-center mb-2">Thanh toán an toàn</div>
                <div className="flex justify-center gap-2 flex-wrap">
                  {['PayOS', 'COD'].map(m => (
                    <span key={m} className="text-xs bg-gray-100 px-2 py-1 rounded">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
