'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function FixedCTA() {
  const router = useRouter()
  const pathname = usePathname()

  // Hidden on /order, /admin and their children
  const shouldHide = pathname.startsWith('/order') || pathname.startsWith('/admin')
  
  if (shouldHide) {
    return null
  }

  const handleOrderClick = () => {
    router.push('/order')
  }

  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 bg-black/50 backdrop-blur-md">
      <div className="max-w-md mx-auto px-4 py-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <button
          onClick={handleOrderClick}
          className="w-full h-12 rounded-xl font-bold bg-black text-white hover:opacity-90 transition-opacity"
          aria-label="11,900원에 주문하기"
        >
          🛒 11,900원에 주문하기
        </button>
      </div>
    </div>
  )
}
