import api from './api.js'

export const chatbotService = {
  sendMessage: async (message, conversationHistory = []) => {
    const res = await api.post('/chatbot/message', {
      message,
      conversationHistory,
    })
    return res.data
  },

  getSuggestions: async () => {
    const res = await api.get('/chatbot/suggestions')
    return res.data
  },
}
