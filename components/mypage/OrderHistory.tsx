'use client'

import { useState, useEffect } from 'react'
import { getUserOrderHistory, OrderHistoryItem } from '@/lib/actions/orders'
import { formatOrderDate, maskPhone, shortAddress } from '@/lib/utils/format'
import { useRouter } from 'next/navigation'

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
    return <OrderHistorySkeleton />
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
    return <EmptyState onOrderClick={handleOrderClick} />
  }

  return (
    <div className="space-y-6">
      {/* Mobile-first Orders List */}
      <div className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                  <tr key={order.id} className="hover:bg-gray-50">
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
                      {order.paid ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">결제완료</span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs font-medium">미결제/실패</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {order.payment_amount ? order.payment_amount.toLocaleString("ko-KR") + "원" : "-"}
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
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="text-sm font-medium text-gray-900">{order.name}</div>
                <div className="text-xs text-gray-500 font-mono">#{order.id}</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">주문일시</span>
                  <span className="text-gray-900">{formatOrderDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">연락처</span>
                  <span className="text-gray-900">{maskPhone(order.phone)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">주소</span>
                  <span className="text-gray-900 text-right ml-4">{shortAddress(order.address, 20)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">결제상태</span>
                  <span>
                    {order.paid ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">결제완료</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs font-medium">미결제/실패</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">결제금액</span>
                  <span className="text-gray-900 font-medium">
                    {order.payment_amount ? order.payment_amount.toLocaleString("ko-KR") + "원" : "-"}
                  </span>
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

function OrderHistorySkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-28"></div>
                <div className="h-4 bg-gray-200 rounded w-40"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onOrderClick }: { onOrderClick: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">주문 내역이 아직 없어요.</h3>
      <p className="text-gray-500 mb-6">첫 주문을 진행해보세요</p>
      <button
        onClick={onOrderClick}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="주문 페이지로 이동"
      >
        🛒 주문하러 가기
      </button>
    </div>
  )
}



