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
            className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold transition-colors hover:border-gray-400"
            aria-label="전화문의"
            style={{ fontFamily: 'Pretendard, sans-serif' }}
          >
            <Phone className="w-5 h-5" />
            전화문의
          </motion.a>

          {/* 구매하기 버튼 */}
          <motion.button
            onClick={onPrimaryClick}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
            aria-label="구매하기"
            style={{ fontFamily: 'Pretendard, sans-serif' }}
          >
            <ShoppingCart className="w-5 h-5" />
            구매하기
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}