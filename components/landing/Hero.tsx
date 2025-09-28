'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Phone, ShoppingCart } from 'lucide-react'

interface HeroProps {
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
}

export default function Hero({ onPrimaryClick, onSecondaryClick }: HeroProps) {
  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const iconVariants = {
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  return (
    <>
      {/* Hero Image - First in DOM */}
      <section className="w-full flex justify-center py-8">
        <picture>
          <source srcSet="/assets/IMG_7402.webp" type="image/webp" />
          <Image
            src="/assets/IMG_7402.jpeg"
            alt="Carry Bedding Hero"
            width={768}
            height={1159}
            className="mx-auto h-auto w-full max-w-[520px]"
            sizes="(max-width: 640px) 100vw, 520px"
            priority
          />
        </picture>
      </section>

      {/* Text and Buttons Section - Second in DOM */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen flex items-center px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl md:text-5xl font-bold text-gray-800 mb-8 leading-tight"
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              세탁부터 배송까지,<br />
              <span className="text-blue-600">하루만에 끝내는</span><br />
              캐리 세탁 서비스
            </motion.h1>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {/* 전화문의 버튼 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSecondaryClick}
                className="w-full sm:w-auto px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2"
                style={{ fontFamily: 'Pretendard, sans-serif' }}
              >
                <Phone className="w-5 h-5" />
                전화문의
              </motion.button>

              {/* 구매하기 버튼 */}
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={onPrimaryClick}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                style={{ fontFamily: 'Pretendard, sans-serif' }}
              >
                <ShoppingCart className="w-5 h-5" />
                구매하기
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-10 w-4 h-4 bg-blue-200 rounded-full opacity-60"
          />
          <motion.div
            animate={{
              y: [0, -15, 0],
              x: [0, -8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute top-32 right-16 w-3 h-3 bg-purple-200 rounded-full opacity-50"
          />
          <motion.div
            animate={{
              y: [0, -25, 0],
              x: [0, 5, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-32 left-16 w-5 h-5 bg-indigo-200 rounded-full opacity-40"
          />
        </div>
      </section>
    </>
  )
}