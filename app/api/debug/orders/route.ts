import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE
    
    if (!supabaseUrl || !supabaseServiceRole) {
      return NextResponse.json({ error: "Supabase configuration missing" }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceRole)
    
    const { data, error } = await supabase
      .from('orders')
      .select('id, paid, payment_amount, payment_method, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      orders: data,
      count: data?.length || 0
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
