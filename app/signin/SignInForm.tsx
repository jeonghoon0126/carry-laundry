'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { SkeletonButton } from '@/components/common/Skeleton'

interface SignInFormProps {
  from?: string
}

export default function SignInForm({ from }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleKakaoSignIn = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      // Determine callback URL
      let callbackUrl = '/mypage' // default
      
      if (from) {
        const allowedRoutes = ['mypage', 'order', 'home']
        const cleanFrom = from.startsWith('/') ? from.slice(1) : from
        if (allowedRoutes.includes(cleanFrom)) {
          callbackUrl = `/${cleanFrom}`
        }
      }
      
      // Directly call Kakao sign-in without provider selection
      await signIn('kakao', { callbackUrl })
    } catch (error) {
      console.error('Sign in error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleKakaoSignIn}
        disabled={isLoading}
        className="w-full h-14 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-300 text-gray-900 font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md disabled:opacity-50"
        aria-label="카카오로 로그인"
      >
        {isLoading ? (
          <SkeletonButton className="w-full h-6" />
        ) : (
          <>
            {/* Kakao logo */}
            <div className="w-6 h-6 bg-gray-900 rounded-sm flex items-center justify-center">
              <span className="text-yellow-400 text-xs font-bold">K</span>
            </div>
            카카오로 로그인
          </>
        )}
      </button>
    </div>
  )
}
