'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useOrderProgress } from '@/lib/contexts/OrderProgressContext'
import Header from '@/components/Header'
import Hero from '@/components/landing/Hero'
import FloatingViewers from '@/components/common/FloatingViewers'
import Footer from '@/components/common/Footer'
import BackToTop from '@/components/common/BackToTop'
import OrderProgressBottomSheet from '@/components/order/OrderProgressBottomSheet'
import { Package } from 'lucide-react'

export default function HomePage() {
  const { data: session } = useSession()
  const { setIsOrderProgressVisible } = useOrderProgress()
  const [showOrderProgress, setShowOrderProgress] = useState(false)
  const [hasActiveOrder, setHasActiveOrder] = useState(false)
  const [isLoadingOrderStatus, setIsLoadingOrderStatus] = useState(true)
  
  // 디버깅을 위한 로그
  console.log('HomePage Debug:', {
    showOrderProgress,
    hasActiveOrder,
    sessionUser: !!session?.user,
    isLoadingOrderStatus,
    shouldHideCTA: (hasActiveOrder && !!session?.user) || isLoadingOrderStatus
  })

  // 바텀시트 상태가 변경될 때마다 전역 상태 동기화
  useEffect(() => {
    setIsOrderProgressVisible(showOrderProgress)
  }, [showOrderProgress, setIsOrderProgressVisible])

  // 활성 주문이 있을 때도 CTA 숨기기 (주문 진행상황 버튼이 보일 때)
  // 로딩 중일 때도 CTA 숨기기 (깜빡임 방지)
  useEffect(() => {
    if ((hasActiveOrder && session?.user) || isLoadingOrderStatus) {
      setIsOrderProgressVisible(true)
    } else {
      setIsOrderProgressVisible(showOrderProgress)
    }
  }, [hasActiveOrder, session?.user, showOrderProgress, isLoadingOrderStatus, setIsOrderProgressVisible])

  // 로그인된 사용자의 활성 주문 확인
  useEffect(() => {
    if (!session?.user) {
      setHasActiveOrder(false)
      setIsLoadingOrderStatus(false)
      return
    }

    const checkActiveOrder = async () => {
      try {
        setIsLoadingOrderStatus(true)
        const response = await fetch('/api/orders/latest')
        if (response.ok) {
          const order = await response.json()
          setHasActiveOrder(!!order)
        }
      } catch (error) {
        console.error('Error checking active order:', error)
        setHasActiveOrder(false)
      } finally {
        setIsLoadingOrderStatus(false)
      }
    }

    checkActiveOrder()

    // 30초마다 활성 주문 상태 확인
    const interval = setInterval(checkActiveOrder, 30000)
    return () => clearInterval(interval)
  }, [session])

  return (
    <div className="min-h-screen bg-gray-50 pt-14 pb-24 md:pb-28">
      <div id="top" />
      <Header />
      
      <div className="relative">
        <FloatingViewers />
        
        {/* Active Order Progress Button */}
        {hasActiveOrder && session?.user && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40">
            <button
              onClick={() => setShowOrderProgress(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 animate-pulse"
            >
              <Package className="w-5 h-5" />
              <span className="font-medium">주문 진행상황 보기</span>
            </button>
          </div>
        )}
      </div>
      
      <div className="space-y-6 md:space-y-8">
        <Hero />
      </div>
      
      
      {/* Footer */}
      <Footer />
      
      <BackToTop />
      
      {/* Order Progress Bottom Sheet */}
      <OrderProgressBottomSheet
        isOpen={showOrderProgress}
        onClose={() => setShowOrderProgress(false)}
      />
    </div>
  )
}
