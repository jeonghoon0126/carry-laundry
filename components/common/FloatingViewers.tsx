'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function FloatingViewers() {
  const pathname = usePathname()
  const [viewers, setViewers] = useState<number | null>(null)

  useEffect(() => {
    setViewers(Math.floor(Math.random() * 8) + 2)
  }, [])

  // Only show on home page
  if (pathname !== '/home') return null

  return (
    <motion.div
      className="fixed top-16 left-1/2 -translate-x-1/2 z-50 rounded-full bg-white/90 backdrop-blur shadow-md px-3 py-1 text-sm font-bold text-gray-700"
      animate={{ y: [0, -6, 0], scale: [1, 1.05, 1] }}
      transition={{
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity
      }}
      role="status" 
      aria-live="polite"
    >
      🔥 <span suppressHydrationWarning>{viewers ?? ''}</span>명이 보고 있어요
    </motion.div>
  )
}
