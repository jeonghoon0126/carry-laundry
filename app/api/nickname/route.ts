import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { generateNicknameWithNumber } from '@/lib/utils/nickname'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log('Nickname API - Session:', session)
    
    if (!session?.user) {
      console.log('No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    if (!userId) {
      console.log('No user ID in session:', session.user)
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    const supabase = getSupabaseServer()
    
    // 사용자의 현재 닉네임 조회
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching nickname:', error)
      
      // 프로필이 없는 경우 생성
      if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
        console.log('Profile not found, creating new profile for user:', userId)
        
        const newNickname = generateNicknameWithNumber()
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            nickname: newNickname,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('nickname')
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
          return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
        }

        return NextResponse.json({ 
          nickname: newProfile?.nickname || newNickname 
        })
      }
      
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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    const body = await request.json()
    const { action, newNickname } = body

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
        .eq('id', userId)
        .select()

      if (error) {
        console.error('Error generating new nickname:', error)
        return NextResponse.json({ error: 'Failed to generate nickname' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true,
        nickname: newNickname 
      })
    } else if (newNickname) {
      // 사용자 지정 닉네임 업데이트
      const supabase = getSupabaseServer()
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          nickname: newNickname,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()

      if (error) {
        console.error('Error updating nickname:', error)
        return NextResponse.json({ error: 'Failed to update nickname' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true,
        nickname: newNickname 
      })
    }

    return NextResponse.json({ error: 'Invalid action or nickname' }, { status: 400 })
  } catch (error) {
    console.error('Error in nickname PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
