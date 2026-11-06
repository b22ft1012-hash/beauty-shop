import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ORDER_STATUS, formatDate, money } from '../../lib/format'
import { Spinner } from '../../components/ui'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    async function load() {
      const [products, users, orders] = await Promise.all([
        supabase.from('products').select('id, stock'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, status, total, created_at, phone').order('created_at', { ascending: false }),
      ])
      const list = orders.data || []
      setStats({
        products: products.data?.length || 0,
        lowStock: (products.data || []).filter((p) => p.stock <= 5).length,
        users: users.count || 0,
        orders: list.length,
        revenue: list.filter((o) => o.status === 'paid' || o.status === 'shipped').reduce((s, o) => s + o.total, 0),
        byStatus: Object.keys(ORDER_STATUS).map((key) => ({ key, count: list.filter((o) => o.status === key).length })),
      })
      setRecent(list.slice(0, 5))
    }
    load()
  }, [])

  if (!stats) return <Spinner />
  const maxStatus = Math.max(1, ...stats.byStatus.map((s) => s.count))

  return (
    <div>
      <h1 className="text-2xl font-bold">Тойм</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[['Бүтээгдэхүүн', stats.products], ['Хэрэглэгч', stats.users], ['Захиалга', stats.orders], ['Орлого (төлөгдсөн)', money(stats.revenue)]].map(([label, value]) => (
          <div key={label} className="card p-5"><p className="text-xs text-muted">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>
        ))}
      </div>
      {stats.lowStock > 0 && <p className="mt-4 rounded bg-amber-50 px-4 py-3 text-sm text-amber-800">⚠️ {stats.lowStock} бүтээгдэхүүний нөөц 5-аас бага байна. <Link to="/admin/products" className="font-bold underline">Шалгах</Link></p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-bold">Захиалга төлвөөр</h2>
          <div className="mt-4 flex flex-col gap-3">
            {stats.byStatus.map((s) => (
              <div key={s.key} className="grid grid-cols-[110px_1fr_30px] items-center gap-3 text-sm">
                <span>{ORDER_STATUS[s.key].label}</span>
                <div className="h-3 rounded bg-cream"><div className="h-full rounded bg-sage" style={{ width: `${(s.count / maxStatus) * 100}%` }} /></div>
                <strong className="text-right">{s.count}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-bold">Сүүлийн захиалгууд</h2>
          {recent.length === 0 ? <p className="mt-4 text-sm text-muted">Захиалга алга.</p> : (
            <table className="mt-3 w-full text-sm">
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-b border-line last:border-0">
                    <td className="py-2.5 font-bold">#{o.id}</td>
                    <td className="text-muted">{formatDate(o.created_at)}</td>
                    <td><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${ORDER_STATUS[o.status].className}`}>{ORDER_STATUS[o.status].label}</span></td>
                    <td className="text-right">{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
