export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import OrderHistory from '@/components/mypage/OrderHistory'
import { Metadata } from 'next'

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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white" style={{ fontFamily: 'Pretendard, sans-serif' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">마이 주문 내역</h1>
          <p className="text-gray-600">최근 주문한 세탁 서비스를 확인하세요</p>
        </div>
        
        {/* Tabs/Filter - placeholder for future expansion */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600">
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



