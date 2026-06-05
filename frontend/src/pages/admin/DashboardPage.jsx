import React, { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService.js'

const StatCard = ({ title, value, sub, icon, color, trend }) => (
  <div style={{
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    position: 'relative',
    transition: 'transform 0.2s, box-shadow 0.2s',
    minWidth: 0,
  }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'
    }}
  >
    <div style={{
      width: '52px',
      height: '52px',
      borderRadius: '14px',
      background: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: `0 8px 20px ${color}50`,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500', marginBottom: '4px', lineHeight: '1.4' }}>{title}</div>
      <div style={{ fontSize: '22px', fontWeight: '800', color: '#1f2937', lineHeight: 1.2, wordBreak: 'break-all' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{sub}</div>}
    </div>
    {trend && (
      <div style={{
        fontSize: '11px',
        fontWeight: '600',
        color: trend > 0 ? '#10b981' : '#ef4444',
        background: trend > 0 ? '#ecfdf5' : '#fef2f2',
        padding: '3px 7px',
        borderRadius: '6px',
        flexShrink: 0,
      }}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </div>
    )}
    <div style={{
      position: 'absolute',
      right: '-20px',
      bottom: '-20px',
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      background: color,
      opacity: 0.05,
      pointerEvents: 'none',
    }} />
  </div>
)

const statusMap = {
  pending: { label: 'Chờ xử lý', color: '#f59e0b', bg: '#fffbeb' },
  confirmed: { label: 'Đã xác nhận', color: '#3b82f6', bg: '#eff6ff' },
  shipping: { label: 'Đang giao', color: '#8b5cf6', bg: '#f5f3ff' },
  delivered: { label: 'Đã giao', color: '#10b981', bg: '#ecfdf5' },
  cancelled: { label: 'Đã hủy', color: '#ef4444', bg: '#fef2f2' },
}

const DashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes] = await Promise.all([
          adminService.getAllOrders({ page: 1, limit: 5 }),
        ])
        setRecentOrders(ordersRes?.data || [])
        // Build mock stats from orders
        const orders = ordersRes?.data || []
        const total = orders.reduce((s, o) => s + (o.total || 0), 0)
        setStats({
          totalOrders: ordersRes?.pagination?.total || orders.length,
          totalRevenue: total,
          pending: orders.filter(o => o.orderStatus === 'pending').length,
          delivered: orders.filter(o => o.orderStatus === 'delivered').length,
        })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
      <div style={{
        width: '40px', height: '40px', border: '3px solid #f3f4f6',
        borderTop: '3px solid #E31837', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1f2937', marginBottom: '6px' }}>Dashboard</h1>
        <p style={{ fontSize: '14px', color: '#9ca3af' }}>
          Tổng quan hệ thống — {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <StatCard
          title="Tổng đơn hàng"
          value={stats?.totalOrders ?? '—'}
          sub="Toàn bộ đơn đã tạo"
          color="linear-gradient(135deg, #E31837, #ff4d6d)"
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" style={{ width: '26px', height: '26px' }}><path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" /></svg>}
        />
        <StatCard
          title="Doanh thu (5 đơn gần nhất)"
          value={fmt(stats?.totalRevenue ?? 0)}
          sub="Tổng tiền thu"
          color="linear-gradient(135deg, #10b981, #34d399)"
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" style={{ width: '26px', height: '26px' }}><path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" /><path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clipRule="evenodd" /><path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" /></svg>}

        />
        <StatCard
          title="Chờ xử lý (5 đơn gần nhất)"
          value={stats?.pending ?? '—'}
          sub="Đơn hàng cần duyệt"
          color="linear-gradient(135deg, #f59e0b, #fbbf24)"
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" style={{ width: '26px', height: '26px' }}><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" /></svg>}
        />
        <StatCard
          title="Đã giao (5 đơn gần nhất)"
          value={stats?.delivered ?? '—'}
          sub="Đơn giao thành công"
          color="linear-gradient(135deg, #3b82f6, #60a5fa)"
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" style={{ width: '26px', height: '26px' }}><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" /></svg>}

        />
      </div>

      {/* Recent orders */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>Đơn hàng gần đây</h3>
          <a href="/admin/orders" style={{ fontSize: '13px', color: '#E31837', fontWeight: '600', textDecoration: 'none' }}>Xem tất cả →</a>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Trạng thái', 'Ngày đặt'].map(h => (
                  <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              )}
              {recentOrders.map((order, i) => {
                const s = statusMap[order.orderStatus] || { label: order.orderStatus, color: '#6b7280', bg: '#f9fafb' }
                return (
                  <tr key={order._id} style={{
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>
                      #{order.orderCode || order._id?.slice(-6)}
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{order.user?.name || 'Khách hàng'}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{order.user?.email}</div>
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: '700', color: '#E31837' }}>
                      {fmt(order.total || 0)}
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: s.color,
                        background: s.bg,
                      }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: '13px', color: '#9ca3af' }}>
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
        {[
          { label: 'Thêm sản phẩm mới', to: '/admin/products', color: '#E31837', desc: 'Quản lý kho hàng' },
          { label: 'Quản lý danh mục', to: '/admin/categories', color: '#3b82f6', desc: 'Phân loại sản phẩm' },
          { label: 'Duyệt đơn hàng', to: '/admin/orders', color: '#f59e0b', desc: 'Cập nhật trạng thái' },
          { label: 'Xem người dùng', to: '/admin/users', color: '#10b981', desc: 'Quản lý tài khoản' },
        ].map(link => (
          <a key={link.to} href={link.to} style={{
            display: 'block',
            padding: '20px',
            background: 'white',
            borderRadius: '12px',
            textDecoration: 'none',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            borderLeft: `4px solid ${link.color}`,
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>{link.label}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{link.desc}</div>
          </a>
        ))}
      </div>
    </div>
  )
}

export default DashboardPage
