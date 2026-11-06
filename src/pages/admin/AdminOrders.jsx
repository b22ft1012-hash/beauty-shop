import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'
import { ORDER_STATUS, formatDate, money } from '../../lib/format'
import { EmptyState, Spinner } from '../../components/ui'

export default function AdminOrders() {
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    let query = supabase.from('orders').select('*, profiles(full_name), order_items(quantity)').order('created_at', { ascending: false })
    if (filter) query = query.eq('status', filter)
    const { data } = await query
    setOrders(data || [])
    setLoading(false)
  }, [filter])

  useEffect(() => { Promise.resolve().then(load) }, [load])

  async function changeStatus(order, status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', order.id)
    if (error) return toast.error(error.message)
    toast.success(`#${order.id} → ${ORDER_STATUS[status].label}`)
    load()
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Захиалга</h1>
        <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Төлвөөр шүүх">
          <option value="">Бүх төлөв</option>
          {Object.entries(ORDER_STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
        </select>
      </div>
      {loading && <Spinner />}
      {!loading && orders.length === 0 && <div className="mt-6"><EmptyState title="Захиалга алга" /></div>}
      {!loading && orders.length > 0 && (
        <div className="mt-5 overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-cream text-left text-xs text-muted">
              <tr><th className="p-3">#</th><th>Огноо</th><th>Хэрэглэгч</th><th>Утас</th><th>Тоо</th><th>Дүн</th><th className="p-3">Төлөв</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-line">
                  <td className="p-3 font-bold">{o.id}</td>
                  <td>{formatDate(o.created_at)}</td>
                  <td>{o.profiles?.full_name || '—'}</td>
                  <td>{o.phone}</td>
                  <td>{o.order_items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td className="font-bold">{money(o.total)}</td>
                  <td className="p-3">
                    <select value={o.status} onChange={(e) => changeStatus(o, e.target.value)} className={`rounded-full border-0 px-2.5 py-1 text-xs font-bold ${ORDER_STATUS[o.status].className}`}>
                      {Object.entries(ORDER_STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
