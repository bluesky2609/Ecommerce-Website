import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, ChevronRight } from 'lucide-react'
import { blogService } from '../../services/blogService.js'
import { formatDate } from '../../utils/formatDate.js'

const BlogPreview = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    blogService.getRecent(3).then(data => {
      setBlogs(data)
      setLoading(false)
    })
  }, [])

  if (loading) return null

  return (
    <section className="py-8 bg-gray-50">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Blog Thời Trang</h2>
          <Link to="/blog" className="text-primary text-sm font-semibold hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map(blog => (
            <article key={blog.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <Link to={`/blog/${blog.slug}`} className="block overflow-hidden aspect-video">
                <img
                  src={blog.thumbnail}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
              <div className="p-4">
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">{blog.category}</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(blog.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {blog.readTime} phút
                  </span>
                </div>
                <Link to={`/blog/${blog.slug}`}>
                  <h3 className="font-bold text-gray-900 hover:text-primary transition-colors line-clamp-2 mb-2">
                    {blog.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{blog.excerpt}</p>
                <Link to={`/blog/${blog.slug}`} className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
                  Đọc tiếp <ChevronRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BlogPreview
