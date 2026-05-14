export const categories = [
  {
    id: 1,
    name: 'Nam',
    slug: 'nam',
    image: 'https://th.bing.com/th/id/OIP.p_yehQVwkuKIU17JdBFCzgHaJ4?w=208&h=277&c=7&r=0&o=5&dpr=1.3&pid=1.7',
    children: [
      { id: 11, name: 'Áo Nam', slug: 'ao-nam', parentId: 1 },
      { id: 12, name: 'Quần Nam', slug: 'quan-nam', parentId: 1 },
      { id: 13, name: 'Áo Khoác Nam', slug: 'ao-khoac-nam', parentId: 1 },
      { id: 14, name: 'Đồ Mặc Nhà Nam', slug: 'do-mac-nha-nam', parentId: 1 },
      { id: 15, name: 'Đồ Thể Thao Nam', slug: 'do-the-thao-nam', parentId: 1 },
    ]
  },
  {
    id: 2,
    name: 'Nữ',
    slug: 'nu',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
    children: [
      { id: 21, name: 'Áo Nữ', slug: 'ao-nu', parentId: 2 },
      { id: 22, name: 'Quần Nữ', slug: 'quan-nu', parentId: 2 },
      { id: 23, name: 'Váy/Đầm', slug: 'vay-dam', parentId: 2 },
      { id: 24, name: 'Đồ Mặc Nhà Nữ', slug: 'do-mac-nha-nu', parentId: 2 },
      { id: 25, name: 'Đồ Thể Thao Nữ', slug: 'do-the-thao-nu', parentId: 2 },
    ]
  },
  {
    id: 3,
    name: 'Trẻ Em',
    slug: 'tre-em',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400',
    children: [
      { id: 31, name: 'Áo Trẻ Em', slug: 'ao-tre-em', parentId: 3 },
      { id: 32, name: 'Quần Trẻ Em', slug: 'quan-tre-em', parentId: 3 },
      { id: 33, name: 'Bộ Trẻ Em', slug: 'bo-tre-em', parentId: 3 },
    ]
  },
  {
    id: 4,
    name: 'Phụ Kiện',
    slug: 'phu-kien',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    children: [
      { id: 41, name: 'Mũ/Nón', slug: 'mu-non', parentId: 4 },
      { id: 42, name: 'Túi/Ba Lô', slug: 'tui-ba-lo', parentId: 4 },
      { id: 43, name: 'Tất/Vớ', slug: 'tat-vo', parentId: 4 },
    ]
  }
]

export const allCategories = categories.reduce((acc, cat) => {
  acc.push(cat)
  if (cat.children) acc.push(...cat.children)
  return acc
}, [])
