'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface SessionCTAProps {
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
}

export default function SessionCTA({ onPrimaryClick, onSecondaryClick }: SessionCTAProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Loading state to prevent hydration mismatch
  if (status === 'loading') {
    return (
      <div className="flex flex-col sm:flex-row gap-3 w-full skeleton-fade-in">
        <div className="flex-1 h-12 bg-gray-200 rounded-xl skeleton-shimmer"></div>
        <div className="w-32 h-12 bg-gray-200 rounded-xl skeleton-shimmer"></div>
      </div>
    )
  }

  // Not signed in - show service info CTA
  if (!session) {
    return (
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={onSecondaryClick}
          className="flex-1 h-12 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          aria-label="서비스 안내 보기"
        >
          📋 서비스 안내 보기
        </button>
      </div>
    )
  }

  // Signed in - show order CTA
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <button
        onClick={onPrimaryClick}
        className="flex-1 h-12 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        aria-label="11,900원에 주문하기"
      >
        🛒 11,900원에 주문하기
      </button>
      <button
        onClick={() => router.push('/mypage')}
        className="w-full sm:w-32 h-12 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-colors"
        aria-label="마이페이지로 이동"
      >
        마이페이지
      </button>
    </div>
  )
}
