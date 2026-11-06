// Мөнгөн дүнг 79,000₮ хэлбэрээр харуулна
export const money = (value) => new Intl.NumberFormat('mn-MN').format(value || 0) + '₮'

export const formatDate = (iso) => new Date(iso).toLocaleDateString('mn-MN', {
  year: 'numeric', month: '2-digit', day: '2-digit',
})

// Захиалгын төлвийн нэр, өнгө
export const ORDER_STATUS = {
  pending: { label: 'Хүлээгдэж буй', className: 'bg-amber-50 text-amber-700' },
  paid: { label: 'Төлөгдсөн', className: 'bg-emerald-50 text-emerald-700' },
  shipped: { label: 'Хүргэгдсэн', className: 'bg-sky-50 text-sky-700' },
  cancelled: { label: 'Цуцлагдсан', className: 'bg-red-50 text-red-700' },
}

export const FREE_SHIPPING = 150000
