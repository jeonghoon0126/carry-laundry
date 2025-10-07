'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Skeleton, { SkeletonCard } from '@/components/common/Skeleton'
import { RefreshCw, Search, TrendingUp, Users, Package, CreditCard, AlertCircle, X, AlertTriangle, Play, CheckCircle, Truck } from 'lucide-react'

type Order = { 
  id: number
  user_id: string | null
  name: string
  phone: string
  address: string
  created_at: string
  paid: boolean
  payment_amount: number | null
  payment_id: string | null
  status?: string
  processing_started_at?: string
  completed_at?: string
  delivered_at?: string
  pickup_photo_url?: string
  delivery_photo_url?: string
  profiles?: {
    name: string | null
    email: string | null
  } | null
}

type AdminStats = {
  totalOrders: number
  paidOrders: number
  unpaidOrders: number
  totalRevenue: number
  distinctUsers: number
  todayOrders: number
}

type FilterType = 'all' | 'paid' | 'unpaid' | 'today'

interface CancelModalState {
  isOpen: boolean
  orderId: string | null
  orderNumber: string | null
  isCancelling: boolean
}

interface StatusUpdateModalState {
  isOpen: boolean
  orderId: string | null
  currentStatus: string | null
  targetStatus: string | null
  isUpdating: boolean
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [cancelModal, setCancelModal] = useState<CancelModalState>({
    isOpen: false,
    orderId: null,
    orderNumber: null,
    isCancelling: false
  })
  
  const [statusModal, setStatusModal] = useState<StatusUpdateModalState>({
    isOpen: false,
    orderId: null,
    currentStatus: null,
    targetStatus: null,
    isUpdating: false
  })

  async function load(isRefresh = false) {
    try {
      setError(null)
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      const res = await fetch('/api/orders', { cache: 'no-store' })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setOrders(data as Order[])
      
      // Calculate stats
      const totalOrders = data.length
      const paidOrders = data.filter((order: Order) => order.paid === true).length
      const unpaidOrders = data.filter((order: Order) => order.paid !== true).length
      const totalRevenue = data
        .filter((order: Order) => order.paid === true && order.payment_amount)
        .reduce((sum: number, order: Order) => sum + (order.payment_amount || 0), 0)
      const distinctUsers = new Set(data.map((order: Order) => order.user_id).filter(Boolean)).size
      const today = new Date().toDateString()
      const todayOrders = data.filter((order: Order) => 
        new Date(order.created_at).toDateString() === today
      ).length
      
      setStats({ 
        totalOrders, 
        paidOrders, 
        unpaidOrders, 
        totalRevenue, 
        distinctUsers, 
        todayOrders 
      })
    } catch (e:any) {
      console.error(e)
      setError('데이터 로드 실패')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

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

  // 주문 취소 실행 (어드민용)
  const handleCancelConfirm = async () => {
    if (!cancelModal.orderId) return

    try {
      setCancelModal(prev => ({ ...prev, isCancelling: true }))
      
      const response = await fetch(`/api/orders/${cancelModal.orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: '관리자에 의한 취소' })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '주문 취소에 실패했습니다')
      }

      const result = await response.json()
      console.log('Admin cancel success:', result)

      // 주문 목록 새로고침
      await load(true)
      
      // 취소 모달 닫기
      handleCancelModalClose()
      
      alert('주문이 성공적으로 취소되었습니다.')
    } catch (error) {
      console.error('Error cancelling order:', error)
      
      let errorMessage = '주문 취소 중 오류가 발생했습니다'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setCancelModal(prev => ({ ...prev, isCancelling: false }))
    }
  }

  const handleStatusUpdateClick = (orderId: string, currentStatus: string, targetStatus: string) => {
    setStatusModal({
      isOpen: true,
      orderId,
      currentStatus,
      targetStatus,
      isUpdating: false
    })
  }

  const handleStatusModalClose = () => {
    setStatusModal({
      isOpen: false,
      orderId: null,
      currentStatus: null,
      targetStatus: null,
      isUpdating: false
    })
  }

  const handleStatusUpdateConfirm = async () => {
    if (!statusModal.orderId || !statusModal.targetStatus) return
    
    setStatusModal(prev => ({ ...prev, isUpdating: true }))
    
    try {
      const response = await fetch(`/api/orders/${statusModal.orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: statusModal.targetStatus,
          notes: `관리자에 의한 상태 변경: ${statusModal.currentStatus} → ${statusModal.targetStatus}`
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Status update API error:', errorData)
        
        // 디버그 정보가 있으면 더 자세한 메시지 제공
        if (errorData.debug) {
          console.log('Debug info:', errorData.debug)
        }
        
        throw new Error(errorData.error || 'Failed to update order status')
      }
      
      // 주문 목록 새로고침
      await load(true)
      
      handleStatusModalClose()
      alert(`주문 상태가 성공적으로 ${statusModal.targetStatus}로 변경되었습니다.`)
    } catch (error) {
      console.error('Error updating order status:', error)
      alert(`주문 상태 변경 실패: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setStatusModal(prev => ({ ...prev, isUpdating: false }))
    }
  }

  // 취소 가능한 주문인지 확인 (어드민은 모든 결제완료 주문 취소 가능)
  const canCancelOrder = (order: Order) => {
    // 결제가 완료되었고 취소되지 않은 주문만 취소 가능
    return order.paid === true && order.status !== 'cancelled'
  }

  // 주문 상태 변경 가능 여부 확인
  const canUpdateOrderStatus = (currentStatus: string | undefined, targetStatus: string) => {
    if (!currentStatus) return false
    
    const validTransitions: Record<string, string[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['completed', 'cancelled'],
      completed: ['delivered'],
      delivered: [],
      cancelled: []
    }
    
    return validTransitions[currentStatus]?.includes(targetStatus) || false
  }

  // 주문 상태별 표시 텍스트와 아이콘
  const getStatusDisplay = (status: string | undefined) => {
    const statusMap: Record<string, { text: string; icon: React.ReactNode; color: string }> = {
      pending: { text: '주문 접수', icon: <AlertCircle className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800' },
      processing: { text: '처리 중', icon: <Play className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800' },
      completed: { text: '세탁 완료', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-800' },
      delivered: { text: '배송 완료', icon: <Truck className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800' },
      cancelled: { text: '주문 취소', icon: <X className="w-4 h-4" />, color: 'bg-red-100 text-red-800' }
    }
    
    return statusMap[status || 'pending'] || statusMap.pending
  }

  const filtered = (orders ?? []).filter(o => {
    const t = q.trim()
    const searchMatch = !t || (o.name ?? '').includes(t) || (o.phone ?? '').includes(t)
    
    if (!searchMatch) return false
    
    switch (filter) {
      case 'paid':
        return o.paid === true
      case 'unpaid':
        return o.paid !== true
      case 'today':
        return new Date(o.created_at).toDateString() === new Date().toDateString()
      default:
        return true
    }
  })

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-4">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </div>
          
          {/* Controls Skeleton */}
          <div className="flex gap-4 items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
          
          {/* Table Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="space-y-3 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton className="h-12 w-full" key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">데이터 로드 실패</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => load()}
            className="px-4 py-2 bg-[#13C2C2] text-white rounded-lg hover:bg-[#0FAFAF] transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">주문 관리</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">실시간 주문 현황을 확인하고 관리하세요</p>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#13C2C2] text-white rounded-lg hover:bg-[#0FAFAF] transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">새로고침</span>
            <span className="sm:hidden">새로고침</span>
          </button>
        </div>
      
        {/* Stats Cards */}
      {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            <div className="group bg-gradient-to-br from-white to-blue-50/30 p-4 sm:p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-blue-200 transition-all duration-300">
                  {/* Pulse ring */}
                  <div className="absolute inset-0 bg-blue-400 rounded-xl animate-ping opacity-20"></div>
                  
                  {/* Icon with bounce animation */}
                  <motion.div
                    animate={{ 
                      y: [0, -2, 0],
                      transition: { 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }
                    }}
                    whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
                  >
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white relative z-10" />
                  </motion.div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">총 주문</p>
                  <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{stats.totalOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-white to-green-50/30 p-4 sm:p-6 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-green-200 transition-all duration-300">
                  {/* Pulse ring */}
                  <div className="absolute inset-0 bg-green-400 rounded-xl animate-ping opacity-20" style={{ animationDelay: '0.5s' }}></div>
                  
                  {/* Icon with bounce animation */}
                  <motion.div
                    animate={{ 
                      y: [0, -2, 0],
                      transition: { 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 0.5
                      }
                    }}
                    whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
                  >
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white relative z-10" />
                  </motion.div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">결제완료</p>
                  <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">{stats.paidOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-white to-red-50/30 p-4 sm:p-6 rounded-2xl shadow-lg border border-red-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-red-200 transition-all duration-300">
                  {/* Pulse ring */}
                  <div className="absolute inset-0 bg-red-400 rounded-xl animate-ping opacity-20" style={{ animationDelay: '1s' }}></div>
                  
                  {/* Icon with bounce animation */}
                  <motion.div
                    animate={{ 
                      y: [0, -2, 0],
                      transition: { 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 1
                      }
                    }}
                    whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
                  >
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white relative z-10" />
                  </motion.div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">미결제</p>
                  <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">{stats.unpaidOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-white to-cyan-50/30 p-4 sm:p-6 rounded-2xl shadow-lg border border-cyan-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#13C2C2] to-[#0FA8A8] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-cyan-200 transition-all duration-300">
                  {/* Pulse ring */}
                  <div className="absolute inset-0 bg-[#13C2C2] rounded-xl animate-ping opacity-20" style={{ animationDelay: '1.5s' }}></div>
                  
                  {/* Icon with bounce animation */}
                  <motion.div
                    animate={{ 
                      y: [0, -2, 0],
                      transition: { 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 1.5
                      }
                    }}
                    whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
                  >
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white relative z-10" />
                  </motion.div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">총 매출</p>
                  <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#13C2C2] to-[#0FA8A8] bg-clip-text text-transparent">{stats.totalRevenue.toLocaleString()}원</p>
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-white to-purple-50/30 p-4 sm:p-6 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-purple-200 transition-all duration-300">
                  {/* Pulse ring */}
                  <div className="absolute inset-0 bg-purple-400 rounded-xl animate-ping opacity-20" style={{ animationDelay: '2s' }}></div>
                  
                  {/* Icon with bounce animation */}
                  <motion.div
                    animate={{ 
                      y: [0, -2, 0],
                      transition: { 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 2
                      }
                    }}
                    whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
                  >
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white relative z-10" />
                  </motion.div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">가입 사용자</p>
                  <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">{stats.distinctUsers}</p>
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-white to-orange-50/30 p-4 sm:p-6 rounded-2xl shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-orange-200 transition-all duration-300">
                  {/* Pulse ring */}
                  <div className="absolute inset-0 bg-orange-400 rounded-xl animate-ping opacity-20" style={{ animationDelay: '2.5s' }}></div>
                  
                  {/* Icon with bounce animation */}
                  <motion.div
                    animate={{ 
                      y: [0, -2, 0],
                      transition: { 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 2.5
                      }
                    }}
                    whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
                  >
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white relative z-10" />
                  </motion.div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">오늘 주문</p>
                  <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">{stats.todayOrders}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      
        {/* Search and Filter Controls */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#13C2C2] focus:border-transparent text-sm sm:text-base" 
                placeholder="이름 또는 전화번호로 검색..." 
                value={q} 
                onChange={(e)=>setQ(e.target.value)} 
              />
            </div>
            
            {/* Filter Buttons and Results Count */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: '전체', count: stats?.totalOrders || 0 },
                  { key: 'paid', label: '결제완료', count: stats?.paidOrders || 0 },
                  { key: 'unpaid', label: '미결제', count: stats?.unpaidOrders || 0 },
                  { key: 'today', label: '오늘', count: stats?.todayOrders || 0 }
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as FilterType)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      filter === key
                        ? 'bg-[#13C2C2] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label} ({count})
                  </button>
                ))}
              </div>
              
              {/* Results Count */}
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="font-medium">{filtered.length}</span>개 주문 표시 중
              </div>
            </div>
          </div>
        </div>
        {/* Orders Table */}
        {filtered.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">주문이 없습니다</h3>
            <p className="text-sm sm:text-base text-gray-600">검색 조건에 맞는 주문을 찾을 수 없습니다.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Mobile Card View */}
            <div className="block md:hidden">
              <div className="divide-y divide-gray-200">
                {filtered.map((o) => (
                  <div key={o.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">#{o.id}</span>
                        {o.user_id ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Users className="w-3 h-3 mr-1" />
                            가입
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            게스트
                          </span>
                        )}
                      </div>
                      {(() => {
                        const statusDisplay = getStatusDisplay(o.status)
                        return (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                            {statusDisplay.icon}
                            <span className="ml-1">{statusDisplay.text}</span>
                          </span>
                        )
                      })()}
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-500">이름</span>
                        <p className="text-sm font-medium text-gray-900">{o.name}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">전화번호</span>
                        <p className="text-sm text-gray-900">{o.phone}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">주소</span>
                        <p className="text-sm text-gray-900 break-words">{o.address}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">주문시간</span>
                        <p className="text-sm text-gray-900">
                          {new Date(o.created_at).toLocaleDateString('ko-KR')} {new Date(o.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">결제금액</span>
                        <p className="text-sm font-semibold text-gray-900">
                          {o.payment_amount ? `${o.payment_amount.toLocaleString()}원` : '-'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Mobile Action Buttons */}
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      {/* 상태 변경 버튼들 */}
                      {o.status === 'pending' && canUpdateOrderStatus(o.status, 'processing') && (
                        <button
                          onClick={() => handleStatusUpdateClick(o.id.toString(), o.status || 'pending', 'processing')}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          처리 시작
                        </button>
                      )}
                      
                      {o.status === 'processing' && canUpdateOrderStatus(o.status, 'completed') && (
                        <button
                          onClick={() => handleStatusUpdateClick(o.id.toString(), o.status || 'processing', 'completed')}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          세탁 완료
                        </button>
                      )}
                      
                      {o.status === 'completed' && canUpdateOrderStatus(o.status, 'delivered') && (
                        <button
                          onClick={() => handleStatusUpdateClick(o.id.toString(), o.status || 'completed', 'delivered')}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          <Truck className="w-4 h-4" />
                          배송 완료
                        </button>
                      )}
                      
                      {/* 취소 버튼 */}
                      {canCancelOrder(o) && (
                        <button
                          onClick={() => handleCancelClick(o.id.toString(), `#${o.id}`)}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          주문 취소
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
      </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      주문시간
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사용자
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      전화번호
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      주소
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      주문상태
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      결제금액
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
            </tr>
          </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((o, index) => (
                    <tr key={o.id} className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                    }`}>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium text-xs lg:text-sm">
                            {new Date(o.created_at).toLocaleDateString('ko-KR')}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {new Date(o.created_at).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  {o.user_id ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Users className="w-3 h-3 mr-1" />
                            <span className="hidden lg:inline">가입회원</span>
                            <span className="lg:hidden">가입</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            게스트
                          </span>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-20 lg:max-w-none">
                        {o.name}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                        <span className="hidden lg:inline">{o.phone}</span>
                        <span className="lg:hidden">{o.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3')}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-gray-500 max-w-32 lg:max-w-xs truncate">
                        {o.address}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const statusDisplay = getStatusDisplay(o.status)
                          return (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                              {statusDisplay.icon}
                              <span className="hidden lg:inline ml-1">{statusDisplay.text}</span>
                              <span className="lg:hidden ml-1">{statusDisplay.text.split(' ')[0]}</span>
                            </span>
                          )
                        })()}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm text-right">
                        {o.payment_amount ? (
                          <span className="font-semibold text-gray-900">
                            <span className="hidden lg:inline">{o.payment_amount.toLocaleString()}원</span>
                            <span className="lg:hidden">{Math.floor(o.payment_amount / 10000)}만원</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                  )}
                </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {/* 상태 변경 버튼들 */}
                          {o.status === 'pending' && canUpdateOrderStatus(o.status, 'processing') && (
                            <button
                              onClick={() => handleStatusUpdateClick(o.id.toString(), o.status || 'pending', 'processing')}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                            >
                              <Play className="w-3 h-3" />
                              <span className="hidden lg:inline">처리시작</span>
                            </button>
                          )}
                          
                          {o.status === 'processing' && canUpdateOrderStatus(o.status, 'completed') && (
                            <button
                              onClick={() => handleStatusUpdateClick(o.id.toString(), o.status || 'processing', 'completed')}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span className="hidden lg:inline">완료</span>
                            </button>
                          )}
                          
                          {o.status === 'completed' && canUpdateOrderStatus(o.status, 'delivered') && (
                            <button
                              onClick={() => handleStatusUpdateClick(o.id.toString(), o.status || 'completed', 'delivered')}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded hover:bg-purple-100 transition-colors"
                            >
                              <Truck className="w-3 h-3" />
                              <span className="hidden lg:inline">배송완료</span>
                            </button>
                          )}
                          
                          {/* 취소 버튼 */}
                          {canCancelOrder(o) && (
                            <button
                              onClick={() => handleCancelClick(o.id.toString(), `#${o.id}`)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                            >
                              <X className="w-3 h-3" />
                              <span className="hidden lg:inline">취소</span>
                            </button>
                          )}
                        </div>
                    </td>
              </tr>
            ))}
          </tbody>
        </table>
            </div>
          </div>
        )}

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
                    관리자 권한으로 주문을 취소합니다.
                  </p>
                  <p className="text-blue-600 text-xs">
                    결제된 금액은 자동으로 환불됩니다.
                  </p>
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

        {/* Status Update Confirmation Modal */}
        {statusModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-blue-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  주문 상태를 변경하시겠어요?
                </h3>
                
                <div className="text-sm text-gray-600 mb-6 space-y-2">
                  <p>주문번호: <span className="font-mono">#{statusModal.orderId}</span></p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {statusModal.currentStatus}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {statusModal.targetStatus}
                    </span>
                  </div>
                  <p className="text-blue-600 text-xs">
                    상태 변경 후에는 되돌릴 수 없습니다.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleStatusModalClose}
                    disabled={statusModal.isUpdating}
                    className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleStatusUpdateConfirm}
                    disabled={statusModal.isUpdating}
                    className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {statusModal.isUpdating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        변경 중...
                      </>
                    ) : (
                      '상태 변경'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
