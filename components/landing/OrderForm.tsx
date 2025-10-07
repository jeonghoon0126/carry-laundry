'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import DaumPostcode from 'react-daum-postcode'
import { CheckCircle, Truck, CreditCard } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useOrderDraft, usePreserveDraftAndSignIn } from '@/lib/hooks/useOrderDraft'
import { useAddressValidation } from '@/lib/hooks/useAddressValidation'
import { loadTossPayments } from '@tosspayments/payment-sdk'

const orderSchema = z.object({
  name: z.string().min(2, '이름을 입력해주세요'),
  phone: z.string().regex(/^01[0-9]-?\d{3,4}-?\d{4}$/, '올바른 전화번호 형식을 입력해주세요'),
  address: z.string().min(5, '주소를 입력해주세요'),
  buildingDetail: z.string().optional(),
})

type OrderForm = z.infer<typeof orderSchema>

export default function OrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPostcode, setShowPostcode] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)

  const { data: session } = useSession()
  const router = useRouter()
  const preserveDraftAndSignIn = usePreserveDraftAndSignIn()

  // Draft persistence
  const { draft, setField, clearDraft, setSubmitRejected, clearSubmitRejected, hasHydrated } = useOrderDraft()
  const hydratedRef = useRef(false)

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema)
  })

  const address = watch('address')
  const name = watch('name')
  const phone = watch('phone')

  // Address validation
  const { isValidating, isServiceable, message, validateNow } = useAddressValidation(address)

  // Clear rejection flag when address becomes serviceable
  useEffect(() => {
    if (isServiceable && draft.submitRejectedNotServiceable && !isValidating) {
      clearSubmitRejected()
    }
  }, [isServiceable, draft.submitRejectedNotServiceable, isValidating, clearSubmitRejected])

  // One-time hydration from draft when ready (prevents infinite loops)
  useEffect(() => {
    if (hasHydrated && !hydratedRef.current && Object.keys(draft).length > 0) {
      hydratedRef.current = true
      
      // Use reset to set all values at once without triggering individual field changes
      reset({
        name: draft.name || '',
        phone: draft.phone || '',
        address: draft.address || '',
        buildingDetail: ''
      })
      
      if (process.env.NODE_ENV === 'development') {
        console.info('Form hydrated from draft')
      }
    }
  }, [hasHydrated, draft, reset])

  // Update draft only when user actually types (not during hydration)
  useEffect(() => {
    if (hasHydrated && hydratedRef.current && name !== undefined) {
      setField('name', name || '')
    }
  }, [name, hasHydrated])

  useEffect(() => {
    if (hasHydrated && hydratedRef.current && phone !== undefined) {
      setField('phone', phone || '')
    }
  }, [phone, hasHydrated])

  useEffect(() => {
    if (hasHydrated && hydratedRef.current && address !== undefined) {
      setField('address', address || '')
    }
  }, [address, hasHydrated])

  const handlePostcodeComplete = (data: any) => {
    let fullAddress = data.address
    let extraAddress = ''

    if (data.addressType === 'R') {
      if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
        extraAddress += data.bname
      }
      if (data.buildingName !== '' && data.apartment === 'Y') {
        extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName)
      }
      if (extraAddress !== '') {
        extraAddress = ` (${extraAddress})`
      }
      fullAddress += extraAddress
    }

    setValue('address', fullAddress)
    setShowPostcode(false)
  }

  const processPayment = async (orderId: string, amount: number) => {
    // Guard against duplicate payment attempts
    if (isProcessingPayment) return
    
    try {
      setIsProcessingPayment(true)
      
      // Create unique orderId: order_<dbId>_<timestamp>
      const stableId = String(orderId)
      const uniqueOrderId = `order_${stableId}_${Date.now()}`
      
      const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!)
      
      const orderName = "세탁 주문 1건"
      const origin =
        typeof window !== "undefined"
          ? window.location.origin                 // 브라우저(클라이언트)일 때
          : process.env.NEXT_PUBLIC_SITE_URL       // SSR일 때 대비용(버셀 도메인)
            || "http://localhost:3000";

      const successUrl = `${origin}/api/payments/confirm`;
      const failUrl    = `${origin}/order?error=payment_failed&reason=${encodeURIComponent('결제가 취소되었습니다')}`;
      
      console.info('[Order] created', { id: orderId, amount })
      console.info('[Toss] open', { orderId: uniqueOrderId, amount })
      
      await tossPayments.requestPayment('카드', {
        amount: amount,
        orderId: uniqueOrderId,
        orderName: orderName,
        customerName: watch('name'),
        customerEmail: 'test@example.com',
        successUrl: successUrl,
        failUrl: failUrl,
      })
    } catch (error) {
      console.error('Payment error:', error)
      
      let errorMessage = '결제 중 오류가 발생했습니다.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      console.error('Payment error details:', {
        error,
        message: errorMessage,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name
      });
      
      alert(errorMessage);
      setIsProcessingPayment(false);
    }
  }

  const onSubmit = async (data: OrderForm) => {
    // Get current form values for draft preservation
    const currentDraft = {
      name: data.name,
      phone: data.phone,
      address: data.address + (data.buildingDetail ? ` ${data.buildingDetail}` : '')
    }

    // client pre-check (no UI change)
    if (!session?.user) {
      preserveDraftAndSignIn(currentDraft, 'order')
      return
    }

    setIsSubmitting(true)

    try {
      // Always validate address before submitting (no debounce, immediate validation)
      const validationResult = await validateNow()
      
      if (!validationResult.isServiceable) {
        // Set rejection flag and show error
        setSubmitRejected(true)
        alert(validationResult.message || '서비스 가능한 지역이 아닙니다.')
        return
      }

      // Clear any previous error state if validation passes
      if (draft.submitRejectedNotServiceable) {
        clearSubmitRejected()
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          address: data.address + (data.buildingDetail ? ` ${data.buildingDetail}` : '')
        }),
      })

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        const errorText = await response.text().catch(() => "")
        console.error('Order API error (JSON parse failed):', response.status, errorText)
        alert('주문 접수 중 오류가 발생했습니다.')
        return
      }

      if (!response.ok) {
        // Handle 401 specifically for login requirement
        if (response.status === 401) {
          preserveDraftAndSignIn(currentDraft, 'order')
          return
        }
        
        // Handle 422 (validation error) - set rejection flag, keep draft
        if (response.status === 422) {
          console.error('Address validation failed:', result.error)
          setSubmitRejected(true)
          alert(result.error || '주소가 서비스 가능한 지역이 아닙니다.')
          return
        }
        
        console.error('Order API error:', response.status, result.error || 'Unknown error')
        alert(result.error || '주문 접수 중 오류가 발생했습니다.')
        return
      }

      // Success - store order ID and start payment process
      setCurrentOrderId(result.id)
      clearDraft()
      const payAmount = Number(result.amount || 11900)
      await processPayment(result.id, payAmount)
    } catch (error) {
      console.error('Error:', error)
      alert('주문 접수 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <section id="order-form" className="py-8 sm:py-12 px-4 bg-white">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Pretendard, sans-serif' }}>세탁 주문</h2>
              <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Pretendard, sans-serif' }}>간단한 정보 입력으로 빠르게 주문하세요</p>
            </div>

            {showSuccess && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
              >
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium" style={{ fontFamily: 'Pretendard, sans-serif' }}>주문이 접수되었습니다!</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Pretendard, sans-serif' }}>
                  이름 *
                </label>
                <input
                  {...register('name')}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="이름을 입력하세요"
                  style={{ fontFamily: 'Pretendard, sans-serif' }}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Pretendard, sans-serif' }}>{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Pretendard, sans-serif' }}>
                  전화번호 *
                </label>
                <input
                  {...register('phone')}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="010-1234-5678"
                  style={{ fontFamily: 'Pretendard, sans-serif' }}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Pretendard, sans-serif' }}>{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Pretendard, sans-serif' }}>
                  주소 *
                </label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <input
                    {...register('address')}
                    className="flex-1 px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    placeholder="주소를 검색하거나 입력하세요"
                    style={{ fontFamily: 'Pretendard, sans-serif' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPostcode(true)}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base whitespace-nowrap"
                    style={{ fontFamily: 'Pretendard, sans-serif' }}
                  >
                    주소 검색
                  </button>
                </div>
                <input
                  {...register('buildingDetail')}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="상세주소 (동/호수 등)"
                  style={{ fontFamily: 'Pretendard, sans-serif' }}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Pretendard, sans-serif' }}>{errors.address.message}</p>
                )}
                
                {/* Address validation feedback */}
                {address && address.trim().length >= 5 && (
                  <div className="mt-2">
                    {isValidating ? (
                      <div className="text-sm text-blue-600 flex items-center" style={{ fontFamily: 'Pretendard, sans-serif' }}>
                        <span aria-hidden="true" className="animate-spin inline-block rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></span>
                        {message}
                      </div>
                    ) : message ? (
                      <div className={`text-sm ${isServiceable ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: 'Pretendard, sans-serif' }}>
                        {message}
                      </div>
                    ) : null}
                    
                    {/* Show rejection message if submit was rejected and address is not serviceable */}
                    {draft.submitRejectedNotServiceable && !isValidating && !isServiceable && (
                      <p className="text-sm text-red-600 mt-1" style={{ fontFamily: 'Pretendard, sans-serif' }}>
                        이전 주문이 서비스 가능한 지역이 아니어서 거부되었습니다. 주소를 수정해주세요.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isProcessingPayment || Boolean(address && address.trim().length >= 5 && !isServiceable && !isValidating)}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center text-base sm:text-lg"
                style={{ fontFamily: 'Pretendard, sans-serif' }}
              >
                {isProcessingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    결제 진행 중...
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    주문 접수 중...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    결제하기
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Postcode Modal */}
      {showPostcode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'Pretendard, sans-serif' }}>주소 검색</h3>
              <button
                onClick={() => setShowPostcode(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <DaumPostcode
              onComplete={handlePostcodeComplete}
              autoClose={false}
              style={{ width: '100%', height: '400px' }}
            />
          </div>
        </div>
      )}
    </>
  )
}