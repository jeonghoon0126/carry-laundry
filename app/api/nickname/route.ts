import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { generateNicknameWithNumber } from '@/lib/utils/nickname'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseServer()
    
    // 사용자의 현재 닉네임 조회
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('Error fetching nickname:', error)
      return NextResponse.json({ error: 'Failed to fetch nickname' }, { status: 500 })
    }

    return NextResponse.json({ 
      nickname: profile?.nickname || null 
    })
  } catch (error) {
    console.error('Error in nickname GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { nickname } = body

    if (!nickname || typeof nickname !== 'string') {
      return NextResponse.json({ error: 'Invalid nickname' }, { status: 400 })
    }

    const supabase = getSupabaseServer()
    
    // 닉네임 업데이트
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        nickname: nickname,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)
      .select()

    if (error) {
      console.error('Error updating nickname:', error)
      return NextResponse.json({ error: 'Failed to update nickname' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      nickname: data?.[0]?.nickname 
    })
  } catch (error) {
    console.error('Error in nickname POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'generate') {
      // 새 닉네임 생성
      const newNickname = generateNicknameWithNumber()
      
      const supabase = getSupabaseServer()
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          nickname: newNickname,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)
        .select()

      if (error) {
        console.error('Error generating new nickname:', error)
        return NextResponse.json({ error: 'Failed to generate nickname' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true,
        nickname: newNickname 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in nickname PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
