import React, { useRef, useState } from 'react'
import { uploadService } from '../../services/uploadService.js'

/**
 * ImageUploader – Dùng chung cho các trang admin
 *
 * Props:
 *   value       {string}   – URL ảnh hiện tại
 *   onChange    {function} – callback(newUrl: string)
 *   label       {string}   – nhãn hiển thị phía trên (tuỳ chọn)
 *   previewHeight {number} – chiều cao preview (px, mặc định 150)
 *   inputId     {string}   – id cho <input type="file"> (mặc định 'img-upload-<random>')
 *   placeholder {string}   – placeholder URL input
 */
const ImageUploader = ({
  value = '',
  onChange,
  label = 'Hình ảnh',
  previewHeight = 150,
  inputId,
  placeholder = 'https://example.com/image.jpg',
}) => {
  const [uploading, setUploading] = useState(false)
  const fileInputId = inputId || `img-upload-${Math.random().toString(36).slice(2, 8)}`
  const fileInputRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('Dung lượng ảnh vượt quá 10MB. Vui lòng chọn ảnh nhỏ hơn!')
      return
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ chấp nhận file hình ảnh (JPEG, PNG, WEBP, GIF)!')
      return
    }

    setUploading(true)
    try {
      const res = await uploadService.uploadImage(file)
      if (res.success && res.url) {
        onChange(res.url)
      } else {
        alert(res.message || 'Lỗi tải ảnh lên server')
      }
    } catch (err) {
      alert(err.message || 'Lỗi kết nối khi tải ảnh lên')
    } finally {
      setUploading(false)
      // Reset input để có thể chọn lại cùng file
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const dt = new DataTransfer()
      dt.items.add(file)
      const fakeEvent = { target: { files: dt.files } }
      handleFile(fakeEvent)
    }
  }

  const s = {
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px',
    },
    dropZone: {
      border: '2px dashed #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      background: '#f9fafb',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
    },
    urlInput: {
      width: '100%',
      padding: '10px 14px',
      border: '1.5px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box',
      color: '#1f2937',
      background: 'white',
    },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {label && <label style={s.label}>{label}</label>}

      {/* Drop zone / preview */}
      <div
        style={s.dropZone}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#E31837'
          e.currentTarget.style.background = '#fff5f6'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#e5e7eb'
          e.currentTarget.style.background = '#f9fafb'
        }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          id={fileInputId}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFile}
        />

        {uploading ? (
          /* Loading spinner */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '10px' }}>
            <div style={{ width: '28px', height: '28px', border: '3px solid #f3f4f6', borderTop: '3px solid #E31837', borderRadius: '50%', animation: 'imgUploaderSpin 0.8s linear infinite' }} />
            <span style={{ fontSize: '13px', color: '#6b7280' }}>Đang tải ảnh lên...</span>
            <style>{`@keyframes imgUploaderSpin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : value ? (
          /* Preview */
          <div style={{ position: 'relative' }}>
            <img
              src={value}
              alt="preview"
              style={{ width: '100%', height: `${previewHeight}px`, objectFit: 'cover', borderRadius: '8px', display: 'block' }}
              onError={e => { e.target.style.display = 'none' }}
            />
            <div style={{
              position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 12px',
              borderRadius: '6px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap',
            }}>
              🖼️ Nhấp hoặc kéo thả để thay ảnh
            </div>
            {/* Remove button */}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange('') }}
              style={{
                position: 'absolute', top: '8px', right: '8px',
                background: '#ef4444', color: 'white', border: 'none',
                borderRadius: '50%', width: '26px', height: '26px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                fontSize: '13px', fontWeight: '700',
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          /* Empty state */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#9ca3af" style={{ width: '40px', height: '40px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: '600' }}>Tải ảnh lên từ máy tính</span>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>Kéo thả hoặc nhấp để chọn · JPG, PNG, WEBP, GIF · Tối đa 10MB</span>
          </div>
        )}
      </div>

      {/* URL input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>Hoặc nhập URL ảnh trực tiếp:</span>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={s.urlInput}
          onFocus={e => (e.target.style.borderColor = '#E31837')}
          onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
        />
      </div>
    </div>
  )
}

export default ImageUploader
