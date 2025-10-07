import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'

function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    throw new Error(`Supabase env missing: url=${!!url}, serviceRoleKey=${!!key}`)
  }
  return createClient(url, key)
}

// GET - 사용자의 배송지 목록 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseServerClient()
    
    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching addresses:', error)
      return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
    }

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error('Address fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - 새로운 배송지 추가
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      address1, 
      address2, 
      addressDetail, 
      entranceMethod, 
      entranceNote,
      isDefault = false 
    } = body

    if (!name || !address1) {
      return NextResponse.json({ error: 'Name and address are required' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()

    // 기본 배송지로 설정하는 경우, 다른 배송지들의 기본값 해제
    if (isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', session.user.id)
    }

    const { data: address, error } = await supabase
      .from('addresses')
      .insert({
        user_id: session.user.id,
        name,
        address1,
        address2: address2 || null,
        address_detail: addressDetail || null,
        entrance_method: entranceMethod || null,
        entrance_note: entranceNote || null,
        is_default: isDefault
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating address:', error)
      return NextResponse.json({ error: 'Failed to create address' }, { status: 500 })
    }

    return NextResponse.json({ address })
  } catch (error) {
    console.error('Address creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
