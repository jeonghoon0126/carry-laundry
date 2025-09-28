'use client'

import { motion } from 'framer-motion'

const comparisonData = [
  {
    category: '시간',
    carry: '당일배송',
    coin: '1시간',
    platform: '최소 3일'
  },
  {
    category: '편의',
    carry: '간편함',
    coin: '번거로움',
    platform: '간편함'
  },
  {
    category: '비용',
    carry: '11,900원',
    coin: '12,000원~',
    platform: '25,000원~'
  }
]

export default function Comparison() {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
        >
          {/* Header */}
          <div className="grid grid-cols-3 bg-gray-50">
            <div className="p-4 text-center font-medium text-gray-600 text-sm" style={{ fontFamily: 'Pretendard, sans-serif' }}>구분</div>
            <div className="p-4 text-center font-bold text-blue-600 bg-blue-50 relative">
              <div className="absolute top-2 left-2 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
              </div>
              <span style={{ fontFamily: 'Pretendard, sans-serif' }}>carry</span>
            </div>
            <div className="p-4 text-center font-medium text-gray-600 text-sm" style={{ fontFamily: 'Pretendard, sans-serif' }}>코인 빨래방</div>
          </div>

          {/* Rows */}
          {comparisonData.map((row, index) => (
            <motion.div
              key={row.category}
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              className="grid grid-cols-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="p-4 text-center font-medium text-gray-700 text-sm border-r border-gray-100" style={{ fontFamily: 'Pretendard, sans-serif' }}>
                {row.category}
              </div>
              <div className="p-4 text-center font-bold text-blue-600 bg-blue-50 border-r border-gray-100" style={{ fontFamily: 'Pretendard, sans-serif' }}>
                {row.carry}
              </div>
              <div className="p-4 text-center text-gray-600 text-sm" style={{ fontFamily: 'Pretendard, sans-serif' }}>
                {row.coin}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Information Box */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-4 bg-gray-100 rounded-lg p-4 flex items-start gap-3"
        >
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-gray-600 text-xs font-bold">i</span>
          </div>
          <p className="text-sm text-gray-700" style={{ fontFamily: 'Pretendard, sans-serif' }}>
            한 번에 세탁 가능한 양은 이불 1장, 침대커버 1장, 베개커버 2장이에요
          </p>
        </motion.div>
      </div>
    </section>
  )
}