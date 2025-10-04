import 'server-only'
import { createClient } from '@supabase/supabase-js'

export function getSupabaseServer() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE
  if (!url) throw new Error('SUPABASE_URL is required')
  if (!serviceRole) throw new Error('SUPABASE_SERVICE_ROLE is required')
  return createClient(url, serviceRole)
}





