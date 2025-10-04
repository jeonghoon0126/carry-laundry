'use client'

import Header from '@/components/Header'
import Hero from '@/components/landing/Hero'
import FloatingViewers from '@/components/common/FloatingViewers'
import Footer from '@/components/common/Footer'
import BackToTop from '@/components/common/BackToTop'

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pt-14 pb-24 md:pb-28" style={{ fontFamily: 'Pretendard, sans-serif' }}>
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
