import api from './api.js'
import useAuthStore from '../stores/authStore.js'

export const authService = {
  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password })
      useAuthStore.getState().setAuth(res.user, res.token)
      return res
    } catch (err) {
      // Fallback mock for development when backend is offline
      if (email === 'demo@hody.vn' && password === '123456') {
        const user = { id: '1', name: 'Demo User', email, role: 'user' }
        const token = 'mock-jwt-token-' + Date.now()
        useAuthStore.getState().setAuth(user, token)
        return { user, token }
      }
      if (err.response?.data?.code === 'UNVERIFIED') {
        throw { message: err.response.data.message, code: 'UNVERIFIED' };
      }
      throw new Error(err?.response?.data?.message || err?.message || 'Email hoặc mật khẩu không đúng')
    }
  },

  register: async (name, email, password, phone) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, phone })
      return res // Không đăng nhập ngay lập tức để chuyển sang màn hình OTP
    } catch (err) {
      throw new Error(err?.response?.data?.message || err?.message || 'Đăng ký thất bại')
    }
  },

  verifyOtp: async (email, otp) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp })
      useAuthStore.getState().setAuth(res.user, res.token)
      return res
    } catch (err) {
      throw new Error(err?.response?.data?.message || err?.message || 'Xác minh OTP thất bại')
    }
  },

  resendOtp: async (email) => {
    try {
      const res = await api.post('/auth/resend-otp', { email })
      return res
    } catch (err) {
      throw new Error(err?.response?.data?.message || err?.message || 'Gửi lại OTP thất bại')
    }
  },

  getMe: async () => {
    const res = await api.get('/auth/me')
    return res.user
  },

  updateProfile: async (data) => {
    const res = await api.put('/auth/me', data)
    useAuthStore.getState().setAuth(res.user, null)
    return res.user
  },

  changePassword: async (currentPassword, newPassword) => {
    return api.put('/auth/change-password', { currentPassword, newPassword })
  },

  logout: () => {
    useAuthStore.getState().logout()
  },

  addAddress: async (addressData) => {
    const res = await api.post('/auth/addresses', addressData);
    if (res.addresses) {
      const authState = useAuthStore.getState();
      authState.setAuth({ ...authState.user, addresses: res.addresses }, null);
    }
    return res;
  },

  updateAddress: async (id, addressData) => {
    const res = await api.put(`/auth/addresses/${id}`, addressData);
    if (res.addresses) {
      const authState = useAuthStore.getState();
      authState.setAuth({ ...authState.user, addresses: res.addresses }, null);
    }
    return res;
  },

  deleteAddress: async (id) => {
    const res = await api.delete(`/auth/addresses/${id}`);
    if (res.addresses) {
      const authState = useAuthStore.getState();
      authState.setAuth({ ...authState.user, addresses: res.addresses }, null);
    }
    return res;
  },

  setDefaultAddress: async (id) => {
    const res = await api.put(`/auth/addresses/${id}/default`);
    if (res.addresses) {
      const authState = useAuthStore.getState();
      authState.setAuth({ ...authState.user, addresses: res.addresses }, null);
    }
    return res;
  },
}
