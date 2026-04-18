import { ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { isSupabaseConfigured } from '@/integrations/supabase/client'

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return
    }
    
    const timer = setTimeout(() => {
      setShowFallback(true)
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [])

  if (!isSupabaseConfigured) {
    return <>{children}</>
  }

  if (loading && !showFallback) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  if (loading && showFallback) {
    return <>{children}</>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute