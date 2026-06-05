import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore.js'
import { authService } from '../services/authService.js'
import AddressManager from '../components/profile/AddressManager.jsx'

const AccountPage = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    authService.logout()
    navigate('/login', { replace: true })
  }

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', phone: user.phone || '' })
    }
  }, [user])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      await authService.updateProfile(profileForm)
      setIsEditingProfile(false)
      // Toast notification if available, otherwise just silent success
    } catch (err) {
      alert(err.message || 'Cập nhật thất bại')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-black mb-2">Tài khoản của tôi</h1>

        <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-gray-900">Thông tin cá nhân</h2>
              {!isEditingProfile && (
                <button onClick={() => setIsEditingProfile(true)} className="text-primary text-sm font-medium hover:underline">
                  Chỉnh sửa
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Họ tên</label>
                    <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value.replace(/[^\p{L}\s]/gu, '') })} required className="w-full text-sm p-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input type="text" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '') })} className="w-full text-sm p-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={user?.email || ''} disabled className="w-full text-sm p-2.5 border border-gray-200 bg-gray-100 text-gray-500 rounded cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Vai trò</label>
                    <input type="text" value={user?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'} disabled className="w-full text-sm p-2.5 border border-gray-200 bg-gray-100 text-gray-500 rounded cursor-not-allowed" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-2">
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-100">Hủy</button>
                  <button type="submit" disabled={isUpdating} className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-black disabled:opacity-50">{isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Họ tên: <span className="font-semibold text-gray-900">{user?.name || 'N/A'}</span></p>
                <p className="text-sm text-gray-600">Số điện thoại: <span className="font-semibold text-gray-900">{user?.phone || 'Chưa cập nhật'}</span></p>
                <p className="text-sm text-gray-600">Email: <span className="font-semibold text-gray-900">{user?.email || 'N/A'}</span></p>
                <p className="text-sm text-gray-600">Vai trò: <span className="font-semibold text-gray-900">{user?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</span></p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/orders" className="btn-primary bg-primary cursor-pointer hover:bg-black hover:text-white border-primary">Lịch sử đơn hàng</Link>
            <Link to="/cart" className="btn-outline">Xem giỏ hàng</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="btn-primary border-primary">Vào trang quản trị</Link>
            )}
            <button onClick={handleLogout} className="btn-ghost border border-gray-300">Đăng xuất</button>
          </div>
        </div>

        <AddressManager />
      </div>
    </div>
  )
}

export default AccountPage
