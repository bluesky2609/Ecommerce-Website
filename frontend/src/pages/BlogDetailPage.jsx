import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Calendar, Clock, ArrowLeft, User } from 'lucide-react'
import { blogService } from '../services/blogService.js'
import { formatDate } from '../utils/formatDate.js'

const BlogDetailPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [b, r] = await Promise.all([
          blogService.getBySlug(slug),
          blogService.getRecent(4),
        ])
        setBlog(b)
        setRecent(r.filter(x => x.slug !== slug).slice(0, 3))
      } catch {
        navigate('/blog', { replace: true })
      } finally {
        setLoading(false)
      }
    }
    fetch()
    window.scrollTo(0, 0)
  }, [slug])

  if (loading) {
    return (
      <div className="container-custom py-12 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-64 bg-gray-200 rounded-xl mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-4 bg-gray-200 rounded" />)}
        </div>
      </div>
    )
  }

  if (!blog) return null

  return (
    <div className="min-h-screen">
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Article */}
          <article className="lg:col-span-2">
            <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
              <ArrowLeft size={16} /> Quay lại Blog
            </Link>

            <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">{blog.category}</div>
            <h1 className="text-3xl font-black text-gray-900 mb-4 leading-tight">{blog.title}</h1>

            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
              <span className="flex items-center gap-1"><User size={14} />{blog.author}</span>
              <span className="flex items-center gap-1"><Calendar size={14} />{formatDate(blog.publishedAt)}</span>
              <span className="flex items-center gap-1"><Clock size={14} />{blog.readTime} phút đọc</span>
            </div>

            <img src={blog.thumbnail} alt={blog.title} className="w-full aspect-video object-cover rounded-2xl mb-8" />

            <div
              className="prose max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-600">Tags:</span>
                {['Thời trang', blog.category, 'HODY'].map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside>
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-20">
              <h3 className="font-bold text-lg mb-4">Bài viết liên quan</h3>
              <div className="space-y-4">
                {recent.map(b => (
                  <Link key={b.id} to={`/blog/${b.slug}`} className="flex gap-3 group">
                    <img src={b.thumbnail} alt={b.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2">{b.title}</div>
                      <div className="text-xs text-gray-400 mt-1">{formatDate(b.publishedAt)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default BlogDetailPage
