'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, Package, MapPin } from 'lucide-react'
import OrderHistory from './OrderHistory'
import AddressManager from './AddressManager'
import OrderProgressBottomSheet from '@/components/order/OrderProgressBottomSheet'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface MyPageClientProps {
  user: User
}

type TabType = 'orders' | 'addresses'

export default function MyPageClient({ user }: MyPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('orders')
  const [showOrderProgress, setShowOrderProgress] = useState(false)
  const [hasActiveOrder, setHasActiveOrder] = useState(false)

  // 활성 주문 확인
  useEffect(() => {
    const checkActiveOrder = async () => {
      try {
        const response = await fetch('/api/orders/latest')
        if (response.ok) {
          const order = await response.json()
          setHasActiveOrder(!!order)
        }
      } catch (error) {
        console.error('Error checking active order:', error)
        setHasActiveOrder(false)
      }
    }

    checkActiveOrder()

    // 30초마다 활성 주문 상태 확인
    const interval = setInterval(checkActiveOrder, 30000)
    return () => clearInterval(interval)
  }, [])

  const tabs = [
    {
      id: 'orders' as TabType,
      label: '주문 내역',
      icon: Package,
      description: '최근 주문한 세탁 서비스를 확인하세요'
    },
    {
      id: 'addresses' as TabType,
      label: '배송지 관리',
      icon: MapPin,
      description: '배송지를 추가하고 관리하세요'
    }
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="flex items-center gap-3 py-3 mb-6">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/home"
              className="group relative p-3 hover:bg-gray-100 rounded-full transition-all duration-200 overflow-hidden"
              aria-label="홈으로 돌아가기"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <Home className="w-4 h-4 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 rounded-full"></div>
            </Link>
          </motion.div>
          <h1 className="text-xl font-semibold text-gray-900">마이페이지</h1>
        </div>

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            안녕하세요, {user.name || '고객'}님! 👋
          </h2>
          <p className="text-gray-600">캐리와 함께 깔끔한 세탁 서비스를 이용하세요</p>
        </div>

        {/* Active Order Progress Button */}
        {hasActiveOrder && (
          <div className="mb-6">
            <motion.button
              onClick={() => setShowOrderProgress(true)}
              className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-[1.02] overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={{ 
                  y: [0, -2, 0],
                  transition: { 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }
                }}
                whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
              >
                <Package className="w-5 h-5" />
              </motion.div>
              <span className="font-semibold">현재 주문 진행상황 보기</span>
              
              {/* Sparkle effects */}
              <div className="absolute top-2 right-2 w-2 h-2 bg-white/60 rounded-full animate-ping"></div>
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl"></div>
            </motion.button>
          </div>
        )}
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 transition-all duration-200 overflow-hidden ${
                      isActive
                        ? 'border-[#13C2C2] text-[#13C2C2]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={isActive ? { 
                        rotate: [0, -10, 10, 0],
                        scale: [1, 1.2, 1],
                        transition: { duration: 0.8, repeat: Infinity, repeatDelay: 1.5 }
                      } : {}}
                      whileHover={{ scale: 1.3, rotate: [0, -5, 5, 0] }}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.div>
                    {tab.label}
                    
                    {/* Active indicator shimmer */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#13C2C2]/20 to-transparent"
                        animate={{ 
                          x: ['-100%', '100%'],
                          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Description */}
        <div className="mb-6">
          <p className="text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'orders' && <OrderHistory />}
          {activeTab === 'addresses' && <AddressManager />}
        </div>
      </div>

      {/* Order Progress Bottom Sheet */}
      <OrderProgressBottomSheet
        isOpen={showOrderProgress}
        onClose={() => setShowOrderProgress(false)}
      />
    </main>
  )
}
