import api from './api.js'

const normalizeId = (value) => {
  if (value === null || value === undefined) return ''
  return String(value)
}

const normalizeVariant = (variant = {}) => ({
  ...variant,
  id: normalizeId(variant._id || variant.id),
  colorId: normalizeId(variant.colorId),
  size: normalizeId(variant.size),
  stock: Number(variant.stock || 0),
})

const normalizeProduct = (product = {}) => {
  const rawColors = Array.isArray(product.colors) ? product.colors : []
  const colorOptions = rawColors
    .map((color) => {
      if (typeof color === 'object' && color !== null) {
        return {
          id: normalizeId(color.id || color._id),
          name: color.name || '',
          hex: color.hex || '',
        }
      }
      return null
    })
    .filter(Boolean)

  const colors = colorOptions.length > 0
    ? colorOptions.map((color) => color.id)
    : rawColors.map((color) => normalizeId(color))

  const variants = Array.isArray(product.variants)
    ? product.variants.map(normalizeVariant)
    : []

  return {
    ...product,
    id: normalizeId(product._id || product.id),
    colors,
    colorOptions,
    sizes: Array.isArray(product.sizes) ? product.sizes.map((size) => normalizeId(size)) : [],
    variants,
    categorySlug: product.categorySlug || product.category?.slug || '',
  }
}

export const productService = {
  getAll: async (params = {}) => {
    const sortMap = { 'price-asc': 'salePrice', 'price-desc': 'salePrice', 'newest': 'createdAt', 'best-seller': 'sold' }
    const orderMap = { 'price-asc': 'asc', 'price-desc': 'desc', 'newest': 'desc', 'best-seller': 'desc' }
    const sort = params.sort || 'newest'
    
    const res = await api.get('/products', {
      params: {
        category: params.category,
        search: params.search,
        sort: sortMap[sort] || 'createdAt',
        order: orderMap[sort] || 'desc',
        page: params.page || 1,
        limit: params.limit || 20,
        minSold: params.minSold,
        includeHot: params.includeHot,
        includeBestSellerLabel: params.includeBestSellerLabel,
      },
    })
    
    const normalizedProducts = Array.isArray(res.data) ? res.data.map(normalizeProduct) : []
    return { data: normalizedProducts, total: res.pagination?.total || normalizedProducts.length }
  },

  getBySlug: async (slug) => {
    const res = await api.get(`/products/${slug}`)
    return normalizeProduct(res.data)
  },

  getBestSellers: async () => {
    const res = await api.get('/products/bestsellers', { params: { limit: 40 } })
    return Array.isArray(res.data) ? res.data.map(normalizeProduct) : []
  },

  getNew: async () => {
    const res = await api.get('/products', { params: { isNew: true, limit: 40 } })
    return Array.isArray(res.data) ? res.data.map(normalizeProduct) : []
  },

  getFeatured: async () => {
    const res = await api.get('/products/featured', { params: { limit: 20 } })
    return Array.isArray(res.data) ? res.data.map(normalizeProduct) : []
  },

  getRelated: async (slug) => {
    const res = await api.get(`/products/${slug}/related`)
    return Array.isArray(res.data) ? res.data.map(normalizeProduct) : []
  },
}
