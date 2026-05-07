/**
 * Supabase BROWSER client
 * Uses only NEXT_PUBLIC_ vars - safe to expose client-side.
 * Never import SUPABASE_SERVICE_ROLE_KEY here.
 */
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
