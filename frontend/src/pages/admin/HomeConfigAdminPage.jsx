import React, { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { homeConfigService } from '../../services/homeConfigService.js'

/* ─── shared styles ─────────────────────────────────────────────────────── */
const inputStyle = {
  width: '100%',
  border: '1.5px solid #e5e7eb',
  borderRadius: '8px',
  padding: '9px 12px',
  fontSize: '14px',
  outline: 'none',
  background: '#fafafa',
  color: '#1f2937',
  boxSizing: 'border-box',
}
const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: '#6b7280',
  marginBottom: '5px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}
const cardStyle = {
  background: 'white',
  borderRadius: '14px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  padding: '24px',
}

/* ─── Banner Modal ──────────────────────────────────────────────────────── */
const EMPTY_BANNER = {
  title: '',
  subtitle: '',
  image: '',
  cta: 'Khám phá ngay',
  href: '/',
  align: 'left',
  isActive: true,
}

function BannerModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY_BANNER })
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(initial?.image || '')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.image) { toast.error('Vui lòng nhập URL ảnh banner!'); return }
    setSaving(true)
    setTimeout(() => {
      onSaved(form)
      setSaving(false)
    }, 200)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '620px', maxHeight: '92vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1f2937', margin: 0 }}>
              {isEdit ? '✏️ Chỉnh sửa Banner' : '➕ Thêm Banner mới'}
            </h2>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0' }}>Tuỳ chỉnh nội dung và hình ảnh banner trang chủ</p>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Image URL */}
          <div>
            <label style={labelStyle}>URL Ảnh Banner *</label>
            <input
              style={inputStyle}
              value={form.image}
              onChange={e => { set('image', e.target.value); setPreview(e.target.value) }}
              placeholder="https://example.com/banner.jpg (1400×600px khuyến nghị)"
            />
            {preview && (
              <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', height: '140px', background: '#f3f4f6' }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none' }}
                />
              </div>
            )}
          </div>

          {/* Title & Subtitle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Tiêu đề</label>
              <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Bộ Sưu Tập Hè 2026" />
            </div>
            <div>
              <label style={labelStyle}>Mô tả phụ</label>
              <input style={inputStyle} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Tươi mát, năng động cùng HODY" />
            </div>
          </div>

          {/* CTA & href */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Nhãn nút bấm</label>
              <input style={inputStyle} value={form.cta} onChange={e => set('cta', e.target.value)} placeholder="Khám phá ngay" />
            </div>
            <div>
              <label style={labelStyle}>Đường dẫn (href)</label>
              <input style={inputStyle} value={form.href} onChange={e => set('href', e.target.value)} placeholder="/category/nu" />
            </div>
          </div>

          {/* Align */}
          <div>
            <label style={labelStyle}>Vị trí nội dung</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['left', 'center', 'right'].map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => set('align', a)}
                  style={{
                    flex: 1,
                    padding: '9px',
                    border: `2px solid ${form.align === a ? '#E31837' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    background: form.align === a ? '#fff0f2' : 'white',
                    color: form.align === a ? '#E31837' : '#6b7280',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {a === 'left' ? '⬅ Trái' : a === 'center' ? '⬛ Giữa' : '➡ Phải'}
                </button>
              ))}
            </div>
          </div>

          {/* Active */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f9fafb', borderRadius: '10px', padding: '12px 16px' }}>
            <input
              id="banner-active"
              type="checkbox"
              checked={form.isActive}
              onChange={e => set('isActive', e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#E31837', cursor: 'pointer' }}
            />
            <label htmlFor="banner-active" style={{ fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
              Hiển thị banner này trên trang chủ
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', border: '1.5px solid #e5e7eb', borderRadius: '10px', background: 'white', color: '#6b7280', fontWeight: '600', cursor: 'pointer' }}>Huỷ</button>
            <button
              type="submit"
              disabled={saving}
              style={{ flex: 2, padding: '11px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #E31837, #ff4d6d)', color: 'white', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(227,24,55,0.35)' }}
            >
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật Banner' : 'Thêm Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Banner Card ───────────────────────────────────────────────────────── */
function BannerCard({ banner, index, total, onEdit, onDelete, onMoveUp, onMoveDown, onToggle }) {
  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      padding: '16px',
      background: banner.isActive ? 'white' : '#f9fafb',
      border: `2px solid ${banner.isActive ? '#e5e7eb' : '#f3f4f6'}`,
      borderRadius: '12px',
      transition: 'all 0.2s',
      opacity: banner.isActive ? 1 : 0.65,
    }}>
      {/* Thumbnail */}
      <div style={{ width: '120px', height: '70px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#f3f4f6' }}>
        <img src={banner.image} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: '700', fontSize: '14px', color: '#1f2937', marginBottom: '2px' }}>{banner.title || '(Không có tiêu đề)'}</div>
        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{banner.subtitle}</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>
            {banner.align === 'left' ? '⬅' : banner.align === 'center' ? '⬛' : '➡'} {banner.align}
          </span>
          <span style={{ fontSize: '11px', background: '#eff6ff', color: '#3b82f6', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
            🔗 {banner.href}
          </span>
          {banner.isActive
            ? <span style={{ fontSize: '11px', background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>✓ Hiện</span>
            : <span style={{ fontSize: '11px', background: '#f3f4f6', color: '#9ca3af', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>✗ Ẩn</span>
          }
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => onMoveUp(index)} disabled={index === 0} style={{ padding: '5px 8px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.4 : 1 }}>↑</button>
          <button onClick={() => onMoveDown(index)} disabled={index === total - 1} style={{ padding: '5px 8px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: index === total - 1 ? 'not-allowed' : 'pointer', opacity: index === total - 1 ? 0.4 : 1 }}>↓</button>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => onToggle(index)} style={{ padding: '5px 8px', background: banner.isActive ? '#fef3c7' : '#f0fdf4', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: banner.isActive ? '#92400e' : '#166534' }}>
            {banner.isActive ? 'Ẩn' : 'Hiện'}
          </button>
          <button onClick={() => onEdit(index)} style={{ padding: '5px 10px', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Sửa</button>
          <button onClick={() => onDelete(index)} style={{ padding: '5px 10px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Xoá</button>
        </div>
      </div>
    </div>
  )
}

/* ─── Section Config Card ───────────────────────────────────────────────── */
function SectionConfigCard({ section, index, total, onChange, onMoveUp, onMoveDown }) {
  const isGrid = section.type === 'bestSellers' || section.type === 'newArrivals';

  const typeLabels = {
    bestSellers: 'Sản phẩm nổi bật',
    newArrivals: 'Sản phẩm mới',
    collections: 'Bộ sưu tập',
    promo: 'Ưu đãi & Banner',
    blogs: 'Blog & Tin tức'
  };

  return (
    <div style={{ ...cardStyle, border: `2px solid ${section.enabled ? '#e5e7eb' : '#f3f4f6'}`, opacity: section.enabled ? 1 : 0.7 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#E31837', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
            {typeLabels[section.type] || 'Khu vực'}
          </div>
          <input
            style={{ ...inputStyle, fontSize: '16px', fontWeight: '800', color: '#1f2937', background: 'transparent', border: '1.5px solid #e5e7eb', padding: '6px 10px', maxWidth: '300px' }}
            value={section.title}
            onChange={e => onChange(index, 'title', e.target.value)}
            placeholder="Tên tiêu đề khu vực..."
          />
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Reorder Buttons */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => onMoveUp(index)} disabled={index === 0} style={{ padding: '6px 10px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.4 : 1, fontSize: '14px' }}>↑</button>
            <button onClick={() => onMoveDown(index)} disabled={index === total - 1} style={{ padding: '6px 10px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: index === total - 1 ? 'not-allowed' : 'pointer', opacity: index === total - 1 ? 0.4 : 1, fontSize: '14px' }}>↓</button>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
            <div
              onClick={() => onChange(index, 'enabled', !section.enabled)}
              style={{
                width: '48px',
                height: '26px',
                borderRadius: '13px',
                background: section.enabled ? 'linear-gradient(135deg, #E31837, #ff4d6d)' : '#e5e7eb',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute',
                top: '3px',
                left: section.enabled ? '25px' : '3px',
                width: '20px',
                height: '20px',
                background: 'white',
                borderRadius: '50%',
                transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: section.enabled ? '#1f2937' : '#9ca3af' }}>
              {section.enabled ? 'Đang hiển thị' : 'Đã ẩn'}
            </span>
          </label>
        </div>
      </div>

      {/* Grid config */}
      {isGrid && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {/* Columns */}
            <div>
              <label style={labelStyle}>Số cột sản phẩm</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => onChange(index, 'columns', Math.max(2, section.columns - 1))}
                  style={{ width: '32px', height: '32px', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >−</button>
                <div style={{ flex: 1, textAlign: 'center', fontSize: '20px', fontWeight: '900', color: '#E31837' }}>{section.columns}</div>
                <button
                  onClick={() => onChange(index, 'columns', Math.min(8, section.columns + 1))}
                  style={{ width: '32px', height: '32px', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >+</button>
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '4px' }}>2 – 8 cột</div>
            </div>

            {/* Rows */}
            <div>
              <label style={labelStyle}>Số hàng sản phẩm</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => onChange(index, 'rows', Math.max(1, section.rows - 1))}
                  style={{ width: '32px', height: '32px', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >−</button>
                <div style={{ flex: 1, textAlign: 'center', fontSize: '20px', fontWeight: '900', color: '#E31837' }}>{section.rows}</div>
                <button
                  onClick={() => onChange(index, 'rows', Math.min(4, section.rows + 1))}
                  style={{ width: '32px', height: '32px', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >+</button>
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '4px' }}>1 – 4 hàng</div>
            </div>

            {/* Preview grid */}
            <div>
              <label style={labelStyle}>Xem trước lưới</label>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(section.columns, 5)}, 1fr)`, gap: '3px' }}>
                {Array.from({ length: Math.min(section.columns, 5) * Math.min(section.rows, 3) }).map((_, i) => (
                  <div key={i} style={{ height: '14px', background: section.enabled ? 'linear-gradient(135deg, #fce7ea, #ffd0d8)' : '#f3f4f6', borderRadius: '3px' }} />
                ))}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                ≈ {section.columns * section.rows} sản phẩm/trang
              </div>
            </div>
          </div>

          {/* View All href */}
          <div style={{ marginTop: '16px' }}>
            <label style={labelStyle}>Link "Xem tất cả"</label>
            <input
              style={inputStyle}
              value={section.viewAllHref}
              onChange={e => onChange(index, 'viewAllHref', e.target.value)}
              placeholder="/best-sellers"
            />
          </div>
        </>
      )}
    </div>
  )
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function HomeConfigAdminPage() {
  const [banners, setBanners] = useState([])
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [editBannerIndex, setEditBannerIndex] = useState(null)
  const [activeTab, setActiveTab] = useState('banners')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await homeConfigService.adminGetConfig()
      setBanners(res.data?.banners || [])
      setSections(res.data?.sections || [])
    } catch {
      toast.error('Không thể tải cấu hình trang chủ')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  /* Banner handlers */
  const handleBannerSaved = (formData) => {
    if (editBannerIndex !== null) {
      setBanners(prev => prev.map((b, i) => i === editBannerIndex ? { ...b, ...formData } : b))
    } else {
      setBanners(prev => [...prev, { ...formData, order: prev.length }])
    }
    setShowBannerModal(false)
    setEditBannerIndex(null)
  }

  const handleBannerDelete = (idx) => {
    if (!window.confirm('Xoá banner này?')) return
    setBanners(prev => prev.filter((_, i) => i !== idx))
  }

  const handleBannerToggle = (idx) => {
    setBanners(prev => prev.map((b, i) => i === idx ? { ...b, isActive: !b.isActive } : b))
  }

  const handleMoveUp = (idx) => {
    if (idx === 0) return
    setBanners(prev => {
      const next = [...prev]
        ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }

  const handleMoveDown = (idx) => {
    setBanners(prev => {
      if (idx >= prev.length - 1) return prev
      const next = [...prev]
        ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }

  /* Section handlers */
  const handleSectionChange = (idx, field, value) => {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  const handleSectionMoveUp = (idx) => {
    if (idx === 0) return
    setSections(prev => {
      const next = [...prev]
        ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }

  const handleSectionMoveDown = (idx) => {
    setSections(prev => {
      if (idx >= prev.length - 1) return prev
      const next = [...prev]
        ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }

  /* Save all */
  const handleSaveAll = async () => {
    setSaving(true)
    try {
      await homeConfigService.adminUpdateConfig({
        banners: banners.map((b, i) => ({ ...b, order: i })),
        sections,
      })
      toast.success('✅ Đã lưu cấu hình trang chủ!')
    } catch {
      toast.error('Lưu thất bại, vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  /* Computed */
  const activeBanners = banners.filter(b => b.isActive).length

  if (loading) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af' }}>
          <div style={{ width: '44px', height: '44px', border: '3px solid #E31837', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          Đang tải cấu hình trang chủ...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Page header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1f2937', margin: 0 }}>Quản lý Trang Chủ</h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>Tuỳ chỉnh banner, danh mục nổi bật và hàng mới về</p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          style={{
            padding: '12px 28px',
            background: saving ? '#f87171' : 'linear-gradient(135deg, #E31837, #ff4d6d)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '15px',
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 16px rgba(227,24,55,0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {saving ? '⏳ Đang lưu...' : 'Lưu tất cả thay đổi'}
        </button>
      </div>

      {/* Stats summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Tổng Banner', value: banners.length, color: '#6366f1', bg: '#eef2ff', icon: '' },
          { label: 'Banner đang hiện', value: activeBanners, color: '#16a34a', bg: '#f0fdf4', icon: '' },
          { label: 'Banner đang ẩn', value: banners.length - activeBanners, color: '#9ca3af', bg: '#f9fafb', icon: '' },
          { label: 'Khu vực sản phẩm', value: sections.filter(s => s.enabled).length + '/' + sections.length, color: '#E31837', bg: '#fff0f2', icon: '' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '14px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontSize: '24px' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: s.color, opacity: 0.8, marginTop: '2px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'white', padding: '6px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: 'fit-content' }}>
        {[
          { id: 'banners', label: 'Quản lý Banner' },
          { id: 'sections', label: 'Khu vực sản phẩm' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #E31837, #ff4d6d)' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6b7280',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(227,24,55,0.3)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── BANNERS TAB ── */}
      {activeTab === 'banners' && (
        <div>
          {/* Info bar */}
          <div style={{ ...cardStyle, marginBottom: '16px', padding: '16px 20px', background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '13px', color: '#4338ca', fontWeight: '500' }}>
              💡 Kéo nút ↑↓ để sắp thứ tự banner. Banner ẩn sẽ không hiện trên trang chủ. Nhớ nhấn <strong>Lưu tất cả thay đổi</strong> sau khi chỉnh sửa.
            </div>
            <button
              id="btn-add-banner"
              onClick={() => { setEditBannerIndex(null); setShowBannerModal(true) }}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #E31837, #ff4d6d)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(227,24,55,0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              ➕ Thêm Banner
            </button>
          </div>

          {banners.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🖼️</div>
              <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '8px' }}>Chưa có banner nào</div>
              <div style={{ fontSize: '13px' }}>Nhấn "Thêm Banner" để tạo banner đầu tiên</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {banners.map((banner, idx) => (
                <BannerCard
                  key={idx}
                  banner={banner}
                  index={idx}
                  total={banners.length}
                  onEdit={(i) => { setEditBannerIndex(i); setShowBannerModal(true) }}
                  onDelete={handleBannerDelete}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onToggle={handleBannerToggle}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SECTIONS TAB ── */}
      {activeTab === 'sections' && (
        <div>
          <div style={{ ...cardStyle, marginBottom: '16px', padding: '16px 20px', background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', color: '#b45309', fontWeight: '500' }}>
              💡 Tuỳ chỉnh số cột và hàng sản phẩm cho từng khu vực hiển thị trên trang chủ. Nhớ nhấn <strong>Lưu tất cả thay đổi</strong> sau khi chỉnh sửa.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sections.map((section, idx) => (
              <SectionConfigCard
                key={`${section.type}-${idx}`}
                section={section}
                index={idx}
                total={sections.length}
                onChange={handleSectionChange}
                onMoveUp={handleSectionMoveUp}
                onMoveDown={handleSectionMoveDown}
              />
            ))}
          </div>

          {sections.length === 0 && (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>📦</div>
              <div style={{ fontWeight: '700', fontSize: '16px' }}>Không có khu vực nào</div>
            </div>
          )}
        </div>
      )}

      {/* Banner Modal */}
      {showBannerModal && (
        <BannerModal
          initial={editBannerIndex !== null ? banners[editBannerIndex] : null}
          onClose={() => { setShowBannerModal(false); setEditBannerIndex(null) }}
          onSaved={handleBannerSaved}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus { border-color: #E31837 !important; background: white !important; }
      `}</style>
    </div>
  )
}
