import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set((state) => ({
        user,
        token: token || state.token,
        isAuthenticated: true,
      })),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      updateUser: (userData) => set(state => ({
        user: { ...state.user, ...userData }
      })),
    }),
    {
      name: 'hody-auth',
    }
  )
)

export default useAuthStore
