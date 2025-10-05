'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Clock, MessageSquare, CreditCard } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import CheckoutSkeleton from './CheckoutSkeleton'

interface TimeSlot {
  id: string
  label: string
  value: string
}

interface PaymentMethod {
  id: string
  name: string
  description: string
  default?: boolean
}

const PICKUP_TIMES: TimeSlot[] = [
  { id: 'today-afternoon', label: '오늘 오후', value: 'today-afternoon' },
  { id: 'today-evening', label: '오늘 저녁', value: 'today-evening' },
  { id: 'tomorrow-morning', label: '내일 오전', value: 'tomorrow-morning' },
  { id: 'tomorrow-afternoon', label: '내일 오후', value: 'tomorrow-afternoon' },
]

const DELIVERY_TIMES: TimeSlot[] = [
  { id: 'tomorrow-afternoon', label: '내일 오후', value: 'tomorrow-afternoon' },
  { id: 'tomorrow-evening', label: '내일 저녁', value: 'tomorrow-evening' },
  { id: 'day-after-morning', label: '모레 오전', value: 'day-after-morning' },
  { id: 'day-after-afternoon', label: '모레 오후', value: 'day-after-afternoon' },
]

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

interface CheckoutSheetProps {
  isLoading?: boolean
}

export default function CheckoutSheet({ isLoading = false }: CheckoutSheetProps) {
  const router = useRouter()
  const [pickupTime, setPickupTime] = useState<string>('')
  const [deliveryTime, setDeliveryTime] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('toss')
  const [specialRequests, setSpecialRequests] = useState<string>('')

  // Mock address data - in real app this would come from props/context
  const address = {
    main: '서울 관악구 과천대로 863',
    detail: '남현동, 1층',
    full: '서울 관악구 과천대로 863 (남현동)'
  }

  if (isLoading) {
    return <CheckoutSkeleton />
  }

  const isFormValid = pickupTime && deliveryTime && paymentMethod

  const handlePay = () => {
    const payload = {
      address: address.full,
      pickupTime,
      deliveryTime,
      paymentMethod,
      specialRequests,
      amount: 11900
    }
    
    console.log('Order payload:', payload)
    // TODO: Call existing order create + toss checkout
    router.push('/order')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 py-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">세탁 주문</h1>
      </div>

      {/* Address Card */}
      <div className="rounded-2xl bg-white shadow-sm p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <MapPin className="w-5 h-5 text-[#13C2C2] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-gray-900 mb-1">배송지</div>
              <div className="text-sm text-gray-600 mb-1">{address.main}</div>
              <div className="text-xs text-gray-500">{address.detail}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            as="a"
            href="/home"
            className="text-[#13C2C2] hover:text-[#0FA8A8]"
          >
            변경
          </Button>
        </div>
      </div>

      {/* Pickup Time Selection */}
      <div className="rounded-2xl bg-white shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-[#13C2C2]" />
          <h3 className="font-medium text-gray-900">수거 시간</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PICKUP_TIMES.map((time) => (
            <button
              key={time.id}
              onClick={() => setPickupTime(time.value)}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                pickupTime === time.value
                  ? 'border-[#13C2C2] bg-[#13C2C2]/10 text-[#13C2C2]'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {time.label}
            </button>
          ))}
        </div>
      </div>

      {/* Delivery Time Selection */}
      <div className="rounded-2xl bg-white shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-[#13C2C2]" />
          <h3 className="font-medium text-gray-900">배송 시간</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DELIVERY_TIMES.map((time) => (
            <button
              key={time.id}
              onClick={() => setDeliveryTime(time.value)}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                deliveryTime === time.value
                  ? 'border-[#13C2C2] bg-[#13C2C2]/10 text-[#13C2C2]'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {time.label}
            </button>
          ))}
        </div>
      </div>

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
          disabled={!isFormValid}
          className="w-full py-4 text-lg font-semibold"
        >
          {isFormValid ? '11,900원 결제하기' : '주문 정보를 입력해주세요'}
        </Button>
      </div>
    </div>
  )
}
