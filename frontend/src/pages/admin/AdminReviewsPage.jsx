import React, { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { Calendar, MessageSquare, Trash2, Search, Star, MessageCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Modal states
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [replying, setReplying] = useState(false)

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await adminService.getAllReviews({
        page,
        limit: 10,
        search,
        rating: ratingFilter,
      })
      if (res.success) {
        setReviews(res.data)
        setTotalPages(res.pagination.totalPages)
      }
    } catch (error) {
      toast.error('Không thể tải danh sách đánh giá')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [page, search, ratingFilter])

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        await adminService.deleteReview(id)
        toast.success('Xóa đánh giá thành công')
        fetchReviews()
      } catch (error) {
        toast.error('Có lỗi xảy ra khi xóa đánh giá')
      }
    }
  }

  const handleOpenReplyModal = (review) => {
    setSelectedReview(review)
    setReplyContent(review.adminReply || '')
    setShowReplyModal(true)
  }

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) {
      return toast.error('Vui lòng nhập nội dung trả lời')
    }
    
    setReplying(true)
    try {
      await adminService.replyToReview(selectedReview._id, replyContent)
      toast.success('Trả lời đánh giá thành công')
      setShowReplyModal(false)
      fetchReviews()
    } catch (error) {
      toast.error('Không thể gửi câu trả lời')
    } finally {
      setReplying(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Đánh giá</h1>
          <p className="text-gray-500 mt-1">Trả lời và quản lý nhận xét của khách hàng</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">Lọc theo sao:</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              <option value="">Tất cả đánh giá</option>
              <option value="5">5 Sao</option>
              <option value="4">4 Sao</option>
              <option value="3">3 Sao</option>
              <option value="2">2 Sao</option>
              <option value="1">1 Sao</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Khách hàng / Ngày</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Sản phẩm</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Đánh giá</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nội dung</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center mb-2">
                       <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-600">Không tìm thấy đánh giá nào</p>
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{review.user?.name || 'User ẩn'}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2 max-w-[200px]">
                        {review.product?.name || 'Sản phẩm đã xóa'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-0.5 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? 'fill-current' : 'text-gray-300'} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs xl:max-w-md line-clamp-3">
                        {review.comment || <span className="text-gray-400 italic">Không có nội dung</span>}
                      </div>
                      {review.adminReply && (
                        <div className="mt-2 text-xs bg-blue-50 text-blue-800 p-2 rounded border border-blue-100 flex items-start gap-1.5 line-clamp-2">
                          <MessageCircle size={14} className="mt-0.5 flex-shrink-0" />
                          <span>{review.adminReply}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenReplyModal(review)}
                          className={`p-2 rounded-lg transition-colors ${review.adminReply ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          title="Trả lời đánh giá"
                        >
                          <MessageCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Xóa đánh giá"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-center">
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Trang trước
              </button>
              <div className="flex items-center px-4 text-sm font-medium text-gray-600">
                Trang {page} / {totalPages}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Trả lời đánh giá</h3>
              <button onClick={() => setShowReplyModal(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm">{selectedReview.user?.name || 'User'}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < selectedReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700">{selectedReview.comment}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phản hồi của Shop</label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Nhập nội dung trả lời khách hàng..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all resize-none text-sm"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowReplyModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitReply}
                disabled={replying}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-70 flex items-center gap-2"
              >
                {replying ? 'Đang gửi...' : 'Gửi trả lời'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReviewsPage
