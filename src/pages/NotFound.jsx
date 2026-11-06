import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center px-5 py-24 text-center">
      <p className="text-7xl font-extrabold text-blush">404</p>
      <h1 className="mt-4 text-2xl font-bold">Хуудас олдсонгүй</h1>
      <p className="mt-2 text-sm text-muted">Таны хайсан хуудас байхгүй эсвэл зөөгдсөн байна.</p>
      <Link to="/" className="btn-primary mt-8">Нүүр хуудас руу</Link>
    </div>
  )
}
