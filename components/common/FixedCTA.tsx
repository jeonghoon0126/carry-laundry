'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useOrderProgress } from '@/lib/contexts/OrderProgressContext'

export default function FixedCTA() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { isOrderProgressVisible } = useOrderProgress()

  // Debug logging
  console.log('FixedCTA Debug:', {
    pathname,
    isOrderProgressVisible,
    shouldHide: pathname.startsWith('/order') || pathname.startsWith('/admin') || pathname.startsWith('/auth/guest-gate') || pathname.startsWith('/mypage') || isOrderProgressVisible
  })

  // Hidden on /order, /admin, /auth/guest-gate, /mypage and their children
  // Also hidden when order progress is visible
  const shouldHide = pathname.startsWith('/order') || 
                     pathname.startsWith('/admin') || 
                     pathname.startsWith('/auth/guest-gate') || 
                     pathname.startsWith('/mypage') || 
                     isOrderProgressVisible
  
  if (shouldHide) {
    return null
  }

  const handleOrderClick = () => {
    // Check if user is authenticated
    if (status === 'loading') {
      // Still loading, do nothing
      return
    }
    
    if (!session?.user) {
      // User is not authenticated, redirect to guest gate
      router.push('/auth/guest-gate?from=order')
    } else {
      // User is authenticated, proceed to order page
      router.push('/order')
    }
  }

  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 p-4 pb-[max(env(safe-area-inset-bottom),16px)]">
      <div className="max-w-md mx-auto">
        <button
          onClick={handleOrderClick}
          disabled={status === 'loading'}
          className="w-full h-12 rounded-xl font-bold bg-[#13C2C2] text-white hover:bg-[#0FA8A8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          aria-label={status === 'loading' ? '로딩 중...' : '11,900원에 주문하기'}
        >
          {status === 'loading' ? '로딩 중...' : '🛒 11,900원에 주문하기'}
        </button>
      </div>
    </div>
  )
}
