'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Clock, MapPin, Camera, CheckCircle, Truck, AlertCircle, Play } from 'lucide-react'
import { OrderWithProgress, OrderStatus } from '@/lib/types/order'
import { ORDER_STATUS_INFO, getOrderProgress, getNextStepInfo } from '@/lib/utils/orderStatus'
import { useSession } from 'next-auth/react'
import { useOrderProgress } from '@/lib/contexts/OrderProgressContext'

interface OrderProgressBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  orderId?: number
}

export default function OrderProgressBottomSheet({ 
  isOpen, 
  onClose, 
  orderId 
}: OrderProgressBottomSheetProps) {
  const { data: session } = useSession()
  const { setIsOrderProgressVisible } = useOrderProgress()
  const [order, setOrder] = useState<OrderWithProgress | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingDelivery, setConfirmingDelivery] = useState(false)

  // 바텀시트 열림/닫힘 상태를 전역 상태에 반영
  useEffect(() => {
    setIsOrderProgressVisible(isOpen)
    
    // 컴포넌트 언마운트 시 상태 초기화
    return () => {
      setIsOrderProgressVisible(false)
    }
  }, [isOpen, setIsOrderProgressVisible])

  // 최근 주문 조회
  useEffect(() => {
    if (!isOpen || !session?.user) return

    const fetchLatestOrder = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/orders/latest')
        if (!response.ok) {
          throw new Error('주문 정보를 불러올 수 없습니다')
        }

        const orderData = await response.json()
        if (orderData) {
          setOrder(orderData)
        } else {
          setError('진행 중인 주문이 없습니다')
        }
      } catch (err) {
        console.error('Error fetching latest order:', err)
        setError(err instanceof Error ? err.message : '주문 정보 조회 실패')
      } finally {
        setLoading(false)
      }
    }

    fetchLatestOrder()

    // 주문 상태 자동 새로고침 (30초마다)
    const interval = setInterval(fetchLatestOrder, 30000)
    return () => clearInterval(interval)
  }, [isOpen, session])

  // 바텀시트가 닫힐 때 데이터 초기화
  useEffect(() => {
    if (!isOpen) {
      setOrder(null)
      setError(null)
      setConfirmingDelivery(false)
    }
  }, [isOpen])

  // 배송 완료 확인
  const handleDeliveryConfirmation = async () => {
    if (!order || order.status !== 'delivered') return

    setConfirmingDelivery(true)
    try {
      const response = await fetch(`/api/orders/${order.id}/delivery-confirmed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('배송 확인에 실패했습니다')
      }

      // 성공 시 바텀시트 닫기
      onClose()
    } catch (err) {
      console.error('Error confirming delivery:', err)
      setError(err instanceof Error ? err.message : '배송 확인 실패')
    } finally {
      setConfirmingDelivery(false)
    }
  }

  if (!isOpen) return null

  const currentStatus = order?.status || 'pending'
  const progress = getOrderProgress(currentStatus as OrderStatus)
  const nextStep = getNextStepInfo(currentStatus as OrderStatus)

  return (
    <motion.div 
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Backdrop with sophisticated blur and fade animation */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 backdrop-blur-md"
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        onClick={onClose}
      />
      
      {/* Bottom Sheet with premium spring animation */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-2xl max-h-[85vh] overflow-hidden border-t border-gray-100"
        initial={{ 
          y: "100%",
          scale: 0.95,
          borderRadius: "32px 32px 0px 0px"
        }}
        animate={{ 
          y: 0,
          scale: 1,
          borderRadius: "32px 32px 0px 0px"
        }}
        exit={{ 
          y: "100%",
          scale: 0.95,
          borderRadius: "32px 32px 0px 0px"
        }}
        transition={{ 
          type: "spring",
          damping: 25,
          stiffness: 300,
          mass: 0.8,
          duration: 0.6
        }}
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
          boxShadow: "0 -20px 60px -12px rgba(0, 0, 0, 0.25), 0 -8px 32px -8px rgba(0, 0, 0, 0.1)"
        }}
      >
        {/* Header with premium styling and animation */}
        <motion.div 
          className="flex items-center justify-between p-6 border-b border-gray-100/50 bg-gradient-to-r from-white/95 via-gray-50/95 to-white/95 backdrop-blur-sm"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-3 h-8 bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 rounded-full shadow-lg shadow-blue-200"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, duration: 0.6, type: "spring", stiffness: 200 }}
            />
            <motion.h2 
              className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-700 bg-clip-text text-transparent"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
            >
              주문 진행상황
            </motion.h2>
          </div>
          <motion.button
            onClick={onClose}
            className="group relative w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl overflow-hidden"
            aria-label="닫기"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.6, duration: 0.4, type: "spring", stiffness: 200 }}
          >
            <X className="w-5 h-5 text-gray-600 relative z-10 transition-colors group-hover:text-gray-800" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 rounded-full"></div>
          </motion.button>
        </motion.div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
          {loading ? (
            <div className="p-8 text-center animate-in fade-in-0 duration-500">
              <div className="relative mx-auto mb-6 w-16 h-16">
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
              </div>
              <p className="text-gray-600 font-medium animate-pulse">주문 정보를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center animate-in fade-in-0 duration-500">
              <div className="relative mx-auto mb-6 w-16 h-16">
                <AlertCircle className="w-16 h-16 text-red-400 animate-bounce" />
                <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-20"></div>
              </div>
              <p className="text-gray-600 mb-6 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl font-medium"
              >
                다시 시도
              </button>
            </div>
          ) : order ? (
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">주문번호</span>
                  <span className="text-sm font-mono text-gray-900">#{order.id}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">주문일시</span>
                  <span className="text-sm text-gray-900">
                    {new Date(order.created_at).toLocaleDateString('ko-KR')} {new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">주소</span>
                  <span className="text-sm text-gray-900 text-right flex-1 ml-4">{order.address}</span>
                </div>
              </div>

              {/* Progress Bar with premium animation */}
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">진행상황</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-blue-600">{progress}%</span>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full"></div>
                  <div 
                    className="relative bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 h-4 rounded-full transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-lg"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </div>
              </div>

              {/* Status Steps with staggered animation */}
              <div className="space-y-4">
                {(['pending', 'processing', 'completed', 'delivered'] as OrderStatus[]).map((status, index) => {
                  const statusInfo = ORDER_STATUS_INFO[status]
                  const isActive = status === currentStatus
                  const isCompleted = getOrderProgress(status) <= progress
                  
                  return (
                    <div 
                      key={status} 
                      className={`flex items-center gap-4 p-5 rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-lg animate-in fade-in-0 slide-in-from-bottom-2 ${
                        isActive ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 shadow-lg shadow-blue-100' : 
                        isCompleted ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-300 shadow-md shadow-green-100' : 
                        'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-200 animate-pulse' :
                        isCompleted ? 'bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg shadow-green-200' :
                        'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-600'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-7 h-7 animate-bounce" />
                        ) : isActive ? (
                          <div className="relative">
                            <span className="text-xl animate-pulse">{statusInfo.icon}</span>
                            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                          </div>
                        ) : (
                          <span className="text-xl">{statusInfo.icon}</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className={`font-bold text-lg ${
                            isActive ? 'bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent' :
                            isCompleted ? 'bg-gradient-to-r from-green-900 to-green-700 bg-clip-text text-transparent' :
                            'text-gray-600'
                          }`}>
                            {statusInfo.statusText}
                          </h4>
                          {isActive && (
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-xs font-bold rounded-full border border-blue-300 animate-pulse">
                              진행중
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${
                          isActive ? 'text-blue-700' :
                          isCompleted ? 'text-green-700' :
                          'text-gray-500'
                        }`}>
                          {statusInfo.description}
                        </p>
                        
                        {/* Status-specific timestamps */}
                        {status === 'processing' && order.processing_started_at && (
                          <p className="text-xs text-blue-600 mt-1">
                            처리 시작: {new Date(order.processing_started_at).toLocaleString('ko-KR')}
                          </p>
                        )}
                        {status === 'completed' && order.completed_at && (
                          <p className="text-xs text-green-600 mt-1">
                            완료: {new Date(order.completed_at).toLocaleString('ko-KR')}
                          </p>
                        )}
                        {status === 'delivered' && order.delivered_at && (
                          <p className="text-xs text-purple-600 mt-1">
                            배송 완료: {new Date(order.delivered_at).toLocaleString('ko-KR')}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>


              {/* Photos Section */}
              {(order.pickup_photo_url || order.delivery_photo_url) && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    사진
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {order.pickup_photo_url && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="aspect-square bg-gray-200 rounded-lg mb-2 overflow-hidden">
                          <img 
                            src={order.pickup_photo_url} 
                            alt="수거 사진"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm font-medium text-gray-700 text-center">수거 완료</p>
                      </div>
                    )}
                    
                    {order.delivery_photo_url && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="aspect-square bg-gray-200 rounded-lg mb-2 overflow-hidden">
                          <img 
                            src={order.delivery_photo_url} 
                            alt="배송 사진"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm font-medium text-gray-700 text-center">배송 완료</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  배송 정보
                </h4>
                <p className="text-gray-700 text-sm">{order.address}</p>
                <p className="text-gray-600 text-sm mt-1">연락처: {order.phone}</p>
              </div>

              {/* Delivery Confirmation Button with premium animation */}
              {order.status === 'delivered' && (
                <div className="bg-gradient-to-br from-green-50 via-green-100 to-green-50 border-2 border-green-300 rounded-3xl p-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 shadow-lg shadow-green-100">
                  <div className="text-center">
                    <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                      <CheckCircle className="w-10 h-10 text-white animate-bounce" />
                      <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-30"></div>
                    </div>
                    <h4 className="text-2xl font-bold bg-gradient-to-r from-green-900 to-green-700 bg-clip-text text-transparent mb-3">배송 완료!</h4>
                    <p className="text-green-700 text-sm mb-6 leading-relaxed">
                      세탁물이 안전하게 배송되었습니다.<br />
                      수령 확인 버튼을 눌러주세요.
                    </p>
                    <button
                      onClick={handleDeliveryConfirmation}
                      disabled={confirmingDelivery}
                      className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-2xl hover:from-green-700 hover:to-green-800 disabled:from-green-400 disabled:to-green-500 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:hover:scale-100"
                    >
                      {confirmingDelivery ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>확인 중...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          <span>수령 확인하기</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">진행 중인 주문이 없습니다</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
