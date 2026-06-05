import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import { authService } from '../services/authService.js'
import toast from 'react-hot-toast'

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Đăng ký, 2: Nhập OTP
  const [otp, setOtp] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    let val = e.target.value
    if (e.target.name === 'name') {
      val = val.replace(/[^\p{L}\s]/gu, '')
    } else if (e.target.name === 'phone') {
      val = val.replace(/\D/g, '')
    }
    setForm(f => ({ ...f, [e.target.name]: val }))
    if (errors[e.target.name]) {
      setErrors(errs => ({ ...errs, [e.target.name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = {}

    // Validate name: letters and spaces only
    const nameRegex = /^[\p{L}\s]+$/u;
    if (!nameRegex.test(form.name.trim())) {
      newErrors.name = 'Không chứa số hoặc ký tự đặc biệt'
    }

    // Validate phone: exactly 10 digits starting with 0
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(form.phone)) {
      newErrors.phone = 'Bắt đầu bằng 0 và gồm 10 chữ số'
    }

    if (form.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    if (form.password !== form.confirm) {
      newErrors.confirm = 'Mật khẩu xác nhận không khớp'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    setLoading(true)
    try {
      await authService.register(form.name, form.email, form.password, form.phone)
      toast.success('Hãy kiểm tra email để nhận mã OTP!')
      setStep(2)
    } catch (err) {
      toast.error(err.message || 'Đăng ký thất bại!')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      toast.error('Mã OTP phải có 6 chữ số.')
      return
    }
    setLoading(true)
    try {
      await authService.verifyOtp(form.email, otp)
      toast.success('Xác thực thành công! Chào mừng bạn đến với HODY!')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Xác thực thất bại!')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setLoading(true)
    try {
      await authService.resendOtp(form.email)
      toast.success('Đã gửi lại mã OTP. Vui lòng kiểm tra email.')
    } catch (err) {
      toast.error(err.message || 'Gửi lại OTP thất bại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-black text-primary">HODY</Link>
          <h1 className="text-2xl font-bold mt-3 text-gray-900">{step === 1 ? 'Tạo tài khoản mới' : 'Xác thực Email'}</h1>
          <p className="text-gray-500 mt-1">
            {step === 1 ? 'Đăng ký để nhận nhiều ưu đãi hấp dẫn' : `Chúng tôi đã gửi mã OTP gồm 6 chữ số đến email ${form.email}`}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <div className="relative">
                  <User size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.name ? 'text-red-400' : 'text-gray-400'}`} />
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange} required
                    placeholder="Nguyễn Văn A"
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg text-sm focus:outline-none ${errors.name ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-primary'}`}
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <div className="relative">
                  <Phone size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.phone ? 'text-red-400' : 'text-gray-400'}`} />
                  <input
                    type="tel" name="phone" value={form.phone} onChange={handleChange} required
                    placeholder="0123456789"
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg text-sm focus:outline-none ${errors.phone ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-primary'}`}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange} required
                    placeholder="email@example.com"
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg text-sm focus:outline-none ${errors.email ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-primary'}`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                  <input
                    type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required
                    placeholder="Ít nhất 6 ký tự"
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg text-sm focus:outline-none ${errors.password ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-primary'}`}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${errors.password ? 'text-red-400' : 'text-gray-400'}`}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.confirm ? 'text-red-400' : 'text-gray-400'}`} />
                  <input
                    type="password" name="confirm" value={form.confirm} onChange={handleChange} required
                    placeholder="Nhập lại mật khẩu"
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg text-sm focus:outline-none ${errors.confirm ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-primary'}`}
                  />
                </div>
                {errors.confirm && <p className="mt-1 text-sm text-red-500">{errors.confirm}</p>}
              </div>
              <div className="flex items-start gap-2 text-sm">
                <input type="checkbox" required className="accent-primary mt-0.5" />
                <span className="text-gray-500">
                  Tôi đồng ý với{' '}
                  <Link to="/dieu-khoan" className="text-primary hover:underline">Điều khoản sử dụng</Link>
                  {' '}và{' '}
                  <Link to="/chinh-sach-bao-mat" className="text-primary hover:underline">Chính sách bảo mật</Link>
                </span>
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? 'Đang gửi...' : 'Đăng ký'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Nhập mã OTP (6 số)</label>
                <input
                  type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="------" required
                  className="w-full text-center text-2xl tracking-widest py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
              <button type="submit" disabled={loading || otp.length !== 6} className="w-full btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? 'Đang xác thực...' : 'Xác thực'}
              </button>
              <div className="text-center text-sm text-gray-500 mt-4">
                Chưa nhận được mã?{' '}
                <button type="button" onClick={handleResendOtp} disabled={loading} className="text-primary font-semibold hover:underline">Gửi lại mã</button>
              </div>
              <div className="text-center mt-2">
                <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-gray-600 underline">Quay lại</button>
              </div>
            </form>
          )}

          {step === 1 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">Đăng nhập</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
