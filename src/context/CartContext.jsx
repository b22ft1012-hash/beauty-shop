import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'bloom-cart'

function readCart() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}

// Сагсыг хөтөч дээр (localStorage) хадгална. Захиалга баталгаажихад өгөгдлийн санд бичигдэнэ.
export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* хадгалах боломжгүй */ }
  }, [items])

  function add(product) {
    setItems((list) => {
      const found = list.find((p) => p.id === product.id)
      if (found) return list.map((p) => (p.id === product.id ? { ...p, quantity: Math.min(p.quantity + 1, product.stock ?? 99) } : p))
      return [...list, { id: product.id, name: product.name, price: product.price, image_url: product.image_url, stock: product.stock, quantity: 1 }]
    })
  }

  function changeQty(id, delta) {
    setItems((list) => list
      .map((p) => (p.id === id ? { ...p, quantity: Math.min(p.quantity + delta, p.stock ?? 99) } : p))
      .filter((p) => p.quantity > 0))
  }

  const remove = (id) => setItems((list) => list.filter((p) => p.id !== id))
  const clear = () => setItems([])

  const count = useMemo(() => items.reduce((s, p) => s + p.quantity, 0), [items])
  const total = useMemo(() => items.reduce((s, p) => s + p.price * p.quantity, 0), [items])

  return (
    <CartContext.Provider value={{ items, add, changeQty, remove, clear, count, total, open, setOpen }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
