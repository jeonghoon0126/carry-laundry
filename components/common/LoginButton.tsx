"use client"
import { signIn, signOut, useSession } from "next-auth/react"

export default function LoginButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">
          {session.user?.name}님 로그인됨
        </span>
        <button 
          onClick={() => signOut()}
          className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
        >
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <button 
      onClick={() => signIn("kakao")}
      className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium transition-colors"
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        className="text-black"
      >
        <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.7 1.8 5.1 4.5 6.4L5.5 21l4.1-2.1c1.1.2 2.2.3 3.4.3 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
      </svg>
      카카오 로그인
    </button>
  )
}




