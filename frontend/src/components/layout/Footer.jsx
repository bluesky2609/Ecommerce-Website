import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, CreditCard, Truck, RotateCcw, Shield } from 'lucide-react'
import { categoryService } from '../../services/categoryService.js'

const Footer = () => {
  const [footerCategories, setFooterCategories] = React.useState([])

  React.useEffect(() => {
    categoryService.getAll().then(setFooterCategories).catch(console.error)
  }, [])
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      {/* Trust badges */}
      <div className="border-b border-gray-700">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Miễn phí vận chuyển', desc: 'Cho đơn từ 299k' },
              { icon: RotateCcw, title: 'Đổi trả dễ dàng', desc: 'Miễn phí 60 ngày' },
              { icon: Shield, title: 'Bảo hành chính hãng', desc: 'Cam kết chất lượng' },
              { icon: CreditCard, title: 'Thanh toán an toàn', desc: 'Đa dạng phương thức' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <Icon size={32} className="text-primary flex-shrink-0" />
                <div>
                  <div className="text-white font-semibold text-sm">{title}</div>
                  <div className="text-xs text-gray-400">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand info */}
          <div>
            <div className="text-3xl font-black text-white mb-4">HODY</div>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Thương hiệu thời trang Việt Nam, mang đến những sản phẩm chất lượng cao với giá thành hợp lý.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-primary" />
                <span>1800 6160 (Miễn phí)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-primary" />
                <span>support@hody.vn</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-primary mt-0.5" />
                <span>123 Nguyễn Trãi, Q.1, TP.HCM</span>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary transition-colors" aria-label="Facebook">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary transition-colors" aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary transition-colors" aria-label="Youtube">
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold mb-4">Danh mục sản phẩm</h3>
            <ul className="space-y-2 text-sm">
              {footerCategories.map(cat => (
                <li key={cat._id || cat.id}>
                  <Link to={`/category/${cat.slug}`} className="hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['Hướng dẫn mua hàng', '/huong-dan-mua-hang'],
                ['Chính sách đổi trả', '/chinh-sach-doi-tra'],
                ['Chính sách vận chuyển', '/chinh-sach-van-chuyen'],
                ['Bảng size', '/bang-size'],
                ['Câu hỏi thường gặp', '/faq'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="hover:text-primary transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-bold mb-4">Về HODY</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['Giới thiệu', '/gioi-thieu'],
                ['Blog thời trang', '/blog'],
                ['Tuyển dụng', '/tuyen-dung'],
                ['Hệ thống cửa hàng', '/cua-hang'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="hover:text-primary transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-white font-semibold text-sm mb-2">Nhận ưu đãi mới nhất</h4>
              <form className="flex gap-2" onSubmit={e => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 bg-gray-700 text-white placeholder-gray-400 px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button type="submit" className="bg-primary text-white px-3 py-2 rounded text-sm hover:bg-primary-600 transition-colors">
                  Đăng ký
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700">
        <div className="container-custom py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>© 2026 HODY. Tất cả quyền được bảo lưu.</span>
          <div className="flex gap-4">
            <Link to="/chinh-sach-bao-mat" className="hover:text-gray-300">Chính sách bảo mật</Link>
            <Link to="/dieu-khoan" className="hover:text-gray-300">Điều khoản sử dụng</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
