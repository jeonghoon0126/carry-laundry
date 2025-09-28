'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import DaumPostcode from 'react-daum-postcode'
import { CheckCircle, Truck } from 'lucide-react'

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

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema)
  })

  const address = watch('address')

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

  const onSubmit = async (data: OrderForm) => {
    setIsSubmitting(true)

    try {
      const supabase = getSupabaseBrowser()
      const { error } = await supabase
        .from('orders')
        .insert([
          {
            name: data.name,
            phone: data.phone,
            address: data.address + (data.buildingDetail ? ` ${data.buildingDetail}` : '')
          }
        ])

      if (error) {
        console.error('Error inserting order:', error)
        alert('주문 접수 중 오류가 발생했습니다.')
        return
      }

      setShowSuccess(true)
      reset()
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error:', error)
      alert('주문 접수 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <section id="order-form" className="py-12 px-4 bg-white">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Pretendard, sans-serif' }}>세탁 주문</h2>
              <p className="text-gray-600" style={{ fontFamily: 'Pretendard, sans-serif' }}>간단한 정보 입력으로 빠르게 주문하세요</p>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="flex gap-2 mb-2">
                  <input
                    {...register('address')}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="주소를 검색하거나 입력하세요"
                    style={{ fontFamily: 'Pretendard, sans-serif' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPostcode(true)}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    style={{ fontFamily: 'Pretendard, sans-serif' }}
                  >
                    주소 검색
                  </button>
                </div>
                <input
                  {...register('buildingDetail')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="상세주소 (동/호수 등)"
                  style={{ fontFamily: 'Pretendard, sans-serif' }}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600" style={{ fontFamily: 'Pretendard, sans-serif' }}>{errors.address.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
                style={{ fontFamily: 'Pretendard, sans-serif' }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    주문 접수 중...
                  </>
                ) : (
                  <>
                    <Truck className="w-5 h-5 mr-2" />
                    주문 접수하기
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