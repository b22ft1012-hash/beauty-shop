import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'
import AuthCard from '../components/AuthCard'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword(form)
    setLoading(false)
    if (error) {
      return setError(error.message.includes('Email not confirmed') ? 'Имэйлээ баталгаажуулна уу (имэйлээ шалгаарай).' : 'Имэйл эсвэл нууц үг буруу байна.')
    }
    toast.success('Амжилттай нэвтэрлээ')
    navigate(location.state?.from || '/', { replace: true })
  }

  return (
    <AuthCard title="Нэвтрэх" subtitle="Bloom Beauty-д тавтай морил"
      footer={<>Бүртгэлгүй юу? <Link to="/register" className="font-bold text-sage">Бүртгүүлэх</Link></>}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div><label className="label" htmlFor="email">Имэйл</label><input id="email" name="email" type="email" required className="input" value={form.email} onChange={handleChange} autoComplete="email" /></div>
        <div>
          <div className="flex justify-between"><label className="label" htmlFor="password">Нууц үг</label><Link to="/forgot-password" className="text-xs font-bold text-sage">Нууц үгээ мартсан?</Link></div>
          <input id="password" name="password" type="password" required className="input" value={form.password} onChange={handleChange} autoComplete="current-password" />
        </div>
        {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}</button>
      </form>
    </AuthCard>
  )
}
