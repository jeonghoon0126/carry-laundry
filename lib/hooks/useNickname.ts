'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { generateNicknameWithNumber } from '@/lib/utils/nickname'

interface UseNicknameReturn {
  nickname: string | null
  loading: boolean
  error: string | null
  generateNewNickname: () => Promise<void>
  updateNickname: (newNickname: string) => Promise<void>
  refreshNickname: () => Promise<void>
}

export function useNickname(): UseNicknameReturn {
  const { data: session, status } = useSession()
  const [nickname, setNickname] = useState<string | null>(generateNicknameWithNumber())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 닉네임 로드
  const loadNickname = async () => {
    if (status !== 'authenticated' || !session?.user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/nickname')
      if (!response.ok) {
        throw new Error('Failed to fetch nickname')
      }
      
      const data = await response.json()
      setNickname(data.nickname)
    } catch (err) {
      console.error('Error loading nickname:', err)
      setError(err instanceof Error ? err.message : 'Failed to load nickname')
      // 에러 시 임시 닉네임 생성
      setNickname(generateNicknameWithNumber())
    } finally {
      setLoading(false)
    }
  }

  // 새 닉네임 생성
  const generateNewNickname = async () => {
    if (!session?.user) return

    try {
      setError(null)
      
      const response = await fetch('/api/nickname', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate nickname')
      }
      
      const data = await response.json()
      setNickname(data.nickname)
    } catch (err) {
      console.error('Error generating nickname:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate nickname')
      // 에러 시 클라이언트에서 임시 생성
      setNickname(generateNicknameWithNumber())
    }
  }

  // 닉네임 업데이트
  const updateNickname = async (newNickname: string) => {
    if (!session?.user || !newNickname.trim()) return

    try {
      setError(null)
      
      const response = await fetch('/api/nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: newNickname.trim() })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update nickname')
      }
      
      const data = await response.json()
      setNickname(data.nickname)
    } catch (err) {
      console.error('Error updating nickname:', err)
      setError(err instanceof Error ? err.message : 'Failed to update nickname')
    }
  }

  // 닉네임 새로고침
  const refreshNickname = async () => {
    await loadNickname()
  }

  // 세션 변경 시 닉네임 로드
  useEffect(() => {
    loadNickname()
  }, [session?.user, status])

  return {
    nickname,
    loading,
    error,
    generateNewNickname,
    updateNickname,
    refreshNickname
  }
}
