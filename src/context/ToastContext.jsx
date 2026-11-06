import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'

const ToastContext = createContext(null)

// Богино мэдэгдэл (toast): toast.success('...'), toast.error('...')
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((text, type) => {
    const id = Date.now() + Math.random()
    setToasts((list) => [...list, { id, text, type }])
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 2800)
  }, [])

  const toast = {
    success: (text) => show(text, 'success'),
    error: (text) => show(text, 'error'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 flex-col gap-2" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-2.5 rounded-md px-5 py-3.5 text-sm text-white shadow-lg ${t.type === 'error' ? 'bg-red-700' : 'bg-sage-dark'}`}>
            {t.type === 'error' ? <XCircle size={17} /> : <CheckCircle2 size={17} />}
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
