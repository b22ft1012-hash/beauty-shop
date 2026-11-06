import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { ORDER_STATUS, formatDate, money } from '../lib/format'
import { EmptyState, ErrorState, PageHeader, Spinner } from '../components/ui'

// Хэрэглэгчийн захиалгын түүх. RLS нь зөвхөн өөрийн захиалгыг буцаана.
export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    supabase.from('orders')
      .select('*, order_items(quantity, unit_price, products(name, image_url))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(true)
        setOrders(data || [])
        setLoading(false)
      })
  }, [user.id])

  return (
    <div className="mx-auto max-w-[900px] px-5 py-12 md:px-7">
      <PageHeader eyebrow="MY ORDERS" title="Миний захиалга" />
      {loading && <Spinner />}
      {error && <ErrorState />}
      {!loading && !error && orders.length === 0 && (
        <EmptyState title="Захиалга алга" text="Та одоогоор захиалга хийгээгүй байна." action={<Link to="/products" className="btn-primary">Дэлгүүр хэсэх</Link>} />
      )}
      <div className="flex flex-col gap-4">
        {orders.map((o) => (
          <article key={o.id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><strong>Захиалга #{o.id}</strong><span className="ml-3 text-xs text-muted">{formatDate(o.created_at)}</span></div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${ORDER_STATUS[o.status].className}`}>{ORDER_STATUS[o.status].label}</span>
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              {o.order_items.map((it, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm">
                  <img src={it.products?.image_url} alt="" className="size-11 rounded object-cover" />
                  <span className="flex-1">{it.products?.name} <span className="text-muted">× {it.quantity}</span></span>
                  <span>{money(it.unit_price * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-line pt-3 text-sm"><span className="text-muted">{o.address}</span><strong>{money(o.total)}</strong></div>
          </article>
        ))}
      </div>
    </div>
  )
}
