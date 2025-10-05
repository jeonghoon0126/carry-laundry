export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import OrderHistory from '@/components/mypage/OrderHistory'
import { Metadata } from 'next'
import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '마이페이지 - carry',
  description: '내 주문 내역을 확인하세요'
}

export default async function MyPage() {
  const session = await getServerSession(authOptions)
  
  // Redirect to sign-in if not authenticated
  if (!session?.user?.id) {
    redirect('/signin?from=mypage')
  }

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
          <h1 className="text-xl font-semibold text-gray-900">마이 주문 내역</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">주문 내역</h2>
          <p className="text-gray-600">최근 주문한 세탁 서비스를 확인하세요</p>
        </div>
        
        {/* Tabs/Filter - placeholder for future expansion */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="border-b-2 border-[#13C2C2] py-2 px-1 text-sm font-medium text-[#13C2C2]">
                전체
              </button>
            </nav>
          </div>
        </div>
        
        <OrderHistory />
      </div>
    </main>
  )
}



