'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getDisplayName, getUserInitials } from '@/lib/utils/format'
import { useNickname } from '@/lib/hooks/useNickname'

export default function UserStatus() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { nickname, loading: nicknameLoading } = useNickname()

  // Show loading state to prevent hydration mismatch
  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full animate-pulse">
        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
        <div className="w-20 h-4 bg-gray-300 rounded"></div>
      </div>
    )
  }

  // Not signed in - show login CTA
  if (!session) {
    return (
      <button
        onClick={() => router.push('/signin')}
        className="flex items-center gap-2 px-4 py-2 bg-yellow-300 text-gray-900 rounded-full font-medium hover:bg-yellow-400 transition-colors"
        aria-label="카카오로 로그인"
      >
        🔑 카카오로 로그인
      </button>
    )
  }

  // Signed in - show user status with actions
  const displayName = getDisplayName(session.user?.name)
  const initials = getUserInitials(session.user?.name)

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/home' })
  }

  const handleMyPage = () => {
    router.push('/mypage')
  }

  return (
    <div className="flex items-center gap-2">
      {/* User Status Chip */}
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-full">
        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
          {initials}
        </div>
        <span className="text-sm font-medium text-blue-900">
          😀 {nicknameLoading ? '로딩 중...' : nickname || session.user?.name || '고객'}님 로그인됨
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
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
      </div>
    </div>
  )
}



