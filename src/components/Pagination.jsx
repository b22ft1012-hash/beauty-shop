import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1)
  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Хуудаслалт">
      <button className="grid size-9 place-items-center rounded border border-line disabled:opacity-40" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Өмнөх хуудас">
        <ChevronLeft size={17} />
      </button>
      {pages.map((p) => (
        <button key={p} onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}
          className={`size-9 rounded text-sm font-bold ${p === page ? 'bg-sage text-white' : 'border border-line hover:bg-cream'}`}>
          {p}
        </button>
      ))}
      <button className="grid size-9 place-items-center rounded border border-line disabled:opacity-40" disabled={page === pageCount} onClick={() => onChange(page + 1)} aria-label="Дараагийн хуудас">
        <ChevronRight size={17} />
      </button>
    </nav>
  )
}
