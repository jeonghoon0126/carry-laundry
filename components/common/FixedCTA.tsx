'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { ShoppingCart, Circle } from 'lucide-react'
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
    <motion.div 
      className="fixed left-0 right-0 bottom-0 z-50 p-4 pb-[max(env(safe-area-inset-bottom),16px)]"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-md mx-auto">
        <motion.button
          onClick={handleOrderClick}
          disabled={status === 'loading'}
          className="group relative w-full h-14 rounded-xl font-bold bg-gradient-to-r from-[#13C2C2] to-[#0FA8A8] text-white hover:from-[#0FA8A8] hover:to-[#0D9B9B] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl overflow-hidden"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          aria-label={status === 'loading' ? '로딩 중...' : '11,900원에 주문하기'}
        >
          {/* 배경 그라데이션 애니메이션 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1
            }}
          />
          
          {/* 메인 콘텐츠 */}
          <div className="relative flex items-center justify-center gap-3">
            {status === 'loading' ? (
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>로딩 중...</span>
              </motion.div>
            ) : (
              <>
                {/* 쇼핑카트 아이콘 */}
                <motion.div
                  animate={{ 
                    y: [0, -3, 0],
                    rotate: [0, 5, -5, 0],
                    transition: { 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }
                  }}
                  whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                >
                  <ShoppingCart className="w-5 h-5" />
                </motion.div>
                
                {/* 가격 텍스트 */}
                <motion.span
                  animate={{
                    scale: [1, 1.05, 1],
                    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  11,900원에 주문하기
                </motion.span>
                
                {/* 버블 아이콘들 */}
                <motion.div
                  className="relative flex items-center justify-center"
                  animate={{ 
                    y: [0, -2, 0],
                    transition: { 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }
                  }}
                >
                  {/* 큰 버블 */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7],
                      transition: { 
                        duration: 2.5, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }
                    }}
                    whileHover={{ scale: 1.2 }}
                  >
                    <Circle className="w-4 h-4 fill-white/80" />
                  </motion.div>
                  
                  {/* 작은 버블들 */}
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ 
                      scale: [0.8, 1.2, 0.8],
                      opacity: [0.5, 1, 0.5],
                      transition: { 
                        duration: 1.8, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 0.5
                      }
                    }}
                  >
                    <Circle className="w-2 h-2 fill-white/60" />
                  </motion.div>
                  
                  <motion.div
                    className="absolute -bottom-1 -left-1"
                    animate={{ 
                      scale: [0.6, 1, 0.6],
                      opacity: [0.4, 0.8, 0.4],
                      transition: { 
                        duration: 2.2, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 1
                      }
                    }}
                  >
                    <Circle className="w-1.5 h-1.5 fill-white/50" />
                  </motion.div>
                </motion.div>
              </>
            )}
          </div>
          
          {/* 버블 효과들 */}
          <motion.div 
            className="absolute top-2 right-2 w-2 h-2 bg-white/60 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6],
              y: [0, -5, 0],
              transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          <motion.div 
            className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white/40 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.8, 0.4],
              y: [0, -3, 0],
              transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
            }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/4 w-1 h-1 bg-white/30 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              y: [0, -2, 0],
              transition: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }
            }}
          />
          <motion.div 
            className="absolute top-1/4 right-1/3 w-1.5 h-1.5 bg-white/50 rounded-full"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.5, 0.9, 0.5],
              y: [0, -4, 0],
              transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }
            }}
          />
          
          {/* 호버 시 버블 효과 */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100"
          >
            {/* 큰 버블들 */}
            <motion.div
              className="absolute top-1/4 left-1/3 w-3 h-3 bg-white/20 rounded-full"
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.2, 0.4, 0.2],
                y: [0, -8, 0],
                transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            <motion.div
              className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-white/15 rounded-full"
              animate={{
                scale: [0.6, 1, 0.6],
                opacity: [0.15, 0.3, 0.15],
                y: [0, -6, 0],
                transition: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
              }}
            />
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  )
}
