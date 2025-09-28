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
      {/* Hero Logo Image - First in DOM */}
      <section className="w-full flex justify-center py-8">
        <Image
          src="/assets/hero.png"
          alt="Carry hero logo"
          width={800}
          height={400}
          className="mx-auto h-auto w-full max-w-[600px]"
          priority
        />
      </section>

      {/* Text Section - Second in DOM */}
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

        {/* Enhanced Background Bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top-left bubbles */}
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
          
          {/* Additional bubbles for richer effect */}
          <motion.div
            animate={{
              y: [0, -18, 0],
              x: [0, 12, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute top-40 left-20 w-3 h-3 bg-cyan-200 rounded-full opacity-55"
          />
          <motion.div
            animate={{
              y: [0, -22, 0],
              x: [0, -6, 0],
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
            className="absolute top-16 right-24 w-5 h-5 bg-pink-200 rounded-full opacity-45"
          />
          <motion.div
            animate={{
              y: [0, -12, 0],
              x: [0, 8, 0],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2.5
            }}
            className="absolute bottom-40 right-12 w-4 h-4 bg-blue-300 rounded-full opacity-50"
          />
          <motion.div
            animate={{
              y: [0, -30, 0],
              x: [0, -10, 0],
            }}
            transition={{
              duration: 6.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
            className="absolute bottom-20 right-32 w-6 h-6 bg-purple-300 rounded-full opacity-35"
          />
          <motion.div
            animate={{
              y: [0, -16, 0],
              x: [0, 14, 0],
            }}
            transition={{
              duration: 5.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8
            }}
            className="absolute top-60 left-32 w-3 h-3 bg-indigo-300 rounded-full opacity-60"
          />
          <motion.div
            animate={{
              y: [0, -28, 0],
              x: [0, -12, 0],
            }}
            transition={{
              duration: 4.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.8
            }}
            className="absolute bottom-60 left-24 w-4 h-4 bg-cyan-300 rounded-full opacity-40"
          />
          <motion.div
            animate={{
              y: [0, -14, 0],
              x: [0, 6, 0],
            }}
            transition={{
              duration: 6.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2.2
            }}
            className="absolute top-80 right-8 w-5 h-5 bg-pink-300 rounded-full opacity-45"
          />
          <motion.div
            animate={{
              y: [0, -20, 0],
              x: [0, -8, 0],
            }}
            transition={{
              duration: 5.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3.5
            }}
            className="absolute bottom-80 left-8 w-3 h-3 bg-blue-400 rounded-full opacity-50"
          />
        </div>
      </section>
    </>
  )
}