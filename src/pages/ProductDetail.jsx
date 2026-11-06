import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Heart, ShoppingBag, Star, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useFavorites } from '../hooks/useFavorites'
import { formatDate, money } from '../lib/format'
import { EmptyState, Spinner } from '../components/ui'
import ConfirmDialog from '../components/ConfirmDialog'

function Stars({ value, onChange, size = 18 }) {
  return (
    <div className="flex gap-1 text-gold">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)} aria-label={`${n} од`}>
          <Star size={size} fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const cart = useCart()
  const toast = useToast()
  const favorites = useFavorites()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const load = useCallback(async () => {
    const [p, r] = await Promise.all([
      supabase.from('product_list').select('*').eq('id', id).maybeSingle(),
      supabase.from('review_list').select('*').eq('product_id', id).order('created_at', { ascending: false }),
    ])
    setProduct(p.data)
    setReviews(r.data || [])
    setLoading(false)
  }, [id])

  useEffect(() => { Promise.resolve().then(load) }, [load])

  async function submitReview(e) {
    e.preventDefault()
    if (comment.trim().length < 3) return toast.error('Сэтгэгдэл дор хаяж 3 тэмдэгттэй байна')
    setSaving(true)
    const { error } = await supabase.from('reviews').insert({ product_id: Number(id), rating, comment: comment.trim() })
    setSaving(false)
    if (error) {
      return toast.error(error.code === '23505' ? 'Та энэ бүтээгдэхүүнд аль хэдийн үнэлгээ өгсөн байна' : error.message)
    }
    setComment('')
    toast.success('Үнэлгээ нэмэгдлээ. Баярлалаа!')
    load()
  }

  async function deleteReview() {
    const { error } = await supabase.from('reviews').delete().eq('id', deleteId)
    setDeleteId(null)
    if (error) return toast.error(error.message)
    toast.success('Сэтгэгдэл устгагдлаа')
    load()
  }

  if (loading) return <Spinner />
  if (!product) return (
    <div className="mx-auto max-w-xl px-5 py-20"><EmptyState title="Бүтээгдэхүүн олдсонгүй" action={<Link to="/products" className="btn-outline">Бүтээгдэхүүн рүү буцах</Link>} /></div>
  )

  const isFav = favorites.ids.includes(product.id)
  const myReview = reviews.find((r) => r.user_id === user?.id)

  return (
    <div className="mx-auto max-w-[1220px] px-5 py-10 md:px-7">
      <Link to="/products" className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-sage"><ArrowLeft size={15} /> Бүтээгдэхүүн рүү буцах</Link>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-sand">
          <img src={product.image_url} alt={product.name} className="size-full object-cover" />
          {product.tag && <span className="absolute left-4 top-4 bg-white px-3 py-2 text-[10px] font-extrabold tracking-wider">{product.tag}</span>}
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-extrabold tracking-[0.15em] text-blush uppercase">{product.brand_name}</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{product.name}</h1>
          <p className="mt-1 text-muted">{product.subtitle}</p>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Stars value={Math.round(product.avg_rating || 0)} />
            <span className="text-muted">{product.avg_rating ? Number(product.avg_rating).toFixed(1) : '—'} · {product.review_count} үнэлгээ</span>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <strong className="text-3xl">{money(product.price)}</strong>
            {product.old_price && <s className="text-muted">{money(product.old_price)}</s>}
          </div>
          <p className="mt-6 leading-relaxed text-ink/80">{product.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded bg-cream p-3"><dt className="text-xs text-muted">Ангилал</dt><dd className="font-bold">{product.category_name}</dd></div>
            <div className="rounded bg-cream p-3"><dt className="text-xs text-muted">Нөөц</dt><dd className={`font-bold ${product.stock > 0 ? 'text-sage' : 'text-red-700'}`}>{product.stock > 0 ? `${product.stock} ширхэг` : 'Дууссан'}</dd></div>
          </dl>
          <div className="mt-8 flex gap-3">
            <button className="btn-primary flex-1 py-4" disabled={product.stock <= 0} onClick={() => { cart.add(product); toast.success('Сагсанд нэмэгдлээ') }}>
              <ShoppingBag size={18} /> Сагсанд нэмэх
            </button>
            <button className={`btn-outline px-4 ${isFav ? 'text-blush' : ''}`} onClick={() => favorites.toggle(product)} aria-label="Хүслийн жагсаалт">
              <Heart size={19} fill={isFav ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      {/* Үнэлгээ, сэтгэгдэл */}
      <section className="mt-16 grid gap-10 md:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="text-2xl font-bold">Үнэлгээ өгөх</h2>
          {!user && <p className="mt-3 text-sm text-muted"><Link to="/login" className="font-bold text-sage underline">Нэвтэрч</Link> үнэлгээ өгнө үү.</p>}
          {user && myReview && <p className="mt-3 text-sm text-muted">Та энэ бүтээгдэхүүнд үнэлгээ өгсөн байна.</p>}
          {user && !myReview && (
            <form onSubmit={submitReview} className="mt-4 flex flex-col gap-3">
              <Stars value={rating} onChange={setRating} size={24} />
              <textarea className="input min-h-28" maxLength={500} placeholder="Бүтээгдэхүүний талаарх сэтгэгдлээ бичнэ үү..." value={comment} onChange={(e) => setComment(e.target.value)} />
              <span className="self-end text-xs text-muted">{comment.length}/500</span>
              <button className="btn-primary self-start" disabled={saving}>{saving ? 'Илгээж байна...' : 'Илгээх'}</button>
            </form>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold">Сэтгэгдлүүд ({reviews.length})</h2>
          {reviews.length === 0 && <p className="mt-3 text-sm text-muted">Одоогоор сэтгэгдэл алга. Анхны сэтгэгдлийг та бичээрэй!</p>}
          <ul className="mt-4 flex flex-col gap-3">
            {reviews.map((r) => (
              <li key={r.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><strong className="text-sm">{r.reviewer}</strong><Stars value={r.rating} size={14} /></div>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    {formatDate(r.created_at)}
                    {(r.user_id === user?.id || isAdmin) && <button onClick={() => setDeleteId(r.id)} aria-label="Сэтгэгдэл устгах" className="hover:text-red-600"><Trash2 size={15} /></button>}
                  </div>
                </div>
                <p className="mt-2 text-sm text-ink/80">{r.comment}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ConfirmDialog open={Boolean(deleteId)} title="Сэтгэгдэл устгах уу?" text="Энэ үйлдлийг буцаах боломжгүй." onConfirm={deleteReview} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
