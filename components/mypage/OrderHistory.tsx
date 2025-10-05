'use client'

import { useState, useEffect } from 'react'
import { getUserOrderHistory, OrderHistoryItem } from '@/lib/actions/orders'
import { formatOrderDate, maskPhone, shortAddress } from '@/lib/utils/format'
import { useRouter } from 'next/navigation'
import EmptyState from '@/components/common/EmptyState'
import Skeleton from '@/components/common/Skeleton'
import Badge from '@/components/ui/Badge'

interface OrderHistoryState {
  orders: OrderHistoryItem[]
  hasMore: boolean
  nextCursor?: string
  loading: boolean
  loadingMore: boolean
  error: string | null
}

export default function OrderHistory() {
  const [state, setState] = useState<OrderHistoryState>({
    orders: [],
    hasMore: false,
    loading: true,
    loadingMore: false,
    error: null
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

  if (state.loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">최근 주문</h2>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} h={64} className="w-full mb-3" />
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
                      <Badge variant={order.paid ? 'success' : 'danger'}>
                        {order.paid ? '결제완료' : '미결제/실패'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={order.paid ? "text-gray-900 font-semibold" : "text-gray-500"}>
                        {order.payment_amount ? order.payment_amount.toLocaleString("ko-KR") + "원" : "-"}
                      </span>
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
              <div className="grid grid-cols-2 gap-4">
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
                    <Badge variant={order.paid ? 'success' : 'danger'}>
                      {order.paid ? '결제완료' : '미결제/실패'}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">결제금액</div>
                  <div className={`text-sm ${order.paid ? "text-gray-900 font-semibold" : "text-gray-500"}`}>
                    {order.payment_amount ? order.payment_amount.toLocaleString("ko-KR") + "원" : "-"}
                  </div>
                </div>
              </div>
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
    </div>
  )
}




