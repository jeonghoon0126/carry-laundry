"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginWithKakao() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    try {
      await signIn('kakao', { callbackUrl: '/home', redirect: true })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      aria-busy={isLoading}
      aria-label="카카오로 로그인"
      className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? "로그인 중..." : "🔑 카카오로 로그인"}
    </button>
  )
}