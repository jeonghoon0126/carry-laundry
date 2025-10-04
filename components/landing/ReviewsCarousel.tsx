'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Skeleton from '@/components/common/Skeleton'

const IMAGES = [
  "/assets/review_1.png",
  "/assets/review_2.png",
  "/assets/review_3.png",
  "/assets/review_4.png",
  "/assets/review_5.png",
  "/assets/review_6.png",
  "/assets/review_7.png",
]

export default function ReviewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Preload next slide image
  useEffect(() => {
    const preloadIndex = (currentIndex + 1) % IMAGES.length
    const img = new window.Image()
    img.src = IMAGES[preloadIndex]
  }, [currentIndex])

  // Autoplay functionality
  useEffect(() => {
    if (!isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % IMAGES.length)
      }, 3000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isHovered])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsLoading(true)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length)
    setIsLoading(true)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % IMAGES.length)
    setIsLoading(true)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious()
      } else if (event.key === 'ArrowRight') {
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div 
      className="relative w-full overflow-hidden my-0 py-0"
      role="region"
      aria-label="Customer reviews"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {/* Carousel Track */}
      <div className="flex touch-pan-x select-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="shrink-0 basis-full flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ 
              opacity: 1, 
              scale: 1.03,
              rotateZ: isHovered ? (Math.random() - 0.5) * 2 : 0,
              y: isHovered ? -2 : 0
            }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 28
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, { offset, velocity }) => {
              if (Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500) {
                if (offset.x > 0 || velocity.x > 0) {
                  goToPrevious()
                } else {
                  goToNext()
                }
              }
            }}
          >
            <div className="relative w-full aspect-[3/4] overflow-hidden">
              {isLoading && <Skeleton className="absolute inset-0" />}
              <Image
                src={IMAGES[currentIndex]}
                alt="Customer review"
                fill
                sizes="100vw"
                className={`object-contain w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZWVlIi8+PC9zdmc+"
                onLoadingComplete={() => setIsLoading(false)}
                loading={currentIndex === 0 ? "eager" : "lazy"}
                priority={currentIndex === 0}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute top-1/2 -translate-y-1/2 left-2 right-auto z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
        aria-label="Previous review"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute top-1/2 -translate-y-1/2 right-2 left-auto z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
        aria-label="Next review"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Navigation */}
      <div className="flex justify-center gap-2 mt-3">
        {IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-gray-600 scale-125' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to review ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
