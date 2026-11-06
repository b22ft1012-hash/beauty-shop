import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from './ui'

// Нэвтрээгүй хэрэглэгчийг /login руу, админ биш хүнийг нүүр хуудас руу шилжүүлнэ
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin, profileLoading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (adminOnly && profileLoading) return <Spinner text="Эрх шалгаж байна..." />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return children
}
