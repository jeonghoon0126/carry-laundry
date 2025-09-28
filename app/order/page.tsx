'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import DaumPostcode from 'react-daum-postcode'

export default function OrderPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    buildingDetail: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [showPostcode, setShowPostcode] = useState(false)

  const validatePhone = (phone: string) => {
    // Korean mobile number validation: must start with 010, 10-11 digits, numbers only
    const phoneRegex = /^010\d{7,8}$/
    return phoneRegex.test(phone)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Validate phone number in real-time
    if (name === 'phone') {
      if (value && !validatePhone(value)) {
        setPhoneError('010으로 시작하는 10-11자리 숫자를 입력해주세요')
      } else {
        setPhoneError('')
      }
    }
  }

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

    setFormData(prev => ({
      ...prev,
      address: fullAddress
    }))
    setShowPostcode(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate phone number before submission
    if (!validatePhone(formData.phone)) {
      setPhoneError('010으로 시작하는 10-11자리 숫자를 입력해주세요')
      return
    }
    
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('orders')
        .insert([
          {
            name: formData.name,
            phone: formData.phone,
            address: formData.address + (formData.buildingDetail ? ` ${formData.buildingDetail}` : '')
          }
        ])

      if (error) {
        console.error('Error inserting order:', error)
        alert('주문 접수 중 오류가 발생했습니다.')
        return
      }

      // Success - show alert and reset form
      alert('주문이 접수되었습니다!')
      setFormData({
        name: '',
        phone: '',
        address: '',
        buildingDetail: ''
      })
    } catch (error) {
      console.error('Error:', error)
      alert('주문 접수 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
            세탁 주문
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="이름을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  phoneError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="01012345678"
              />
              {phoneError && (
                <p className="mt-1 text-sm text-red-600">{phoneError}</p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                주소
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="주소를 입력하거나 검색하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowPostcode(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                  주소 검색
                </button>
              </div>
              <input
                type="text"
                name="buildingDetail"
                value={formData.buildingDetail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="상세주소 (동/호수 등)"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !!phoneError}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '주문 접수 중...' : '주문 접수'}
            </button>
          </form>
        </div>
      </div>

      {/* Postcode Modal */}
      {showPostcode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">주소 검색</h3>
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
    </div>
  )
}
