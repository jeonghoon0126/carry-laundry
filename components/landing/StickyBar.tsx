'use client'

import { motion } from 'framer-motion'
import { Phone, ShoppingCart } from 'lucide-react'

interface StickyBarProps {
  onPrimaryClick: () => void
}

export default function StickyBar({ onPrimaryClick }: StickyBarProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="grid grid-cols-2 gap-3">
          {/* 전화문의 버튼 */}
          <motion.a
            href="tel:01094320293"
            whileTap={{ scale: 0.95 }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className="group relative flex items-center justify-center gap-3 py-4 px-6 border-2 border-gray-300 rounded-2xl text-gray-700 font-bold transition-all duration-300 hover:border-gray-400 hover:shadow-lg overflow-hidden"
            aria-label="전화문의"
            style={{ fontFamily: 'Pretendard, sans-serif' }}
          >
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            
            {/* Icon with premium animation */}
            <motion.div
              className="relative z-10"
              animate={{ 
                rotate: [0, -5, 5, -5, 0],
                transition: { 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }
              }}
              whileHover={{ scale: 1.1 }}
            >
              <Phone className="w-6 h-6 text-blue-600" />
            </motion.div>
            
            <span className="relative z-10 text-lg">전화문의</span>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl"></div>
          </motion.a>

          {/* 구매하기 버튼 */}
          <motion.button
            onClick={onPrimaryClick}
            whileTap={{ scale: 0.95 }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className="group relative flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-[#13C2C2] to-[#0FA8A8] hover:from-[#0FA8A8] hover:to-[#0E9A9A] text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
            aria-label="구매하기"
            style={{ fontFamily: 'Pretendard, sans-serif' }}
          >
            {/* Background pulse effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#13C2C2] to-[#0FA8A8] opacity-75 animate-pulse rounded-2xl"></div>
            
            {/* Icon with bounce animation */}
            <motion.div
              className="relative z-10"
              animate={{ 
                y: [0, -2, 0],
                transition: { 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }
              }}
              whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
            >
              <ShoppingCart className="w-6 h-6" />
            </motion.div>
            
            <span className="relative z-10 text-lg">구매하기</span>
            
            {/* Sparkle effects */}
            <div className="absolute top-2 right-2 w-2 h-2 bg-white/60 rounded-full animate-ping"></div>
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl"></div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}