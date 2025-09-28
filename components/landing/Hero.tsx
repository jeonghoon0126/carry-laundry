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
      {/* Text Section - First in DOM */}
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

      {/* Hero Image - Second in DOM */}
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
    </>
  )
}