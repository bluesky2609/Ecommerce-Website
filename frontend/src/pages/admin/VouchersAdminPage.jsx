import React, { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { voucherService } from '../../services/voucherService.js'

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—')
const fmtMoney = (n) =>
  n ? n.toLocaleString('vi-VN') + 'đ' : '0đ'

const EMPTY_FORM = {
  code: '',
  type: 'percent',
  value: '',
  minOrder: '',
  maxDiscount: '',
  usageLimit: '100',
  startDate: '',
  endDate: '',
  isActive: true,
}

const inputStyle = {
  width: '100%',
  border: '1.5px solid #e5e7eb',
  borderRadius: '8px',
  padding: '9px 12px',
  fontSize: '14px',
  outline: 'none',
  background: '#fafafa',
  color: '#1f2937',
  transition: 'border-color 0.2s',
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

/* ─── status badge ────────────────────────────────────────────────────────── */
function StatusBadge({ voucher }) {
  const now = new Date()
  const expired = new Date(voucher.endDate) < now
  const notStarted = new Date(voucher.startDate) > now
  const exhausted = voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit

  if (!voucher.isActive)
    return <span style={{ background: '#f3f4f6', color: '#9ca3af', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: '600' }}>Tắt</span>
  if (expired)
    return <span style={{ background: '#fef2f2', color: '#ef4444', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: '600' }}>Hết hạn</span>
  if (notStarted)
    return <span style={{ background: '#fffbeb', color: '#f59e0b', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: '600' }}>Chưa bắt đầu</span>
  if (exhausted)
    return <span style={{ background: '#fff7ed', color: '#f97316', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: '600' }}>Hết lượt</span>
  return <span style={{ background: '#f0fdf4', color: '#16a34a', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: '600' }}>Hoạt động</span>
}

/* ─── modal ───────────────────────────────────────────────────────────────── */
function VoucherModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial?._id
  const [form, setForm] = useState(() => {
    if (!initial) return EMPTY_FORM
    const startIso = initial.startDate ? new Date(initial.startDate).toISOString().slice(0, 10) : ''
    const endIso = initial.endDate ? new Date(initial.endDate).toISOString().slice(0, 10) : ''
    return {
      code: initial.code || '',
      type: initial.type || 'percent',
      value: initial.value ?? '',
      minOrder: initial.minOrder ?? '',
      maxDiscount: initial.maxDiscount ?? '',
      usageLimit: initial.usageLimit ?? 100,
      startDate: startIso,
      endDate: endIso,
      isActive: initial.isActive ?? true,
    }
  })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.code || !form.value || !form.endDate) {
      toast.error('Vui lòng điền đủ thông tin bắt buộc!')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase().trim(),
        value: Number(form.value),
        minOrder: Number(form.minOrder) || 0,
        maxDiscount: Number(form.maxDiscount) || 0,
        usageLimit: Number(form.usageLimit) || 100,
      }
      let saved
      if (isEdit) {
        saved = await voucherService.adminUpdate(initial._id, payload)
      } else {
        saved = await voucherService.adminCreate(payload)
      }
      toast.success(isEdit ? 'Đã cập nhật voucher!' : 'Tạo voucher thành công!')
      onSaved(saved.data)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '560px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1f2937', margin: 0 }}>
              {isEdit ? 'Chỉnh sửa voucher' : 'Tạo voucher mới'}
            </h2>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '3px 0 0' }}>
              {isEdit ? 'Cập nhật thông tin voucher' : 'Điền thông tin để tạo mã giảm giá mới'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Code */}
          <div>
            <label style={labelStyle}>Mã voucher *</label>
            <input
              style={{ ...inputStyle, textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' }}
              value={form.code}
              onChange={e => set('code', e.target.value)}
              placeholder="VD: SUMMER30"
              disabled={isEdit}
            />
          </div>

          {/* Type + Value */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Loại giảm giá *</label>
              <select style={inputStyle} value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (đ)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Giá trị *</label>
              <input
                style={inputStyle}
                type="number"
                min="0"
                value={form.value}
                onChange={e => set('value', e.target.value)}
                placeholder={form.type === 'percent' ? 'VD: 20 (%)' : 'VD: 50000 (đ)'}
              />
            </div>
          </div>

          {/* Min order + Max discount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Đơn tối thiểu (đ)</label>
              <input style={inputStyle} type="number" min="0" value={form.minOrder} onChange={e => set('minOrder', e.target.value)} placeholder="0 = không giới hạn" />
            </div>
            <div>
              <label style={labelStyle}>Giảm tối đa (đ) {form.type === 'fixed' && <span style={{ color: '#d1d5db' }}>— N/A</span>}</label>
              <input style={inputStyle} type="number" min="0" value={form.maxDiscount} onChange={e => set('maxDiscount', e.target.value)} placeholder="0 = không giới hạn" disabled={form.type === 'fixed'} />
            </div>
          </div>

          {/* Usage limit */}
          <div>
            <label style={labelStyle}>Số lần sử dụng tối đa</label>
            <input style={inputStyle} type="number" min="0" value={form.usageLimit} onChange={e => set('usageLimit', e.target.value)} placeholder="0 = không giới hạn" />
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Ngày bắt đầu</label>
              <input style={inputStyle} type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Ngày hết hạn *</label>
              <input style={inputStyle} type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
            </div>
          </div>

          {/* Active toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f9fafb', borderRadius: '10px', padding: '12px 16px' }}>
            <input
              id="voucher-active"
              type="checkbox"
              checked={form.isActive}
              onChange={e => set('isActive', e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#E31837', cursor: 'pointer' }}
            />
            <label htmlFor="voucher-active" style={{ fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
              Kích hoạt voucher (hiển thị cho người dùng)
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', border: '1.5px solid #e5e7eb', borderRadius: '10px', background: 'white', color: '#6b7280', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 2,
                padding: '11px',
                border: 'none',
                borderRadius: '10px',
                background: saving ? '#f87171' : 'linear-gradient(135deg, #E31837, #ff4d6d)',
                color: 'white',
                fontWeight: '700',
                fontSize: '14px',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(227,24,55,0.35)',
              }}
            >
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── main page ───────────────────────────────────────────────────────────── */
export default function VouchersAdminPage() {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await voucherService.adminGetAll()
      setVouchers(res.data || [])
    } catch {
      toast.error('Không thể tải danh sách voucher')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSaved = (saved) => {
    setVouchers(prev => {
      const idx = prev.findIndex(v => v._id === saved._id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [saved, ...prev]
    })
    setShowModal(false)
    setEditTarget(null)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá voucher này?')) return
    setDeleting(id)
    try {
      await voucherService.adminDelete(id)
      setVouchers(prev => prev.filter(v => v._id !== id))
      toast.success('Đã xoá voucher')
    } catch {
      toast.error('Xoá thất bại')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggle = async (v) => {
    try {
      const updated = await voucherService.adminUpdate(v._id, { isActive: !v.isActive })
      setVouchers(prev => prev.map(x => x._id === v._id ? updated.data : x))
      toast.success(updated.data.isActive ? 'Đã bật voucher' : 'Đã tắt voucher')
    } catch {
      toast.error('Cập nhật thất bại')
    }
  }

  const openCreate = () => { setEditTarget(null); setShowModal(true) }
  const openEdit = (v) => { setEditTarget(v); setShowModal(true) }

  const filtered = vouchers.filter(v => v.code.toLowerCase().includes(search.toLowerCase()))

  const stats = {
    total: vouchers.length,
    active: vouchers.filter(v => {
      const now = new Date()
      return v.isActive && new Date(v.endDate) >= now && new Date(v.startDate) <= now
    }).length,
    expired: vouchers.filter(v => new Date(v.endDate) < new Date()).length,
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1f2937', margin: 0 }}>Quản lý Voucher</h1>
        <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>Tạo và quản lý mã giảm giá cho khách hàng</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Tổng voucher', value: stats.total, color: '#6366f1', bg: '#eef2ff' },
          { label: 'Đang hoạt động', value: stats.active, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Đã hết hạn', value: stats.expired, color: '#ef4444', bg: '#fef2f2' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: s.color, opacity: 0.85 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          style={{ ...inputStyle, maxWidth: '300px', flex: 1 }}
          placeholder="Tìm theo mã voucher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          id="btn-create-voucher"
          onClick={openCreate}
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
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
          }}
        >
          + Tạo voucher mới
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #E31837', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            Đang tải...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎟️</div>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>Chưa có voucher nào</div>
            <div style={{ fontSize: '13px', marginTop: '6px' }}>Nhấn "+ Tạo voucher mới" để bắt đầu</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                  {['Mã Voucher', 'Loại / Giá trị', 'Điều kiện', 'Hạn sử dụng', 'Lượt dùng', 'Trạng thái', 'Thao tác'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, i) => (
                  <tr key={v._id} style={{ borderBottom: '1px solid #f9fafb', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    {/* Code */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '15px', color: '#1f2937', background: '#f3f4f6', padding: '4px 10px', borderRadius: '6px', letterSpacing: '1px' }}>{v.code}</span>
                    </td>
                    {/* Type / Value */}
                    <td style={{ padding: '14px 16px' }}>
                      {v.type === 'percent' ? (
                        <span style={{ color: '#6366f1', fontWeight: '700', fontSize: '15px' }}>-{v.value}%</span>
                      ) : (
                        <span style={{ color: '#E31837', fontWeight: '700', fontSize: '15px' }}>-{fmtMoney(v.value)}</span>
                      )}
                      {v.maxDiscount > 0 && v.type === 'percent' && (
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>Tối đa {fmtMoney(v.maxDiscount)}</div>
                      )}
                    </td>
                    {/* Conditions */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>
                      {v.minOrder > 0 ? <span>Đơn từ {fmtMoney(v.minOrder)}</span> : <span style={{ color: '#d1d5db' }}>Không giới hạn</span>}
                    </td>
                    {/* Dates */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>
                      <div>{fmtDate(v.startDate)} →</div>
                      <div style={{ fontWeight: '600', color: new Date(v.endDate) < new Date() ? '#ef4444' : '#374151' }}>{fmtDate(v.endDate)}</div>
                    </td>
                    {/* Usage */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                        {v.usedCount} / {v.usageLimit > 0 ? v.usageLimit : '∞'}
                      </div>
                      {v.usageLimit > 0 && (
                        <div style={{ marginTop: '4px', height: '4px', background: '#f3f4f6', borderRadius: '4px', width: '80px' }}>
                          <div style={{ height: '100%', borderRadius: '4px', background: v.usedCount / v.usageLimit > 0.8 ? '#ef4444' : '#16a34a', width: `${Math.min((v.usedCount / v.usageLimit) * 100, 100)}%` }} />
                        </div>
                      )}
                    </td>
                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                        <StatusBadge voucher={v} />
                        <button
                          onClick={() => handleToggle(v)}
                          style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '20px',
                            background: 'white',
                            color: '#6b7280',
                            cursor: 'pointer',
                            fontWeight: '500',
                          }}
                        >
                          {v.isActive ? 'Tắt' : 'Bật'}
                        </button>
                      </div>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openEdit(v)}
                          style={{ padding: '7px 14px', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(v._id)}
                          disabled={deleting === v._id}
                          style={{ padding: '7px 14px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <VoucherModal
          initial={editTarget}
          onClose={() => { setShowModal(false); setEditTarget(null) }}
          onSaved={handleSaved}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus { border-color: #E31837 !important; background: white !important; }
      `}</style>
    </div>
  )
}
