import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-sage-dark text-white">
      <div className="mx-auto grid max-w-[1220px] grid-cols-2 gap-9 px-5 py-14 md:grid-cols-[2fr_1fr_1fr_1.3fr] md:px-7">
        <div className="col-span-2 md:col-span-1">
          <span className="text-3xl font-extrabold tracking-tighter">bloom<span className="text-blush">.</span></span>
          <p className="mt-5 text-xs text-white/70">Өөрийнхөөрөө гэрэлт. Өөртөө хайртай бай.</p>
        </div>
        <div className="flex flex-col gap-3.5 text-xs text-white/70">
          <strong className="mb-1 text-white">Дэлгүүр</strong>
          <Link to="/products">Бүтээгдэхүүн</Link>
          <Link to="/favorites">Хүслийн жагсаалт</Link>
          <Link to="/orders">Миний захиалга</Link>
        </div>
        <div className="flex flex-col gap-3.5 text-xs text-white/70">
          <strong className="mb-1 text-white">Мэдээлэл</strong>
          <Link to="/about">Бидний тухай</Link>
          <span>Хүргэлтийн нөхцөл</span>
        </div>
        <div className="flex flex-col gap-3.5 text-xs text-white/70">
          <strong className="mb-1 text-white">Холбоо барих</strong>
          <span>Улаанбаатар, Монгол</span>
          <span>Даваа–Ням · 10:00–20:00</span>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1220px] flex-col justify-between gap-2 border-t border-white/15 px-5 py-5 text-[11px] text-white/60 md:flex-row md:px-7">
        <span>© 2026 Bloom Beauty · SWE334 бие даалтын төсөл</span>
        <span>Зургууд: Unsplash</span>
      </div>
    </footer>
  )
}
