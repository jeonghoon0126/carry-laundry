'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="p-4 sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200">
      <Link href="/" className="inline-block">
        <Image 
          src="/assets/carry-logo.png" 
          alt="Carry Logo" 
          width={120} 
          height={40} 
          priority 
        />
      </Link>
    </header>
  )
}
