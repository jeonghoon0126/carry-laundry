import OrderForm from '@/components/landing/OrderForm'
import PaymentErrorAlert from '@/components/order/PaymentErrorAlert'
import { Suspense } from 'react'
import Link from 'next/link'

interface OrderPageProps {
  searchParams: Promise<{ error?: string; reason?: string; status?: string }>
}

export default async function OrderPage({ searchParams }: OrderPageProps) {
  const params = await searchParams
  const hasPaymentError = params.error === 'payment_failed'

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Temporary link to new design */}
      <div className="mb-6 text-center">
        <Link 
          href="/order/new" 
          className="text-sm text-[#13C2C2] hover:text-[#0FA8A8] underline"
        >
          새 디자인으로 보기
        </Link>
      </div>
      
      <PaymentErrorAlert />
      {hasPaymentError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 text-center">
            결제에 실패했습니다. 다시 시도해주세요.
          </p>
        </div>
      )}
      <OrderForm />
    </main>
  )
}