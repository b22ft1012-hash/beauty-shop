import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'
import { money } from '../../lib/format'
import { EmptyState, ErrorState, Spinner } from '../../components/ui'
import ConfirmDialog from '../../components/ConfirmDialog'

export default function AdminProducts() {
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('product_list').select('*').order('created_at', { ascending: false })
    setError(Boolean(error))
    setProducts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { Promise.resolve().then(load) }, [load])

  async function toggleActive(p) {
    const { error } = await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id)
    if (error) return toast.error(error.message)
    toast.success(p.is_active ? 'Бүтээгдэхүүнийг нууллаа' : 'Бүтээгдэхүүнийг нийтэллээ')
    load()
  }

  async function confirmDelete() {
    setDeleting(true)
    const { error } = await supabase.from('products').delete().eq('id', toDelete.id)
    setDeleting(false)
    setToDelete(null)
    // Захиалгад орсон бүтээгдэхүүнийг устгах боломжгүй (foreign key) — оронд нь нууна
    if (error) return toast.error(error.code === '23503' ? 'Захиалгад орсон тул устгах боломжгүй. "Нуух" товчийг ашиглана уу.' : error.message)
    toast.success('Бүтээгдэхүүн устгагдлаа')
    load()
  }

  const filtered = products.filter((p) => `${p.name} ${p.brand_name}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Бүтээгдэхүүн ({products.length})</h1>
        <Link to="/admin/products/new" className="btn-primary"><Plus size={17} /> Шинэ бүтээгдэхүүн</Link>
      </div>
      <input className="input mt-5 max-w-sm" placeholder="Нэр, брэндээр хайх..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {loading && <Spinner />}
      {error && <div className="mt-6"><ErrorState onRetry={load} /></div>}
      {!loading && !error && filtered.length === 0 && <div className="mt-6"><EmptyState title="Бүтээгдэхүүн олдсонгүй" /></div>}

      {!loading && filtered.length > 0 && (
        <div className="mt-5 overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-cream text-left text-xs text-muted">
              <tr><th className="p-3">Бүтээгдэхүүн</th><th>Ангилал</th><th>Үнэ</th><th>Нөөц</th><th>Төлөв</th><th className="p-3 text-right">Үйлдэл</th></tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image_url} alt="" className="size-11 rounded object-cover" />
                      <div><strong className="block">{p.name}</strong><span className="text-xs text-muted">{p.brand_name}</span></div>
                    </div>
                  </td>
                  <td>{p.category_name}</td>
                  <td>{money(p.price)}</td>
                  <td className={p.stock <= 5 ? 'font-bold text-amber-700' : ''}>{p.stock}</td>
                  <td>
                    <button onClick={() => toggleActive(p)} className={`rounded-full px-2.5 py-1 text-xs font-bold ${p.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.is_active ? 'Нийтлэгдсэн' : 'Нуусан'}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/products/${p.id}/edit`} className="grid size-8 place-items-center rounded bg-cream hover:bg-sage-light" aria-label="Засах"><Pencil size={15} /></Link>
                      <button onClick={() => setToDelete(p)} className="grid size-8 place-items-center rounded bg-red-50 text-red-700 hover:bg-red-100" aria-label="Устгах"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog open={Boolean(toDelete)} busy={deleting} title="Бүтээгдэхүүн устгах уу?"
        text={`"${toDelete?.name}" бүтээгдэхүүнийг бүр мөсөн устгана. Энэ үйлдлийг буцаах боломжгүй.`}
        onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  )
}
