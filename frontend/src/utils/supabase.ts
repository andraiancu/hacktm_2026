import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

let client: SupabaseClient | null = null
if (supabaseUrl && supabaseKey) {
  client = createClient(supabaseUrl, supabaseKey)
}

export const supabase: SupabaseClient | null = client
