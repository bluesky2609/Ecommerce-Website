import { useState, useEffect } from 'react'
import { productService } from '../services/productService.js'

export const useProducts = (params = {}) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)

  const paramsKey = JSON.stringify(params)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await productService.getAll(params)
        setProducts(res.data)
        setTotal(res.total)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [paramsKey])

  return { products, loading, error, total }
}
