/**
 * Supabase ADMIN client (service_role)
 * ⚠️  SERVER-SIDE ONLY - NEVER import this in client components or pages.
 * Bypasses Row Level Security. Use only for trusted server operations.
 */
import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
