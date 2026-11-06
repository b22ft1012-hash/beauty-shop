import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart } from 'lucide-react'

const tabs = [
  { to: '/admin', label: 'Тойм', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Бүтээгдэхүүн', icon: Package },
  { to: '/admin/orders', label: 'Захиалга', icon: ShoppingCart },
]

export default function AdminLayout() {
  return (
    <div className="mx-auto grid max-w-[1220px] gap-8 px-5 py-10 md:grid-cols-[200px_1fr] md:px-7">
      <aside>
        <p className="eyebrow mb-4">ADMIN</p>
        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex shrink-0 items-center gap-2.5 rounded px-3 py-2.5 text-sm font-bold ${isActive ? 'bg-sage text-white' : 'text-ink/70 hover:bg-cream'}`}>
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="min-w-0"><Outlet /></section>
    </div>
  )
}
