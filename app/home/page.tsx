'use client'

import { useRef } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/landing/Hero'
import FeatureCards from '@/components/landing/FeatureCards'
import Comparison from '@/components/landing/Comparison'
import Timeline from '@/components/landing/Timeline'
import Testimonials from '@/components/landing/Testimonials'
import Notice from '@/components/landing/Notice'
import OrderForm from '@/components/landing/OrderForm'
import StickyBar from '@/components/landing/StickyBar'

export default function HomePage() {
  const orderFormRef = useRef<HTMLDivElement>(null)

  const scrollToOrder = () => {
    const element = document.getElementById('order-form')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white" style={{ fontFamily: 'Pretendard, sans-serif' }}>
      <div id="top" />
      <Header />
      <div className="space-y-6 md:space-y-8">
        <Hero onPrimaryClick={scrollToOrder} />
        <FeatureCards />
        <Comparison />
        <Timeline />
        <Testimonials />
        <Notice />
        <OrderForm />
        <StickyBar onPrimaryClick={scrollToOrder} />
      </div>
    </div>
  )
}
