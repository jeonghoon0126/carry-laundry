'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, User, Home } from 'lucide-react'
import Button from '@/components/ui/Button'

// Metadata는 layout.tsx에서 처리됩니다

export default function OrderCompletedPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#13C2C2] to-[#0FA8A8] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            
            {/* Success Message */}
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
              결제 완료
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              <span className="font-medium text-[#13C2C2]">세탁물은 익일 오전 9시에 수거해서, 익일 오후 11시 전에 배송 돼요</span>
            </p>
          </div>

          {/* Order Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 mb-1">결제 금액</p>
              <p className="text-xs text-gray-400">테스트 결제</p>
            </div>
            <p className="text-xl font-semibold text-gray-900">100원</p>
          </div>

          {/* CTA Buttons - 상하 배치 */}
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Link href="/mypage">
                <motion.button
                  className="group relative w-full h-12 bg-gradient-to-r from-[#13C2C2] to-[#0FA8A8] text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                  >
                    <User className="w-5 h-5" />
                  </motion.div>
                  마이페이지
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl"></div>
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Link href="/home">
                <motion.button
                  className="group relative w-full h-12 bg-white border-2 border-[#13C2C2] text-[#13C2C2] rounded-xl font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#13C2C2] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, -5, 5, 0],
                      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                    }}
                    whileHover={{ scale: 1.2, rotate: [0, 10, -10, 0] }}
                  >
                    <Home className="w-5 h-5" />
                  </motion.div>
                  홈으로 가기
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#13C2C2]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl"></div>
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              주문 내역은 마이페이지에서 확인하실 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
