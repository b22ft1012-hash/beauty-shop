import { useNavigate } from 'react-router-dom'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { FREE_SHIPPING, money } from '../lib/format'

// Баруун талаас гарч ирэх сагс
export default function CartDrawer() {
  const { items, open, setOpen, changeQty, remove, total, count } = useCart()
  const navigate = useNavigate()
  if (!open) return null

  function goCheckout() {
    setOpen(false)
    navigate('/checkout')
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl" aria-label="Худалдан авалтын сагс">
        <div className="flex items-center justify-between border-b border-line p-6">
          <h2 className="text-xl font-bold">Миний сагс <span className="text-blush">({count})</span></h2>
          <button onClick={() => setOpen(false)} aria-label="Хаах"><X /></button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center gap-2 text-center">
              <ShoppingBag size={46} className="text-sage/60" />
              <h3 className="font-bold">Таны сагс хоосон байна</h3>
              <p className="text-sm text-muted">Өөрт таалагдсан бүтээгдэхүүнээ сонгоорой.</p>
              <button className="btn-primary mt-4" onClick={() => { setOpen(false); navigate('/products') }}>Бүтээгдэхүүн үзэх</button>
            </div>
          ) : items.map((p) => (
            <div key={p.id} className="flex gap-4 border-b border-line py-4">
              <img src={p.image_url} alt={p.name} className="h-24 w-22 rounded object-cover" />
              <div className="flex flex-1 flex-col gap-2">
                <strong className="text-sm">{p.name}</strong>
                <span className="text-sm font-bold">{money(p.price)}</span>
                <div className="flex items-center gap-3 text-sm">
                  <button className="grid size-7 place-items-center rounded bg-cream" onClick={() => changeQty(p.id, -1)} aria-label="Нэгээр хасах"><Minus size={14} /></button>
                  {p.quantity}
                  <button className="grid size-7 place-items-center rounded bg-cream disabled:opacity-40" disabled={p.quantity >= p.stock} onClick={() => changeQty(p.id, 1)} aria-label="Нэгээр нэмэх"><Plus size={14} /></button>
                </div>
              </div>
              <button className="self-start text-muted hover:text-red-600" onClick={() => remove(p.id)} aria-label="Сагснаас хасах"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line p-6">
            <div className="flex justify-between text-base"><span>Нийт дүн</span><strong>{money(total)}</strong></div>
            <p className="mt-1 text-xs text-sage">
              {total >= FREE_SHIPPING ? 'Таны хүргэлт үнэгүй! ✨' : `Үнэгүй хүргэлтэд ${money(FREE_SHIPPING - total)} дутуу байна.`}
            </p>
            <button className="btn-primary mt-4 w-full" onClick={goCheckout}>Захиалга үргэлжлүүлэх <ArrowRight size={17} /></button>
          </div>
        )}
      </aside>
    </div>
  )
}
