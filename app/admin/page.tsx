'use client'
import { useEffect, useState } from 'react'
import { SkeletonCard, SkeletonText, Skeleton } from '@/components/common/Skeleton'
import { RefreshCw, Search, TrendingUp, Users, Package, CreditCard, AlertCircle } from 'lucide-react'

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

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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
              <SkeletonCard key={i} className="p-4">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-12" />
              </SkeletonCard>
            ))}
          </div>
          
          {/* Controls Skeleton */}
          <div className="flex gap-4 items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
          
          {/* Table Skeleton */}
          <SkeletonCard className="overflow-hidden">
            <div className="space-y-3 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton className="h-12 w-full" key={i} />
              ))}
            </div>
          </SkeletonCard>
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
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">총 주문</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">결제완료</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.paidOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">미결제</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.unpaidOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#13C2C2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#13C2C2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">총 매출</p>
                  <p className="text-lg sm:text-2xl font-bold text-[#13C2C2]">{stats.totalRevenue.toLocaleString()}원</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">가입 사용자</p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.distinctUsers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">오늘 주문</p>
                  <p className="text-lg sm:text-2xl font-bold text-orange-600">{stats.todayOrders}</p>
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
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        o.paid === true 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {o.paid === true ? '결제완료' : '미결제'}
                      </span>
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
                      결제상태
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      결제금액
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
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          o.paid === true 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {o.paid === true ? (
                            <>
                              <CreditCard className="w-3 h-3 mr-1" />
                              <span className="hidden lg:inline">결제완료</span>
                              <span className="lg:hidden">완료</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              <span className="hidden lg:inline">미결제</span>
                              <span className="lg:hidden">미결제</span>
                            </>
                          )}
                        </span>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
