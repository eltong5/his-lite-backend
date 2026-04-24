
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function upgradeUser() {
  const email = 'eltonguerrero@gmail.com'
  console.log(`🚀 Intentando subir de rango al usuario: ${email}`)

  // 1. Buscamos el ID en profiles (si ya se creó como fallback)
  const { data: profile, error: searchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('first_name', 'Usuario') // El nombre por defecto que pusimos en el fallback
    .limit(1)
    .single()

  if (searchError) {
    console.log('⚠️ No se encontró el perfil en la base de datos pública. Por favor, asegúrate de haber iniciado sesión al menos una vez.')
    return
  }

  const userId = profile.id
  console.log(`🆔 ID de usuario encontrado: ${userId}`)

  // 2. Intentamos actualizar el rol. 
  // Nota: Esto solo funcionará si RLS lo permite. Si no, tendrás que hacerlo manualmente en el portal de Supabase.
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId)

  if (updateError) {
    console.error('❌ Error al actualizar rol:', updateError.message)
    console.log('💡 Sugerencia: Ve al portal de Supabase -> SQL Editor y ejecuta:')
    console.log(`UPDATE profiles SET role = 'admin' WHERE id = '${userId}';`)
  } else {
    console.log('✅ ¡Felicidades! Ahora eres ADMIN. Por favor, cierra sesión y vuelve a entrar en la aplicación.')
  }
}

upgradeUser()
