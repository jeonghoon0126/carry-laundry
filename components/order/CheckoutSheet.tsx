'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Clock, MessageSquare, CreditCard, Search } from 'lucide-react'
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

// Daum Postcode types
declare global {
  interface Window {
    daum: any
  }
}

export default function CheckoutSheet({ isLoading = false }: CheckoutSheetProps) {
  const router = useRouter()
  const [pickupTime, setPickupTime] = useState<string>('')
  const [deliveryTime, setDeliveryTime] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('toss')
  const [specialRequests, setSpecialRequests] = useState<string>('')
  const [address, setAddress] = useState<string>('')

  // Daum Postcode function
  const openDaumPostcode = () => {
    if (typeof window !== 'undefined' && window.daum) {
      new window.daum.Postcode({
        oncomplete: function(data: any) {
          // 주소 정보를 조합하여 표시할 주소
          let fullAddr = ''
          let extraAddr = ''

          // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
          if (data.userSelectedType === 'R') {
            // 사용자가 도로명 주소를 선택했을 경우
            fullAddr = data.roadAddress
          } else {
            // 사용자가 지번 주소를 선택했을 경우
            fullAddr = data.jibunAddress
          }

          // 사용자가 선택한 주소가 도로명 타입일때 조합한다.
          if (data.userSelectedType === 'R') {
            // 법정동명이 있을 경우 추가한다.
            if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
              extraAddr += data.bname
            }
            // 건물명이 있고, 공동주택일 경우 추가한다.
            if (data.buildingName !== '' && data.apartment === 'Y') {
              extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName)
            }
            // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
            if (extraAddr !== '') {
              extraAddr = ' (' + extraAddr + ')'
            }
            // 조합된 참고항목을 해당 필드에 넣는다.
            fullAddr += extraAddr
          }

          // 우편번호와 주소 정보를 해당 필드에 넣는다.
          setAddress(fullAddr)
        }
      }).open()
    } else {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
    }
  }

  if (isLoading) {
    return <CheckoutSkeleton />
  }

  const isFormValid = pickupTime && deliveryTime && paymentMethod && address

  const handlePay = () => {
    const payload = {
      address: address,
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
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-[#13C2C2]" />
          <h3 className="font-medium text-gray-900">배송지</h3>
        </div>
        
        <div className="space-y-3">
          {/* Address Input with Search Button */}
          <div className="flex gap-2">
            <input
              id="addressInput"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="주소를 입력하거나 검색해주세요"
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#13C2C2] focus:border-transparent"
            />
            <button
              onClick={openDaumPostcode}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-medium"
            >
              <Search className="w-4 h-4" />
              주소 검색
            </button>
          </div>
          
          {/* Address Display */}
          {address && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">선택된 주소</div>
              <div className="text-sm font-medium text-gray-900">{address}</div>
            </div>
          )}
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