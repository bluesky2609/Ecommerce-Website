import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      toggle: (product) => {
        const { items } = get()
        const exists = items.find(i => i.id === product.id)
        if (exists) {
          set({ items: items.filter(i => i.id !== product.id) })
        } else {
          set({ items: [...items, product] })
        }
      },

      isWishlisted: (productId) => {
        return get().items.some(i => i.id === productId)
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.id !== productId) })
      },
    }),
    {
      name: 'hody-wishlist',
    }
  )
)

export default useWishlistStore
