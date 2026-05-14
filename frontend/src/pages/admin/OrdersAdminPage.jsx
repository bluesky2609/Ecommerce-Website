import React, { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService.js'

const statusMap = {
  pending: { label: 'Chờ xử lý', color: '#f59e0b', bg: '#fffbeb' },
  confirmed: { label: 'Đã xác nhận', color: '#3b82f6', bg: '#eff6ff' },
  shipping: { label: 'Đang giao', color: '#8b5cf6', bg: '#f5f3ff' },
  delivered: { label: 'Đã giao', color: '#10b981', bg: '#ecfdf5' },
  cancelled: { label: 'Đã hủy', color: '#ef4444', bg: '#fef2f2' },
}

const paymentMap = {
  pending: { label: 'Chưa thanh toán', color: '#f59e0b' },
  paid: { label: 'Đã thanh toán', color: '#10b981' },
  failed: { label: 'Thất bại', color: '#ef4444' },
}

const methodLabel = { cod: 'COD', payos: 'PayOS', vnpay: 'VNPay', momo: 'MoMo', card: 'Thẻ' }
const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ'

const OrdersAdminPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0 })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [syncingId, setSyncingId] = useState(null)
  const limit = 15

  const load = async (p = page, status = filterStatus) => {
    setLoading(true)
    setError('')
    try {
      const params = { page: p, limit }
      if (status) params.status = status
      const res = await adminService.getAllOrders(params)
      setOrders(res?.data || [])
      setPagination({ total: res?.pagination?.total || 0 })
    } catch (e) {
      setError(e?.message || 'Không tải được đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(page, filterStatus) }, [page, filterStatus])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await adminService.updateOrderStatus(orderId, newStatus)
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      if (selectedOrder?._id === orderId) setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }))
    } catch (e) {
      alert(e?.message || 'Lỗi cập nhật trạng thái')
    } finally {
      setUpdatingId(null)
    }
  }

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    setUpdatingId(orderId + '_pay')
    try {
      await adminService.updatePaymentStatus(orderId, newPaymentStatus)
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o))
      if (selectedOrder?._id === orderId) setSelectedOrder(prev => ({ ...prev, paymentStatus: newPaymentStatus }))
    } catch (e) {
      alert(e?.message || 'Lỗi cập nhật thanh toán')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSyncPayOS = async (order) => {
    setSyncingId(order._id)
    try {
      // Extract numeric order code (remove 'HD' prefix)
      const numericCode = order.orderCode?.replace(/^HD/, '')
      const res = await adminService.syncPayOSStatus(numericCode)
      const newPaymentStatus = res?.paymentStatus || order.paymentStatus
      const newOrderStatus = res?.orderStatus || order.orderStatus
      setOrders(prev => prev.map(o => o._id === order._id ? { ...o, paymentStatus: newPaymentStatus, orderStatus: newOrderStatus } : o))
      if (selectedOrder?._id === order._id) setSelectedOrder(prev => ({ ...prev, paymentStatus: newPaymentStatus, orderStatus: newOrderStatus }))
      alert(`Đồng bộ thành công! Thanh toán: ${paymentMap[newPaymentStatus]?.label || newPaymentStatus}`)
    } catch (e) {
      alert(e?.message || 'Không thể đồng bộ trạng thái PayOS')
    } finally {
      setSyncingId(null)
    }
  }

  const totalPages = Math.ceil(pagination.total / limit)

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1f2937' }}>Quản lý đơn hàng</h1>
        <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '2px' }}>Duyệt và cập nhật trạng thái đơn hàng</p>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[{ value: '', label: 'Tất cả' }, ...Object.entries(statusMap).map(([v, s]) => ({ value: v, label: s.label }))].map(tab => (
          <button
            key={tab.value}
            onClick={() => { setFilterStatus(tab.value); setPage(1) }}
            style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
              border: filterStatus === tab.value ? 'none' : '1.5px solid #e5e7eb',
              background: filterStatus === tab.value ? 'linear-gradient(135deg, #E31837, #ff4d6d)' : 'white',
              color: filterStatus === tab.value ? 'white' : '#6b7280',
              cursor: 'pointer',
              boxShadow: filterStatus === tab.value ? '0 4px 12px rgba(227,24,55,0.3)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 380px' : '1fr', gap: '20px', alignItems: 'flex-start' }}>
        {/* Table */}
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #f3f4f6', borderTop: '3px solid #E31837', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}
          {!loading && error && <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>{error}</div>}
          {!loading && !error && (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Phương thức', 'Thanh toán', 'Trạng thái', 'Ngày đặt', ''].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>Không có đơn hàng nào</td></tr>
                  )}
                  {orders.map(order => {
                    const s = statusMap[order.orderStatus] || { label: order.orderStatus, color: '#6b7280', bg: '#f9fafb' }
                    const ps = paymentMap[order.paymentStatus] || { label: order.paymentStatus, color: '#6b7280' }
                    const isSelected = selectedOrder?._id === order._id
                    const isCOD = order.paymentMethod === 'cod'
                    const isPayOS = order.paymentMethod === 'payos'

                    return (
                      <tr key={order._id}
                        style={{ borderBottom: '1px solid #f3f4f6', background: isSelected ? '#fef7f7' : '', cursor: 'pointer', transition: 'background 0.15s' }}
                        onClick={() => setSelectedOrder(isSelected ? null : order)}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#fafafa' }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '' }}
                      >
                        <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>#{order.orderCode || order._id?.slice(-6)}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>{order.user?.name || 'Khách hàng'}</div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>{order.user?.email}</div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '700', color: '#E31837', whiteSpace: 'nowrap' }}>{fmt(order.total || 0)}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '99px',
                            background: isCOD ? '#f3f4f6' : '#eff6ff',
                            color: isCOD ? '#374151' : '#2563eb'
                          }}>
                            {methodLabel[order.paymentMethod] || order.paymentMethod}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                          {isCOD ? (
                            <select
                              value={order.paymentStatus}
                              onChange={e => handlePaymentStatusChange(order._id, e.target.value)}
                              disabled={updatingId === order._id + '_pay'}
                              style={{
                                padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                                border: `1.5px solid ${ps.color}`, color: ps.color, background: 'white',
                                cursor: 'pointer', outline: 'none',
                              }}
                            >
                              {Object.entries(paymentMap).map(([val, meta]) => (
                                <option key={val} value={val}>{meta.label}</option>
                              ))}
                            </select>
                          ) : isPayOS ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '600', color: ps.color }}>{ps.label}</span>
                              <button
                                onClick={() => handleSyncPayOS(order)}
                                disabled={syncingId === order._id}
                                title="Đồng bộ trạng thái từ PayOS"
                                style={{
                                  padding: '2px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: '600',
                                  border: '1.5px solid #3b82f6', color: '#3b82f6', background: 'white',
                                  cursor: 'pointer', whiteSpace: 'nowrap',
                                  opacity: syncingId === order._id ? 0.5 : 1,
                                }}
                              >
                                {syncingId === order._id ? '...' : '↻ Sync'}
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', fontWeight: '600', color: ps.color }}>{ps.label}</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                          <select
                            value={order.orderStatus}
                            onChange={e => { e.stopPropagation(); handleStatusChange(order._id, e.target.value) }}
                            disabled={updatingId === order._id}
                            onClick={e => e.stopPropagation()}
                            style={{
                              padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                              border: `1.5px solid ${s.color}`, color: s.color, background: s.bg,
                              cursor: 'pointer', outline: 'none',
                            }}
                          >
                            {Object.entries(statusMap).map(([val, meta]) => (
                              <option key={val} value={val}>{meta.label}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '13px', color: '#E31837', fontWeight: '600' }}>{isSelected ? '▲' : '▼'}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Tổng: {pagination.total} đơn</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: 'white', color: page === 1 ? '#d1d5db' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '13px' }}>← Trước</button>
                    <span style={{ padding: '6px 12px', fontSize: '13px', color: '#374151', fontWeight: '600' }}>{page}/{totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: 'white', color: page >= totalPages ? '#d1d5db' : '#374151', cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '13px' }}>Sau →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Order detail panel */}
        {selectedOrder && (
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden', position: 'sticky', top: '88px' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>#{selectedOrder.orderCode || selectedOrder._id?.slice(-6)}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Customer */}
              <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Khách hàng</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName}</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{selectedOrder.user?.email}</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{selectedOrder.shippingAddress?.phone}</div>
              </div>

              {/* Address */}
              <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Địa chỉ giao hàng</div>
                <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>
                  {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.ward}, {selectedOrder.shippingAddress?.province}
                </div>
              </div>

              {/* Items */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Sản phẩm ({(selectedOrder.items || []).length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(selectedOrder.items || []).map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>
                      {item.productImage ? (
                        <img src={item.productImage} alt="" style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '42px', height: '42px', borderRadius: '6px', background: '#e5e7eb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👕</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.productName}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{item.colorName} · Size {item.size} · x{item.quantity}</div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#E31837', whiteSpace: 'nowrap' }}>{fmt(item.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                {[
                  { label: 'Tạm tính', value: fmt(selectedOrder.subtotal || 0) },
                  { label: 'Phí ship', value: fmt(selectedOrder.shippingFee || 0) },
                  { label: 'Giảm giá', value: `-${fmt(selectedOrder.discount || 0)}`, color: '#10b981' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>
                    <span>{r.label}</span>
                    <span style={{ color: r.color }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: '#1f2937', borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '4px' }}>
                  <span>Tổng cộng</span>
                  <span style={{ color: '#E31837' }}>{fmt(selectedOrder.total || 0)}</span>
                </div>
              </div>

              {/* Payment info + action */}
              <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Thanh toán</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Phương thức</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>{methodLabel[selectedOrder.paymentMethod] || selectedOrder.paymentMethod}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Trạng thái</span>
                  {selectedOrder.paymentMethod === 'cod' ? (
                    <select
                      value={selectedOrder.paymentStatus}
                      onChange={e => handlePaymentStatusChange(selectedOrder._id, e.target.value)}
                      disabled={updatingId === selectedOrder._id + '_pay'}
                      style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                        border: `1.5px solid ${paymentMap[selectedOrder.paymentStatus]?.color || '#ccc'}`,
                        color: paymentMap[selectedOrder.paymentStatus]?.color || '#333',
                        background: 'white', cursor: 'pointer', outline: 'none',
                      }}
                    >
                      {Object.entries(paymentMap).map(([val, meta]) => (
                        <option key={val} value={val}>{meta.label}</option>
                      ))}
                    </select>
                  ) : selectedOrder.paymentMethod === 'payos' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: paymentMap[selectedOrder.paymentStatus]?.color || '#333' }}>
                        {paymentMap[selectedOrder.paymentStatus]?.label || selectedOrder.paymentStatus}
                      </span>
                      <button
                        onClick={() => handleSyncPayOS(selectedOrder)}
                        disabled={syncingId === selectedOrder._id}
                        style={{
                          padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                          border: '1.5px solid #3b82f6', color: '#3b82f6', background: 'white',
                          cursor: 'pointer', opacity: syncingId === selectedOrder._id ? 0.5 : 1,
                        }}
                      >
                        {syncingId === selectedOrder._id ? 'Đang sync...' : '↻ Đồng bộ PayOS'}
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '13px', fontWeight: '700', color: paymentMap[selectedOrder.paymentStatus]?.color || '#333' }}>
                      {paymentMap[selectedOrder.paymentStatus]?.label || selectedOrder.paymentStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersAdminPage
