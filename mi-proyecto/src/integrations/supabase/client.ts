import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("[Supabase] VITE_SUPABASE_URL:", supabaseUrl ? "set" : "undefined");
console.log("[Supabase] VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "set" : "undefined");

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
console.log("[Supabase] isSupabaseConfigured:", isSupabaseConfigured);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
