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

// PUT - 배송지 수정
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

    // 먼저 해당 배송지가 사용자의 것인지 확인
    const { data: existingAddress, error: fetchError } = await supabase
      .from('addresses')
      .select('user_id')
      .eq('id', addressId)
      .single()

    if (fetchError || existingAddress.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // 기본 배송지로 설정하는 경우, 다른 배송지들의 기본값 해제
    if (isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', session.user.id)
        .neq('id', addressId)
    }

    const { data: address, error } = await supabase
      .from('addresses')
      .update({
        name,
        address1,
        address2: address2 || null,
        address_detail: addressDetail || null,
        entrance_method: entranceMethod || null,
        entrance_note: entranceNote || null,
        is_default: isDefault
      })
      .eq('id', addressId)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating address:', error)
      return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
    }

    return NextResponse.json({ address })
  } catch (error) {
    console.error('Address update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - 배송지 삭제
export async function DELETE(
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
      .select('user_id, is_default')
      .eq('id', addressId)
      .single()

    if (fetchError || existingAddress.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // 배송지 삭제
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Error deleting address:', error)
      return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
    }

    // 삭제된 배송지가 기본 배송지였다면, 다른 배송지를 기본으로 설정
    if (existingAddress.is_default) {
      const { data: remainingAddresses } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1)

      if (remainingAddresses && remainingAddresses.length > 0) {
        await supabase
          .from('addresses')
          .update({ is_default: true })
          .eq('id', remainingAddresses[0].id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Address deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
