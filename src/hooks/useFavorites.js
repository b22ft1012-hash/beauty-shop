import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

// Хэрэглэгчийн хүслийн жагсаалт (favorites хүснэгт — N:M холбоо)
export function useFavorites() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [ids, setIds] = useState([])

  useEffect(() => {
    if (!user) { Promise.resolve().then(() => setIds([])); return }
    supabase.from('favorites').select('product_id').eq('user_id', user.id)
      .then(({ data }) => setIds((data || []).map((f) => f.product_id)))
  }, [user])

  const toggle = useCallback(async (product) => {
    if (!user) {
      toast.error('Хүслийн жагсаалт ашиглахын тулд нэвтэрнэ үү')
      navigate('/login')
      return
    }
    const isFav = ids.includes(product.id)
    const { error } = isFav
      ? await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', product.id)
      : await supabase.from('favorites').insert({ user_id: user.id, product_id: product.id })
    if (error) return toast.error('Алдаа гарлаа: ' + error.message)
    setIds((list) => (isFav ? list.filter((id) => id !== product.id) : [...list, product.id]))
    toast.success(isFav ? 'Хүслийн жагсаалтаас хаслаа' : 'Хүслийн жагсаалтад нэмлээ')
  }, [user, ids, toast, navigate])

  return { ids, toggle }
}
