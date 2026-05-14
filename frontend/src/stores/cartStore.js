import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      selectedItems: [],
      isOpen: false,

      addItem: (product, variant, quantity = 1) => {
        const { items, selectedItems } = get()
        const key = `${product.id}-${variant.colorId}-${variant.size}`
        const existing = items.find(i => i.key === key)

        const limit = variant?.stock ?? product?.countInStock ?? 9999;
        let newQuantity = quantity;
        
        if (existing) {
          newQuantity += existing.quantity;
        }

        if (newQuantity > limit) {
          toast.error('số lượng sản phẩm khách hàng muốn mua vượt quá số lượng tồn kho', { id: 'stock-limit' })
          newQuantity = limit;
        }

        if (existing) {
          set({
            items: items.map(i =>
              i.key === key ? { ...i, quantity: newQuantity } : i
            )
          })
        } else {
          set({
            items: [...items, {
              key,
              product,
              variant,
              quantity: newQuantity,
            }],
            selectedItems: [...selectedItems, key] // auto-select newly added items
          })
        }
      },

      removeItem: (key) => {
        set({ 
          items: get().items.filter(i => i.key !== key),
          selectedItems: get().selectedItems.filter(k => k !== key)
        })
      },

      updateQuantity: (key, quantity) => {
        if (quantity < 1) return
        const { items } = get()
        const item = items.find(i => i.key === key)
        if (!item) return;

        const limit = item.variant?.stock ?? item.product?.countInStock ?? 9999;
        let newQuantity = quantity;

        if (newQuantity > limit) {
          toast.error('số lượng sản phẩm khách hàng muốn mua vượt quá số lượng tồn kho', { id: 'stock-limit' })
          newQuantity = limit;
        }

        set({
          items: items.map(i => i.key === key ? { ...i, quantity: newQuantity } : i)
        })
      },

      clearCart: () => set({ items: [], selectedItems: [] }),
      
      clearSelectedItems: () => {
        const { items, selectedItems } = get()
        set({
          items: items.filter(i => !selectedItems.includes(i.key)),
          selectedItems: []
        })
      },

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      toggleItemSelection: (key) => {
        const { selectedItems } = get()
        if (selectedItems.includes(key)) {
          set({ selectedItems: selectedItems.filter(k => k !== key) })
        } else {
          set({ selectedItems: [...selectedItems, key] })
        }
      },

      toggleAllSelections: () => {
        const { items, selectedItems } = get()
        if (selectedItems.length === items.length && items.length > 0) {
          set({ selectedItems: [] }) // Deselect all
        } else {
          set({ selectedItems: items.map(i => i.key) }) // Select all
        }
      },

      get totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      get subtotal() {
        return get().items.reduce(
          (sum, i) => sum + (i.product.salePrice * i.quantity),
          0
        )
      },
    }),
    {
      name: 'hody-cart',
      partialize: (state) => ({ items: state.items, selectedItems: state.selectedItems }),
    }
  )
)

export default useCartStore
