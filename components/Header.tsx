'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getDisplayName, getUserInitials } from '@/lib/utils/format'
import { useNickname } from '@/lib/hooks/useNickname'

export default function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { nickname, loading: nicknameLoading } = useNickname()

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
        <Link href="/" className="inline-block" onClick={scrollToTop}>
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
            <div className="flex items-center gap-2">
              <div className="w-20 h-8 bg-gray-200 rounded-md skeleton-shimmer"></div>
              <div className="w-16 h-8 bg-gray-200 rounded-md skeleton-shimmer"></div>
            </div>
          ) : session ? (
            <>
              <button
                onClick={handleMyPage}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="마이페이지로 이동"
              >
                마이페이지
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="로그아웃"
              >
                로그아웃
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}
