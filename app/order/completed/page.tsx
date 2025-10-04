import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Home, User } from 'lucide-react'

export const metadata: Metadata = {
  title: '주문 완료 - carry',
  description: '주문이 성공적으로 완료되었습니다.'
}

export default function OrderCompletedPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4" style={{ fontFamily: 'Pretendard, sans-serif' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            {/* Success Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              결제가 완료되었습니다!
            </h1>
            <p className="text-gray-600 text-sm">
              주문과 결제가 성공적으로 완료되었습니다.<br />
              세탁물을 안전하게 수거하여 깨끗하게 세탁해드리겠습니다.
            </p>
          </div>

          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">결제 금액</p>
            <p className="text-xl font-bold text-gray-900">100원</p>
            <p className="text-xs text-gray-500 mt-1">테스트 결제</p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            {/* Primary CTA - My Page */}
            <Link
              href="/mypage"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <User className="w-5 h-5 mr-2" />
              마이페이지로 이동
            </Link>

            {/* Secondary CTA - Home */}
            <Link
              href="/home"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              홈으로 이동
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              주문 내역은 마이페이지에서 확인하실 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
