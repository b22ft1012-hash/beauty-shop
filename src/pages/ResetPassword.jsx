import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'
import AuthCard from '../components/AuthCard'

// Имэйлийн холбоосоор орж ирэхэд Supabase түр session үүсгэнэ, тэгээд шинэ нууц үг тохируулна
export default function ResetPassword() {
  const navigate = useNavigate()
  const toast = useToast()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) return setError('Нууц үг дор хаяж 6 тэмдэгттэй байна')
    if (password !== confirm) return setError('Нууц үг таарахгүй байна')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) return setError('Холбоосны хугацаа дууссан байж магадгүй. Дахин сэргээх хүсэлт илгээнэ үү.')
    toast.success('Нууц үг шинэчлэгдлээ')
    navigate('/')
  }

  return (
    <AuthCard title="Шинэ нууц үг" subtitle="Шинэ нууц үгээ оруулна уу.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div><label className="label" htmlFor="pw">Шинэ нууц үг</label><input id="pw" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></div>
        <div><label className="label" htmlFor="pw2">Давтах</label><input id="pw2" type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" /></div>
        {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Хадгалж байна...' : 'Хадгалах'}</button>
      </form>
    </AuthCard>
  )
}
