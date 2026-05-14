import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { SlidersHorizontal, Loader2 } from 'lucide-react'
import { productService } from '../services/productService.js'
import { categoryService } from '../services/categoryService.js'
import ProductCard from '../components/ui/ProductCard.jsx'
import { ProductCardSkeleton } from '../components/ui/Skeleton.jsx'
import Breadcrumb from '../components/ui/Breadcrumb.jsx'

const SORT_OPTIONS = [
  { value: 'best-seller', label: 'Bán chạy nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá thấp đến cao' },
  { value: 'price-desc', label: 'Giá cao đến thấp' },
]

const LIMIT = 20

const CategoryPage = () => {
  const { slug } = useParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [category, setCategory] = useState(null)
  const [parentCategory, setParentCategory] = useState(null)
  const [sort, setSort] = useState('best-seller')
  const [activeSubcat, setActiveSubcat] = useState(slug)
  const [page, setPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const parents = await categoryService.getAll()
        let foundParent = null
        let foundCat = null

        for (const p of parents) {
          if (p.slug === slug) {
            foundCat = p
            break
          }
          if (p.children && p.children.length > 0) {
            const sub = p.children.find(c => c.slug === slug)
            if (sub) {
              foundCat = sub
              foundParent = p
              break
            }
          }
        }
        setCategory(foundCat)
        setParentCategory(foundParent)
        setActiveSubcat(slug)
      } catch (err) {
        console.error(err)
      }
    }
    loadCategory()
  }, [slug])

  // Reset và load trang 1 khi đổi danh mục hoặc sắp xếp
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setPage(1)
      try {
        const res = await productService.getAll({
          category: activeSubcat,
          sort,
          page: 1,
          limit: LIMIT,
        })
        setProducts(res.data)
        const total = res.total || res.data.length
        setTotalProducts(total)
        setHasMore(res.data.length < total)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [activeSubcat, sort])

  // Load thêm sản phẩm (trang tiếp theo)
  const handleLoadMore = useCallback(async () => {
    const nextPage = page + 1
    setLoadingMore(true)
    try {
      const res = await productService.getAll({
        category: activeSubcat,
        sort,
        page: nextPage,
        limit: LIMIT,
      })
      setProducts(prev => [...prev, ...res.data])
      const total = res.total || totalProducts
      setTotalProducts(total)
      setPage(nextPage)
      setHasMore(products.length + res.data.length < total)
    } finally {
      setLoadingMore(false)
    }
  }, [page, activeSubcat, sort, products.length, totalProducts])

  const handleSubcatChange = (newSlug) => {
    setActiveSubcat(newSlug)
    setProducts([])
    setPage(1)
  }

  const displayCategory = parentCategory || category
  const subcategories = displayCategory?.children || []

  const breadcrumbItems = parentCategory
    ? [
      { label: parentCategory.name, href: `/category/${parentCategory.slug}` },
      { label: category?.name },
    ]
    : [{ label: category?.name }]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header Banner */}
      {displayCategory?.image && (
        <div className="relative h-32 sm:h-48 overflow-hidden">
          <img src={displayCategory.image} alt={displayCategory.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center">
            <div className="container-custom">
              <h1 className="text-white text-2xl sm:text-4xl font-black drop-shadow-lg">{displayCategory?.name}</h1>
            </div>
          </div>
        </div>
      )}

      <div className="container-custom py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Sub-category pills */}
      {subcategories.length > 0 && (
        <div className="bg-white border-b">
          <div className="container-custom">
            <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => handleSubcatChange(displayCategory.slug)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeSubcat === displayCategory.slug ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Tất cả
              </button>
              {subcategories.map(sub => (
                <button
                  key={sub._id || sub.id}
                  onClick={() => handleSubcatChange(sub.slug)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeSubcat === sub.slug ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container-custom py-6">
        {/* Sort Bar */}
        <div className="flex items-center justify-between mb-6 bg-white p-3 rounded-lg shadow-sm">
          <span className="text-sm text-gray-500">
            {loading ? '...' : `Hiển thị ${products.length}${totalProducts > 0 ? ` / ${totalProducts}` : ''} sản phẩm`}
          </span>
          <div className="flex items-center gap-3">
            <button
              className="sm:hidden flex items-center gap-2 text-sm font-medium"
              onClick={() => { }}
            >
              <SlidersHorizontal size={16} />
              Lọc
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:block">Sắp xếp:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-primary cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">Không có sản phẩm</h3>
            <p className="text-gray-400">Chưa có sản phẩm trong danh mục này</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map(product => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all"
                >
                  {loadingMore ? (
                    <><Loader2 size={18} className="animate-spin" /> Đang tải...</>
                  ) : (
                    'Xem thêm sản phẩm'
                  )}
                </button>
              </div>
            )}

            {/* Loading more skeletons */}
            {loadingMore && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                {Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CategoryPage
