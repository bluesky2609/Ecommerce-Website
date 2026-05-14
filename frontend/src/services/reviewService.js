import api from './api.js'

export const reviewService = {
  // Lấy danh sách đánh giá của sản phẩm
  getByProduct: async (productId, params = {}) => {
    const res = await api.get(`/products/${productId}/reviews`, { params })
    return res
  },

  // Kiểm tra quyền đánh giá
  canReview: async (productId) => {
    try {
      const res = await api.get(`/products/${productId}/reviews/can-review`)
      return res
    } catch {
      return { canReview: false, pendingOrders: [] }
    }
  },

  // Tạo đánh giá mới
  create: async (productId, data) => {
    const res = await api.post(`/products/${productId}/reviews`, data)
    return res
  },

  // Xóa đánh giá
  delete: async (productId, reviewId) => {
    const res = await api.delete(`/products/${productId}/reviews/${reviewId}`)
    return res
  },
}
