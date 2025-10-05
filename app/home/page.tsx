'use client'

import Header from '@/components/Header'
import Hero from '@/components/landing/Hero'
import FloatingViewers from '@/components/common/FloatingViewers'
import Footer from '@/components/common/Footer'
import BackToTop from '@/components/common/BackToTop'

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gray-50 pt-14 pb-24 md:pb-28">
      <div id="top" />
      <Header />
      
      <div className="relative">
        <FloatingViewers />
      </div>
      <div className="space-y-6 md:space-y-8">
        <Hero />
      </div>
      
      
      {/* Footer */}
      <Footer />
      
      <BackToTop />
    </div>
  )
}
