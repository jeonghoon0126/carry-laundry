'use client'

import { motion } from 'framer-motion'
import { Truck, BadgeCheck, PiggyBank, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: '당일배송',
    description: '수거부터 배송까지 당일 완료',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-700',
    shadow: 'shadow-blue-200'
  },
  {
    icon: BadgeCheck,
    title: '전문 퀄리티',
    description: '전문 세탁 시설에서 안전하게',
    color: 'green',
    gradient: 'from-green-500 to-green-700',
    shadow: 'shadow-green-200'
  },
  {
    icon: PiggyBank,
    title: '합리적 가격',
    description: '가장 저렴한 세탁 비용',
    color: 'yellow',
    gradient: 'from-yellow-500 to-yellow-700',
    shadow: 'shadow-yellow-200'
  },
  {
    icon: Sparkles,
    title: '개별 포장',
    description: '깨끗한 개별 포장으로 배송',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-700',
    shadow: 'shadow-purple-200'
  }
]

const colorClasses = {
  blue: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-200',
  green: 'bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-green-200',
  yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200',
  purple: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 border-purple-200'
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
              initial={{ y: 30, opacity: 0, scale: 0.9 }}
              whileInView={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15, duration: 0.6, type: "spring", stiffness: 100 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -8, 
                scale: 1.05,
                transition: { duration: 0.3, type: "spring", stiffness: 300 }
              }}
              className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200 text-center relative overflow-hidden group hover:shadow-2xl transition-all duration-500"
            >
              {/* Background glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
              
              {/* Icon container with premium animation */}
              <motion.div 
                className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg ${feature.shadow} group-hover:shadow-xl transition-all duration-300`}
                whileHover={{ 
                  rotate: [0, -5, 5, -5, 0],
                  transition: { duration: 0.5 }
                }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl"></div>
                
                {/* Icon with bounce animation */}
                <motion.div
                  animate={{ 
                    y: [0, -2, 0],
                    transition: { 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }
                  }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
                
                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
              
              {/* Title with gradient text */}
              <motion.h3 
                className="font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2"
                style={{ fontFamily: 'Pretendard, sans-serif' }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {feature.title}
              </motion.h3>
              
              {/* Description with fade animation */}
              <motion.p 
                className="text-sm text-gray-600 leading-relaxed"
                style={{ fontFamily: 'Pretendard, sans-serif' }}
                initial={{ opacity: 0.7 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {feature.description}
              </motion.p>
              
              {/* Decorative dots */}
              <div className="flex justify-center gap-1 mt-3">
                {[0, 1, 2].map((dot) => (
                  <motion.div
                    key={dot}
                    className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.gradient}`}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                      transition: {
                        duration: 1.5,
                        repeat: Infinity,
                        delay: dot * 0.2,
                        ease: "easeInOut"
                      }
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}