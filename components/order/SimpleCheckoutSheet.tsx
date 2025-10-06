'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, MessageSquare, CreditCard } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import type { AddressCore } from '@/lib/addresses'

interface PaymentMethod {
  id: string
  name: string
  description: string
  default?: boolean
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { 
    id: 'toss', 
    name: '토스 간편결제', 
    description: '빠르고 안전한 결제',
    default: true
  },
  { 
    id: 'card', 
    name: '카드결제', 
    description: '일반 카드 결제'
  },
]

interface SimpleCheckoutSheetProps {
  isLoading?: boolean
  shippingAddress?: AddressCore
  /** 외부(상단) 배송지 컴포넌트를 쓰는 경우, 내부 배송지 입력을 숨긴다 */
  hideAddressInput?: boolean
}

export default function SimpleCheckoutSheet({ isLoading = false, shippingAddress, hideAddressInput = true }: SimpleCheckoutSheetProps) {
  const router = useRouter()
  const [name, setName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('toss')
  const [specialRequests, setSpecialRequests] = useState<string>('')
  const [tossPaymentsError, setTossPaymentsError] = useState<string>('')
  const [isTossScriptLoaded, setIsTossScriptLoaded] = useState(false)

  // Dynamically load Toss Payments script
  useEffect(() => {
    if (paymentMethod === 'toss') {
      const loadTossPayments = async () => {
        try {
          const { loadTossPayments } = await import('@tosspayments/payment-sdk')
          await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '')
          setIsTossScriptLoaded(true)
        } catch (error) {
          console.error('Failed to load Toss Payments:', error)
          setTossPaymentsError('결제 시스템을 불러올 수 없습니다.')
        }
      }
      loadTossPayments()
    }
  }, [paymentMethod])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
      </div>
    )
  }

  const isFormValid = name && phone && address && paymentMethod

  const handlePay = async () => {
    if (tossPaymentsError || (paymentMethod === 'toss' && !isTossScriptLoaded)) {
      return
    }

    try {
      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone,
          address,
          specialRequests,
        }),
      })

      if (!orderResponse.ok) {
        throw new Error('주문 생성에 실패했습니다.')
      }

      const orderResult = await orderResponse.json()
      console.log('Order created:', orderResult)

      if (paymentMethod === 'toss') {
        // Load Toss Payments and process payment
        const { loadTossPayments } = await import('@tosspayments/payment-sdk')
        const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '')
        
        const orderId = `order_${orderResult.id}_${Date.now()}`
        const amount = Number(orderResult.amount || 11900)
        const orderName = '세탁 주문 1건'
        const customerName = name
        const customerEmail = 'customer@example.com'
        
        const successUrl = `${window.location.origin}/api/payments/confirm`
        const failUrl = `${window.location.origin}/order?error=payment_failed`

        console.info('[Toss] Opening widget', { orderId, orderName, amount, successUrl, failUrl })

        await tossPayments.requestPayment('카드', {
          amount,
          orderId,
          orderName,
          customerName,
          customerEmail,
          successUrl,
          failUrl,
        })
      }
    } catch (error) {
      console.error('Payment error:', error)
      router.push('/order?error=payment_failed')
    }
  }

  return (
    <div className="space-y-4">
      {/* Toss Payments Error Alert */}
      {tossPaymentsError && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
          <Badge variant="danger">{tossPaymentsError}</Badge>
        </div>
      )}


      {/* Name Input */}
      <div className="rounded-2xl bg-white shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          이름
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력해주세요"
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#13C2C2] focus:border-transparent"
        />
      </div>

      {/* Phone Input */}
      <div className="rounded-2xl bg-white shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          전화번호
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="010-1234-5678"
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#13C2C2] focus:border-transparent"
        />
      </div>

      {/* Address Input - 외부 AddressSection을 쓰면 숨김 */}
      {!hideAddressInput && (
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-[#13C2C2]" />
            <label className="text-sm font-medium text-gray-900">배송지</label>
          </div>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="주소를 입력해주세요 (예: 서울 관악구 과천대로 863)"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#13C2C2] focus:border-transparent"
          />
        </div>
      )}

      {/* Special Requests */}
      <div className="rounded-2xl bg-white shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-5 h-5 text-[#13C2C2]" />
          <h3 className="font-medium text-gray-900">요청사항</h3>
        </div>
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="특별한 요청사항이 있다면 적어주세요"
          className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-[#13C2C2] focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Payment Method */}
      <div className="rounded-2xl bg-white shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-5 h-5 text-[#13C2C2]" />
          <h3 className="font-medium text-gray-900">결제 수단</h3>
        </div>
        <div className="space-y-2">
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                paymentMethod === method.id
                  ? 'border-[#13C2C2] bg-[#13C2C2]/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={method.id}
                checked={paymentMethod === method.id}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-[#13C2C2]"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{method.name}</div>
                <div className="text-sm text-gray-500">{method.description}</div>
              </div>
              {method.default && (
                <span className="text-xs bg-[#13C2C2]/10 text-[#13C2C2] px-2 py-1 rounded-full">
                  기본
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="rounded-2xl bg-white shadow-sm p-4">
        <h3 className="font-medium text-gray-900 mb-3">주문 요약</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">세탁 서비스</span>
            <span className="text-gray-900">10,000원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">배달비</span>
            <span className="text-gray-900">1,900원</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span className="text-gray-900">총 결제금액</span>
              <span className="text-gray-900">11,900원</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="sticky bottom-4 pt-4">
        <Button
          variant="primary"
          onClick={handlePay}
          disabled={!isFormValid || tossPaymentsError !== '' || (paymentMethod === 'toss' && !isTossScriptLoaded)}
          className="w-full py-4 text-lg font-semibold"
        >
          {!isFormValid 
            ? '주문 정보를 입력해주세요'
            : tossPaymentsError || (paymentMethod === 'toss' && !isTossScriptLoaded)
            ? '결제 준비 중...'
            : '11,900원 결제하기'
          }
        </Button>
      </div>
    </div>
  )
}
