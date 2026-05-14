import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderService } from '../services/orderService.js'

const statusMap = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
}

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders()
        const ordersList = Array.isArray(data) ? data : (data?.data || [])
        setOrders(ordersList)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/account" className="text-gray-500 hover:text-primary">&larr; Quay lại</Link>
          <h1 className="text-2xl font-black">Lịch sử đơn hàng</h1>
        </div>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào.</p>
            <Link to="/" className="btn-primary inline-block">Tiếp tục mua sắm</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border hover:border-primary transition-colors">
                <div>
                  <p className="font-bold text-gray-900 mb-1">Mã đơn: {order.orderCode}</p>
                  <p className="text-sm text-gray-500 mb-1">Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                  <p className="text-sm text-gray-500">
                    Sản phẩm: {order.items.length} món
                  </p>
                </div>
                
                <div className="flex flex-col md:items-end gap-3 text-right">
                  <p className="font-bold text-primary text-lg">Tổng: {order.total?.toLocaleString('vi-VN')}đ</p>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusMap[order.orderStatus]?.color || 'bg-gray-100 text-gray-800'}`}>
                      {statusMap[order.orderStatus]?.label || order.orderStatus}
                    </span>
                    <Link to={`/orders/${order._id}`} className="text-sm text-primary hover:underline font-medium bg-primary/10 px-3 py-1 rounded-full">Xem chi tiết</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage
