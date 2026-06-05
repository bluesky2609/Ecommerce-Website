import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatbotService } from '../../services/chatbotService.js'
import './ChatbotWidget.css'

// SVG Icons as components
const ChatIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

const MinimizeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

// Default suggestions
const DEFAULT_SUGGESTIONS = [
  { text: '🔥 Sản phẩm bán chạy', message: 'Cho tôi xem những sản phẩm bán chạy nhất' },
  { text: '🆕 Hàng mới về', message: 'Có sản phẩm mới nào không?' },
  { text: '⭐ Nổi bật', message: 'Gợi ý sản phẩm nổi bật' },
]

// Format price
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

// Get time string
function getTimeString() {
  return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

// Simple markdown-like parsing for bot messages
function parseMessageText(text) {
  if (!text) return ''

  // Replace **bold** with <strong>
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // Replace *italic* with <em>
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // Replace newlines with <br>
  html = html.replace(/\n/g, '<br />')

  return html
}

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasGreeted, setHasGreeted] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 400)
    }
  }, [isOpen])

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  // Welcome message when first opened
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true)
      const welcomeMsg = {
        id: Date.now(),
        role: 'bot',
        content: 'Chào bạn! 👋 Mình là trợ lý mua sắm của **HODY**. Mình có thể giúp bạn tìm sản phẩm, tư vấn size, hoặc giải đáp thắc mắc. Hãy hỏi mình bất cứ điều gì nhé! 😊',
        time: getTimeString(),
        products: [],
      }
      setMessages([welcomeMsg])
    }
  }, [isOpen, hasGreeted])

  // Toggle chat window
  const toggleChat = () => {
    if (isOpen) {
      setIsClosing(true)
      setTimeout(() => {
        setIsOpen(false)
        setIsClosing(false)
      }, 250)
    } else {
      setIsOpen(true)
      setUnreadCount(0)
    }
  }

  // Build conversation history for API
  const buildHistory = () => {
    return messages
      .filter(m => m.role === 'user' || m.role === 'bot')
      .map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.content,
      }))
  }

  // Send message
  const sendMessage = async (text = null) => {
    const messageText = text || inputValue.trim()
    if (!messageText) return

    setError(null)
    setShowSuggestions(false)

    // Add user message
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      time: getTimeString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    try {
      const history = buildHistory()
      const response = await chatbotService.sendMessage(messageText, history)

      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        content: response.reply,
        time: getTimeString(),
        products: response.products || [],
      }

      setMessages(prev => [...prev, botMsg])

      // If chat is not visible, increment unread
      if (!isOpen) {
        setUnreadCount(prev => prev + 1)
      }
    } catch (err) {
      console.error('Chatbot error:', err)
      const errorMessage = err?.message || err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
      setError(errorMessage)
    } finally {
      setIsTyping(false)
    }
  }

  // Handle enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Handle suggestion click
  const handleSuggestion = (suggestion) => {
    sendMessage(suggestion.message)
  }

  // Navigate to product
  const handleProductClick = (product) => {
    if (product.slug) {
      navigate(`/product/${product.slug}`)
    }
  }

  // Retry last message
  const handleRetry = () => {
    setError(null)
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content)
    }
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        className={`chatbot-toggle-btn ${isOpen ? 'is-open' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat tư vấn'}
        id="chatbot-toggle"
      >
        <span className="icon-chat"><ChatIcon /></span>
        <span className="icon-close"><CloseIcon /></span>
        {unreadCount > 0 && !isOpen && (
          <span className="chatbot-unread-badge">{unreadCount}</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`chatbot-window ${isClosing ? 'closing' : ''}`} id="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-avatar">🛍️</div>
            <div className="chatbot-header-info">
              <h3 className="chatbot-header-title">HODY Assistant</h3>
              <div className="chatbot-header-status">
                <span className="chatbot-status-dot"></span>
                <span>Đang hoạt động</span>
              </div>
            </div>
            <button
              className="chatbot-header-close"
              onClick={toggleChat}
              aria-label="Thu nhỏ"
            >
              <MinimizeIcon />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages" id="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-welcome">
                <div className="chatbot-welcome-icon">👋</div>
                <h4 className="chatbot-welcome-title">Xin chào!</h4>
                <p className="chatbot-welcome-text">
                  Mình là trợ lý mua sắm HODY.<br />
                  Hãy hỏi mình bất cứ điều gì!
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`chatbot-message ${msg.role}`}>
                <div className="chatbot-msg-avatar">
                  {msg.role === 'bot' ? '🤖' : '👤'}
                </div>
                <div className="chatbot-msg-content">
                  <div
                    className="chatbot-msg-bubble"
                    dangerouslySetInnerHTML={{ __html: parseMessageText(msg.content) }}
                  />

                  {/* Product Cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="chatbot-products">
                      {msg.products.map((product) => (
                        <a
                          key={product.id}
                          className="chatbot-product-card"
                          onClick={(e) => {
                            e.preventDefault()
                            handleProductClick(product)
                          }}
                          href={`/product/${product.slug}`}
                        >
                          <img
                            className="chatbot-product-img"
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" fill="%23f3f4f6"><rect width="160" height="120"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="14">No Image</text></svg>'
                            }}
                          />
                          <div className="chatbot-product-info">
                            <p className="chatbot-product-name">{product.name}</p>
                            <div className="chatbot-product-price">
                              <span className="chatbot-product-sale-price">
                                {formatPrice(product.salePrice)}
                              </span>
                              {product.discount > 0 && (
                                <>
                                  <span className="chatbot-product-original-price">
                                    {formatPrice(product.originalPrice)}
                                  </span>
                                  <span className="chatbot-product-discount">
                                    -{product.discount}%
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}

                  <span className="chatbot-msg-time">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chatbot-typing">
                <div className="chatbot-msg-avatar" style={{ background: 'linear-gradient(135deg, #fee2e2, #fecaca)' }}>
                  🤖
                </div>
                <div className="chatbot-typing-bubble">
                  <span className="chatbot-typing-dot"></span>
                  <span className="chatbot-typing-dot"></span>
                  <span className="chatbot-typing-dot"></span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="chatbot-error">
                <span>⚠️ {error}</span>
                <button className="chatbot-error-retry" onClick={handleRetry}>
                  Thử lại
                </button>
              </div>
            )}

            {/* Suggestions */}
            {showSuggestions && messages.length > 0 && messages.length <= 1 && (
              <div className="chatbot-suggestions">
                {DEFAULT_SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    className="chatbot-suggestion-btn"
                    onClick={() => handleSuggestion(s)}
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              className="chatbot-input"
              type="text"
              placeholder="Nhập tin nhắn..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              id="chatbot-input"
              autoComplete="off"
            />
            <button
              className="chatbot-send-btn"
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isTyping}
              aria-label="Gửi tin nhắn"
              id="chatbot-send"
            >
              <SendIcon />
            </button>
          </div>

          <div className="chatbot-powered">
            Powered by HODY AI
          </div>
        </div>
      )}
    </>
  )
}

export default ChatbotWidget
