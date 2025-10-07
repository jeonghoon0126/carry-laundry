import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { OrderWithProgress } from '@/lib/types/order'
import { ORDER_STATUS_INFO } from '@/lib/utils/orderStatus'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    const supabase = getSupabaseServer()

    // 사용자의 가장 최근 주문 조회 (배송 완료 확인되지 않은 주문만)
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'cancelled') // 취소되지 않은 주문만
      .or('delivery_confirmed_at.is.null,status.neq.delivered') // 배송 완료 확인되지 않았거나 배송 완료가 아닌 주문
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Error fetching latest order:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch latest order',
        details: error.message 
      }, { status: 500 })
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(null)
    }

    const order = orders[0] as any

    // 주문 상태가 delivered인 경우는 제외 (완료된 주문)
    if (order.status === 'delivered') {
      return NextResponse.json(null)
    }

    // OrderWithProgress 형태로 변환
    const orderWithProgress: OrderWithProgress = {
      ...order,
      progress: ORDER_STATUS_INFO[order.status as keyof typeof ORDER_STATUS_INFO] || ORDER_STATUS_INFO.pending,
      canCancel: ['pending', 'processing'].includes(order.status),
      estimatedDeliveryTime: order.estimated_completion_time 
        ? new Date(order.estimated_completion_time).toLocaleString('ko-KR')
        : undefined
    }

    return NextResponse.json(orderWithProgress)

  } catch (error) {
    console.error('Latest order API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
