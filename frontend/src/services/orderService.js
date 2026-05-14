import api from './api.js'

export const orderService = {
  create: async (orderData) => {
    const res = await api.post('/orders', orderData)
    return res.data
  },

  getMyOrders: async () => {
    const res = await api.get('/orders/my')
    return res.data
  },

  getById: async (id) => {
    const res = await api.get(`/orders/${id}`)
    return res.data
  },

  applyCoupon: async (code, subtotal) => {
    const res = await api.post('/orders/apply-coupon', { code, subtotal })
    return res.data
  },

  createPayOSPayment: async (payload) => {
    const res = await api.post('/payment/payos/create', payload)
    return res.data
  },

  getPayOSStatus: async (orderCode) => {
    const res = await api.get(`/payment/payos/status/${orderCode}`)
    return res.data
  },
}
