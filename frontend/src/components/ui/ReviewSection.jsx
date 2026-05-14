import React, { useState, useEffect, useCallback } from 'react'
import { Star, ThumbsUp, Trash2, ShieldCheck, ChevronDown, MessageCircle } from 'lucide-react'
import { reviewService } from '../../services/reviewService.js'
import useAuthStore from '../../stores/authStore.js'
import toast from 'react-hot-toast'

// ── Star selector component ──────────────────────────────────────────────────
const StarSelector = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="transition-transform hover:scale-125"
      >
        <Star
          size={28}
          className={star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}
        />
      </button>
    ))}
  </div>
)

// ── Star display component ───────────────────────────────────────────────────
const StarDisplay = ({ value, size = 14 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        className={star <= Math.round(value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
      />
    ))}
  </div>
)

// ── Rating distribution bar ──────────────────────────────────────────────────
const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3 text-right text-gray-600 font-medium">{star}</span>
      <Star size={12} className="fill-yellow-400 text-yellow-400 flex-shrink-0" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-gray-400 text-xs">{count}</span>
    </div>
  )
}

// ── ReviewForm ───────────────────────────────────────────────────────────────
const ReviewForm = ({ productId, pendingOrders, onSuccess }) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(pendingOrders[0]?.id || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return toast.error('Vui lòng viết nhận xét!')
    if (!selectedOrder) return toast.error('Vui lòng chọn đơn hàng!')

    setSubmitting(true)
    try {
      await reviewService.create(productId, { rating, comment, orderId: selectedOrder })
      toast.success('Cảm ơn bạn đã đánh giá! 🎉')
      setComment('')
      setRating(5)
      onSuccess()
    } catch (err) {
      toast.error(err?.message || 'Gửi đánh giá thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  const labels = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt']

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6">
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <ShieldCheck size={18} className="text-primary" />
        Viết đánh giá của bạn
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating stars */}
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Đánh giá của bạn</label>
          <div className="flex items-center gap-3">
            <StarSelector value={rating} onChange={setRating} />
            <span className="text-sm font-medium text-yellow-600">{labels[rating]}</span>
          </div>
        </div>

        {/* Chọn đơn hàng nếu có nhiều đơn */}
        {pendingOrders.length > 1 && (
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Đánh giá cho đơn hàng</label>
            <select
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              {pendingOrders.map((o) => (
                <option key={o.id} value={o.id}>{o.orderCode}</option>
              ))}
            </select>
          </div>
        )}

        {/* Comment */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Nhận xét chi tiết</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary transition-colors"
          />
          <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/1000</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </form>
    </div>
  )
}

// ── ReviewCard ───────────────────────────────────────────────────────────────
const ReviewCard = ({ review, currentUserId, onDelete }) => {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm('Xóa đánh giá này?')) return
    setDeleting(true)
    try {
      await onDelete(review._id)
    } finally {
      setDeleting(false)
    }
  }

  const isOwner = currentUserId && review.user?._id === currentUserId

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{review.user?.name || 'Người dùng'}</p>
            <p className="text-xs text-gray-400">
              {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {review.isVerifiedPurchase && (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <ShieldCheck size={11} />
              Đã mua hàng
            </span>
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-gray-300 hover:text-red-400 transition-colors"
              title="Xóa đánh giá"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Stars */}
      <StarDisplay value={review.rating} />

      {/* Comment */}
      {review.comment && (
        <p className="mt-3 text-gray-700 text-sm leading-relaxed">{review.comment}</p>
      )}

      {/* Admin Reply */}
      {review.adminReply && (
        <div className="mt-3 bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-sm">
          <div className="flex items-center gap-1.5 text-blue-700 font-semibold mb-1 text-xs">
            <MessageCircle size={14} />
            Phản hồi từ HODY Shop
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{review.adminReply}</p>
        </div>
      )}

      {/* Helpful */}
      {review.helpful > 0 && (
        <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
          <ThumbsUp size={12} />
          <span>{review.helpful} người thấy hữu ích</span>
        </div>
      )}
    </div>
  )
}

// ── Main ReviewSection ───────────────────────────────────────────────────────
const ReviewSection = ({ product }) => {
  const { user, token } = useAuthStore()
  const [reviews, setReviews] = useState([])
  const [distribution, setDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [canReview, setCanReview] = useState(false)
  const [pendingOrders, setPendingOrders] = useState([])

  const LIMIT = 5

  const loadReviews = useCallback(async (resetPage = false) => {
    if (!product?.id) return
    setLoading(true)
    try {
      const currentPage = resetPage ? 1 : page
      const res = await reviewService.getByProduct(product.id, { page: currentPage, limit: LIMIT })
      const newReviews = res.data || []

      if (resetPage) {
        setReviews(newReviews)
        setPage(1)
      } else {
        setReviews((prev) => currentPage === 1 ? newReviews : [...prev, ...newReviews])
      }

      setDistribution(res.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
      setTotal(res.pagination?.total || 0)
      setHasMore(currentPage < (res.pagination?.totalPages || 1))
    } catch {
      // API chưa có review: giữ trống
    } finally {
      setLoading(false)
    }
  }, [product?.id, page])

  const checkCanReview = useCallback(async () => {
    if (!token || !product?.id) return
    const res = await reviewService.canReview(product.id)
    setCanReview(res.canReview || false)
    setPendingOrders(res.pendingOrders || [])
  }, [product?.id, token])

  useEffect(() => {
    loadReviews(true)
    checkCanReview()
  }, [product?.id])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadReviews(false)
  }

  const handleDelete = async (reviewId) => {
    try {
      await reviewService.delete(product.id, reviewId)
      toast.success('Đã xóa đánh giá')
      loadReviews(true)
      checkCanReview()
    } catch {
      toast.error('Không thể xóa đánh giá')
    }
  }

  const avgRating = product?.rating || 0
  const reviewCount = product?.reviewCount || total

  return (
    <div className="space-y-8">
      {/* Tổng quan rating */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Điểm trung bình */}
          <div className="text-center min-w-[100px]">
            <div className="text-5xl font-black text-gray-900">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</div>
            <StarDisplay value={avgRating} size={18} />
            <p className="text-sm text-gray-400 mt-1">{reviewCount} đánh giá</p>
          </div>

          {/* Phân bổ sao */}
          <div className="flex-1 w-full space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => (
              <RatingBar key={star} star={star} count={distribution[star] || 0} total={reviewCount} />
            ))}
          </div>
        </div>
      </div>

      {/* Form viết đánh giá */}
      {token && canReview && (
        <ReviewForm
          productId={product.id}
          pendingOrders={pendingOrders}
          onSuccess={() => { loadReviews(true); checkCanReview() }}
        />
      )}

      {token && !canReview && user && (
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 text-center">
          💡 Bạn cần mua và nhận hàng thành công để có thể đánh giá sản phẩm này.
        </div>
      )}

      {!token && (
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-600 text-center">
          <a href="/login" className="font-semibold underline">Đăng nhập</a> để viết đánh giá sản phẩm.
        </div>
      )}

      {/* Danh sách đánh giá */}
      <div>
        <h4 className="font-bold text-gray-900 mb-4">
          {reviewCount > 0 ? `${reviewCount} đánh giá từ khách hàng` : 'Chưa có đánh giá'}
        </h4>

        {loading && reviews.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-28" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Star size={48} className="mx-auto mb-3 text-gray-200" />
            <p className="font-medium">Chưa có đánh giá nào</p>
            <p className="text-sm mt-1">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                currentUserId={user?.id || user?._id}
                onDelete={handleDelete}
              />
            ))}

            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ChevronDown size={16} />
                {loading ? 'Đang tải...' : 'Xem thêm đánh giá'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewSection
