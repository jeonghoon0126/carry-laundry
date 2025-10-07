'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Package, MapPin } from 'lucide-react'
import OrderHistory from './OrderHistory'
import AddressManager from './AddressManager'

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
          <Link
            href="/home"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="홈으로 돌아가기"
          >
            <Home className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">마이페이지</h1>
        </div>

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            안녕하세요, {user.name || '고객'}님! 👋
          </h2>
          <p className="text-gray-600">캐리와 함께 깔끔한 세탁 서비스를 이용하세요</p>
        </div>
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? 'border-[#13C2C2] text-[#13C2C2]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
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
    </main>
  )
}
