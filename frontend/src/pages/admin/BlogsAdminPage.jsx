import React, { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService.js'

const emptyForm = {
  title: '', excerpt: '', content: '', thumbnail: '',
  category: 'Tin tức', tags: '', isPublished: true,
}

const BlogsAdminPage = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ page: 1, total: 0 })

  const load = async (page = 1) => {
    setLoading(true)
    try {
      const res = await adminService.getAllBlogs({ page, limit: 10 })
      setBlogs(res?.data || [])
      setPagination({ page: res?.pagination?.page || 1, total: res?.pagination?.total || 0 })
    } catch (e) {
      setError(e?.message || 'Lỗi tải bài viết')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (b) => {
    setEditing(b)
    setForm({
      title: b.title || '', excerpt: b.excerpt || '', content: b.content || '',
      thumbnail: b.thumbnail || '', category: b.category || 'Tin tức',
      tags: (b.tags || []).join(', '), isPublished: b.isPublished !== false,
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      if (editing) await adminService.updateBlog(editing._id, payload)
      else await adminService.createBlog(payload)
      setShowModal(false)
      load()
    } catch (e) {
      alert(e?.message || 'Lỗi lưu bài viết')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (blog) => {
    if (!window.confirm(`Xóa bài viết "${blog.title}"?`)) return
    try {
      await adminService.deleteBlog(blog._id)
      load()
    } catch (e) {
      alert(e?.message || 'Lỗi xóa bài viết')
    }
  }

  const filtered = blogs.filter(b => b.title?.toLowerCase().includes(search.toLowerCase()))

  const categories = ['Tin tức', 'Xu hướng', 'Phong cách', 'Hướng dẫn', 'Khuyến mãi']

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1f2937' }}>Bài viết</h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '2px' }}>Quản lý blog & tin tức</p>
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'linear-gradient(135deg, #E31837, #ff4d6d)',
          color: 'white', border: 'none', borderRadius: '10px',
          padding: '10px 20px', fontWeight: '600', fontSize: '14px',
          cursor: 'pointer', boxShadow: '0 4px 12px rgba(227,24,55,0.35)',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Viết bài mới
        </button>
      </div>

      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#9ca3af" style={{ width: '18px', height: '18px', position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm bài viết..." style={{
          width: '100%', padding: '12px 16px 12px 44px', border: '1.5px solid #e5e7eb', borderRadius: '10px',
          fontSize: '14px', color: '#1f2937', background: 'white', outline: 'none', boxSizing: 'border-box',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }} />
      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #f3f4f6', borderTop: '3px solid #E31837', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}
        {!loading && error && <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>{error}</div>}
        {!loading && !error && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Bài viết', 'Danh mục', 'Lượt xem', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>Chưa có bài viết nào</td></tr>
              )}
              {filtered.map(blog => (
                <tr key={blog._id} style={{ borderBottom: '1px solid #f3f4f6' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {blog.thumbnail ? (
                        <img src={blog.thumbnail} alt="" style={{ width: '52px', height: '36px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '52px', height: '36px', borderRadius: '8px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>📝</div>
                      )}
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blog.title}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>/{blog.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: '#eff6ff', color: '#3b82f6' }}>{blog.category}</span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b7280' }}>{blog.views || 0}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                      color: blog.isPublished ? '#10b981' : '#ef4444',
                      background: blog.isPublished ? '#ecfdf5' : '#fef2f2',
                    }}>
                      {blog.isPublished ? 'Đã đăng' : 'Ẩn'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#9ca3af' }}>
                    {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEdit(blog)} style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '13px', fontWeight: '600', background: '#eff6ff', color: '#3b82f6', border: 'none', cursor: 'pointer' }}>Sửa</button>
                      <button onClick={() => handleDelete(blog)} style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '13px', fontWeight: '600', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer' }}>Xóa</button>
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
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>{editing ? 'Sửa bài viết' : 'Viết bài viết mới'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Tiêu đề *</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = '#E31837'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Danh mục</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: 'white' }}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Tóm tắt</label>
                <textarea value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} rows={3} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} onFocus={e => e.target.style.borderColor = '#E31837'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Nội dung</label>
                <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={6} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} onFocus={e => e.target.style.borderColor = '#E31837'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>URL ảnh bìa</label>
                <input value={form.thumbnail} onChange={e => setForm(p => ({ ...p, thumbnail: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = '#E31837'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                {form.thumbnail && <img src={form.thumbnail} alt="preview" style={{ marginTop: '8px', width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} onError={e => e.target.style.display = 'none'} />}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Tags (phân cách bằng dấu phẩy)</label>
                <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="thời trang, trẻ em, mùa hè..." style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = '#E31837'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="blogPub" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} style={{ width: '16px', height: '16px' }} />
                <label htmlFor="blogPub" style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>Công khai bài viết</label>
              </div>
              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', border: '1.5px solid #e5e7eb', borderRadius: '10px', background: 'white', color: '#6b7280', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '10px', background: saving ? '#9ca3af' : 'linear-gradient(135deg, #E31837, #ff4d6d)', color: 'white', fontWeight: '600', fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 12px rgba(227,24,55,0.35)' }}>
                  {saving ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Đăng bài')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BlogsAdminPage
