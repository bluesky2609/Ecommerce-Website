import React, { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService.js'

const UsersAdminPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0 })
  const [selectedUser, setSelectedUser] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const limit = 15

  const load = async (p = page) => {
    setLoading(true)
    setError('')
    try {
      const params = { page: p, limit }
      if (filterRole) params.role = filterRole
      if (search) params.search = search
      const res = await adminService.getAllUsers(params)
      setUsers(res?.data || [])
      setPagination({ total: res?.pagination?.total || res?.data?.length || 0 })
    } catch (e) {
      setError(e?.message || 'Không tải được danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(page) }, [page, filterRole])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    load(1)
  }

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    if (!window.confirm(`Đổi quyền của "${user.name}" thành ${newRole === 'admin' ? 'Admin' : 'User'}?`)) return
    setUpdatingId(user._id)
    try {
      await adminService.updateUser(user._id, { role: newRole })
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u))
    } catch (e) {
      alert(e?.message || 'Lỗi cập nhật quyền')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleToggleActive = async (user) => {
    const action = user.isActive ? 'khóa' : 'mở khóa'
    if (!window.confirm(`Xác nhận ${action} tài khoản "${user.name}"?`)) return
    setUpdatingId(user._id)
    try {
      await adminService.updateUser(user._id, { isActive: !user.isActive })
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !user.isActive } : u))
    } catch (e) {
      alert(e?.message || 'Lỗi cập nhật tài khoản')
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = users.filter(u => {
    if (!search) return true
    return u.name?.toLowerCase().includes(search.toLowerCase()) || 
           u.email?.toLowerCase().includes(search.toLowerCase())
  })

  const totalPages = Math.ceil(pagination.total / limit)

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1f2937' }}>Người dùng</h1>
        <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '2px' }}>Quản lý tài khoản và phân quyền</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#9ca3af" style={{ width: '18px', height: '18px', position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email..."
            style={{ width: '100%', padding: '12px 16px 12px 44px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          />
        </form>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[{ value: '', label: 'Tất cả' }, { value: 'admin', label: 'Admin' }, { value: 'user', label: 'User' }].map(tab => (
            <button key={tab.value} onClick={() => { setFilterRole(tab.value); setPage(1) }} style={{
              padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
              border: filterRole === tab.value ? 'none' : '1.5px solid #e5e7eb',
              background: filterRole === tab.value ? 'linear-gradient(135deg, #E31837, #ff4d6d)' : 'white',
              color: filterRole === tab.value ? 'white' : '#6b7280',
              cursor: 'pointer', boxShadow: filterRole === tab.value ? '0 4px 12px rgba(227,24,55,0.3)' : 'none',
            }}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {[
          { label: 'Tổng tài khoản', value: pagination.total, color: '#3b82f6' },
          { label: 'Admin', value: users.filter(u => u.role === 'admin').length, color: '#E31837' },
          { label: 'Hoạt động', value: users.filter(u => u.isActive !== false).length, color: '#10b981' },
          { label: 'Bị khóa', value: users.filter(u => u.isActive === false).length, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#1f2937' }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

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
                  {['Người dùng', 'Email', 'SĐT', 'Quyền', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>Không tìm thấy người dùng nào</td></tr>
                )}
                {filtered.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #f3f4f6' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                          background: user.role === 'admin'
                            ? 'linear-gradient(135deg, #E31837, #ff4d6d)'
                            : 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: '700', fontSize: '15px',
                          overflow: 'hidden',
                        }}>
                          {user.avatar ? (
                            <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            user.name?.charAt(0)?.toUpperCase()
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{user.name}</div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>ID: {user._id?.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>{user.email}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>{user.phone || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700',
                        color: user.role === 'admin' ? '#E31837' : '#3b82f6',
                        background: user.role === 'admin' ? '#fef2f2' : '#eff6ff',
                      }}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                        color: user.isActive !== false ? '#10b981' : '#ef4444',
                        background: user.isActive !== false ? '#ecfdf5' : '#fef2f2',
                      }}>
                        {user.isActive !== false ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#9ca3af' }}>
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleToggleRole(user)}
                          disabled={updatingId === user._id}
                          style={{
                            padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                            background: user.role === 'admin' ? '#eff6ff' : '#fef2f2',
                            color: user.role === 'admin' ? '#3b82f6' : '#E31837',
                            border: 'none', cursor: 'pointer',
                          }}
                        >
                          {user.role === 'admin' ? '→ User' : '→ Admin'}
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          disabled={updatingId === user._id}
                          style={{
                            padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                            background: user.isActive !== false ? '#fef2f2' : '#ecfdf5',
                            color: user.isActive !== false ? '#ef4444' : '#10b981',
                            border: 'none', cursor: 'pointer',
                          }}
                        >
                          {user.isActive !== false ? 'Khóa' : 'Mở khóa'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Tổng: {pagination.total} người dùng</span>
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
    </div>
  )
}

export default UsersAdminPage
