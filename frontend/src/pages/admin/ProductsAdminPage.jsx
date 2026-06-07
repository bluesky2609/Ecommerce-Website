import React, { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService.js'
import { categoryService } from '../../services/categoryService.js'
import api from '../../services/api.js'
import ImageUploader from '../../components/admin/ImageUploader.jsx'

// Lấy tất cả sản phẩm (kể cả ẩn) cho trang admin
const getAdminProducts = async (params) => {
  const res = await api.get('/products', { params })
  return res
}

const emptyForm = {
  name: '',
  description: '',
  category: '',
  images: '',
  originalPrice: '',
  salePrice: '',
  discount: 0,
  countInStock: 0,
  sizes: '',
  isNew: false,
  isBestSeller: false,
  isFeatured: false,
  isActive: true,
  tags: '',
  colors: [],
  variants: [],
}

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ'

const ProductsAdminPage = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [priceError, setPriceError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedParentId, setSelectedParentId] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })
  const limit = 12

  const load = async (p = page) => {
    setLoading(true)
    setError('')
    try {
      const params = { page: p, limit, sort: 'createdAt', order: 'desc' }
      if (search) params.search = search
      if (filterCat) params.category = filterCat
      let res
      try {
        res = await adminService.getAllProducts(params)
      } catch {
        res = await getAdminProducts(params)
      }
      setProducts(res?.data || [])
      setPagination(res?.pagination || { total: res?.data?.length || 0, totalPages: 1 })
    } catch (e) {
      setError(e?.message || 'Lỗi tải sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadCats = async () => {
      try {
        const cats = await categoryService.getAll()
        setCategories(Array.isArray(cats) ? cats : (cats?.data || []))
      } catch { }
    }
    loadCats()
  }, [])

  useEffect(() => { load(page) }, [page, filterCat])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    load(1)
  }

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setSelectedParentId('')
    setShowModal(true)
  }

  const openEdit = (p) => {
    const catId = p.category?._id || p.category || ''
    let parentId = ''
    for (const parent of categories) {
      if (parent._id === catId) {
        parentId = catId
        break
      }
      if (parent.children && parent.children.some(child => child._id === catId)) {
        parentId = parent._id
        break
      }
    }

    setEditing(p)
    setForm({
      name: p.name || '',
      description: p.description || '',
      category: catId,
      images: (p.images || []).join(', '),
      originalPrice: p.originalPrice || '',
      salePrice: p.salePrice || '',
      discount: p.discount || 0,
      countInStock: p.countInStock || 0,
      sizes: (p.sizes || []).join(', '),
      isNew: !!p.isNew,
      isBestSeller: !!p.isBestSeller,
      isFeatured: !!p.isFeatured,
      isActive: p.isActive !== false,
      tags: (p.tags || []).join(', '),
      colors: p.colors || [],
      variants: p.variants || [],
    })
    setSelectedParentId(parentId)
    setShowModal(true)
  }

  const computedTotalStock = () => {
    if (!form.sizes) return Number(form.countInStock || 0);
    const validSizes = form.sizes.split(',').map(s => s.trim()).filter(Boolean);
    const validColors = form.colors?.length > 0 ? form.colors.map(c => c.id) : ['none'];
    return (form.variants || []).reduce((sum, v) => {
      if (validSizes.includes(v.size) && validColors.includes(v.colorId)) {
        return sum + (v.stock || 0);
      }
      return sum;
    }, 0);
  }

  // Tính % giảm giá tự động, làm tròn lên số nguyên gần nhất
  const calcDiscount = (original, sale) => {
    const o = Number(original)
    const s = Number(sale)
    if (!o || !s || o <= 0) return 0
    return Math.ceil(((o - s) / o) * 100)
  }

  const handlePriceChange = (key, value) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      const o = key === 'originalPrice' ? Number(value) : Number(prev.originalPrice)
      const s = key === 'salePrice' ? Number(value) : Number(prev.salePrice)
      if (o > 0 && s > 0) {
        if (s > o) {
          setPriceError('Giá bán không được cao hơn giá gốc!')
        } else {
          setPriceError('')
          next.discount = calcDiscount(o, s)
        }
      } else {
        setPriceError('')
      }
      return next
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const o = Number(form.originalPrice)
    const s = Number(form.salePrice)
    if (s > o) {
      setPriceError('Giá bán không được cao hơn giá gốc!')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        originalPrice: Number(form.originalPrice),
        salePrice: Number(form.salePrice),
        discount: Number(form.discount),
        countInStock: computedTotalStock(),
        images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
        sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
        variants: (form.variants || []).filter(v => {
          const validSizes = form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : [];
          const validColors = form.colors?.length > 0 ? form.colors.map(c => c.id) : ['none'];
          return validSizes.includes(v.size) && validColors.includes(v.colorId);
        }),
      }
      if (editing) {
        await adminService.updateProduct(editing._id, payload)
      } else {
        await adminService.createProduct(payload)
      }
      setShowModal(false)
      load(page)
    } catch (e) {
      alert(e?.message || 'Lỗi lưu sản phẩm')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (p) => {
    if (!window.confirm(`Xóa sản phẩm "${p.name}"?`)) return
    try {
      await adminService.deleteProduct(p._id)
      load(page)
    } catch (e) {
      alert(e?.message || 'Lỗi xóa sản phẩm')
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: '8px', fontSize: '14px', color: '#1f2937', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.15s',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1f2937' }}>Sản phẩm</h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '2px' }}>
            Quản lý kho hàng · {pagination.total} sản phẩm
          </p>
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'linear-gradient(135deg, #E31837, #ff4d6d)',
          color: 'white', border: 'none', borderRadius: '10px',
          padding: '10px 20px', fontWeight: '600', fontSize: '14px',
          cursor: 'pointer', boxShadow: '0 4px 12px rgba(227,24,55,0.35)',
          transition: 'all 0.2s',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Thêm sản phẩm
        </button>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '240px', position: 'relative', display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#9ca3af" style={{ width: '18px', height: '18px', position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              style={{ width: '100%', padding: '12px 16px 12px 44px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            />
          </div>
          <button type="submit" style={{ padding: '12px 20px', borderRadius: '10px', background: '#1a1a2e', color: 'white', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Tìm</button>
        </form>

        <select
          value={filterCat}
          onChange={e => { setFilterCat(e.target.value); setPage(1) }}
          style={{ padding: '12px 16px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', color: '#1f2937', background: 'white', outline: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', minWidth: '160px' }}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(c => (
            <React.Fragment key={c._id}>
              <option value={c.slug} style={{ fontWeight: 'bold' }}>{c.name}</option>
              {c.children?.map(sub => (
                <option key={sub._id} value={sub.slug}>&nbsp;&nbsp;— {sub.name}</option>
              ))}
            </React.Fragment>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #f3f4f6', borderTop: '3px solid #E31837', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}
        {!loading && error && <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>{error}</div>}
        {!loading && !error && (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Sản phẩm', 'Danh mục', 'Tồn kho', 'Giá gốc', 'Giá bán', 'Giảm', 'Nhãn', 'Trạng thái', 'Thao tác'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
                      <div>Không tìm thấy sản phẩm nào</div>
                    </td></tr>
                  )}
                  {products.map(product => (
                    <tr key={product._id} style={{ borderBottom: '1px solid #f3f4f6' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '52px', height: '52px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#f3f4f6' }}>
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>👕</div>
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>/{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '5px', fontSize: '12px', fontWeight: '600', background: '#f3f4f6', color: '#6b7280' }}>{product.category?.name || '—'}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#4b5563', textAlign: 'center' }}>
                        {product.variants?.length > 0 ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0) : (product.countInStock || 0)}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                        <s>{fmt(product.originalPrice || 0)}</s>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#E31837', whiteSpace: 'nowrap' }}>
                        {fmt(product.salePrice || 0)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {product.discount > 0 && (
                          <span style={{ fontSize: '12px', fontWeight: '700', color: 'white', background: '#E31837', padding: '2px 6px', borderRadius: '4px' }}>-{product.discount}%</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {product.isNew && <span style={{ fontSize: '11px', fontWeight: '700', color: '#3b82f6', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>Mới</span>}
                          {product.isBestSeller && <span style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', background: '#fffbeb', padding: '2px 6px', borderRadius: '4px' }}>Hot</span>}
                          {product.isFeatured && <span style={{ fontSize: '11px', fontWeight: '700', color: '#8b5cf6', background: '#f5f3ff', padding: '2px 6px', borderRadius: '4px' }}>Nổi bật</span>}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                          color: product.isActive ? '#10b981' : '#ef4444',
                          background: product.isActive ? '#ecfdf5' : '#fef2f2',
                        }}>
                          {product.isActive ? 'Hiện' : 'Ẩn'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => openEdit(product)} style={{ padding: '6px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: '600', background: '#eff6ff', color: '#3b82f6', border: 'none', cursor: 'pointer' }}>Sửa</button>
                          <button onClick={() => handleDelete(product)} style={{ padding: '6px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: '600', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer' }}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Tổng: {pagination.total} sản phẩm</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: 'white', color: page === 1 ? '#d1d5db' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '13px' }}>← Trước</button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const p = i + 1
                    return (
                      <button key={p} onClick={() => setPage(p)} style={{
                        padding: '6px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '600',
                        border: page === p ? 'none' : '1.5px solid #e5e7eb',
                        background: page === p ? '#E31837' : 'white',
                        color: page === p ? 'white' : '#374151',
                        cursor: 'pointer',
                      }}>{p}</button>
                    )
                  })}
                  <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: 'white', color: page >= pagination.totalPages ? '#d1d5db' : '#374151', cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '13px' }}>Sau →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '680px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'white', zIndex: 1, borderRadius: '20px 20px 0 0' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1f2937' }}>{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>Điền đầy đủ thông tin sản phẩm</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>✕</button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Basic info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Tên sản phẩm <span style={{ color: '#E31837' }}>*</span></label>
                  <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} onFocus={e => e.target.style.borderColor = '#E31837'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Danh mục lớn <span style={{ color: '#E31837' }}>*</span></label>
                  <select required value={selectedParentId} onChange={e => {
                    const pId = e.target.value;
                    setSelectedParentId(pId);
                    setForm(prev => ({ ...prev, category: pId }));
                  }} style={{ ...inputStyle, background: 'white' }}>
                    <option value="">— Chọn danh mục lớn —</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                {selectedParentId && (() => {
                  const parentCat = categories.find(c => c._id === selectedParentId);
                  const subCats = parentCat?.children || [];
                  if (subCats.length === 0) return null;
                  return (
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Danh mục con</label>
                      <select value={form.category === selectedParentId ? '' : form.category} onChange={e => {
                        const subId = e.target.value;
                        setForm(prev => ({ ...prev, category: subId || selectedParentId }));
                      }} style={{ ...inputStyle, background: 'white' }}>
                        <option value="">— Chọn danh mục con (tất cả) —</option>
                        {subCats.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                      </select>
                    </div>
                  );
                })()}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Mô tả</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = '#E31837'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
              </div>

              {/* Price */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Giá & Số lượng</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                  {/* Giá gốc */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>Giá gốc (đ) *</label>
                    <input
                      type="number" min={0} required
                      value={form.originalPrice}
                      onChange={e => handlePriceChange('originalPrice', e.target.value)}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#E31837'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  {/* Giá bán */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: priceError ? '#ef4444' : '#6b7280', marginBottom: '6px' }}>Giá bán (đ) *</label>
                    <input
                      type="number" min={0} required
                      value={form.salePrice}
                      onChange={e => handlePriceChange('salePrice', e.target.value)}
                      style={{ ...inputStyle, borderColor: priceError ? '#ef4444' : '#e5e7eb' }}
                      onFocus={e => e.target.style.borderColor = priceError ? '#ef4444' : '#E31837'}
                      onBlur={e => e.target.style.borderColor = priceError ? '#ef4444' : '#e5e7eb'}
                    />
                    {priceError && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', fontWeight: '600' }}>{priceError}</p>}
                  </div>
                  {/* Giảm giá - tự động tính */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>Giảm giá (%)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number" min={0} max={100}
                        value={form.discount}
                        readOnly
                        style={{ ...inputStyle, background: '#f3f4f6', cursor: 'not-allowed', color: form.discount > 0 ? '#E31837' : '#9ca3af', fontWeight: form.discount > 0 ? '700' : '400' }}
                      />
                      {form.discount > 0 && (
                        <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', fontWeight: '700', color: '#E31837' }}>%</span>
                      )}
                    </div>
                  </div>
                  {/* Tồn kho */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>Tồn kho *</label>
                    <input
                      type="number" min={0} required
                      value={form.sizes ? computedTotalStock() : form.countInStock}
                      onChange={e => setForm(p => ({ ...p, countInStock: e.target.value }))}
                      onKeyDown={(e) => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); }}
                      readOnly={!!form.sizes}
                      style={{ ...inputStyle, background: !!form.sizes ? '#f3f4f6' : 'white', cursor: !!form.sizes ? 'not-allowed' : 'text' }}
                      onFocus={e => !form.sizes && (e.target.style.borderColor = '#E31837')}
                      onBlur={e => !form.sizes && (e.target.style.borderColor = '#e5e7eb')}
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Hình ảnh sản phẩm
                </div>
                {/* Multi-image list */}
                {(() => {
                  const urls = form.images ? form.images.split(',').map(u => u.trim()).filter(Boolean) : []
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {urls.map((url, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f9fafb', borderRadius: '10px', padding: '10px 14px', border: '1px solid #e5e7eb' }}>
                          <img
                            src={url}
                            alt={`img-${i}`}
                            style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                            onError={e => e.target.style.display = 'none'}
                          />
                          <span style={{ flex: 1, fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = urls.filter((_, idx) => idx !== i)
                              setForm(p => ({ ...p, images: next.join(', ') }))
                            }}
                            style={{ padding: '4px 10px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                      {/* Uploader for next image */}
                      <ImageUploader
                        label={urls.length === 0 ? 'Ảnh đầu tiên' : `Thêm ảnh #${urls.length + 1}`}
                        value=""
                        onChange={url => {
                          if (!url) return
                          setForm(p => ({
                            ...p,
                            images: p.images ? p.images.split(',').map(u => u.trim()).filter(Boolean).concat(url).join(', ') : url,
                          }))
                        }}
                        previewHeight={120}
                        inputId={`product-img-upload-${urls.length}`}
                        placeholder="https://example.com/product.jpg"
                      />
                    </div>
                  )
                })()}
              </div>

              {/* Sizes & Tags */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Size có sẵn (phân cách phẩy)</label>
                  <input value={form.sizes} onChange={e => setForm(p => ({ ...p, sizes: e.target.value }))} placeholder="S, M, L, XL, XXL" style={inputStyle} onFocus={e => e.target.style.borderColor = '#E31837'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Tags (phân cách phẩy)</label>
                  <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="áo, nam, cotton..." style={inputStyle} onFocus={e => e.target.style.borderColor = '#E31837'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Màu sắc</div>
                  <button type="button" onClick={() => setForm(p => ({ ...p, colors: [...(p.colors || []), { id: Date.now().toString(), name: '', hex: '#000000' }] }))} style={{ padding: '4px 10px', borderRadius: '6px', background: '#eff6ff', color: '#3b82f6', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>+ Thêm màu</button>
                </div>
                {(form.colors || []).map((color, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'center', background: '#f9fafb', padding: '10px', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>Tên màu</label>
                      <input value={color.name} onChange={e => {
                        const newColors = [...form.colors];
                        newColors[idx].name = e.target.value;
                        setForm(p => ({ ...p, colors: newColors }));
                      }} placeholder="VD: Đen, Trắng..." style={{ ...inputStyle, padding: '8px 12px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>Mã màu</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input type="color" value={color.hex || '#000000'} onChange={e => {
                          const newColors = [...form.colors];
                          newColors[idx].hex = e.target.value;
                          setForm(p => ({ ...p, colors: newColors }));
                        }} style={{ width: '38px', height: '38px', padding: '0', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }} />
                        <span style={{ fontSize: '13px', color: '#6b7280', width: '60px' }}>{color.hex || '#000000'}</span>
                      </div>
                    </div>
                    <div style={{ paddingTop: '20px' }}>
                      <button type="button" onClick={() => {
                        const newColors = form.colors.filter((_, i) => i !== idx);
                        setForm(p => ({ ...p, colors: newColors }));
                      }} style={{ padding: '8px 12px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Xóa</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tồn kho theo Size & Màu */}
              {form.sizes && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tồn kho theo phân loại (Size & Màu)</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Áp dụng chung:</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="VD: 50"
                        onChange={e => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          const colorsList = form.colors?.length > 0 ? form.colors : [{ id: 'none', name: 'Mặc định', hex: '#000000' }];
                          const sizeList = form.sizes.split(',').map(s => s.trim()).filter(Boolean);
                          const newVariants = [];
                          colorsList.forEach(color => {
                            sizeList.forEach(size => {
                              newVariants.push({ colorId: color.id, colorName: color.name, colorHex: color.hex, size, stock: val });
                            });
                          });
                          setForm(p => ({ ...p, variants: newVariants }));
                        }}
                        onKeyDown={(e) => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); }}
                        style={{ width: '80px', padding: '4px 8px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                        onFocus={e => e.target.style.borderColor = '#E31837'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {(form.colors?.length > 0 ? form.colors : [{ id: 'none', name: 'Mặc định', hex: '#000000' }]).map(color => {
                      const sizeList = form.sizes.split(',').map(s => s.trim()).filter(Boolean);
                      return sizeList.map(size => {
                        const variant = (form.variants || []).find(v => v.colorId === color.id && v.size === size);
                        return (
                          <div key={`${color.id}-${size}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f9fafb', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {color.id !== 'none' && <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: color.hex, border: '1px solid #e5e7eb' }}></div>}
                              <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                                {color.id !== 'none' ? `${color.name} - ` : ''}{size}
                              </span>
                            </div>
                            <input
                              type="number"
                              min={0}
                              placeholder="0"
                              value={variant ? variant.stock : ''}
                              onChange={e => {
                                const val = e.target.value === '' ? 0 : Number(e.target.value);
                                const newVariants = [...(form.variants || [])];
                                const idx = newVariants.findIndex(v => v.colorId === color.id && v.size === size);
                                if (idx >= 0) {
                                  newVariants[idx].stock = val;
                                  newVariants[idx].colorName = color.name;
                                  newVariants[idx].colorHex = color.hex;
                                } else {
                                  newVariants.push({ colorId: color.id, colorName: color.name, colorHex: color.hex, size, stock: val });
                                }
                                setForm(p => ({ ...p, variants: newVariants }));
                              }}
                              onKeyDown={(e) => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); }}
                              style={{ width: '70px', padding: '6px 10px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                              onFocus={e => e.target.style.borderColor = '#E31837'}
                              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                            />
                          </div>
                        )
                      });
                    })}
                  </div>
                </div>
              )}

              {/* Flags */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nhãn & Hiển thị</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {[
                    { key: 'isNew', label: 'Sản phẩm mới' },
                    { key: 'isBestSeller', label: 'Bán chạy' },
                    { key: 'isFeatured', label: 'Nổi bật' },
                    { key: 'isActive', label: 'Hiển thị' },
                  ].map(flag => (
                    <label key={flag.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', color: '#374151', fontWeight: '500', background: form[flag.key] ? '#f0fdf4' : 'white', borderColor: form[flag.key] ? '#10b981' : '#e5e7eb', transition: 'all 0.15s' }}>
                      <input type="checkbox" checked={form[flag.key]} onChange={e => setForm(p => ({ ...p, [flag.key]: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: '#10b981' }} />
                      {flag.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '13px', border: '1.5px solid #e5e7eb', borderRadius: '10px', background: 'white', color: '#6b7280', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" disabled={saving} style={{
                  flex: 2, padding: '13px', border: 'none', borderRadius: '10px',
                  background: saving ? '#9ca3af' : 'linear-gradient(135deg, #E31837, #ff4d6d)',
                  color: 'white', fontWeight: '700', fontSize: '14px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: saving ? 'none' : '0 4px 12px rgba(227,24,55,0.35)',
                }}>
                  {saving ? '⏳ Đang lưu...' : (editing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsAdminPage
