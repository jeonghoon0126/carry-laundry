import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('[Test] Supabase config:', {
      hasUrl: !!supabaseUrl,
      hasServiceRole: !!supabaseServiceRole
    })
    
    if (!supabaseUrl || !supabaseServiceRole) {
      return NextResponse.json({ 
        error: 'Supabase config missing',
        hasUrl: !!supabaseUrl,
        hasServiceRole: !!supabaseServiceRole
      }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceRole)
    
    // Test update the most recent order
    const { data: orders } = await supabase
      .from('orders')
      .select('id, paid, payment_amount')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: 'No orders found' }, { status: 404 })
    }
    
    const orderId = orders[0].id
    console.log('[Test] Testing update for order:', orderId)
    
    // Try to update the order
    const { data: updateData, error: updateError } = await supabase
      .from('orders')
      .update({
        paid: true,
        payment_amount: 11900,
        payment_method: 'test'
      })
      .eq('id', orderId)
      .select()
    
    console.log('[Test] Update result:', { updateData, updateError })
    
    return NextResponse.json({
      success: !updateError,
      orderId,
      updateData,
      error: updateError?.message
    })
    
  } catch (error: any) {
    console.error('[Test] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
