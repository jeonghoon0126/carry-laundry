'use client'

import { motion } from 'framer-motion'
import { Truck, BadgeCheck, PiggyBank, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: '당일배송',
    description: '수거부터 배송까지 당일 완료',
    color: 'blue'
  },
  {
    icon: BadgeCheck,
    title: '전문 퀄리티',
    description: '전문 세탁 시설에서 안전하게',
    color: 'green'
  },
  {
    icon: PiggyBank,
    title: '합리적 가격',
    description: '가장 저렴한 세탁 비용',
    color: 'yellow'
  },
  {
    icon: Sparkles,
    title: '개별 포장',
    description: '깨끗한 개별 포장으로 배송',
    color: 'purple'
  }
]

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  purple: 'bg-purple-50 text-purple-600'
}

export default function FeatureCards() {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -2 }}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center"
            >
              <div className={`w-12 h-12 rounded-full ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mx-auto mb-3`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Pretendard, sans-serif' }}>{feature.title}</h3>
              <p className="text-sm text-gray-600" style={{ fontFamily: 'Pretendard, sans-serif' }}>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}