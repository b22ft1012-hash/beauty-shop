import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useFavorites } from '../hooks/useFavorites'
import ProductCard from '../components/ProductCard'
import Pagination from '../components/Pagination'
import { EmptyState, ErrorState, PageHeader, Spinner } from '../components/ui'

const PAGE_SIZE = 8
const SORTS = {
  newest: { label: 'Шинэ нь эхэндээ', column: 'created_at', ascending: false },
  price_asc: { label: 'Үнэ өсөхөөр', column: 'price', ascending: true },
  price_desc: { label: 'Үнэ буурахаар', column: 'price', ascending: false },
  name: { label: 'Нэрээр (A–Z)', column: 'name', ascending: true },
}

export default function Products() {
  // Шүүлтүүдийг URL-д хадгална: /products?q=serum&category=1&page=2 гэх мэт хуваалцах боломжтой
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const category = params.get('category') || ''
  const minPrice = params.get('min') || ''
  const maxPrice = params.get('max') || ''
  const days = params.get('days') || ''
  const sort = params.get('sort') || 'newest'
  const page = Number(params.get('page') || 1)

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reload, setReload] = useState(0)
  const [search, setSearch] = useState(q)
  const [showFilters, setShowFilters] = useState(false)

  const cart = useCart()
  const toast = useToast()
  const favorites = useFavorites()

  useEffect(() => {
    supabase.from('categories').select('id, name').order('id').then(({ data }) => setCategories(data || []))
  }, [])

  // Шүүлт өөрчлөгдөх бүрт өгөгдлийн сангаас дахин татна (шүүлтийг сервер талд хийнэ)
  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(false)
      const s = SORTS[sort] || SORTS.newest
      let query = supabase.from('product_list').select('*', { count: 'exact' }).eq('is_active', true)

      const term = q.replace(/[,()%]/g, ' ').trim()
      if (term) query = query.or(`name.ilike.%${term}%,subtitle.ilike.%${term}%,brand_name.ilike.%${term}%`)
      if (category) query = query.eq('category_id', category)
      if (minPrice) query = query.gte('price', Number(minPrice))
      if (maxPrice) query = query.lte('price', Number(maxPrice))
      if (days) query = query.gte('created_at', new Date(Date.now() - Number(days) * 86400000).toISOString())

      const from = (page - 1) * PAGE_SIZE
      const { data, count, error } = await query.order(s.column, { ascending: s.ascending }).range(from, from + PAGE_SIZE - 1)
      if (!active) return
      if (error) setError(true)
      setProducts(data || [])
      setTotal(count || 0)
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [q, category, minPrice, maxPrice, days, sort, page, reload])

  // Нэг шүүлтийг солиход эхний хуудас руу буцна
  function update(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  function submitSearch(e) {
    e.preventDefault()
    update('q', search.trim())
  }

  function clearAll() {
    setSearch('')
    setParams({})
  }

  function handleAdd(product) {
    cart.add(product)
    toast.success(`${product.name} сагсанд нэмэгдлээ`)
  }

  const hasFilters = q || category || minPrice || maxPrice || days
  const pageCount = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="mx-auto max-w-[1220px] px-5 py-12 md:px-7">
      <PageHeader eyebrow="SHOP ALL" title="Бүтээгдэхүүн">
        <div className="flex items-center gap-2 text-xs text-muted">
          Эрэмбэлэх:
          <select className="input w-auto py-2" value={sort} onChange={(e) => update('sort', e.target.value)} aria-label="Эрэмбэлэх">
            {Object.entries(SORTS).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
          </select>
        </div>
      </PageHeader>

      <form onSubmit={submitSearch} className="flex gap-2">
        <input className="input" placeholder="Нэр, брэндээр хайх..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Хайх" />
        <button className="btn-primary">Хайх</button>
        <button type="button" className="btn-outline md:hidden" onClick={() => setShowFilters(!showFilters)} aria-label="Шүүлтүүр"><SlidersHorizontal size={17} /></button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={() => update('category', '')} className={`rounded border px-4 py-2 text-xs font-bold ${!category ? 'border-sage bg-sage text-white' : 'border-line bg-white text-ink/70'}`}>Бүгд</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => update('category', String(c.id))}
            className={`rounded border px-4 py-2 text-xs font-bold ${category === String(c.id) ? 'border-sage bg-sage text-white' : 'border-line bg-white text-ink/70'}`}>
            {c.name}
          </button>
        ))}
      </div>

      <div className={`${showFilters ? 'grid' : 'hidden'} mt-4 gap-3 rounded-lg bg-cream p-4 md:grid md:grid-cols-[1fr_1fr_1fr_auto] md:items-end`}>
        <div><label className="label" htmlFor="min">Доод үнэ (₮)</label><input id="min" type="number" min="0" className="input bg-white" value={minPrice} onChange={(e) => update('min', e.target.value)} placeholder="0" /></div>
        <div><label className="label" htmlFor="max">Дээд үнэ (₮)</label><input id="max" type="number" min="0" className="input bg-white" value={maxPrice} onChange={(e) => update('max', e.target.value)} placeholder="300000" /></div>
        <div>
          <label className="label" htmlFor="days">Нэмэгдсэн огноо</label>
          <select id="days" className="input bg-white" value={days} onChange={(e) => update('days', e.target.value)}>
            <option value="">Бүх хугацаа</option>
            <option value="7">Сүүлийн 7 хоног</option>
            <option value="30">Сүүлийн 30 хоног</option>
          </select>
        </div>
        {hasFilters && <button className="btn-outline" onClick={clearAll}><X size={15} /> Цэвэрлэх</button>}
      </div>

      <p className="mt-6 text-xs text-muted">{loading ? ' ' : `${total} бүтээгдэхүүн олдлоо`}</p>

      {loading && <Spinner />}
      {!loading && error && <ErrorState onRetry={() => setReload((n) => n + 1)} />}
      {!loading && !error && products.length === 0 && (
        <EmptyState title="Илэрц олдсонгүй" text="Өөр түлхүүр үгээр хайх эсвэл шүүлтүүрээ цэвэрлэж үзнэ үү." action={<button className="btn-outline" onClick={clearAll}>Шүүлтүүр цэвэрлэх</button>} />
      )}
      {!loading && !error && products.length > 0 && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} isFavorite={favorites.ids.includes(p.id)} onToggleFavorite={favorites.toggle} onAdd={handleAdd} />
            ))}
          </div>
          <Pagination page={page} pageCount={pageCount} onChange={(p) => { update('page', String(p)); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
        </>
      )}
    </div>
  )
}
