'use client'

import { useState } from 'react'
import { X, Save, MapPin, Search } from 'lucide-react'
import AddressSearch from '@/components/order/AddressSearch'

interface Address {
  id: string
  name: string
  address1: string
  address2?: string
  address_detail?: string
  entrance_method?: string
  entrance_note?: string
  is_default: boolean
}

interface AddressFormProps {
  address?: Address | null
  onClose: () => void
}

export default function AddressForm({ address, onClose }: AddressFormProps) {
  const [formData, setFormData] = useState({
    name: address?.name || '',
    address1: address?.address1 || '',
    address2: address?.address2 || '',
    addressDetail: address?.address_detail || '',
    entranceMethod: address?.entrance_method || '',
    entranceNote: address?.entrance_note || '',
    isDefault: address?.is_default || false
  })
  const [loading, setLoading] = useState(false)
  const [showAddressSearch, setShowAddressSearch] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.address1.trim()) {
      alert('배송지 이름과 주소는 필수입니다.')
      return
    }

    setLoading(true)

    try {
      const url = address ? `/api/addresses/${address.id}` : '/api/addresses'
      const method = address ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onClose()
      } else {
        const errorData = await response.json()
        alert(errorData.error || '배송지 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error saving address:', error)
      alert('배송지 저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 주소 검색 결과 처리
  const handleAddressSelect = (selectedAddress: {
    zipcode?: string
    address1: string
    si?: string
    gu?: string
    dong?: string
  }) => {
    setFormData(prev => ({
      ...prev,
      address1: selectedAddress.address1
    }))
    setShowAddressSearch(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {address ? '배송지 수정' : '배송지 추가'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 배송지 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              배송지 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="예: 집, 회사, 학교"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#13C2C2] focus:border-transparent"
              required
            />
          </div>

          {/* 주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.address1}
                onChange={(e) => handleInputChange('address1', e.target.value)}
                placeholder="예: 서울 관악구 과천대로 863"
                className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#13C2C2] focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowAddressSearch(true)}
                className="px-4 py-3 bg-[#13C2C2] text-white rounded-lg hover:bg-[#0FA8A8] transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                검색
              </button>
            </div>
          </div>

          {/* 상세주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상세주소
            </label>
            <input
              type="text"
              value={formData.address2}
              onChange={(e) => handleInputChange('address2', e.target.value)}
              placeholder="예: 101동 1203호"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#13C2C2] focus:border-transparent"
            />
          </div>

          {/* 추가 상세주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              추가 상세주소
            </label>
            <input
              type="text"
              value={formData.addressDetail}
              onChange={(e) => handleInputChange('addressDetail', e.target.value)}
              placeholder="예: 경비실 앞"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#13C2C2] focus:border-transparent"
            />
          </div>

          {/* 출입방법 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출입방법
            </label>
            <select
              value={formData.entranceMethod}
              onChange={(e) => handleInputChange('entranceMethod', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#13C2C2] focus:border-transparent"
            >
              <option value="">선택해주세요</option>
              <option value="공동현관 비밀번호">공동현관 비밀번호</option>
              <option value="인터폰">인터폰</option>
              <option value="경비실">경비실</option>
              <option value="자유출입">자유출입</option>
              <option value="기타">기타</option>
            </select>
          </div>

          {/* 출입메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출입메모
            </label>
            <textarea
              value={formData.entranceNote}
              onChange={(e) => handleInputChange('entranceNote', e.target.value)}
              placeholder="출입 시 필요한 추가 정보를 입력해주세요"
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-[#13C2C2] focus:border-transparent"
            />
          </div>

          {/* 기본 배송지 설정 */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => handleInputChange('isDefault', e.target.checked)}
              className="w-4 h-4 text-[#13C2C2] border-gray-300 rounded focus:ring-[#13C2C2]"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">
              기본 배송지로 설정
            </label>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[#13C2C2] text-white rounded-lg hover:bg-[#0FA8A8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {address ? '수정하기' : '추가하기'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 주소 검색 모달 */}
      <AddressSearch
        open={showAddressSearch}
        onClose={() => setShowAddressSearch(false)}
        onSelect={handleAddressSelect}
      />
    </div>
  )
}
