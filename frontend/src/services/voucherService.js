import api from './api.js'

// NOTE: api.js interceptor returns response.data directly (the { success, data, ... } object)
// So calling api.get/post/... already gives us { success: true, data: ... }

export const voucherService = {
  // Public – get all active vouchers visible to users
  getPublicVouchers: async () => {
    return await api.get('/vouchers')  // returns { success, data: [...] }
  },

  // Public – apply / validate a voucher code
  applyVoucher: async (code, orderTotal) => {
    return await api.post('/vouchers/apply', { code, orderTotal })  // returns { success, data: {...} }
  },

  // ─── Admin ─────────────────────────────────────────────────
  adminGetAll: async () => {
    return await api.get('/admin/vouchers')  // returns { success, data: [...] }
  },

  adminCreate: async (data) => {
    return await api.post('/admin/vouchers', data)  // returns { success, data: voucher }
  },

  adminUpdate: async (id, data) => {
    return await api.put(`/admin/vouchers/${id}`, data)  // returns { success, data: voucher }
  },

  adminDelete: async (id) => {
    return await api.delete(`/admin/vouchers/${id}`)  // returns { success, message }
  },
}
