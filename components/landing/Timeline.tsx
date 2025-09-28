'use client'

import { motion } from 'framer-motion'
import { Clock, Truck, Package } from 'lucide-react'

const timelineSteps = [
  {
    icon: Clock,
    title: '주문 마감',
    time: '자정까지',
    color: 'blue'
  },
  {
    icon: Truck,
    title: '수거 시간',
    time: '익일 오전 9시부터',
    color: 'green'
  },
  {
    icon: Package,
    title: '배송 시간',
    time: '익일 오후 10시까지',
    color: 'purple'
  }
]

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600'
}

export default function Timeline() {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-6 text-center" style={{ fontFamily: 'Pretendard, sans-serif' }}>
            주문 프로세스
          </h2>
          
          <div className="space-y-4">
            {timelineSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                <div className={`w-10 h-10 rounded-full ${colorClasses[step.color as keyof typeof colorClasses]} flex items-center justify-center flex-shrink-0`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Pretendard, sans-serif' }}>{step.title}</h3>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Pretendard, sans-serif' }}>{step.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}