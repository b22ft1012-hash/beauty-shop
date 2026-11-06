// Нэвтрэлтийн хуудсуудын нийтлэг хүрээ
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="flex justify-center bg-cream px-5 py-16">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 border-t border-line pt-5 text-center text-sm text-muted">{footer}</div>}
      </div>
    </div>
  )
}
