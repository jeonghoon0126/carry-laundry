import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: '주문 완료 - carry',
  description: '주문이 성공적으로 완료되었습니다.'
}

export default function OrderCompletedPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#13C2C2] to-[#0FA8A8] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            
            {/* Success Message */}
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
              결제가 완료되었습니다!
            </h1>
            <p className="text-gray-600 text-sm">
              주문과 결제가 성공적으로 완료되었습니다.<br />
              세탁물을 안전하게 수거하여 깨끗하게 세탁해드리겠습니다.
            </p>
          </div>

          {/* Order Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 mb-1">결제 금액</p>
              <p className="text-xs text-gray-400">테스트 결제</p>
            </div>
            <p className="text-xl font-semibold text-gray-900">100원</p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              variant="primary"
              as="a"
              href="/mypage"
              className="w-full justify-center"
            >
              마이페이지로 이동
            </Button>

            <Button
              variant="secondary"
              as="a"
              href="/home"
              className="w-full justify-center"
            >
              홈으로 이동
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              주문 내역은 마이페이지에서 확인하실 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
