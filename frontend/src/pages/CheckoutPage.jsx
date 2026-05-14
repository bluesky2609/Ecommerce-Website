import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, CreditCard, Truck, Smartphone, Tag, X, ChevronDown, QrCode } from 'lucide-react'
import { useCart } from '../hooks/useCart.js'
import useAuthStore from '../stores/authStore.js'
import { formatPriceShort } from '../utils/formatPrice.js'
import toast from 'react-hot-toast'
import { orderService } from '../services/orderService.js'
import { voucherService } from '../services/voucherService.js'

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: Truck },
  { id: 'payos', label: 'PayOS – Chuyển khoản QR Napas 24/7', icon: QrCode, badge: 'Recommended' },
  // { id: 'vnpay', label: 'VNPay', icon: CreditCard },
  // { id: 'momo', label: 'Ví MoMo', icon: Smartphone },
  // { id: 'card', label: 'Thẻ Visa/Mastercard', icon: CreditCard },
]

/* ─── VoucherPicker modal ─────────────────────────────────────────────────── */
function VoucherPickerModal({ publicVouchers, subtotal, onSelect, onClose }) {
  const fmtMoney = (n) => n?.toLocaleString('vi-VN') + 'đ'
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: '800', fontSize: '16px', color: '#1f2937' }}>🎟️ Chọn voucher</div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {publicVouchers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>Hiện chưa có voucher nào</div>
          ) : publicVouchers.map(v => {
            const eligible = subtotal >= (v.minOrder || 0)
            return (
              <div
                key={v._id}
                onClick={() => eligible && onSelect(v.code)}
                style={{
                  border: `2px dashed ${eligible ? '#E31837' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  padding: '14px 16px',
                  cursor: eligible ? 'pointer' : 'not-allowed',
                  opacity: eligible ? 1 : 0.55,
                  background: eligible ? '#fff5f7' : '#fafafa',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ textAlign: 'center', minWidth: '64px' }}>
                  <div style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '13px', color: '#E31837', letterSpacing: '1px' }}>{v.code}</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#1f2937', marginTop: '2px' }}>
                    {v.type === 'percent' ? `-${v.value}%` : `-${fmtMoney(v.value)}`}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#4b5563' }}>
                    {v.minOrder > 0 ? `Đơn từ ${fmtMoney(v.minOrder)}` : 'Không giới hạn đơn tối thiểu'}
                  </div>
                  {v.maxDiscount > 0 && v.type === 'percent' && (
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>Giảm tối đa {fmtMoney(v.maxDiscount)}</div>
                  )}
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                    HSD: {new Date(v.endDate).toLocaleDateString('vi-VN')}
                  </div>
                  {!eligible && (
                    <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600', marginTop: '4px' }}>
                      Cần thêm {fmtMoney((v.minOrder || 0) - subtotal)} để dùng
                    </div>
                  )}
                </div>
                {eligible && <div style={{ color: '#E31837', fontWeight: '700', fontSize: '13px' }}>Dùng</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
const CheckoutPage = () => {
  const { selectedItemsList: items, selectedSubtotal: subtotal, clearSelectedItems } = useCart()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [createdOrder, setCreatedOrder] = useState(null)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const { user } = useAuthStore()
  const addresses = user?.addresses || []
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0]

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(null)
  const [applyingVoucher, setApplyingVoucher] = useState(false)
  const [publicVouchers, setPublicVouchers] = useState([])
  const [showVoucherPicker, setShowVoucherPicker] = useState(false)

  const [form, setForm] = useState({
    fullName: defaultAddress?.fullName || user?.name || '',
    phone: defaultAddress?.phone || user?.phone || '',
    email: user?.email || '',
    address: defaultAddress?.street || '',
    ward: defaultAddress?.ward || '',
    city: defaultAddress?.province || '',
    note: ''
  })
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?._id || 'new')

  const shipping = subtotal >= 299000 ? 0 : 30000
  const discount = appliedVoucher?.discount || 0
  const total = subtotal + shipping - discount

  // Load public vouchers on mount
  useEffect(() => {
    voucherService.getPublicVouchers()
      .then(res => setPublicVouchers(res.data || []))
      .catch(() => { })
  }, [])

  const handleApplyVoucher = useCallback(async (code) => {
    const trimmed = (code !== undefined ? code : voucherCode).trim()
    if (!trimmed) { toast.error('Vui lòng nhập mã voucher'); return }
    setApplyingVoucher(true)
    try {
      const res = await voucherService.applyVoucher(trimmed, subtotal)
      // res = { success: true, data: { voucherId, code, type, value, discount, finalTotal } }
      const voucherData = res.data
      setAppliedVoucher(voucherData)
      setVoucherCode(voucherData.code)
      setShowVoucherPicker(false)
      toast.success(`🎉 Áp dụng thành công! Giảm ${voucherData.discount?.toLocaleString('vi-VN')}đ`)
    } catch (err) {
      toast.error(err?.message || err?.response?.data?.message || 'Mã voucher không hợp lệ')
    } finally {
      setApplyingVoucher(false)
    }
  }, [voucherCode, subtotal])

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherCode('')
    toast('Đã xoá voucher', { icon: '🗑️' })
  }

  const handleAddressSelect = (e) => {
    const id = e.target.value
    setSelectedAddressId(id)
    if (id === 'new') {
      setForm(f => ({ ...f, fullName: '', phone: '', address: '', ward: '', city: '' }))
    } else {
      const addr = addresses.find(a => a._id === id)
      if (addr) {
        setForm(f => ({ ...f, fullName: addr.fullName, phone: addr.phone, address: addr.street, ward: addr.ward, city: addr.province }))
      }
    }
  }

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmitShipping = (e) => {
    e.preventDefault()
    if (!form.fullName || !form.phone || !form.address) { toast.error('Vui lòng điền đầy đủ thông tin!'); return }
    setStep(2)
  }

  const handlePlaceOrder = async () => {
    if (items.length === 0) { toast.error('Giỏ hàng đang trống!'); return }
    const payload = {
      items: items.map((item) => ({
        productId: item.product._id || item.product.id,
        colorId: item.variant.colorId,
        colorName: item.variant.colorName,
        size: item.variant.size,
        quantity: item.quantity,
      })),
      shippingAddress: {
        fullName: form.fullName,
        phone: form.phone,
        province: form.city,
        ward: form.ward,
        street: form.address,
      },
      paymentMethod,
      note: form.note,
      ...(appliedVoucher ? { couponCode: appliedVoucher.code, couponDiscount: appliedVoucher.discount } : {}),
    }
    setIsPlacingOrder(true)

    // ── PayOS: tạo link và redirect ──────────────────
    if (paymentMethod === 'payos') {
      toast.loading('Đang tạo liên kết thanh toán...', { id: 'order' })
      try {
        const res = await orderService.createPayOSPayment(payload)
        const checkoutUrl = res.checkoutUrl || res.data?.checkoutUrl || res.data?.data?.checkoutUrl;

        if (checkoutUrl) {
          clearSelectedItems()
          toast.success('Đang chuyển đến trang thanh toán...', { id: 'order' })
          // Redirect sang trang PayOS (QR code)
          window.location.href = checkoutUrl
        } else {
          throw new Error('Không nhận được link thanh toán')
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || err?.message || 'Tạo link thanh toán thất bại!', { id: 'order' })
        setIsPlacingOrder(false)
      }
      return
    }

    // ── COD / các phương thức khác ───────────────────
    toast.loading('Đang xử lý đơn hàng...', { id: 'order' })
    try {
      const order = await orderService.create(payload)
      setCreatedOrder(order)
      clearSelectedItems()
      setStep(3)
      toast.success('Đặt hàng thành công!', { id: 'order' })
    } catch (err) {
      toast.error(err?.message || 'Đặt hàng thất bại!', { id: 'order' })
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-20 max-w-md px-4">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3">Đặt hàng thành công!</h2>
          <p className="text-gray-500 mb-2">Mã đơn hàng: <strong className="text-gray-900">#{createdOrder?.orderCode || createdOrder?._id?.slice(-6) || 'N/A'}</strong></p>
          <p className="text-gray-500 mb-8">Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất. Cảm ơn bạn đã mua hàng tại HODY!</p>
          <button onClick={() => navigate('/')} className="btn-primary">Tiếp tục mua sắm</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-black mb-2">Thanh toán</h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          {['Thông tin giao hàng', 'Phương thức thanh toán'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${step > i + 1 ? 'text-green-600' : step === i + 1 ? 'text-primary font-semibold' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                {s}
              </div>
              {i < 1 && <div className="flex-1 h-px bg-gray-200" />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <form onSubmit={handleSubmitShipping} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-bold text-lg">Thông tin giao hàng</h2>
                </div>

                {addresses.length > 0 && (
                  <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chọn địa chỉ đã lưu:</label>
                    <select value={selectedAddressId} onChange={handleAddressSelect}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
                      {addresses.map(addr => (
                        <option key={addr._id} value={addr._id}>
                          {addr.fullName} - {addr.phone} - {addr.street}, {addr.ward}, {addr.province} {addr.isDefault ? '(Mặc định)' : ''}
                        </option>
                      ))}
                      <option value="new">+ Nhập địa chỉ mới</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                    <input name="fullName" value={form.fullName} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết *</label>
                  <input name="address" value={form.address} onChange={handleChange} required placeholder="Số nhà, tên đường" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã *</label>
                    <input name="ward" value={form.ward} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố *</label>
                    <input name="city" value={form.city} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea name="note" value={form.note} onChange={handleChange} rows={2} placeholder="Ghi chú về đơn hàng (không bắt buộc)" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" />
                </div>
                <button type="submit" className="w-full btn-primary">Tiếp tục đến thanh toán →</button>
              </form>
            )}

            {step === 2 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-bold text-lg mb-4">Phương thức thanh toán</h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(pm => (
                    <label key={pm.id} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === pm.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} className="accent-primary" />
                      <pm.icon size={20} className={pm.id === 'payos' ? 'text-primary' : 'text-gray-600'} />
                      <span className="font-medium text-sm flex-1">{pm.label}</span>
                      {pm.badge && (
                        <span style={{ fontSize: '10px', fontWeight: '700', background: 'linear-gradient(135deg,#E31837,#ff4d6d)', color: 'white', padding: '2px 8px', borderRadius: '99px', letterSpacing: '0.5px' }}>
                          {pm.badge}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="flex-1 btn-ghost border border-gray-300">← Quay lại</button>
                  <button onClick={handlePlaceOrder} disabled={isPlacingOrder} className="flex-2 btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed">
                    {isPlacingOrder ? 'Đang xử lý...' : 'Đặt hàng'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-20">
              <h3 className="font-bold mb-4">Đơn hàng ({items.length} sản phẩm)</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {items.map(item => (
                  <div key={item.key} className="flex gap-3">
                    <div className="relative">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg" />
                      <span className="absolute -top-1 -right-1 bg-gray-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-1">{item.product.name}</div>
                      <div className="text-xs text-gray-400">Size: {item.variant.size}</div>
                      <div className="text-sm font-bold text-primary">{formatPriceShort(item.product.salePrice * item.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Voucher section ── */}
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Tag size={14} style={{ color: '#E31837' }} />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>Mã giảm giá</span>
                </div>

                {appliedVoucher ? (
                  <div style={{ background: '#fff5f7', border: '1.5px dashed #E31837', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontFamily: 'monospace', fontWeight: '800', color: '#E31837', fontSize: '14px', letterSpacing: '1px' }}>{appliedVoucher.code}</div>
                      <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', marginTop: '2px' }}>
                        Tiết kiệm {formatPriceShort(appliedVoucher.discount)}
                      </div>
                    </div>
                    <button onClick={handleRemoveVoucher} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        id="voucher-code-input"
                        value={voucherCode}
                        onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleApplyVoucher()}
                        placeholder="Nhập mã voucher"
                        style={{ flex: 1, border: '1.5px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontFamily: 'monospace', fontWeight: '600', letterSpacing: '0.5px', outline: 'none' }}
                      />
                      <button
                        id="btn-apply-voucher"
                        onClick={() => handleApplyVoucher()}
                        disabled={applyingVoucher}
                        style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #E31837, #ff4d6d)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: applyingVoucher ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                      >
                        {applyingVoucher ? '...' : 'Áp dụng'}
                      </button>
                    </div>
                    {publicVouchers.length > 0 && (
                      <button
                        id="btn-show-vouchers"
                        onClick={() => setShowVoucherPicker(true)}
                        style={{ marginTop: '8px', width: '100%', background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '500' }}
                      >
                        <Tag size={12} /> Xem voucher có sẵn ({publicVouchers.length}) <ChevronDown size={12} />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính</span>
                  <span>{formatPriceShort(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vận chuyển</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>{shipping === 0 ? 'Miễn phí' : formatPriceShort(shipping)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-semibold" style={{ color: '#16a34a' }}>
                    <span>Voucher ({appliedVoucher?.code})</span>
                    <span>-{formatPriceShort(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Tổng</span>
                  <span className="text-primary text-lg">{formatPriceShort(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showVoucherPicker && (
        <VoucherPickerModal
          publicVouchers={publicVouchers}
          subtotal={subtotal}
          onSelect={(code) => handleApplyVoucher(code)}
          onClose={() => setShowVoucherPicker(false)}
        />
      )}
    </div>
  )
}

export default CheckoutPage
