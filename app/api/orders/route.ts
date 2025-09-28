export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const prerender = false

import 'server-only'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE

  if (!supabaseUrl) throw new Error('SUPABASE_URL is required')
  if (!supabaseServiceRole) throw new Error('SUPABASE_SERVICE_ROLE is required')

  // Create client at runtime (not at module top-level)
  const supabase = createClient(supabaseUrl, supabaseServiceRole)

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}