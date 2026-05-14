import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../components/layout/Layout.jsx'
import useAuthStore from '../stores/authStore.js'

// Lazy loaded pages
const HomePage = lazy(() => import('../pages/HomePage.jsx'))
const CategoryPage = lazy(() => import('../pages/CategoryPage.jsx'))
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage.jsx'))
const CartPage = lazy(() => import('../pages/CartPage.jsx'))
const CheckoutPage = lazy(() => import('../pages/CheckoutPage.jsx'))
const LoginPage = lazy(() => import('../pages/LoginPage.jsx'))
const RegisterPage = lazy(() => import('../pages/RegisterPage.jsx'))
const SearchPage = lazy(() => import('../pages/SearchPage.jsx'))
const BestSellersPage = lazy(() => import('../pages/BestSellersPage.jsx'))
const BlogPage = lazy(() => import('../pages/BlogPage.jsx'))
const BlogDetailPage = lazy(() => import('../pages/BlogDetailPage.jsx'))
const WishlistPage = lazy(() => import('../pages/WishlistPage.jsx'))
const AccountPage = lazy(() => import('../pages/AccountPage.jsx'))
const AdminLayout = lazy(() => import('../pages/admin/AdminLayout.jsx'))
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage.jsx'))
const ProductsAdminPage = lazy(() => import('../pages/admin/ProductsAdminPage.jsx'))
const CategoriesAdminPage = lazy(() => import('../pages/admin/CategoriesAdminPage.jsx'))
const BlogsAdminPage = lazy(() => import('../pages/admin/BlogsAdminPage.jsx'))
const OrdersAdminPage = lazy(() => import('../pages/admin/OrdersAdminPage.jsx'))
const UsersAdminPage = lazy(() => import('../pages/admin/UsersAdminPage.jsx'))
const AdminReviewsPage = lazy(() => import('../pages/admin/AdminReviewsPage.jsx'))
const VouchersAdminPage = lazy(() => import('../pages/admin/VouchersAdminPage.jsx'))
const HomeConfigAdminPage = lazy(() => import('../pages/admin/HomeConfigAdminPage.jsx'))
const OrdersPage = lazy(() => import('../pages/OrdersPage.jsx'))
const OrderDetailPage = lazy(() => import('../pages/OrderDetailPage.jsx'))
const PaymentReturnPage = lazy(() => import('../pages/PaymentReturnPage.jsx'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />
  }
  return children
}

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  return children
}

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth pages - no layout header/footer */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Main layout pages */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/category/:slug" element={<Layout><CategoryPage /></Layout>} />
          <Route path="/product/:slug" element={<Layout><ProductDetailPage /></Layout>} />
          <Route path="/cart" element={<Layout><CartPage /></Layout>} />
          <Route path="/wishlist" element={<Layout><WishlistPage /></Layout>} />
          <Route path="/search" element={<Layout><SearchPage /></Layout>} />
          <Route path="/best-sellers" element={<Layout><BestSellersPage /></Layout>} />
          <Route path="/blog" element={<Layout><BlogPage /></Layout>} />
          <Route path="/blog/:slug" element={<Layout><BlogDetailPage /></Layout>} />

          {/* Payment return – không cần auth, PayOS redirect về đây */}
          <Route path="/payment/return" element={<PaymentReturnPage />} />

          {/* Protected routes */}
          <Route path="/checkout" element={
            <Layout>
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            </Layout>
          } />

          <Route path="/account" element={
            <Layout>
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            </Layout>
          } />

          <Route path="/orders" element={
            <Layout>
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            </Layout>
          } />

          <Route path="/orders/:id" element={
            <Layout>
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            </Layout>
          } />

          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsAdminPage />} />
            <Route path="categories" element={<CategoriesAdminPage />} />
            <Route path="blogs" element={<BlogsAdminPage />} />
            <Route path="orders" element={<OrdersAdminPage />} />
            <Route path="users" element={<UsersAdminPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="vouchers" element={<VouchersAdminPage />} />
            <Route path="home-config" element={<HomeConfigAdminPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <Layout>
              <div className="min-h-screen flex items-center justify-center text-center py-20">
                <div>
                  <div className="text-8xl font-black text-gray-200 mb-4">404</div>
                  <h2 className="text-2xl font-bold text-gray-700 mb-2">Trang không tìm thấy</h2>
                  <p className="text-gray-400 mb-8">Trang bạn tìm kiếm không tồn tại</p>
                  <a href="/" className="btn-primary">Về trang chủ</a>
                </div>
              </div>
            </Layout>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRouter
