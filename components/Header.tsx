'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getDisplayName, getUserInitials } from '@/lib/utils/format'
import LoginWithKakao from '@/components/auth/LoginWithKakao'

export default function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/home' })
  }

  const handleMyPage = () => {
    router.push('/mypage')
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="mx-auto w-full max-w-[520px] px-4 py-2 flex items-center justify-between">
        <Link href="/" className="inline-block">
          <Image 
            src="/assets/carry-logo.png" 
            alt="Carry Logo" 
            width={120} 
            height={40} 
            priority 
          />
        </Link>
        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
          ) : session ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {getUserInitials(session.user?.name)}
                </div>
                <span className="text-sm font-medium text-blue-900">
                  😀 {session.user?.nickname || getDisplayName(session.user?.name)}님 로그인됨
                </span>
              </div>
              <button
                onClick={handleMyPage}
                className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                aria-label="마이페이지로 이동"
              >
                마이페이지
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                aria-label="로그아웃"
              >
                로그아웃
              </button>
            </>
          ) : (
            <LoginWithKakao />
          )}
        </div>
      </div>
    </header>
  )
}
