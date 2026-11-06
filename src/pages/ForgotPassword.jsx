import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AuthCard from '../components/AuthCard'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Имэйлээр ирэх холбоос /reset-password хуудас руу буцаана
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })
    setLoading(false)
    if (error) return setError(error.message)
    setSent(true)
  }

  return (
    <AuthCard title="Нууц үг сэргээх" subtitle="Бүртгэлтэй имэйлээ оруулбал сэргээх холбоос илгээнэ."
      footer={<Link to="/login" className="font-bold text-sage">Нэвтрэх хуудас руу буцах</Link>}>
      {sent ? (
        <p className="rounded bg-sage-light px-4 py-3 text-sm text-sage-dark">{email} хаяг руу нууц үг сэргээх холбоос илгээлээ. Имэйлээ шалгана уу.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div><label className="label" htmlFor="email">Имэйл</label><input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Илгээж байна...' : 'Холбоос илгээх'}</button>
        </form>
      )}
    </AuthCard>
  )
}
