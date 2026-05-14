import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { productService } from '../services/productService.js'
import { useDebounce } from '../hooks/useDebounce.js'
import ProductCard from '../components/ui/ProductCard.jsx'
import { ProductCardSkeleton } from '../components/ui/Skeleton.jsx'

const SORT_OPTIONS = [
  { value: 'best-seller', label: 'Bán chạy nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá thấp đến cao' },
  { value: 'price-desc', label: 'Giá cao đến thấp' },
]

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const debouncedQuery = useDebounce(query, 400)
  const [sort, setSort] = useState(searchParams.get('sort') || 'best-seller')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const doSearch = async () => {
      if (!debouncedQuery && sort === 'best-seller') {
        setProducts([])
        setTotal(0)
        return
      }
      setLoading(true)
      try {
        const res = await productService.getAll({ search: debouncedQuery, sort })
        setProducts(res.data)
        setTotal(res.total)
      } finally {
        setLoading(false)
      }
    }
    doSearch()

    const params = {}
    if (debouncedQuery) params.q = debouncedQuery
    if (sort !== 'best-seller') params.sort = sort
    setSearchParams(params)
  }, [debouncedQuery, sort])

  // Initial load from URL params
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const s = searchParams.get('sort') || 'best-seller'
    setQuery(q)
    setSort(s)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Search box */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-base focus:outline-none focus:border-primary shadow-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Results header */}
        {(query || sort !== 'best-seller') && (
          <div className="flex items-center justify-between mb-6">
            <div>
              {query && (
                <h1 className="text-xl font-bold text-gray-900">
                  Kết quả tìm kiếm: "<span className="text-primary">{query}</span>"
                </h1>
              )}
              <span className="text-sm text-gray-500">{loading ? '...' : `${total} sản phẩm`}</span>
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Search size={64} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-500 mb-2">
              {query ? `Không tìm thấy kết quả cho "${query}"` : 'Nhập từ khóa để tìm kiếm'}
            </h3>
            {query && <p className="text-gray-400">Thử tìm với từ khóa khác</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage
