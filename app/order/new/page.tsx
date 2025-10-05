import { Metadata } from 'next'
import CheckoutSheet from '@/components/order/CheckoutSheet'

export const metadata: Metadata = {
  title: '세탁 주문 - carry',
  description: '세탁 서비스를 주문하세요'
}

export default function NewOrderPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-4">
      <div className="mx-auto max-w-[390px] px-4 md:px-0">
        <CheckoutSheet />
      </div>
    </main>
  )
}
