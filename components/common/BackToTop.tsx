'use client'

import { useState, useEffect } from 'react'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 200) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-x-0 bottom-24 md:bottom-28 z-50 flex justify-center">
      <div className="max-w-[520px] w-full px-4 flex justify-end">
        <button
          aria-label="상단으로 이동"
          className="w-12 h-12 rounded-full bg-gray-900/50 hover:bg-gray-900/70 active:bg-gray-900/80 shadow-lg backdrop-blur flex items-center justify-center transition"
          onClick={scrollToTop}
        >
          ↑
        </button>
      </div>
    </div>
  )
}
