import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Sparkles, Truck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useFavorites } from '../hooks/useFavorites'
import ProductCard from '../components/ProductCard'
import { ErrorState, Spinner } from '../components/ui'

const HERO = 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1900&q=88'
const STORY = 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1100&q=85'

export default function Home() {
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const cart = useCart()
  const toast = useToast()
  const favorites = useFavorites()

  useEffect(() => {
    async function load() {
      const [cats, prods] = await Promise.all([
        supabase.from('categories').select('*').order('id'),
        supabase.from('product_list').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(6),
      ])
      if (cats.error || prods.error) setError(true)
      setCategories(cats.data || [])
      setFeatured(prods.data || [])
      setLoading(false)
    }
    load()
  }, [])

  function handleAdd(product) {
    cart.add(product)
    toast.success(`${product.name} сагсанд нэмэгдлээ`)
  }

  return (
    <>
      {/* Hero */}
      <section className="relative h-[540px] overflow-hidden bg-sand">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(90deg, rgba(245,237,230,.97) 0%, rgba(245,237,230,.9) 36%, rgba(245,237,230,.1) 74%), url(${HERO})` }} />
        <div className="relative mx-auto flex h-full max-w-[1220px] items-center px-5 md:px-7">
          <div className="max-w-xl">
            <p className="eyebrow mb-5">— THE ART OF SELF-CARE</p>
            <h1 className="text-5xl font-bold leading-tight tracking-tighter md:text-7xl">Өөрийнхөөрөө<br /><em className="font-accent font-normal not-italic text-blush">гэрэлт.</em></h1>
            <p className="my-7 max-w-sm text-sm leading-loose text-ink/70">Таны арьс, таны гоо үзэсгэлэн. Өдөр бүр өөртөө зарцуулах жижигхэн аз жаргалыг биднээс олоорой.</p>
            <Link to="/products" className="btn-primary gap-6 px-6 py-4">Худалдан авалт хийх <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      {/* Давуу талууд */}
      <section className="mx-auto grid max-w-[1220px] gap-4 border-b border-line px-5 py-8 sm:grid-cols-3 md:px-7">
        {[[Truck, 'Хурдан хүргэлт', 'Улаанбаатар хот даяар'], [Leaf, 'Чанартай бүтээгдэхүүн', 'Нягтлан сонгосон брэндүүд'], [Sparkles, 'Өдөр бүр гэрэлт', 'Таны арьсанд зориулсан']].map(([Icon, title, text]) => (
          <div key={title} className="flex items-center gap-4 sm:justify-center">
            <Icon className="text-sage" strokeWidth={1.3} size={28} />
            <p><strong className="block text-xs">{title}</strong><span className="text-[11px] text-muted">{text}</span></p>
          </div>
        ))}
      </section>

      {loading && <Spinner />}
      {error && <div className="mx-auto max-w-[1220px] px-5 py-10"><ErrorState /></div>}

      {/* Ангиллууд (өгөгдлийн сангаас) */}
      {!loading && categories.length > 0 && (
        <section className="mx-auto max-w-[1220px] px-5 py-20 md:px-7">
          <div className="text-center">
            <p className="eyebrow">DISCOVER YOUR BEAUTY</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">Танд зориулсан <em className="font-accent font-normal not-italic text-blush">ангиллууд</em></h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link key={c.id} to={`/products?category=${c.id}`} className="group relative h-72 overflow-hidden rounded bg-sand">
                <img src={c.image_url} alt={c.name} className="size-full object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                <span className="absolute bottom-6 left-6 text-white">
                  <strong className="block text-2xl tracking-tight">{c.name}</strong>
                  <span className="mt-2 flex items-center gap-2 text-xs font-bold">Үзэх <ArrowRight size={15} /></span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Шинэ бүтээгдэхүүн */}
      {!loading && featured.length > 0 && (
        <section className="bg-cream py-20">
          <div className="mx-auto max-w-[1220px] px-5 md:px-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">HANDPICKED FOR YOU</p>
                <h2 className="mt-3 text-4xl font-bold tracking-tight">Шинэ <em className="font-accent font-normal not-italic text-blush">бүтээгдэхүүн</em></h2>
              </div>
              <Link to="/products" className="btn-outline">Бүгдийг үзэх <ArrowRight size={16} /></Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-3">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} isFavorite={favorites.ids.includes(p.id)} onToggleFavorite={favorites.toggle} onAdd={handleAdd} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Бидний тухай */}
      <section className="grid min-h-[440px] bg-sage-light md:grid-cols-2">
        <div className="min-h-80 bg-cover bg-center" style={{ backgroundImage: `url(${STORY})` }} role="img" aria-label="Арьс арчилгаа" />
        <div className="flex flex-col items-start justify-center px-8 py-16 md:px-16">
          <p className="eyebrow">A LITTLE LOVE FOR YOURSELF</p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight">Гоо сайхан бол<br /><em className="font-accent font-normal not-italic text-blush">өөртөө хайртай байх.</em></h2>
          <p className="my-6 max-w-md text-sm leading-loose text-ink/70">Монголд жинхэнэ, чанартай гоо сайхны бүтээгдэхүүнийг нэг дороос найдвартай авах боломжтой болгох нь бидний зорилго.</p>
          <Link to="/about" className="flex items-center gap-3 border-b border-sage pb-1.5 text-xs font-extrabold text-sage">Дэлгэрэнгүй <ArrowRight size={17} /></Link>
        </div>
      </section>
    </>
  )
}
