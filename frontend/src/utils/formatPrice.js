export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

export const formatPriceShort = (price) => {
  return price.toLocaleString('vi-VN') + 'đ'
}
