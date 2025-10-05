import { Metadata } from 'next'
import SimpleCheckoutSheet from '@/components/order/SimpleCheckoutSheet'
import PaymentErrorAlert from '@/components/order/PaymentErrorAlert'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: '세탁 주문 - carry',
  description: '세탁 서비스를 주문하세요'
}

interface OrderPageProps {
  searchParams: Promise<{ error?: string; reason?: string; status?: string }>
}

export default async function OrderPage({ searchParams }: OrderPageProps) {
  const params = await searchParams
  const hasPaymentError = params.error === 'payment_failed'

  return (
    <main className="min-h-screen bg-gray-50 py-4">
      <div className="mx-auto max-w-[390px] px-4 md:px-0">
        <PaymentErrorAlert />
        {hasPaymentError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">
              결제에 실패했습니다. 다시 시도해주세요.
            </p>
          </div>
        )}
        <SimpleCheckoutSheet />
      </div>
    </main>
  )
}