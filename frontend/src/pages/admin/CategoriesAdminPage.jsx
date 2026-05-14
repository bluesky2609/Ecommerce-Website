import React, { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService.js'

const emptyForm = {
  name: '', slug: '', description: '', image: '',
  parent: '', order: 0, isActive: true,
}

const CategoriesAdminPage = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminService.getAllCategories()
      setCategories(res?.data || [])
    } catch (e) {
      setError(e?.message || 'Lỗi tải danh mục')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setForm({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      image: cat.image || '',
      parent: cat.parent?._id || cat.parent || '',
      order: cat.order || 0,
      isActive: cat.isActive !== false,
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await adminService.updateCategory(editing._id, form)
      } else {
        await adminService.createCategory(form)
      }
      setShowModal(false)
      load()
    } catch (e) {
      alert(e?.message || 'Lỗi lưu danh mục')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cat) => {
    if (!window.confirm(`Xóa danh mục "${cat.name}"?`)) return
    try {
      await adminService.deleteCategory(cat._id)
      load()
    } catch (e) {
      alert(e?.message || 'Lỗi xóa danh mục')
    }
  }

  const filtered = categories.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1f2937' }}>Danh mục</h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '2px' }}>Quản lý danh mục sản phẩm</p>
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
          Thêm danh mục
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#9ca3af" style={{ width: '18px', height: '18px', position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm danh mục..."
          style={{
            width: '100%', padding: '12px 16px 12px 44px',
            border: '1.5px solid #e5e7eb', borderRadius: '10px',
            fontSize: '14px', color: '#1f2937', background: 'white',
            outline: 'none', boxSizing: 'border-box',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #f3f4f6', borderTop: '3px solid #E31837', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}
        {!loading && error && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444', fontSize: '14px' }}>{error}</div>
        )}
        {!loading && !error && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Tên danh mục', 'Slug', 'Danh mục cha', 'Thứ tự', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>Không tìm thấy danh mục nào</td></tr>
              )}
              {filtered.map(cat => (
                <tr key={cat._id} style={{ borderBottom: '1px solid #f3f4f6' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                          📁
                        </div>
                      )}
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{cat.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>{cat.slug}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b7280' }}>{cat.parent?.name || '—'}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>{cat.order}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                      color: cat.isActive ? '#10b981' : '#ef4444',
                      background: cat.isActive ? '#ecfdf5' : '#fef2f2',
                    }}>
                      {cat.isActive ? 'Hoạt động' : 'Ẩn'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEdit(cat)} style={{
                        padding: '6px 14px', borderRadius: '7px', fontSize: '13px', fontWeight: '600',
                        background: '#eff6ff', color: '#3b82f6', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                      }}>Sửa</button>
                      <button onClick={() => handleDelete(cat)} style={{
                        padding: '6px 14px', borderRadius: '7px', fontSize: '13px', fontWeight: '600',
                        background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                      }}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>{editing ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>✕</button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Tên danh mục *', key: 'name', type: 'text', required: true },
                { label: 'Đường dẫn (slug)', key: 'slug', type: 'text' },
                { label: 'Mô tả', key: 'description', type: 'text' },
                { label: 'URL hình ảnh', key: 'image', type: 'text' },
                { label: 'Thứ tự', key: 'order', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>{f.label}</label>
                  <input
                    type={f.type}
                    required={f.required}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb',
                      borderRadius: '8px', fontSize: '14px', color: '#1f2937', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = '#E31837'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Danh mục cha</label>
                <select
                  value={form.parent}
                  onChange={e => setForm(p => ({ ...p, parent: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', color: '#1f2937', outline: 'none', boxSizing: 'border-box', background: 'white' }}
                >
                  <option value="">— Không có —</option>
                  {categories.filter(c => c._id !== editing?._id && !c.parent).map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="catActive" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} style={{ width: '16px', height: '16px' }} />
                <label htmlFor="catActive" style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>Hiển thị danh mục</label>
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  flex: 1, padding: '12px', border: '1.5px solid #e5e7eb', borderRadius: '10px',
                  background: 'white', color: '#6b7280', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                }}>Hủy</button>
                <button type="submit" disabled={saving} style={{
                  flex: 1, padding: '12px', border: 'none', borderRadius: '10px',
                  background: saving ? '#9ca3af' : 'linear-gradient(135deg, #E31837, #ff4d6d)',
                  color: 'white', fontWeight: '600', fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: saving ? 'none' : '0 4px 12px rgba(227,24,55,0.35)',
                }}>
                  {saving ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoriesAdminPage
