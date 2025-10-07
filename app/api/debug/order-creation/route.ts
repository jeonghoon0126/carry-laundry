import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('=== ORDER CREATION DEBUG START ===')
    
    // 1. Session check
    const session = await getServerSession(authOptions)
    console.log('Session:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'No valid session',
        step: 'session_check'
      }, { status: 401 })
    }

    // 2. Environment variables check
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceRole: !!supabaseServiceRole,
      urlHost: supabaseUrl ? new URL(supabaseUrl).hostname : 'missing'
    })
    
    if (!supabaseUrl || !supabaseServiceRole) {
      return NextResponse.json({
        error: 'Missing Supabase environment variables',
        step: 'env_check',
        hasUrl: !!supabaseUrl,
        hasServiceRole: !!supabaseServiceRole
      }, { status: 500 })
    }

    // 3. Request body check
    let body
    try {
      body = await request.json()
      console.log('Request body:', JSON.stringify(body, null, 2))
    } catch (e) {
      return NextResponse.json({
        error: 'Invalid JSON in request body',
        step: 'body_parse'
      }, { status: 400 })
    }

    const { name, phone, address } = body
    
    // 4. Field validation
    const validationErrors = []
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      validationErrors.push(`name: ${JSON.stringify(name)} (${typeof name})`)
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      validationErrors.push(`phone: ${JSON.stringify(phone)} (${typeof phone})`)
    }
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      validationErrors.push(`address: ${JSON.stringify(address)} (${typeof address})`)
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json({
        error: 'Validation failed',
        step: 'validation',
        errors: validationErrors
      }, { status: 400 })
    }

    // 5. Supabase connection test
    const supabase = createClient(supabaseUrl, supabaseServiceRole)
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('orders')
        .select('id')
        .limit(1)
      
      console.log('Supabase connection test:', { testData, testError })
      
      if (testError) {
        return NextResponse.json({
          error: 'Supabase connection failed',
          step: 'supabase_test',
          details: testError.message,
          code: testError.code
        }, { status: 500 })
      }
    } catch (e) {
      return NextResponse.json({
        error: 'Supabase client creation failed',
        step: 'supabase_client',
        details: e instanceof Error ? e.message : 'Unknown error'
      }, { status: 500 })
    }

    // 6. Test order insertion
    const testOrderData = {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      user_id: session.user.id,
      si: '서울특별시',
      gu: '관악구',
      dong: '테스트동',
      lat: 37.5665,
      lng: 126.9780,
      is_serviceable: true,
      paid: false,
      payment_amount: 0
    }
    
    console.log('Attempting test order insertion:', JSON.stringify(testOrderData, null, 2))
    
    const { data: insertData, error: insertError } = await supabase
      .from('orders')
      .insert(testOrderData)
      .select()
      .single()

    if (insertError) {
      console.error('Insert error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      })
      
      return NextResponse.json({
        error: 'Order insertion failed',
        step: 'order_insert',
        details: insertError.message,
        code: insertError.code,
        hint: insertError.hint
      }, { status: 500 })
    }

    console.log('Order insertion successful:', insertData)

    return NextResponse.json({
      success: true,
      orderId: insertData.id,
      message: 'Order creation debug completed successfully',
      steps: ['session_check', 'env_check', 'body_parse', 'validation', 'supabase_test', 'supabase_client', 'order_insert']
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      error: 'Debug API failed',
      step: 'catch_block',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
