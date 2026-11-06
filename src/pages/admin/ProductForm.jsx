import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ImagePlus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'
import { Spinner } from '../../components/ui'

const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
const empty = { name: '', subtitle: '', description: '', category_id: '', brand_id: '', price: '', old_price: '', stock: '', tag: '', is_active: true }

// Нэг форм: шинээр нэмэх (/admin/products/new) болон засах (/admin/products/:id/edit)
export default function ProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState(empty)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [imageUrl, setImageUrl] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('categories').select('id, name').order('name').then(({ data }) => setCategories(data || []))
    supabase.from('brands').select('id, name').order('name').then(({ data }) => setBrands(data || []))
  }, [])

  // Засах үед хуучин утгыг ачаална
  useEffect(() => {
    if (!isEdit) return
    supabase.from('products').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      if (data) {
        setForm({
          name: data.name, subtitle: data.subtitle || '', description: data.description || '',
          category_id: String(data.category_id), brand_id: data.brand_id ? String(data.brand_id) : '',
          price: String(data.price), old_price: data.old_price ? String(data.old_price) : '',
          stock: String(data.stock), tag: data.tag || '', is_active: data.is_active,
        })
        setImageUrl(data.image_url || '')
      }
      setLoading(false)
    })
  }, [id, isEdit])

  // Сонгосон зургийн урьдчилан харах URL-ийг үүсгэж, дараа нь чөлөөлнө
  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    Promise.resolve().then(() => setPreview(url))
    return () => URL.revokeObjectURL(url)
  }, [file])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  function handleFile(e) {
    const selected = e.target.files[0]
    if (!selected) return
    if (!ALLOWED.includes(selected.type)) return setErrors({ ...errors, image: 'Зөвхөн JPG, PNG, WEBP зураг оруулна уу' })
    if (selected.size > MAX_SIZE) return setErrors({ ...errors, image: 'Зургийн хэмжээ 2MB-аас бага байх ёстой' })
    setErrors({ ...errors, image: undefined })
    setFile(selected)
  }

  function validate() {
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Нэр дор хаяж 2 тэмдэгттэй байна'
    if (!form.category_id) next.category_id = 'Ангилал сонгоно уу'
    if (!(Number(form.price) > 0)) next.price = 'Үнэ 0-ээс их байна'
    if (form.old_price && Number(form.old_price) <= Number(form.price)) next.old_price = 'Хуучин үнэ одоогийн үнээс их байх ёстой'
    if (form.stock === '' || Number(form.stock) < 0 || !Number.isInteger(Number(form.stock))) next.stock = 'Нөөц 0 эсвэл түүнээс их бүхэл тоо'
    if (!file && !imageUrl) next.image = 'Зураг оруулна уу'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return toast.error('Формын алдааг засна уу')
    setSaving(true)

    // 1. Шинэ зураг сонгосон бол Storage руу оруулна
    let finalUrl = imageUrl
    if (file) {
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('product-images').upload(path, file)
      if (error) { setSaving(false); return toast.error('Зураг оруулахад алдаа гарлаа: ' + error.message) }
      finalUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
    }

    // 2. Өгөгдөл бэлтгэх
    const payload = {
      name: form.name.trim(),
      subtitle: form.subtitle.trim() || null,
      description: form.description.trim() || null,
      category_id: Number(form.category_id),
      brand_id: form.brand_id ? Number(form.brand_id) : null,
      price: Number(form.price),
      old_price: form.old_price ? Number(form.old_price) : null,
      stock: Number(form.stock),
      tag: form.tag.trim() || null,
      is_active: form.is_active,
      image_url: finalUrl,
    }

    // 3. Хадгалах (RLS: зөвхөн админ бичих эрхтэй)
    const { error } = isEdit
      ? await supabase.from('products').update(payload).eq('id', id)
      : await supabase.from('products').insert(payload)
    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success(isEdit ? 'Бүтээгдэхүүн шинэчлэгдлээ' : 'Бүтээгдэхүүн нэмэгдлээ')
    navigate('/admin/products')
  }

  if (loading) return <Spinner />

  const err = (name) => errors[name] && <p className="mt-1 text-xs text-red-700">{errors[name]}</p>

  return (
    <div>
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-sage"><ArrowLeft size={15} /> Буцах</Link>
      <h1 className="text-2xl font-bold">{isEdit ? 'Бүтээгдэхүүн засах' : 'Шинэ бүтээгдэхүүн'}</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="card grid gap-4 p-6 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="label" htmlFor="name">Нэр *</label><input id="name" name="name" className="input" value={form.name} onChange={handleChange} />{err('name')}</div>
          <div className="sm:col-span-2"><label className="label" htmlFor="subtitle">Товч тайлбар</label><input id="subtitle" name="subtitle" className="input" value={form.subtitle} onChange={handleChange} /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="description">Дэлгэрэнгүй тайлбар</label><textarea id="description" name="description" rows={4} className="input" value={form.description} onChange={handleChange} /></div>
          <div>
            <label className="label" htmlFor="category_id">Ангилал *</label>
            <select id="category_id" name="category_id" className="input" value={form.category_id} onChange={handleChange}>
              <option value="">— Сонгох —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>{err('category_id')}
          </div>
          <div>
            <label className="label" htmlFor="brand_id">Брэнд</label>
            <select id="brand_id" name="brand_id" className="input" value={form.brand_id} onChange={handleChange}>
              <option value="">— Сонгох —</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div><label className="label" htmlFor="price">Үнэ (₮) *</label><input id="price" name="price" type="number" min="1" className="input" value={form.price} onChange={handleChange} />{err('price')}</div>
          <div><label className="label" htmlFor="old_price">Хуучин үнэ (₮)</label><input id="old_price" name="old_price" type="number" min="1" className="input" value={form.old_price} onChange={handleChange} />{err('old_price')}</div>
          <div><label className="label" htmlFor="stock">Нөөц *</label><input id="stock" name="stock" type="number" min="0" className="input" value={form.stock} onChange={handleChange} />{err('stock')}</div>
          <div><label className="label" htmlFor="tag">Шошго</label><input id="tag" name="tag" className="input" placeholder="NEW, -20%" value={form.tag} onChange={handleChange} /></div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="size-4 accent-sage" /> Дэлгүүрт нийтлэх</label>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card p-4">
            <p className="label">Зураг *</p>
            <div className="aspect-square overflow-hidden rounded bg-cream">
              {(preview || imageUrl)
                ? <img src={preview || imageUrl} alt="Урьдчилан харах" className="size-full object-cover" />
                : <div className="grid size-full place-items-center text-muted"><ImagePlus size={34} /></div>}
            </div>
            <label className="btn-outline mt-3 w-full cursor-pointer">
              <ImagePlus size={16} /> Зураг сонгох
              <input type="file" accept={ALLOWED.join(',')} onChange={handleFile} hidden />
            </label>
            <p className="mt-2 text-xs text-muted">JPG, PNG, WEBP · 2MB хүртэл</p>
            {err('image')}
          </div>
          <button className="btn-primary w-full py-4" disabled={saving}>{saving ? 'Хадгалж байна...' : 'Хадгалах'}</button>
        </div>
      </form>
    </div>
  )
}
