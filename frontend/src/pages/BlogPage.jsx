import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, ChevronRight } from 'lucide-react'
import { blogService } from '../services/blogService.js'
import { formatDate } from '../utils/formatDate.js'

const BlogPage = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    blogService.getAll().then(data => {
      setBlogs(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gray-900 text-white py-16 text-center">
        <h1 className="text-4xl font-black mb-2">Blog Thời Trang</h1>
        <p className="text-gray-400">Xu hướng, phong cách và bí quyết thời trang</p>
      </div>

      <div className="container-custom py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-video rounded-xl mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Featured post */}
            {blogs[0] && (
              <article className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 bg-white rounded-2xl overflow-hidden shadow-sm group">
                <Link to={`/blog/${blogs[0].slug}`} className="overflow-hidden aspect-video md:aspect-auto">
                  <img src={blogs[0].thumbnail} alt={blogs[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </Link>
                <div className="p-8 flex flex-col justify-center">
                  <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-3 w-fit">{blogs[0].category}</span>
                  <Link to={`/blog/${blogs[0].slug}`}>
                    <h2 className="text-2xl font-black text-gray-900 hover:text-primary transition-colors mb-3">{blogs[0].title}</h2>
                  </Link>
                  <p className="text-gray-500 leading-relaxed mb-4">{blogs[0].excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Calendar size={14} />{formatDate(blogs[0].publishedAt)}</span>
                    <span className="flex items-center gap-1"><Clock size={14} />{blogs[0].readTime} phút đọc</span>
                  </div>
                  <Link to={`/blog/${blogs[0].slug}`} className="mt-4 inline-flex items-center gap-1 text-primary font-semibold">
                    Đọc tiếp <ChevronRight size={16} />
                  </Link>
                </div>
              </article>
            )}

            {/* Rest of posts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogs.slice(1).map(blog => (
                <article key={blog.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <Link to={`/blog/${blog.slug}`} className="block overflow-hidden aspect-video">
                    <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <div className="p-5">
                    <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded mb-2">{blog.category}</span>
                    <Link to={`/blog/${blog.slug}`}>
                      <h3 className="font-bold text-gray-900 hover:text-primary transition-colors line-clamp-2 mb-2">{blog.title}</h3>
                    </Link>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{blog.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(blog.publishedAt)}</span>
                      <span className="flex items-center gap-1"><Clock size={12} />{blog.readTime} phút</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default BlogPage
