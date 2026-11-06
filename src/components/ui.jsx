import { AlertTriangle, Inbox, Loader2 } from 'lucide-react'

// Ачаалж буй, хоосон, алдааны төлвийг бүх хуудсанд нэг ижил харуулна

export function Spinner({ text = 'Ачаалж байна...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-muted">
      <Loader2 className="animate-spin" size={20} /> {text}
    </div>
  )
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg bg-cream px-6 py-14 text-center">
      <Inbox size={40} className="text-sage/60" />
      <h3 className="text-base font-bold">{title}</h3>
      {text && <p className="max-w-sm text-sm text-muted">{text}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ text = 'Өгөгдөл татахад алдаа гарлаа.', onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg bg-red-50 px-6 py-10 text-center text-red-800">
      <AlertTriangle size={32} />
      <p className="text-sm">{text}</p>
      {onRetry && <button className="btn-outline" onClick={onRetry}>Дахин оролдох</button>}
    </div>
  )
}

export function PageHeader({ eyebrow, title, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
      </div>
      {children}
    </div>
  )
}
