'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, MessageSquare, CreditCard } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dynamically load Toss Payments script
  useEffect(() => {
    const loadTossPayments = async () => {
      try {
        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
        if (!clientKey) {
          setTossPaymentsError('Toss Payments 클라이언트 키가 설정되지 않았습니다.');
          return;
        }
        
        const { loadTossPayments } = await import('@tosspayments/payment-sdk')
        const tossPayments = await loadTossPayments(clientKey)
        
        // 전역 객체에 저장
        if (typeof window !== 'undefined') {
          (window as any).TossPayments = tossPayments;
        }
        setIsTossScriptLoaded(true)
        console.log('Toss Payments loaded successfully', tossPayments)
      } catch (error) {
        console.error('Failed to load Toss Payments:', error)
        setTossPaymentsError('결제 시스템을 불러올 수 없습니다.')
      }
    }
    
    // 컴포넌트 마운트 시 즉시 로드
    loadTossPayments()
  }, [])

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

  // CTA 활성화 조건: 이름/전화/주소 3개만 만족하면 활성화, 상태는 렌더마다 즉시 반영
  const isDisabled =
    isSubmitting ||
    !name?.trim() ||
    !/^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone || "") ||
    !shippingAddress?.address1?.trim();

  const handlePayment = async () => {
    try {
      if (isDisabled) return;
      setIsSubmitting(true);

      // ✅ 관악구 제한 (배달 가능 지역)
      const addressText = shippingAddress?.address1 || "";
      if (!addressText.includes("관악구")) {
        alert("현재는 관악구 내 주소만 주문 가능합니다.");
        setIsSubmitting(false);
        return;
      }

      // ✅ 결제수단 무엇을 선택하든 Toss 결제창으로 연결
      if (tossPaymentsError || !isTossScriptLoaded) {
        throw new Error('Toss Payments not ready');
      }
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
          shippingAddress: shippingAddress ? {
            addressDetail: shippingAddress.addressDetail,
            entranceMethod: shippingAddress.entranceMethod,
            entranceNote: shippingAddress.entranceNote,
          } : undefined,
        }),
      })

      if (!orderResponse.ok) {
        throw new Error('주문 생성에 실패했습니다.')
      }

      const orderResult = await orderResponse.json()
      console.log('Order created:', orderResult)

      // 모든 결제수단은 Toss로 처리
      console.log('Starting Toss payment process...')
      
      const orderId = `order_${orderResult.id}_${Date.now()}`
      const amount = Number(orderResult.amount || 11900)
      const orderName = '세탁 주문 1건'
      const customerName = name
      const customerEmail = 'customer@example.com'
      
      const successUrl = `${window.location.origin}/api/payments/confirm`
      const failUrl = `${window.location.origin}/order?error=payment_failed`

      console.info('[Toss] Opening widget', { orderId, orderName, amount, successUrl, failUrl })

      // Toss Payments 위젯 열기
      const tossPayments = (window as any).TossPayments;
      if (!tossPayments) {
        console.error('TossPayments not found on window object');
        throw new Error('Toss Payments가 로드되지 않았습니다.');
      }

      console.log('Calling TossPayments.requestPayment...');
      
      await tossPayments.requestPayment('카드', {
        amount,
        orderId,
        orderName,
        customerName,
        customerEmail,
        successUrl,
        failUrl,
      })
    } catch (err) {
      console.error("Payment error", err);
      router.push('/order?error=payment_failed');
    } finally {
      setIsSubmitting(false);
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
          onClick={handlePayment}
          disabled={isDisabled}
          className={cn(
            "w-full h-14 rounded-xl font-semibold transition",
            isDisabled
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-[#13C2C2] text-white hover:brightness-95"
          )}
        >
          {isSubmitting ? "결제 중..." : "주문하기"}
        </Button>
      </div>
    </div>
  )
}
