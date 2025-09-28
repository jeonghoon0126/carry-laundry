'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: '조*국',
    rating: 5,
    comment: '세탁 후 이불이 보송보송하고 냄새도 완전 사라졌어요. 새 이불처럼 깨끗해서 만족합니다.',
    beforeImage: '/before.jpg',
    afterImage: '/after.jpg'
  }
]

export default function Testimonials() {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-gray-100 rounded-xl p-4"
        >
          {/* Before/After Images */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-xs text-gray-500" style={{ fontFamily: 'Pretendard, sans-serif' }}>Before</span>
            </div>
            <div className="flex-1 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-xs text-gray-500" style={{ fontFamily: 'Pretendard, sans-serif' }}>After</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center mb-2">
            {[...Array(testimonials[0].rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
            ))}
          </div>

          {/* Comment */}
          <p className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Pretendard, sans-serif' }}>
            "{testimonials[0].comment}"
          </p>

          {/* Name */}
          <p className="text-xs font-semibold text-gray-900 text-right" style={{ fontFamily: 'Pretendard, sans-serif' }}>
            - {testimonials[0].name}
          </p>
        </motion.div>
      </div>
    </section>
  )
}