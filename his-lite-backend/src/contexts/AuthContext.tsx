import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, getSupabaseClient } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types'

interface AuthUser {
  id: string
  email: string
  role: UserRole
  clinic_id: string
  first_name: string
  last_name: string
  avatar_url?: string
  specialization?: string
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, role: UserRole, firstName: string, lastName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  hasRole: (roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    console.log('👤 fetchProfile para userId:', userId)
    try {
      console.log('👤 Ejecutando consulta a profiles...')
      
      // Intentar primero con la consulta normal (respeta RLS)
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      // Si falla por RLS, intentar con el método alternativo
      if (error && (error.code === 'PGRST116' || error.message?.includes('permission'))) {
        console.log('👤 Intentando consulta alternativa...')
        const { data: altProfile, error: altError } = await supabase
          .from('profiles')
          .select('id, clinic_id, role, first_name, last_name, avatar_url, specialization')
          .eq('id', userId)
          .maybeSingle()
        
        profile = altProfile
        error = altError
      }

      console.log('👤 Consulta completada, resultado:', { profile, error })

      if (error) {
        console.error('👤 Error en consulta:', error)
        // Si es error de RLS o no encontrado, creamos un perfil básico
        if (error.code === 'PGRST116' || error.code === '42501') {
          console.warn('👤 Error de permisos o no encontrado, usando perfil básico')
          setUser({
            id: userId,
            email: '',
            role: 'patient',
            clinic_id: '00000000-0000-0000-0000-000000000001',
            first_name: 'Usuario',
            last_name: 'Temporal',
          })
          return
        }
        throw error
      }

      if (profile) {
        console.log('👤 Perfil encontrado, actualizando user state')
        setUser({
          id: profile.id,
          email: session?.user.email || '',
          role: profile.role,
          clinic_id: profile.clinic_id,
          first_name: profile.first_name,
          last_name: profile.last_name,
        })
        console.log('👤 User actualizado:', { id: profile.id, role: profile.role })
      } else {
        console.warn('👤 No se encontró perfil para userId:', userId)
        // Crear perfil básico si no existe
        setUser({
          id: userId,
          email: '',
          role: 'patient',
          clinic_id: '00000000-0000-0000-0000-000000000001',
          first_name: 'Usuario',
          last_name: 'Temporal',
        })
      }
    } catch (error) {
      console.error('👤 fetchProfile catch:', error)
      // En caso de error, usamos un perfil básico para permitir el login
      setUser({
        id: userId,
        email: '',
        role: 'patient',
        clinic_id: '00000000-0000-0000-0000-000000000001',
        first_name: 'Usuario',
        last_name: 'Temporal',
      })
    }
  }

  useEffect(() => {
    // Mount once
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session && mounted) {
          setSession(session)
          await fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('🔔 Auth state changed:', event);
      setSession(session)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
      }
      
      setLoading(false)
    })

    return () => {
      mounted = false;
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 SignIn intentando con:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('🔐 SignIn resultado:', { data, error })

      if (error) {
        console.error('🔐 SignIn error:', error)
        throw error
      }

      if (data.session) {
        console.log('🔐 Session creada, user id:', data.session.user.id)
        setSession(data.session)
        console.log('🔐 Llamando a fetchProfile...')
        await fetchProfile(data.session.user.id)
        console.log('🔐 fetchProfile completado')
      }

      return { error: null }
    } catch (error) {
      console.error('🔐 SignIn catch:', error)
      return { error: error as Error }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    firstName: string,
    lastName: string
  ) => {
    try {
      console.log('Starting sign up for:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role,
          },
        },
      })

      console.log('Auth signUp result:', { data, error })

      if (error) {
        console.error('Auth error:', error)
        throw error
      }

      if (data.user) {
        console.log('Creating profile for user:', data.user.id)
        
        const { error: profileError } = await supabase.rpc('create_user_profile', {
          user_id: data.user.id,
          user_first_name: firstName,
          user_last_name: lastName,
          user_role: role,
          user_clinic_id: '00000000-0000-0000-0000-000000000001',
        })
        
        console.log('Profile creation result:', { error: profileError })
        
        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw profileError
        }
      }

      return { error: null }
    } catch (error) {
      console.error('SignUp catch error:', error)
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false
    return roles.includes(user.role)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}