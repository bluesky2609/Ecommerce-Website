import api from './api.js'

export const adminService = {
  // ─── Dashboard ───────────────────────────────────────
  getDashboardStats: async () => {
    const res = await api.get('/admin/stats')
    return res
  },

  // ─── Products ─────────────────────────────────────────
  getAllProducts: async (params = {}) => {
    const res = await api.get('/admin/products', { params })
    return res
  },

  createProduct: async (data) => {
    const res = await api.post('/admin/products', data)
    return res.data
  },

  updateProduct: async (id, data) => {
    const res = await api.put(`/admin/products/${id}`, data)
    return res.data
  },

  deleteProduct: async (id) => {
    return api.delete(`/admin/products/${id}`)
  },

  // ─── Categories ───────────────────────────────────────
  getAllCategories: async (params = {}) => {
    const res = await api.get('/categories', { params })
    return res
  },

  createCategory: async (data) => {
    const res = await api.post('/admin/categories', data)
    return res.data
  },

  updateCategory: async (id, data) => {
    const res = await api.put(`/admin/categories/${id}`, data)
    return res.data
  },

  deleteCategory: async (id) => {
    return api.delete(`/admin/categories/${id}`)
  },

  // ─── Blogs ────────────────────────────────────────────
  getAllBlogs: async (params = {}) => {
    const res = await api.get('/blogs', { params })
    return res
  },

  createBlog: async (data) => {
    const res = await api.post('/admin/blogs', data)
    return res.data
  },

  updateBlog: async (id, data) => {
    const res = await api.put(`/admin/blogs/${id}`, data)
    return res.data
  },

  deleteBlog: async (id) => {
    return api.delete(`/admin/blogs/${id}`)
  },

  // ─── Orders ───────────────────────────────────────────
  getAllOrders: async (params = {}) => {
    const res = await api.get('/admin/orders', { params })
    return res
  },

  updateOrderStatus: async (id, orderStatus) => {
    const res = await api.put(`/admin/orders/${id}/status`, { orderStatus })
    return res.data
  },

  updatePaymentStatus: async (id, paymentStatus) => {
    const res = await api.put(`/admin/orders/${id}/payment-status`, { paymentStatus })
    return res.data
  },

  syncPayOSStatus: async (orderCode) => {
    const res = await api.get(`/payment/payos/status/${orderCode}`)
    return res
  },

  // ─── Users ────────────────────────────────────────────
  getAllUsers: async (params = {}) => {
    const res = await api.get('/admin/users', { params })
    return res
  },

  updateUser: async (id, data) => {
    const res = await api.put(`/admin/users/${id}`, data)
    return res.data
  },

  deleteUser: async (id) => {
    return api.delete(`/admin/users/${id}`)
  },

  // ─── Reviews ──────────────────────────────────────────
  getAllReviews: async (params = {}) => {
    const res = await api.get('/admin/reviews', { params })
    return res
  },

  replyToReview: async (id, reply) => {
    const res = await api.put(`/admin/reviews/${id}/reply`, { reply })
    return res.data
  },

  deleteReview: async (id) => {
    return api.delete(`/admin/reviews/${id}`)
  },
}
