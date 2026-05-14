import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, Phone } from 'lucide-react'
import { useCart } from '../../hooks/useCart.js'
import useAuthStore from '../../stores/authStore.js'
import { categoryService } from '../../services/categoryService.js'
import { useDebounce } from '../../hooks/useDebounce.js'
import { productService } from '../../services/productService.js'

const MegaMenu = ({ category, onClose, triggerRef }) => {
  if (!category?.children?.length) return null

  // Tính toán vị trí để dropdown không tràn ra ngoài màn hình
  const [menuStyle, setMenuStyle] = React.useState({})

  React.useEffect(() => {
    if (!triggerRef?.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const menuWidth = Math.min(896, window.innerWidth - 32) // max-w-4xl = 896px, padding 16px mỗi bên

    // Vị trí cạnh trái của menu trong viewport (tâm trigger - nửa width menu)
    let menuLeft = rect.left + rect.width / 2 - menuWidth / 2
    // Đảm bảo không tràn trái
    if (menuLeft < 16) menuLeft = 16
    // Đảm bảo không tràn phải
    if (menuLeft + menuWidth > window.innerWidth - 16) menuLeft = window.innerWidth - 16 - menuWidth

    // Đổi sang tọa độ tương đối với parent (position: relative) = viewport_left - parent_left
    const cssLeft = menuLeft - rect.left
    setMenuStyle({ left: `${cssLeft}px` })
  }, [triggerRef])

  return (
    <div
      className="absolute top-full bg-white shadow-xl border-t-2 border-primary z-50 py-8 px-8 rounded-b-xl"
      style={{ ...menuStyle, width: 'min(896px, calc(100vw - 32px))' }}
    >
      <div className="grid grid-cols-3 gap-6">
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-900">{category.name}</h3>
          <ul className="space-y-2">
            {category.children.map(sub => (
              <li key={sub._id || sub.id}>
                <Link
                  to={`/category/${sub.slug}`}
                  className="text-gray-600 hover:text-primary transition-colors"
                  onClick={onClose}
                >
                  {sub.name}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to={`/category/${category.slug}`}
            className="inline-block mt-4 text-primary font-semibold hover:underline text-sm"
            onClick={onClose}
          >
            Xem tất cả →
          </Link>
        </div>
        <div className="col-span-2">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  )
}

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [headerCategories, setHeaderCategories] = useState([])
  const debouncedSearch = useDebounce(searchQuery, 300)
  const { totalItems } = useCart()
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const headerRef = useRef(null)
  const categoryRefs = useRef({})

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await categoryService.getAll()
        setHeaderCategories(cats)
      } catch (err) {
        console.error(err)
      }
    }
    fetchCats()
  }, [])

  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      productService.getAll({ search: debouncedSearch, limit: 5 })
        .then(res => setSearchResults(res.data || []))
        .catch(() => setSearchResults([]))
    } else {
      setSearchResults([])
    }
  }, [debouncedSearch])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-primary text-white text-center text-xs py-2 px-4">
        <span>🚀 Đổi, trả miễn phí tại nhà trong 60 ngày | Freeship đơn từ 299k | Hotline: 1800 6160</span>
      </div>

      <header ref={headerRef} className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container-custom">
          <div className="flex items-center h-16 gap-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 mr-4">
              <div className="text-2xl font-black text-primary tracking-tight">HODY</div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 flex-1">
              {headerCategories.map(cat => (
                <div
                  key={cat._id || cat.id}
                  className="relative"
                  ref={el => categoryRefs.current[cat._id || cat.id] = el}
                  onMouseEnter={() => setActiveMenu(cat._id || cat.id)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link
                    to={`/category/${cat.slug}`}
                    className={`flex items-center gap-1 px-3 py-5 font-semibold text-sm transition-colors hover:text-primary ${activeMenu === (cat._id || cat.id) ? 'text-primary' : 'text-gray-700'}`}
                  >
                    {cat.name}
                    {cat.children && <ChevronDown size={14} className={`transition-transform ${activeMenu === (cat._id || cat.id) ? 'rotate-180' : ''}`} />}
                  </Link>
                  {activeMenu === (cat._id || cat.id) && cat.children && (
                    <MegaMenu
                      category={cat}
                      onClose={() => setActiveMenu(null)}
                      triggerRef={{ current: categoryRefs.current[cat._id || cat.id] }}
                    />
                  )}
                </div>
              ))}
              <Link to="/blog" className="px-3 py-5 font-semibold text-sm text-gray-700 hover:text-primary">Blog</Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Search */}
              <div className="relative">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 hover:text-primary transition-colors"
                  aria-label="Tìm kiếm"
                >
                  <Search size={20} />
                </button>
                {searchOpen && (
                  <div className="absolute right-0 top-full mt-1 w-80 bg-white shadow-xl rounded-lg border z-50 p-3">
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm sản phẩm..."
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        autoFocus
                      />
                      <button type="submit" className="bg-primary text-white px-3 py-2 rounded">
                        <Search size={16} />
                      </button>
                    </form>
                    {searchResults.length > 0 && (
                      <ul className="mt-2 divide-y">
                        {searchResults.map(p => (
                          <li key={p.id}>
                            <Link
                              to={`/product/${p.slug}`}
                              className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded px-2"
                              onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                            >
                              <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded" />
                              <div>
                                <div className="text-sm font-medium line-clamp-1">{p.name}</div>
                                <div className="text-xs text-primary">{p.salePrice.toLocaleString('vi-VN')}đ</div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link to="/wishlist" className="p-2 hover:text-primary transition-colors hidden sm:block" aria-label="Yêu thích">
                <Heart size={20} />
              </Link>

              {/* Cart */}
              <Link to="/cart" className="p-2 hover:text-primary transition-colors relative" aria-label="Giỏ hàng">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>

              {/* User */}
              {isAuthenticated ? (
                <Link to="/account" className="p-2 hover:text-primary transition-colors" aria-label="Tài khoản">
                  <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                </Link>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center gap-1 px-3 py-2 border border-gray-300 rounded hover:border-primary hover:text-primary text-sm font-medium transition-colors">
                  <User size={16} />
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="text-xl font-black text-primary">HODY</div>
              <button onClick={() => setMobileOpen(false)} className="p-2">
                <X size={20} />
              </button>
            </div>
            <nav className="p-4">
              {!isAuthenticated ? (
                <div className="flex gap-2 mb-6">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 btn-primary text-center text-sm py-2">Đăng nhập</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 btn-outline text-center text-sm py-2">Đăng ký</Link>
                </div>
              ) : (
                <div className="mb-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{user?.name}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </div>
                </div>
              )}
              {headerCategories.map(cat => (
                <div key={cat._id || cat.id} className="mb-4">
                  <Link
                    to={`/category/${cat.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="font-bold text-gray-900 block mb-2"
                  >
                    {cat.name}
                  </Link>
                  {cat.children && (
                    <ul className="pl-4 space-y-1">
                      {cat.children.map(sub => (
                        <li key={sub._id || sub.id}>
                          <Link
                            to={`/category/${sub.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="text-gray-600 text-sm hover:text-primary"
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              <Link to="/blog" onClick={() => setMobileOpen(false)} className="block font-bold text-gray-900 mb-4">Blog</Link>
            </nav>
            <div className="p-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} />
                <span>Hotline: 1800 6160</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
