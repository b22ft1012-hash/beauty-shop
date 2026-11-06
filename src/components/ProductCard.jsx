import { Link } from 'react-router-dom'
import { Heart, Plus, Star } from 'lucide-react'
import { money } from '../lib/format'

// Бүтээгдэхүүний карт: props-оор өгөгдөл болон үйлдлүүдийг хүлээн авна
export default function ProductCard({ product, isFavorite, onToggleFavorite, onAdd }) {
  const outOfStock = product.stock <= 0
  return (
    <article className="group min-w-0">
      <div className="relative h-64 overflow-hidden rounded bg-sand md:h-72">
        <Link to={`/products/${product.id}`}>
          <img src={product.image_url} alt={product.name} loading="lazy" className="size-full object-cover transition duration-300 group-hover:scale-105" />
        </Link>
        {product.tag && <span className="absolute left-3.5 top-3.5 bg-white px-3 py-2 text-[9px] font-extrabold tracking-wider">{product.tag}</span>}
        <button onClick={() => onToggleFavorite(product)} aria-label={isFavorite ? 'Хүслийн жагсаалтаас хасах' : 'Хүслийн жагсаалтад нэмэх'}
          className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white ${isFavorite ? 'text-blush' : 'text-ink/70'}`}>
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="px-0.5 pt-5">
        <span className="text-[10px] font-extrabold tracking-[0.15em] text-blush uppercase">{product.brand_name}</span>
        <h3 className="mt-1.5 truncate text-base font-bold tracking-tight">
          <Link to={`/products/${product.id}`} className="hover:text-sage">{product.name}</Link>
        </h3>
        <p className="truncate text-xs text-muted">{product.subtitle}</p>
        <div className="mt-3 flex items-center gap-1 text-xs font-extrabold text-gold">
          <Star size={14} fill="currentColor" /> {product.avg_rating ? Number(product.avg_rating).toFixed(1) : '—'}
          <span className="ml-1 font-medium text-muted">({product.review_count || 0} үнэлгээ)</span>
        </div>
        <div className="mt-3.5 flex items-end justify-between">
          <div className="flex min-w-0 flex-col sm:flex-row sm:items-center sm:gap-2.5">
            <strong className="text-base sm:text-lg">{money(product.price)}</strong>
            {product.old_price && <s className="text-xs text-muted">{money(product.old_price)}</s>}
          </div>
          <button onClick={() => onAdd(product)} disabled={outOfStock} aria-label={`${product.name} сагсанд нэмэх`}
            className="grid size-10 place-items-center rounded-full bg-sage-light text-sage transition hover:bg-sage hover:text-white disabled:opacity-40">
            <Plus size={20} />
          </button>
        </div>
        {outOfStock && <p className="mt-1 text-xs font-bold text-red-700">Дууссан</p>}
      </div>
    </article>
  )
}
