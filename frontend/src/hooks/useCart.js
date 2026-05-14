import { useState, useCallback } from 'react'
import useCartStore from '../stores/cartStore.js'

export const useCart = () => {
  const store = useCartStore()

  const totalItems = store.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = store.items.reduce(
    (sum, i) => sum + (i.product.salePrice * i.quantity),
    0
  )

  const selectedItemsList = store.items.filter(i => store.selectedItems?.includes(i.key))
  
  const selectedTotalItems = selectedItemsList.reduce((sum, i) => sum + i.quantity, 0)
  const selectedSubtotal = selectedItemsList.reduce(
    (sum, i) => sum + (i.product.salePrice * i.quantity),
    0
  )

  return {
    ...store,
    totalItems,
    subtotal,
    selectedItemsList,
    selectedTotalItems,
    selectedSubtotal,
  }
}
