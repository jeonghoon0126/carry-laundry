'use client'
import { useEffect, useState } from 'react'

type Order = { id:number; name:string; phone:string; address:string; created_at:string }

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')

  async function load() {
    try {
      setError(null)
      const res = await fetch('/api/orders', { cache: 'no-store' })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setOrders(data as Order[])
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
              <th className="p-2 border-b">이름</th>
              <th className="p-2 border-b">전화</th>
              <th className="p-2 border-b">주소</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-b">
                <td className="p-2">{new Date(o.created_at).toLocaleString()}</td>
                <td className="p-2">{o.name}</td>
                <td className="p-2">{o.phone}</td>
                <td className="p-2">{o.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
