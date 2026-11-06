// Устгахаас өмнө баталгаажуулах цонх
export default function ConfirmDialog({ open, title, text, confirmText = 'Устгах', onConfirm, onCancel, busy }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm text-muted">{text}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-outline" onClick={onCancel} disabled={busy}>Болих</button>
          <button className="btn bg-red-600 text-white hover:bg-red-700" onClick={onConfirm} disabled={busy}>
            {busy ? 'Түр хүлээнэ үү...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
