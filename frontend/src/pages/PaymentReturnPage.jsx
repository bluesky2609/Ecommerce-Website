import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, ArrowRight, Home, ShoppingBag } from 'lucide-react'
import { orderService } from '../services/orderService.js'

/* ─── Animated spinner ─────────────────────────────────────── */
const Spinner = () => (
  <div style={{
    width: '64px', height: '64px', borderRadius: '50%',
    border: '4px solid #f3f4f6',
    borderTopColor: '#E31837',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto',
  }} />
)

/* ─── Main ─────────────────────────────────────────────────── */
const PaymentReturnPage = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  // Query params PayOS gửi về: code, id, cancel, orderCode, status
  const code = params.get('code')
  const status = params.get('status')
  const orderCode = params.get('orderCode')
  const cancelled = params.get('cancel') === 'true' || params.get('cancelled') === '1'

  const [loading, setLoading] = useState(true)
  const [orderInfo, setOrderInfo] = useState(null)
  const [pollStatus, setPollStatus] = useState(null) // 'PAID' | 'CANCELLED' | 'PENDING' | 'ERROR'

  useEffect(() => {
    const check = async () => {
      try {
        if (orderCode) {
          const res = await orderService.getPayOSStatus(orderCode)
          if (res.success) {
            setOrderInfo(res.data.order)
            setPollStatus(res.data.status) // PAID | CANCELLED | PENDING
          } else {
            setPollStatus('ERROR')
          }
        } else {
          // Không có orderCode, dùng code từ query param
          setPollStatus(cancelled ? 'CANCELLED' : (code === '00' ? 'PAID' : 'CANCELLED'))
        }
      } catch {
        setPollStatus('ERROR')
      } finally {
        setLoading(false)
      }
    }
    check()
  }, [orderCode, code, cancelled])

  // Countdown redirect
  const [countdown, setCountdown] = useState(5)
  const isSuccess = pollStatus === 'PAID' || (!loading && code === '00' && !cancelled)

  useEffect(() => {
    if (!loading && isSuccess) {
      const timer = setInterval(() => setCountdown(c => c - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [loading, isSuccess])

  useEffect(() => {
    if (isSuccess && countdown <= 0) navigate('/orders')
  }, [isSuccess, countdown, navigate])

  /* ═══ Rendering ════════════════════════════════════════════ */
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', 'Be Vietnam Pro', sans-serif",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>

      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px 40px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 25px 60px rgba(0,0,0,0.10)',
        animation: 'fadeInUp 0.5s ease',
        textAlign: 'center',
      }}>

        {/* ── Loading ── */}
        {loading && (
          <>
            <Spinner />
            <h2 style={{ marginTop: '24px', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
              Đang xác nhận thanh toán...
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
              Vui lòng chờ trong giây lát
            </p>
          </>
        )}

        {/* ── SUCCESS ── */}
        {!loading && isSuccess && (
          <>
            {/* Icon with ripple */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
              <div style={{
                position: 'absolute', inset: '-12px', borderRadius: '50%',
                background: 'rgba(34,197,94,0.15)',
                animation: 'ripple 2s ease-out infinite',
              }} />
              <div style={{
                width: '96px', height: '96px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(34,197,94,0.35)',
                animation: 'pulse 2s ease infinite',
              }}>
                <CheckCircle size={52} color="white" strokeWidth={2.5} />
              </div>
            </div>

            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1f2937', marginBottom: '8px' }}>
              Thanh toán thành công!
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              Đơn hàng của bạn đã được xác nhận và đang được xử lý.
            </p>

            {/* Order info */}
            {orderInfo && (
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                border: '1.5px solid #86efac',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                textAlign: 'left',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Mã đơn hàng</span>
                  <span style={{ fontWeight: '800', fontFamily: 'monospace', color: '#1f2937', fontSize: '15px' }}>
                    #{orderInfo.orderCode}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Tổng thanh toán</span>
                  <span style={{ fontWeight: '800', color: '#E31837', fontSize: '16px' }}>
                    {orderInfo.total?.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Trạng thái</span>
                  <span style={{
                    fontSize: '12px', fontWeight: '700',
                    background: '#22c55e', color: 'white',
                    padding: '3px 10px', borderRadius: '99px',
                  }}>
                    ✓ Đã thanh toán
                  </span>
                </div>
              </div>
            )}

            {/* Countdown */}
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
              Tự động chuyển đến đơn hàng sau{' '}
              <strong style={{ color: '#E31837' }}>{countdown}s</strong>
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <button
                onClick={() => navigate('/orders')}
                style={{
                  width: '100%', padding: '14px',
                  background: 'linear-gradient(135deg, #E31837, #ff4d6d)',
                  color: 'white', border: 'none', borderRadius: '12px',
                  fontWeight: '700', fontSize: '15px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 16px rgba(227,24,55,0.3)',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <ShoppingBag size={18} /> Xem đơn hàng <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/')}
                style={{
                  width: '100%', padding: '14px',
                  background: 'white', color: '#374151',
                  border: '1.5px solid #e5e7eb', borderRadius: '12px',
                  fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <Home size={16} /> Tiếp tục mua sắm
              </button>
            </div>
          </>
        )}

        {/* ── CANCELLED / FAILED ── */}
        {!loading && !isSuccess && pollStatus !== 'PENDING' && (
          <>
            <div style={{
              width: '96px', height: '96px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 24px rgba(239,68,68,0.35)',
            }}>
              <XCircle size={52} color="white" strokeWidth={2.5} />
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#1f2937', marginBottom: '8px' }}>
              {cancelled ? 'Đã huỷ thanh toán' : 'Thanh toán thất bại'}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
              {cancelled
                ? 'Bạn đã huỷ giao dịch. Đơn hàng vẫn được giữ, bạn có thể thử lại hoặc chọn phương thức khác.'
                : 'Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.'}
            </p>

            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <button
                onClick={() => navigate('/checkout')}
                style={{
                  width: '100%', padding: '14px',
                  background: 'linear-gradient(135deg, #E31837, #ff4d6d)',
                  color: 'white', border: 'none', borderRadius: '12px',
                  fontWeight: '700', fontSize: '15px', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(227,24,55,0.3)',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Thử lại thanh toán
              </button>
              <button
                onClick={() => navigate('/')}
                style={{
                  width: '100%', padding: '14px',
                  background: 'white', color: '#374151',
                  border: '1.5px solid #e5e7eb', borderRadius: '12px',
                  fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                <Home size={16} /> Về trang chủ
              </button>
            </div>
          </>
        )}

        {/* ── PENDING ── */}
        {!loading && pollStatus === 'PENDING' && (
          <>
            <div style={{
              width: '96px', height: '96px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 24px rgba(245,158,11,0.35)',
            }}>
              <Clock size={52} color="white" strokeWidth={2.5} />
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1f2937', marginBottom: '8px' }}>
              Đang chờ thanh toán
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
              Giao dịch đang được xác nhận. Vui lòng kiểm tra lịch sử đơn hàng sau ít phút.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <button
                onClick={() => navigate('/orders')}
                style={{
                  width: '100%', padding: '14px',
                  background: 'linear-gradient(135deg, #E31837, #ff4d6d)',
                  color: 'white', border: 'none', borderRadius: '12px',
                  fontWeight: '700', fontSize: '15px', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(227,24,55,0.3)',
                }}
              >
                <ShoppingBag size={18} style={{ display: 'inline', marginRight: '8px' }} />
                Xem đơn hàng
              </button>
              <button
                onClick={() => navigate('/')}
                style={{
                  width: '100%', padding: '14px',
                  background: 'white', color: '#374151',
                  border: '1.5px solid #e5e7eb', borderRadius: '12px',
                  fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                }}
              >
                Về trang chủ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentReturnPage
