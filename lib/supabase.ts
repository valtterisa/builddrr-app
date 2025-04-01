import { createClient } from "@supabase/supabase-js"

// Check if environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create the client if both URL and key are available
let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn("Supabase credentials not available. Make sure environment variables are set.")
}

// Export a function that returns the client or throws a helpful error
export function getSupabaseClient() {
  if (!supabase) {
    throw new Error(
      "Supabase client not initialized. Check your environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    )
  }
  return supabase
}

// For backward compatibility
export { supabase }

