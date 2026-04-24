import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔌 Inicializando Supabase con URL:', supabaseUrl ? 'Configurada' : 'FALTA')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están definidas en el archivo .env')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export const getSupabaseClient = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || ''
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  return createClient(url, key)
}