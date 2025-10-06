'use client'
import { useEffect, useState } from 'react'

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

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')

  async function load() {
    try {
      setError(null)
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
    }
  }

  useEffect(() => { load() }, [])

  const filtered = (orders ?? []).filter(o => {
    const t = q.trim()
    if (!t) return true
    return (o.name ?? '').includes(t) || (o.phone ?? '').includes(t)
  })

  if (error) return <div className="p-6 text-red-600">에러: {error}</div>
  if (!orders) return <div className="p-6">로딩 중…</div>

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">주문 리스트</h1>
      
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 text-sm">총 주문</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 text-sm">결제완료</h3>
            <p className="text-2xl font-bold text-green-600">{stats.paidOrders}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-900 text-sm">미결제</h3>
            <p className="text-2xl font-bold text-red-600">{stats.unpaidOrders}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 text-sm">총 매출</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.totalRevenue.toLocaleString()}원</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-900 text-sm">가입 사용자</h3>
            <p className="text-2xl font-bold text-orange-600">{stats.distinctUsers}</p>
          </div>
          <div className="bg-cyan-50 p-4 rounded-lg">
            <h3 className="font-semibold text-cyan-900 text-sm">오늘 주문</h3>
            <p className="text-2xl font-bold text-cyan-600">{stats.todayOrders}</p>
          </div>
        </div>
      )}
      
      <div className="flex gap-2 items-center">
        <input className="border p-2 rounded w-64" placeholder="이름/전화 검색" value={q} onChange={(e)=>setQ(e.target.value)} />
        <button onClick={load} className="border px-3 py-2 rounded">새로고침</button>
        <span className="text-sm text-gray-500">총 {filtered.length}건</span>
      </div>
      {filtered.length === 0 ? (
        <div className="text-gray-600">표시할 주문이 없습니다.</div>
      ) : (
        <table className="w-full border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border-b">시간</th>
              <th className="p-2 border-b">사용자</th>
              <th className="p-2 border-b">이름</th>
              <th className="p-2 border-b">전화</th>
              <th className="p-2 border-b">주소</th>
              <th className="p-2 border-b">결제상태</th>
              <th className="p-2 border-b">결제금액</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-b">
                <td className="p-2">{new Date(o.created_at).toLocaleString()}</td>
                <td className="p-2">
                  {o.user_id ? (
                    <span className="text-green-600 font-medium">✓ 가입</span>
                  ) : (
                    <span className="text-gray-400">게스트</span>
                  )}
                </td>
                <td className="p-2">{o.name}</td>
                <td className="p-2">{o.phone}</td>
                <td className="p-2">{o.address}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    o.paid === true 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {o.paid === true ? '결제완료' : '미결제'}
                  </span>
                </td>
                <td className="p-2 text-right">
                  {o.payment_amount ? `${o.payment_amount.toLocaleString()}원` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
