import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useFavorites } from '../hooks/useFavorites'
import ProductCard from '../components/ProductCard'
import { EmptyState, PageHeader, Spinner } from '../components/ui'

export default function Favorites() {
  const favorites = useFavorites()
  const cart = useCart()
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (favorites.ids.length === 0) { Promise.resolve().then(() => { setProducts([]); setLoading(false) }); return }
    supabase.from('product_list').select('*').in('id', favorites.ids)
      .then(({ data }) => { setProducts(data || []); setLoading(false) })
  }, [favorites.ids])

  return (
    <div className="mx-auto max-w-[1220px] px-5 py-12 md:px-7">
      <PageHeader eyebrow="WISHLIST" title="Хүслийн жагсаалт" />
      {loading && <Spinner />}
      {!loading && products.length === 0 && (
        <EmptyState title="Хүслийн жагсаалт хоосон" text="Таалагдсан бүтээгдэхүүнийхээ ♡ дээр дарж хадгалаарай." action={<Link to="/products" className="btn-primary">Бүтээгдэхүүн үзэх</Link>} />
      )}
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} isFavorite onToggleFavorite={favorites.toggle} onAdd={(prod) => { cart.add(prod); toast.success('Сагсанд нэмэгдлээ') }} />
        ))}
      </div>
    </div>
  )
}
