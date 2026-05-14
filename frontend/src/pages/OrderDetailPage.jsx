import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { orderService } from '../services/orderService.js'

const statusMap = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
}

const paymentMethodMap = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  vnpay: 'Thanh toán qua VNPAY',
  momo: 'Thanh toán qua MOMO',
  card: 'Thanh toán thẻ',
}

const OrderDetailPage = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getById(id)
        setOrder(data?.data || data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-gray-500 mb-4">Không tìm thấy đơn hàng</p>
        <Link to="/orders" className="btn-primary">Quay lại lịch sử</Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/orders" className="text-gray-500 hover:text-primary">&larr; Lịch sử đơn hàng</Link>
          <h1 className="text-2xl font-black">Chi tiết đơn hàng {order.orderCode}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden">
              <h2 className="font-bold text-lg border-b pb-4 mb-4">Sản phẩm</h2>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 border-b last:border-0 pb-4 last:pb-0">
                    <img 
                      src={item.productImage || 'https://via.placeholder.com/80'} 
                      alt={item.productName} 
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 line-clamp-2">{item.productName}</h3>
                      <div className="text-sm text-gray-500 mt-1 flex gap-2">
                        <span>Màu: <span className="font-medium text-gray-700">{item.colorName}</span></span>
                        <span>Size: <span className="font-medium text-gray-700">{item.size}</span></span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">SL: {item.quantity}</span>
                        <span className="font-medium">{item.price?.toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h2 className="font-bold text-lg mb-4">Địa chỉ nhận hàng</h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">{order.shippingAddress?.fullName}</p>
                  <p>SĐT: {order.shippingAddress?.phone}</p>
                  <p>{order.shippingAddress?.street}</p>
                  <p>{order.shippingAddress?.ward}, {order.shippingAddress?.district}</p>
                  <p>{order.shippingAddress?.province}</p>
                </div>
              </div>
              <div className="flex-1 border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-6">
                <h2 className="font-bold text-lg mb-4">Thông tin đơn hàng</h2>
                <div className="text-sm space-y-2">
                  <p className="flex justify-between text-gray-600">Trạng thái: 
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusMap[order.orderStatus]?.color || ''}`}>
                      {statusMap[order.orderStatus]?.label || order.orderStatus}
                    </span>
                  </p>
                  <p className="flex justify-between text-gray-600">Thanh toán: 
                    <span className="font-medium text-gray-900">{paymentMethodMap[order.paymentMethod] || order.paymentMethod}</span>
                  </p>
                  <p className="flex justify-between text-gray-600">Trạng thái TT: 
                    <span className="font-medium text-gray-900">{order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</span>
                  </p>
                  {order.note && <p className="mt-2 text-gray-600">Ghi chú: <span className="italic">{order.note}</span></p>}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="font-bold text-lg border-b pb-4 mb-4">Tóm tắt thanh toán</h2>
              <div className="space-y-3 text-sm text-gray-600 border-b pb-4 mb-4">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span className="font-medium text-gray-900">{order.subtotal?.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className={`font-medium ${order.shippingFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {order.shippingFee === 0 ? 'Miễn phí' : `${order.shippingFee?.toLocaleString('vi-VN')}đ`}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá {order.couponCode ? `(${order.couponCode})` : ''}</span>
                    <span>-{order.discount?.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                <span>Tổng cộng</span>
                <span className="text-primary">{order.total?.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage
