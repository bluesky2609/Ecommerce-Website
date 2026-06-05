import api from './api.js'

export const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res
  },
}
