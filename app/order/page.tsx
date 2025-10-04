import OrderForm from '@/components/landing/OrderForm'
import PaymentErrorAlert from '@/components/order/PaymentErrorAlert'
import { Suspense } from 'react'

interface OrderPageProps {
  searchParams: Promise<{ error?: string; reason?: string; status?: string }>
}

export default async function OrderPage({ searchParams }: OrderPageProps) {
  const params = await searchParams
  const hasPaymentError = params.error === 'payment_failed'

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
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