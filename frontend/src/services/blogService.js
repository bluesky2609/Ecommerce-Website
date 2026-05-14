import api from './api.js'
import { blogs } from '../data/mock/blogs.js'

export const blogService = {
  getAll: async (params = {}) => {
    try {
      const res = await api.get('/blogs', { params })
      return res.data
    } catch {
      return blogs
    }
  },

  getBySlug: async (slug) => {
    try {
      const res = await api.get(`/blogs/${slug}`)
      return res.data
    } catch {
      const blog = blogs.find(b => b.slug === slug)
      if (!blog) throw new Error('Bài viết không tồn tại')
      return blog
    }
  },

  getRecent: async (limit = 4) => {
    try {
      const res = await api.get('/blogs/recent')
      return res.data
    } catch {
      return blogs.slice(0, limit)
    }
  },
}
