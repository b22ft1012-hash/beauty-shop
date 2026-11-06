import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { FREE_SHIPPING, money } from '../lib/format'
import { EmptyState, PageHeader } from '../components/ui'

export default function Checkout() {
  const { profile } = useAuth()
  const { items, total, clear } = useCart()
  const toast = useToast()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Профайлд утас хадгалсан бол автоматаар бөглөнө
  useEffect(() => {
    if (profile?.phone) Promise.resolve().then(() => setPhone((p) => p || profile.phone))
  }, [profile])

  function validate() {
    const next = {}
    if (!/^\d{8}$/.test(phone.trim())) next.phone = 'Утасны дугаар 8 оронтой байна'
    if (address.trim().length < 10) next.address = 'Хүргэлтийн хаягаа дэлгэрэнгүй бичнэ үү'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function placeOrder(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    // Зөвхөн id, тоо ширхэгийг илгээнэ — үнийг create_order() функц өгөгдлийн сангаас тооцоолно
    const payload = items.map((i) => ({ product_id: i.id, quantity: i.quantity }))
    const { data: orderId, error } = await supabase.rpc('create_order', { items: payload, p_phone: phone, p_address: address })
    setSaving(false)
    if (error) return toast.error(error.message)
    clear()
    toast.success(`Захиалга #${orderId} амжилттай үүслээ`)
    navigate('/orders')
  }

  if (items.length === 0) return (
    <div className="mx-auto max-w-xl px-5 py-20">
      <EmptyState title="Сагс хоосон байна" text="Захиалга хийхийн тулд бүтээгдэхүүн сонгоно уу." action={<Link to="/products" className="btn-primary">Бүтээгдэхүүн үзэх</Link>} />
    </div>
  )

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-12 md:px-7">
      <PageHeader eyebrow="CHECKOUT" title="Захиалга баталгаажуулах" />
      <div className="grid gap-8 md:grid-cols-[1.3fr_1fr]">
        <form onSubmit={placeOrder} className="card flex flex-col gap-4 p-6" noValidate>
          <h2 className="text-lg font-bold">Хүргэлтийн мэдээлэл</h2>
          <div>
            <label className="label" htmlFor="phone">Утасны дугаар</label>
            <input id="phone" inputMode="numeric" maxLength={8} className="input" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="99112233" />
            {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone}</p>}
          </div>
          <div>
            <label className="label" htmlFor="address">Хүргэлтийн хаяг</label>
            <textarea id="address" className="input min-h-24" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Дүүрэг, хороо, байр, орц, тоот" />
            {errors.address && <p className="mt-1 text-xs text-red-700">{errors.address}</p>}
          </div>
          <p className="rounded bg-amber-50 px-3 py-2 text-xs text-amber-800">Захиалга «Хүлээгдэж буй» төлөвтэй үүснэ. QPay төлбөрийн холболтыг Хамгаалалт-2-т нэмнэ.</p>
          <button className="btn-primary w-full py-4" disabled={saving}>{saving ? 'Захиалж байна...' : `Захиалах · ${money(total)}`}</button>
        </form>

        <aside className="card h-fit p-6">
          <h2 className="text-lg font-bold">Таны сагс</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 text-sm">
                <img src={i.image_url} alt="" className="size-14 rounded object-cover" />
                <span className="flex-1">{i.name} <span className="text-muted">× {i.quantity}</span></span>
                <strong>{money(i.price * i.quantity)}</strong>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex justify-between border-t border-line pt-4 text-sm"><span>Хүргэлт</span><span>{total >= FREE_SHIPPING ? 'Үнэгүй' : 'Тооцоогоор'}</span></div>
          <div className="mt-2 flex justify-between text-lg font-bold"><span>Нийт</span><span>{money(total)}</span></div>
        </aside>
      </div>
    </div>
  )
}
