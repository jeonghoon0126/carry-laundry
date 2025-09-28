'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Phone } from 'lucide-react'

const notices = [
  '세탁물을 가능한 1개의 비닐에 담아 주세요',
  '침구류만 세탁 가능합니다 (이불, 베개, 매트리스 커버 등)',
  '수거 시간: 익일 오전 9시부터',
  '배송 시간: 익일 오후 10시까지',
  '세탁 불가 품목: 가죽, 모피, 실크 등'
]

export default function Notice() {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Pretendard, sans-serif' }}>꼭 확인해주세요</h2>
          </div>

          <ul className="space-y-2 mb-6">
            {notices.map((notice, index) => (
              <motion.li
                key={index}
                initial={{ x: -10, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                viewport={{ once: true }}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <span className="text-yellow-600 mt-1">•</span>
                <span style={{ fontFamily: 'Pretendard, sans-serif' }}>{notice}</span>
              </motion.li>
            ))}
          </ul>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span style={{ fontFamily: 'Pretendard, sans-serif' }}>고객문의: 010-9432-0293</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}