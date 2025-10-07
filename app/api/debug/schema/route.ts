import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function GET() {
  try {
    console.log('=== SCHEMA DEBUG API ===')
    
    const supabase = getSupabaseServer()
    console.log('Supabase client created')

    // Get orders table schema information
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'orders')
      .eq('table_schema', 'public')

    console.log('Orders table columns:', { columns, error })

    // Test a simple select to see what fields are available
    const { data: sampleOrder, error: sampleError } = await supabase
      .from('orders')
      .select('*')
      .limit(1)

    console.log('Sample order data:', { sampleOrder, sampleError })

    return NextResponse.json({
      success: true,
      columns: columns,
      sampleOrder: sampleOrder?.[0] || null,
      error: error?.message,
      sampleError: sampleError?.message,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Schema debug API error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
