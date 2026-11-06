import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'
import AuthCard from '../components/AuthCard'

export default function Register() {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Формын оролтыг шалгах (validation)
  function validate() {
    const next = {}
    if (form.fullName.trim().length < 2) next.fullName = 'Нэрээ оруулна уу'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Имэйл хаяг буруу байна'
    if (form.password.length < 6) next.password = 'Нууц үг дор хаяж 6 тэмдэгттэй байна'
    if (form.password !== form.confirm) next.confirm = 'Нууц үг таарахгүй байна'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName.trim() } },
    })
    setLoading(false)
    if (error) return setErrors({ form: error.message.includes('registered') ? 'Энэ имэйлээр бүртгэл үүссэн байна.' : error.message })
    // Имэйл баталгаажуулалт асаалттай бол session байхгүй ирнэ
    if (!data.session) return setSent(true)
    toast.success('Бүртгэл амжилттай үүслээ')
    navigate('/')
  }

  if (sent) return (
    <AuthCard title="Имэйлээ шалгана уу" subtitle={`${form.email} хаяг руу баталгаажуулах холбоос илгээлээ.`}
      footer={<Link to="/login" className="font-bold text-sage">Нэвтрэх хуудас руу</Link>} />
  )

  const field = (name, label, type = 'text', autoComplete) => (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} className="input" value={form[name]} onChange={handleChange} autoComplete={autoComplete} aria-invalid={Boolean(errors[name])} />
      {errors[name] && <p className="mt-1 text-xs text-red-700">{errors[name]}</p>}
    </div>
  )

  return (
    <AuthCard title="Бүртгүүлэх" subtitle="Захиалга хийж, хүслийн жагсаалтаа хадгалаарай"
      footer={<>Бүртгэлтэй юу? <Link to="/login" className="font-bold text-sage">Нэвтрэх</Link></>}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {field('fullName', 'Нэр', 'text', 'name')}
        {field('email', 'Имэйл', 'email', 'email')}
        {field('password', 'Нууц үг', 'password', 'new-password')}
        {field('confirm', 'Нууц үг давтах', 'password', 'new-password')}
        {errors.form && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}</button>
      </form>
    </AuthCard>
  )
}
