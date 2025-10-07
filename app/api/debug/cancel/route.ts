import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    console.log('=== DEBUG CANCEL API ===')
    
    const session = await getServerSession(authOptions)
    console.log('Session:', session)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const userId = (session.user as any).id
    console.log('User ID:', userId)

    const supabase = getSupabaseServer()
    console.log('Supabase client created')

    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from('orders')
      .select('id, user_id, paid, created_at')
      .eq('user_id', userId)
      .limit(10)

    console.log('Test query result:', { testData, testError })

    // Check if order ID 60 exists and belongs to whom
    const { data: order60, error: order60Error } = await supabase
      .from('orders')
      .select('id, user_id, paid, created_at, name')
      .eq('id', 60)
      .single()

    console.log('Order 60 check:', { order60, order60Error })

    return NextResponse.json({
      success: true,
      userId,
      orders: testData,
      order60: order60,
      order60Error: order60Error?.message,
      error: testError?.message,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
