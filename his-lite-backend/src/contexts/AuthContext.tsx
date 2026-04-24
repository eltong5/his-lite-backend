import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
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

  const fetchProfile = async (userId: string, email: string) => {
    console.log('🚩 [DEBUG] fetchProfile iniciado con userId:', userId, 'email:', email);
    
    if (!userId) {
      console.log('🚩 [DEBUG] No hay userId, saliendo...');
      setLoading(false);
      return;
    }
    
    console.log('👤 Buscando perfil para:', email || 'Sin email');
    
    // Timeout más corto para evitar espera infinita
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ [DEBUG] Timeout en fetchProfile (3s), aplicando fallback');
      console.log('🚩 [DEBUG] Creando usuario fallback con role: patient');
      const fallbackUser = {
        id: userId,
        email: email || '',
        role: 'patient' as const,
        clinic_id: '00000000-0000-0000-0000-000000000001',
        first_name: 'Usuario',
        last_name: email ? email.split('@')[0] : 'Nuevo',
      };
      console.log('🚩 [DEBUG] Usuario fallback creado:', fallbackUser);
      setUser(fallbackUser);
      console.log('🚩 [DEBUG] setUser fallback ejecutado, setting loading false');
      setLoading(false);
    }, 3000);
    
    try {
      console.log('🚩 [DEBUG] Iniciando consulta a profiles...');
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('🚩 [DEBUG] Respuesta de Supabase - profile:', profile, 'error:', error);

      clearTimeout(timeoutId);

      if (error) {
        console.log('👤 [DEBUG] Error en consulta de perfil:', error.message);
        console.log('👤 [DEBUG] Error code:', error.code);
        console.log('👤 [DEBUG] Error details:', error.details);
        console.log('👤 [DEBUG] Aplicando fallback de paciente');
        
        const fallbackUser = {
          id: userId,
          email: email || '',
          role: 'patient' as const,
          clinic_id: '00000000-0000-0000-0000-000000000001',
          first_name: 'Usuario',
          last_name: email ? email.split('@')[0] : 'Nuevo',
        };
        console.log('🚩 [DEBUG] Usuario fallback (error) creado:', fallbackUser);
        setUser(fallbackUser);
      } else if (profile) {
        console.log('🚩 [DEBUG] Perfil encontrado:', profile);
        const userObj = {
          id: profile.id,
          email: email,
          role: profile.role,
          clinic_id: profile.clinic_id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          specialization: profile.specialization,
        };
        console.log('🚩 [DEBUG] Usuario objeto creado:', userObj);
        setUser(userObj);
        console.log('👤 Perfil cargado exitosamente para:', profile.role)
      } else {
        console.log('🚩 [DEBUG] No hay perfil ni error, aplicando fallback');
        const fallbackUser = {
          id: userId,
          email: email || '',
          role: 'patient' as const,
          clinic_id: '00000000-0000-0000-0000-000000000001',
          first_name: 'Usuario',
          last_name: email ? email.split('@')[0] : 'Nuevo',
        };
        setUser(fallbackUser);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('👤 [DEBUG] Error inesperado en fetchProfile:', err)
      console.log('🚩 [DEBUG] Aplicando fallback por error catch');
      // Fallback en caso de error
      const fallbackUser = {
        id: userId,
        email: email || '',
        role: 'patient' as const,
        clinic_id: '00000000-0000-0000-0000-000000000001',
        first_name: 'Usuario',
        last_name: email ? email.split('@')[0] : 'Nuevo',
      };
      setUser(fallbackUser);
    } finally {
      clearTimeout(timeoutId);
      console.log('✅ [DEBUG] Carga de perfil finalizada, setting loading false');
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      console.log('🔐 Iniciando inicialización de Auth...')
      
      // Añadir un timeout para evitar cuelgues infinitos
      const timeoutId = setTimeout(() => {
        setLoading((prevLoading) => {
          if (prevLoading) {
            console.warn('⚠️ La inicialización de Auth está tardando demasiado (timeout de 5s)')
            return false
          }
          return prevLoading
        })
      }, 5000)

      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error obteniendo sesión:', error.message)
        }

        if (mounted) {
          console.log('🔐 Sesión obtenida:', session ? 'Usuario autenticado' : 'No hay sesión activa')
          setSession(session)
          if (session?.user) {
            await fetchProfile(session.user.id, session.user.email || '')
          }
        }
      } catch (error) {
        console.error('💥 Error crítico en initializeAuth:', error)
      } finally {
        clearTimeout(timeoutId)
        if (mounted) {
          console.log('✅ Auth inicializado, quitando estado loading')
          setLoading(false)
        }
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return
      
      console.log('🔔 Cambio de estado de Auth (evento):', event)
      setSession(currentSession)
      
      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id, currentSession.user.email || '')
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      if (data.session) {
        setSession(data.session)
        await fetchProfile(data.session.user.id, data.session.user.email || '')
      }

      return { error: null }
    } catch (error) {
      console.error('🔐 SignIn error:', error)
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
    console.log('🚩 [DEBUG] Iniciando signUp para:', email, 'rol:', role)
    
    try {
      // Paso 1: Crear usuario en Supabase Auth
      console.log('🚩 [DEBUG] Creando usuario en Supabase Auth...')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, role },
        },
      })

      if (error) {
        console.error('🚩 [DEBUG] Error en Supabase Auth signUp:', error)
        throw error
      }

      console.log('🚩 [DEBUG] Usuario creado en Auth:', data.user?.id)

      if (data.user) {
        // Paso 2: Crear perfil en la base de datos
        console.log('🚩 [DEBUG] Creando perfil con RPC...')
        
        const { error: profileError } = await supabase.rpc('create_user_profile', {
          user_id: data.user.id,
          user_first_name: firstName,
          user_last_name: lastName,
          user_role: role,
          user_clinic_id: '00000000-0000-0000-0000-000000000001',
        })
        
        if (profileError) {
          console.error('🚩 [DEBUG] Error en create_user_profile RPC:', profileError)
          
          // Intento fallback: crear perfil directamente
          console.log('🚩 [DEBUG] Intentando crear perfil directamente...')
          const { error: fallbackError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              user_id: data.user.id,
              first_name: firstName,
              last_name: lastName,
              role: role,
              email: email,
              clinic_id: '00000000-0000-0000-0000-000000000001',
            })
          
          if (fallbackError) {
            console.error('🚩 [DEBUG] Error en fallback:', fallbackError)
            throw fallbackError
          } else {
            console.log('🚩 [DEBUG] Perfil creado con fallback exitosamente')
          }
        } else {
          console.log('🚩 [DEBUG] Perfil creado con RPC exitosamente')
        }
      }

      console.log('🚩 [DEBUG] SignUp completado exitosamente')
      return { error: null }
    } catch (error) {
      console.error('🚩 [DEBUG] SignUp error completo:', error)
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    console.log('🚩 [DEBUG] Iniciando signOut...')
    try {
      // Limpiar estado local primero
      setUser(null)
      setSession(null)
      
      // Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('🚩 [DEBUG] Error en Supabase signOut:', error)
      } else {
        console.log('🚩 [DEBUG] Sesión cerrada exitosamente')
      }
      
      // Forzar redirección inmediata
      console.log('🚩 [DEBUG] Redirigiendo a login...')
      window.location.replace('/login')
      
    } catch (error) {
      console.error('🚩 [DEBUG] Error general en signOut:', error)
      // Forzar redirección incluso si hay error
      window.location.replace('/login')
    }
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