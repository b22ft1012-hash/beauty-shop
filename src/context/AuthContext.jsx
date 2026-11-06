import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Нэвтэрсэн хэрэглэгчийн төлвийг хянах
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = useCallback(async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    setProfile(data)
  }, [])

  // Хэрэглэгч солигдох бүрт profile (role)-ийг татна
  useEffect(() => {
    if (user) loadProfile(user.id)
    else Promise.resolve().then(() => setProfile(null))
  }, [user, loadProfile])

  const value = {
    user,
    profile,
    loading,
    profileLoading: Boolean(user) && !profile,
    isAdmin: profile?.role === 'admin',
    refreshProfile: () => user && loadProfile(user.id),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
