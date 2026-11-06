import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Heart, LogOut, Menu, Package, Search, Shield, ShoppingBag, UserRound, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { FREE_SHIPPING, money } from '../lib/format'

const links = [
  { to: '/', label: 'Нүүр', end: true },
  { to: '/products', label: 'Бүтээгдэхүүн' },
  { to: '/about', label: 'Бидний тухай' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { user, profile, isAdmin, signOut } = useAuth()
  const { count, setOpen } = useCart()
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    navigate(`/products?q=${encodeURIComponent(query.trim())}`)
    setMenuOpen(false)
  }

  async function handleLogout() {
    await signOut()
    setAccountOpen(false)
    navigate('/')
  }

  const navClass = ({ isActive }) => `text-xs font-bold transition hover:text-blush ${isActive ? 'text-blush' : ''}`

  return (
    <>
      <div className="flex h-9 items-center justify-center gap-4 bg-sage text-[11px] font-semibold tracking-wide text-white">
        ✨ {money(FREE_SHIPPING)}-өөс дээш захиалгад хүргэлт ҮНЭГҮЙ
      </div>
      <header className="sticky top-0 z-30 border-b border-line bg-white">
        <div className="mx-auto flex h-20 max-w-[1220px] items-center justify-between gap-6 px-5 md:px-7">
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Цэс нээх">
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>

          <Link to="/" className="flex flex-col leading-none" onClick={() => setMenuOpen(false)}>
            <span className="text-3xl font-extrabold tracking-tighter">bloom<span className="text-blush">.</span></span>
            <small className="mt-1.5 font-label text-[8px] font-bold tracking-[0.35em] text-muted">BEAUTY & SKINCARE</small>
          </Link>

          <nav className={`${menuOpen ? 'flex' : 'hidden'} absolute inset-x-0 top-20 flex-col gap-5 bg-white p-6 shadow-lg md:static md:ml-10 md:flex md:flex-row md:gap-8 md:bg-transparent md:p-0 md:shadow-none`}>
            {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={navClass} onClick={() => setMenuOpen(false)}>{l.label}</NavLink>)}
            <form onSubmit={handleSearch} className="flex h-10 items-center gap-2 rounded bg-cream px-3 text-muted md:hidden">
              <Search size={16} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Бүтээгдэхүүн хайх..." className="w-full bg-transparent text-sm outline-none" />
            </form>
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden h-10 w-52 items-center gap-2.5 rounded bg-cream px-3 text-muted lg:flex">
              <Search size={16} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Бүтээгдэхүүн хайх..." aria-label="Бүтээгдэхүүн хайх" className="w-full bg-transparent text-xs outline-none" />
            </form>

            {user ? (
              <div className="relative">
                <button onClick={() => setAccountOpen(!accountOpen)} aria-label="Хэрэглэгчийн цэс" className="grid size-9 place-items-center rounded-full bg-blush-light text-sm font-bold text-blush">
                  {(profile?.full_name || user.email).charAt(0).toUpperCase()}
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-12 w-56 rounded-lg border border-line bg-white p-2 text-sm shadow-xl" onMouseLeave={() => setAccountOpen(false)}>
                    <p className="truncate px-3 py-2 text-xs text-muted">{user.email}</p>
                    <Link to="/orders" className="flex items-center gap-2.5 rounded px-3 py-2 hover:bg-cream" onClick={() => setAccountOpen(false)}><Package size={16} /> Миний захиалга</Link>
                    <Link to="/favorites" className="flex items-center gap-2.5 rounded px-3 py-2 hover:bg-cream" onClick={() => setAccountOpen(false)}><Heart size={16} /> Хүслийн жагсаалт</Link>
                    {isAdmin && <Link to="/admin" className="flex items-center gap-2.5 rounded px-3 py-2 font-bold text-sage hover:bg-cream" onClick={() => setAccountOpen(false)}><Shield size={16} /> Админ самбар</Link>}
                    <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-red-700 hover:bg-red-50"><LogOut size={16} /> Гарах</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" aria-label="Нэвтрэх"><UserRound size={22} /></Link>
            )}

            <button className="relative" onClick={() => setOpen(true)} aria-label="Сагс">
              <ShoppingBag size={22} />
              {count > 0 && <span className="absolute -right-2 -top-2 grid size-[17px] place-items-center rounded-full bg-blush text-[10px] text-white">{count}</span>}
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
