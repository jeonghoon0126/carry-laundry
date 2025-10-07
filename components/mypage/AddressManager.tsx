'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, MapPin, Edit, Trash2, Star } from 'lucide-react'
import AddressForm from './AddressForm'
import type { AddressCore } from '@/lib/addresses'
import { SkeletonAddressCard } from '@/components/common/Skeleton'

interface Address {
  id: string
  name: string
  address1: string
  address2?: string
  address_detail?: string
  entrance_method?: string
  entrance_note?: string
  is_default: boolean
  created_at: string
}

interface AddressManagerProps {
  onAddressSelect?: (address: AddressCore) => void
}

export default function AddressManager({ onAddressSelect }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  // 배송지 목록 불러오기
  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/addresses')
      if (response.ok) {
        const data = await response.json()
        setAddresses(data.addresses || [])
      } else {
        console.error('Failed to fetch addresses')
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  // 배송지 삭제
  const handleDelete = async (addressId: string) => {
    if (!confirm('정말 이 배송지를 삭제하시겠어요?')) {
      return
    }

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchAddresses()
      } else {
        alert('배송지 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      alert('배송지 삭제 중 오류가 발생했습니다.')
    }
  }

  // 기본 배송지 설정
  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}/default`, {
        method: 'PUT'
      })

      if (response.ok) {
        await fetchAddresses()
      } else {
        alert('기본 배송지 설정에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error setting default address:', error)
      alert('기본 배송지 설정 중 오류가 발생했습니다.')
    }
  }

  // 배송지 선택
  const handleSelect = (address: Address) => {
    if (onAddressSelect) {
      const addressCore: AddressCore = {
        address1: address.address1,
        address2: address.address2,
        addressDetail: address.address_detail,
        entranceMethod: address.entrance_method as "free" | "password" | "security" | "call" | "other" | undefined,
        entranceNote: address.entrance_note
      }
      onAddressSelect(addressCore)
    }
  }

  // 폼 닫기
  const handleFormClose = () => {
    setShowForm(false)
    setEditingAddress(null)
    fetchAddresses()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded skeleton-shimmer"></div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="skeleton-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <SkeletonAddressCard />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">배송지 관리</h3>
        <motion.button
          onClick={() => setShowForm(true)}
          className="group relative flex items-center justify-center gap-2 px-4 py-2 bg-[#13C2C2] text-white rounded-lg hover:bg-[#0FA8A8] transition-all duration-200 text-sm sm:text-base overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ 
              rotate: [0, 90, 0],
              scale: [1, 1.2, 1],
              transition: { duration: 2, repeat: Infinity, repeatDelay: 3 }
            }}
            whileHover={{ scale: 1.3, rotate: 45 }}
          >
            <Plus className="w-4 h-4" />
          </motion.div>
          배송지 추가
          
          {/* Sparkle effects */}
          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white/60 rounded-full animate-ping"></div>
          <div className="absolute bottom-1 left-1 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-lg"></div>
        </motion.button>
      </div>

      {/* 배송지 목록 */}
      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <motion.div
            animate={{ 
              y: [0, -5, 0],
              rotate: [0, 5, -5, 0],
              transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          </motion.div>
          <p className="text-gray-500 mb-4">등록된 배송지가 없습니다</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[#13C2C2] text-white rounded-lg hover:bg-[#0FA8A8] transition-colors"
          >
            첫 배송지 추가하기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 truncate">{address.name}</h4>
                    {address.is_default && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#13C2C2]/10 text-[#13C2C2] text-xs rounded-full flex-shrink-0">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0],
                            transition: { duration: 2, repeat: Infinity, repeatDelay: 1 }
                          }}
                        >
                          <Star className="w-3 h-3 fill-current" />
                        </motion.div>
                        기본
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1 break-words">{address.address1}</p>
                  {address.address2 && (
                    <p className="text-sm text-gray-500 break-words">{address.address2}</p>
                  )}
                  {address.address_detail && (
                    <p className="text-xs text-gray-500 mt-1 break-words">
                      상세주소: {address.address_detail}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 mt-2">
                    {address.entrance_method && (
                      <p className="text-xs text-gray-500">
                        출입방법: {address.entrance_method}
                      </p>
                    )}
                    {address.entrance_note && (
                      <p className="text-xs text-gray-500 break-words">
                        출입메모: {address.entrance_note}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  {onAddressSelect && (
                    <button
                      onClick={() => handleSelect(address)}
                      className="p-2 text-[#13C2C2] hover:bg-[#13C2C2]/10 rounded-lg transition-colors"
                      title="배송지 선택"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <MapPin className="w-4 h-4" />
                      </motion.div>
                    </button>
                  )}
                  <button
                    onClick={() => setEditingAddress(address)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="수정"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: [0, -15, 15, 0] }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit className="w-4 h-4" />
                    </motion.div>
                  </button>
                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="기본 배송지로 설정"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: [0, 20, -20, 0] }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Star className="w-4 h-4" />
                      </motion.div>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="삭제"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 배송지 추가/수정 폼 */}
      {(showForm || editingAddress) && (
        <AddressForm
          address={editingAddress}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}
