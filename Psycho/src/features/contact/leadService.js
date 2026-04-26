import { supabase } from '../../lib/supabase'

export async function submitLead(payload) {
  if (!supabase) {
    return {
      data: null,
      error: new Error('Supabase client not configured'),
    }
  }

  return supabase.from('appointments_leads').insert(payload).select().single()
}
