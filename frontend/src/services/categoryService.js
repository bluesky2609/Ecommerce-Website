import api from './api.js'
import { categories, allCategories } from '../data/mock/categories.js'

export const categoryService = {
  getAll: async () => {
    try {
      const res = await api.get('/categories', { params: { tree: true } })
      return res.data.success ? res.data.data : res.data
    } catch {
      return categories
    }
  },

  getBySlug: async (slug) => {
    try {
      const res = await api.get(`/categories/${slug}`)
      return res.data.success ? res.data.data : res.data
    } catch {
      const cat = allCategories.find(c => c.slug === slug)
      if (!cat) throw new Error('Danh mục không tồn tại')
      return cat
    }
  },
}
