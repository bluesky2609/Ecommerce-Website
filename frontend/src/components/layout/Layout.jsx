import React from 'react'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import ChatbotWidget from '../chatbot/ChatbotWidget.jsx'
import { Toaster } from 'react-hot-toast'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ChatbotWidget />
      <Toaster
        position="top-right"
        toastOptions={{
          success: { style: { background: '#22c55e', color: 'white' } },
          error: { style: { background: '#ef4444', color: 'white' } },
          duration: 3000,
        }}
      />
    </div>
  )
}

export default Layout

