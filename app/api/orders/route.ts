export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import 'server-only'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { geocodeAddress } from '@/lib/kakao'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE

  // Temporary diagnostics - remove after verification
  if (!supabaseUrl || !supabaseServiceRole) {
    return NextResponse.json({
      ok: false,
      why: "env",
      urlSet: !!supabaseUrl,
      roleSet: !!supabaseServiceRole,
      urlHost: supabaseUrl ? new URL(supabaseUrl).hostname : "missing"
    }, { status: 400 })
  }

  try {
    // Create client at runtime (avoid top-level creation)
    const supabase = createClient(supabaseUrl, supabaseServiceRole)

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      // Mask sensitive information in error response
      const safeError = error.message.replace(/eyJ[A-Za-z0-9_-]+/g, '[MASKED_JWT]')
      return NextResponse.json({ 
        error: safeError,
        code: error.code || 'unknown'
      }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (err: any) {
    // Catch and return Supabase error message (mask secrets)
    const safeError = err.message?.replace(/eyJ[A-Za-z0-9_-]+/g, '[MASKED_JWT]') || 'Unknown error'
    return NextResponse.json({ 
      error: safeError,
      type: 'client_error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  // auth check in POST
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({
      error: "로그인이 필요합니다."
    }, { status: 401 })
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE

  if (!supabaseUrl || !supabaseServiceRole) {
    return NextResponse.json({
      error: "Server configuration error"
    }, { status: 500 })
  }

  try {
    // Parse request body
    const body = await request.json()
    const { name, phone, address } = body

    // Basic validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({
        error: "이름을 입력해주세요."
      }, { status: 400 })
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      return NextResponse.json({
        error: "전화번호를 입력해주세요."
      }, { status: 400 })
    }

    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return NextResponse.json({
        error: "주소를 입력해주세요."
      }, { status: 400 })
    }

    // Geocode address and validate Gwanak-gu
    let geocodeResult
    try {
      geocodeResult = await geocodeAddress(address)
    } catch (error) {
      console.log(`Geocoding failed`)
      return NextResponse.json({
        error: "주소를 찾을 수 없습니다. 정확한 주소를 입력해주세요."
      }, { status: 400 })
    }

    // Enforce Gwanak-gu only service using hardened validation
    const { si, gu, dong, lat, lng, isServiceable } = geocodeResult
    if (!isServiceable) {
      console.log(`Service area validation failed: si=${si}, gu=${gu}, dong=${dong}`)
      return NextResponse.json({
        error: "관악구 외 지역은 아직 서비스하지 않습니다.",
        detail: { si, gu, dong }
      }, { status: 422 })
    }

    console.log(`Order validation passed: si=${si}, gu=${gu}, dong=${dong}`)

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceRole)

    // Insert order with normalized location data
    const { data, error } = await supabase
      .from('orders')
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        user_id: session.user.id,
        si,
        gu,
        dong,
        lat,
        lng,
        is_serviceable: true,
        paid: false,
        payment_amount: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error.code)
      return NextResponse.json({
        error: "주문 처리 중 오류가 발생했습니다."
      }, { status: 500 })
    }

    const insertedId = data.id
    console.info('[API] order-insert', { id: insertedId })

    return NextResponse.json({
      id: insertedId,
      amount: 11900
    }, { status: 200 })

  } catch (error: any) {
    console.error('Order creation error:', error.message)
    return NextResponse.json({
      error: "주문 처리 중 오류가 발생했습니다."
    }, { status: 500 })
  }
}