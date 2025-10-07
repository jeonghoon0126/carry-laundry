'use server'

import { getSupabaseServer } from '@/lib/supabase-server'
import { generateNicknameWithNumber } from '@/lib/utils/nickname'

export async function upsertUserProfile(userData: {
  id: string
  email?: string | null
  name?: string | null
  avatar_url?: string | null
}) {
  try {
    const supabase = getSupabaseServer()
    
    // First, check if user already exists to preserve existing nickname
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', userData.id)
      .single()
    
    const nickname = existingProfile?.nickname || generateNicknameWithNumber()
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar_url: userData.avatar_url,
        nickname: nickname,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()

    if (error) {
      console.error('Error upserting user profile:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in upsertUserProfile:', error)
    return { success: false, error: 'Failed to upsert user profile' }
  }
}
