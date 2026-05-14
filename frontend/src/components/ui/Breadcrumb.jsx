import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const Breadcrumb = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap gap-1 text-sm text-gray-500">
        <li>
          <Link to="/" className="flex items-center hover:text-primary transition-colors">
            <Home size={14} />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            <ChevronRight size={14} className="text-gray-300" />
            {index === items.length - 1 ? (
              <span className="text-gray-800 font-medium">{item.label}</span>
            ) : (
              <Link to={item.href} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumb
