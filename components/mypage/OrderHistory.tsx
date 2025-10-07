'use client'

import { useState, useEffect } from 'react'
import { getUserOrderHistory, OrderHistoryItem } from '@/lib/actions/orders'
import { formatOrderDate, maskPhone, shortAddress } from '@/lib/utils/format'
import { useRouter } from 'next/navigation'
import EmptyState from '@/components/common/EmptyState'
import { SkeletonOrderCard } from '@/components/common/Skeleton'
import Badge from '@/components/ui/Badge'
import { X, AlertTriangle } from 'lucide-react'

interface OrderHistoryState {
  orders: OrderHistoryItem[]
  hasMore: boolean
  nextCursor?: string
  loading: boolean
  loadingMore: boolean
  error: string | null
}

interface CancelModalState {
  isOpen: boolean
  orderId: string | null
  orderNumber: string | null
  isCancelling: boolean
}

interface SuccessModalState {
  isOpen: boolean
  cancelledOrder: OrderHistoryItem | null
}

export default function OrderHistory() {
  const [state, setState] = useState<OrderHistoryState>({
    orders: [],
    hasMore: false,
    loading: true,
    loadingMore: false,
    error: null
  })
  const [cancelModal, setCancelModal] = useState<CancelModalState>({
    isOpen: false,
    orderId: null,
    orderNumber: null,
    isCancelling: false
  })
  const [successModal, setSuccessModal] = useState<SuccessModalState>({
    isOpen: false,
    cancelledOrder: null
  })
  const router = useRouter()

  const loadOrders = async (cursor?: string, append = false) => {
    if (append) {
      setState(prev => ({ ...prev, loadingMore: true, error: null }))
    } else {
      setState(prev => ({ ...prev, loading: true, error: null }))
    }
    
    try {
      const result = await getUserOrderHistory(cursor)
      setState(prev => ({
        orders: append ? [...prev.orders, ...result.orders] : result.orders,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
        loading: false,
        loadingMore: false,
        error: null
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        loadingMore: false,
        error: '주문 내역을 불러오는데 실패했습니다.'
      }))
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleLoadMore = () => {
    if (state.nextCursor && !state.loadingMore) {
      loadOrders(state.nextCursor, true)
    }
  }

  const handleOrderClick = () => {
    router.push('/order')
  }

  // 주문 취소 모달 열기
  const handleCancelClick = (orderId: string, orderNumber: string) => {
    setCancelModal({
      isOpen: true,
      orderId,
      orderNumber,
      isCancelling: false
    })
  }

  // 주문 취소 모달 닫기
  const handleCancelModalClose = () => {
    setCancelModal({
      isOpen: false,
      orderId: null,
      orderNumber: null,
      isCancelling: false
    })
  }

  // 성공 모달 열기
  const handleSuccessModalOpen = (cancelledOrder: OrderHistoryItem) => {
    setSuccessModal({
      isOpen: true,
      cancelledOrder
    })
  }

  // 성공 모달 닫기
  const handleSuccessModalClose = () => {
    setSuccessModal({
      isOpen: false,
      cancelledOrder: null
    })
  }

  // 홈으로 돌아가기
  const handleGoHome = () => {
    router.push('/')
  }

  // 주문 취소 실행
  const handleCancelConfirm = async () => {
    if (!cancelModal.orderId) return

    try {
      setCancelModal(prev => ({ ...prev, isCancelling: true }))
      
      const response = await fetch(`/api/orders/${cancelModal.orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: '고객 요청에 의한 취소' })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Cancel API error response:', errorData)
        
        // 디버그 정보가 있으면 더 자세한 메시지 제공
        if (errorData.debug) {
          console.log('Debug info:', errorData.debug)
          if (errorData.debug.userOrderIds) {
            console.log('Available order IDs for user:', errorData.debug.userOrderIds)
          }
        }
        
        throw new Error(errorData.error || '주문 취소에 실패했습니다')
      }

      const result = await response.json()
      console.log('Cancel success:', result)

      // 취소된 주문 찾기
      const cancelledOrder = state.orders.find(order => order.id.toString() === cancelModal.orderId)
      
      // 주문 목록 새로고침
      await loadOrders()
      
      // 취소 모달 닫기
      handleCancelModalClose()
      
      // 성공 모달 열기
      if (cancelledOrder) {
        handleSuccessModalOpen(cancelledOrder)
      } else {
        alert(result.message || '주문이 성공적으로 취소되었습니다')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      
      let errorMessage = '주문 취소 중 오류가 발생했습니다'
      if (error instanceof Error) {
        errorMessage = error.message
        
        // 특정 에러에 대한 사용자 친화적 메시지
        if (error.message.includes('Order not found')) {
          errorMessage = '해당 주문을 찾을 수 없거나 취소할 권한이 없습니다.'
        } else if (error.message.includes('Unauthorized')) {
          errorMessage = '로그인이 필요합니다.'
        }
      }
      
      alert(errorMessage)
    } finally {
      setCancelModal(prev => ({ ...prev, isCancelling: false }))
    }
  }

  // 주문 상태에 따른 배지 렌더링
  const renderOrderStatus = (order: OrderHistoryItem) => {
    if ((order as any).status === 'cancelled') {
      return <Badge variant="danger">취소됨</Badge>
    }
    if (order.paid) {
      return <Badge variant="success">결제완료</Badge>
    }
    return <Badge variant="danger">결제대기</Badge>
  }

  // 취소 가능한 주문인지 확인
  const canCancelOrder = (order: OrderHistoryItem) => {
    return (order as any).status !== 'cancelled' && 
           new Date(order.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // 24시간 이내
  }

  if (state.loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">최근 주문</h2>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <SkeletonOrderCard />
          </div>
        ))}
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{state.error}</div>
        <button
          onClick={() => loadOrders()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          aria-label="주문 내역 다시 불러오기"
        >
          다시 시도
        </button>
      </div>
    )
  }

  if (state.orders.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">최근 주문</h2>
        <EmptyState 
          title="아직 주문이 없어요"
          actionLabel="주문하러 가기"
          onAction={handleOrderClick}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">최근 주문</h2>
      
      {/* Mobile-first Orders List */}
      <div className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주문일시
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주문자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연락처
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주소
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주문번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.orders.map((order) => (
                  <tr key={order.id} className="hover:ring-1 hover:ring-[#13C2C2]/20 hover:-translate-y-[1px] transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatOrderDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {maskPhone(order.phone)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {shortAddress(order.address)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderOrderStatus(order)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={order.paid === true ? "text-gray-900 font-semibold" : "text-gray-500"}>
                        {order.payment_amount ? order.payment_amount.toLocaleString("ko-KR") + "원" : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {canCancelOrder(order) && (
                        <button
                          onClick={() => handleCancelClick(order.id.toString(), `#${order.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          취소
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {state.orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm p-4 hover:ring-1 hover:ring-[#13C2C2]/20 hover:-translate-y-[1px] transition">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">주문일시</div>
                  <div className="text-sm text-gray-900">{formatOrderDate(order.created_at)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">주소</div>
                  <div className="text-sm text-gray-500">{shortAddress(order.address, 15)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">결제상태</div>
                  <div>
                    {renderOrderStatus(order)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">결제금액</div>
                  <div className={`text-sm ${order.paid === true ? "text-gray-900 font-semibold" : "text-gray-500"}`}>
                    {order.payment_amount ? order.payment_amount.toLocaleString("ko-KR") + "원" : "-"}
                  </div>
                </div>
              </div>
              
              {/* Mobile Action Button */}
              {canCancelOrder(order) && (
                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleCancelClick(order.id.toString(), `#${order.id}`)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    주문 취소
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Load More Button */}
      {state.hasMore && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            disabled={state.loadingMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            aria-label="더 많은 주문 내역 불러오기"
          >
            {state.loadingMore ? (
              <>
                <div className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                불러오는 중...
              </>
            ) : (
              '더 보기'
            )}
          </button>
        </div>
      )}

      {/* Order Count */}
      <div className="text-center text-sm text-gray-500">
        총 {state.orders.length}개 주문
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                주문을 취소하시겠어요?
              </h3>
              
              <div className="text-sm text-gray-600 mb-6 space-y-1">
                <p>주문번호: <span className="font-mono">{cancelModal.orderNumber}</span></p>
                <p className="text-red-600 font-medium">
                  취소 후에는 복구할 수 없습니다.
                </p>
                {state.orders.find(o => o.id.toString() === cancelModal.orderId)?.paid && (
                  <p className="text-blue-600 text-xs">
                    결제된 금액은 자동으로 환불됩니다.
                  </p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCancelModalClose}
                  disabled={cancelModal.isCancelling}
                  className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  아니요
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={cancelModal.isCancelling}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cancelModal.isCancelling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      취소 중...
                    </>
                  ) : (
                    '주문 취소'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal.isOpen && successModal.cancelledOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <img 
                  src="/assets/icon/ok2.png" 
                  alt="Success" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                주문 취소 완료
              </h3>
              
              {/* Order Details */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <h4 className="font-semibold text-gray-900 mb-3 text-center">취소된 주문 내역</h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">주문번호</span>
                    <span className="font-mono font-medium">#{successModal.cancelledOrder.id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">주문일시</span>
                    <span>{formatOrderDate(successModal.cancelledOrder.created_at)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">주문자</span>
                    <span>{successModal.cancelledOrder.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">연락처</span>
                    <span>{maskPhone(successModal.cancelledOrder.phone)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">주소</span>
                    <span className="text-right max-w-[200px]">{shortAddress(successModal.cancelledOrder.address, 20)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제금액</span>
                    <span className="font-semibold">
                      {successModal.cancelledOrder.payment_amount 
                        ? `${successModal.cancelledOrder.payment_amount.toLocaleString()}원`
                        : '미결제'
                      }
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">상태</span>
                      <Badge variant="danger">취소됨</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* CTA Button */}
              <button
                onClick={handleGoHome}
                className="w-full px-6 py-3 bg-[#13C2C2] text-white rounded-xl font-semibold hover:bg-[#0FAFAF] transition-colors"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}




