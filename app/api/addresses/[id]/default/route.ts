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

// PUT - 기본 배송지 설정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const addressId = params.id
    const supabase = getSupabaseServerClient()

    // 해당 배송지가 사용자의 것인지 확인
    const { data: existingAddress, error: fetchError } = await supabase
      .from('addresses')
      .select('user_id')
      .eq('id', addressId)
      .single()

    if (fetchError || existingAddress.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // 모든 배송지의 기본값 해제
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', session.user.id)

    // 선택된 배송지를 기본으로 설정
    const { data: address, error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Error setting default address:', error)
      return NextResponse.json({ error: 'Failed to set default address' }, { status: 500 })
    }

    return NextResponse.json({ address })
  } catch (error) {
    console.error('Default address setting error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
