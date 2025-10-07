import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderId = params.id
    const body = await request.json()
    const { reason } = body

    const supabase = getSupabaseServer()
    
    // 주문 정보 조회
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', session.user.id)
      .single()

    if (fetchError || !order) {
      console.error('Error fetching order:', fetchError)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 이미 취소된 주문인지 확인
    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'Order already cancelled' }, { status: 400 })
    }

    // 결제가 완료된 주문인 경우 토스페이먼츠 취소 처리
    if (order.paid && order.payment_id) {
      try {
        const cancelResponse = await fetch('https://api.tosspayments.com/v1/payments/cancel', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cancelReason: reason || '고객 요청에 의한 취소',
            cancelAmount: order.payment_amount || order.amount
          })
        })

        if (!cancelResponse.ok) {
          const errorData = await cancelResponse.json()
          console.error('Toss cancellation failed:', errorData)
          return NextResponse.json({ 
            error: 'Payment cancellation failed',
            details: errorData 
          }, { status: 500 })
        }

        const cancelData = await cancelResponse.json()
        console.log('Payment cancelled successfully:', cancelData)
      } catch (error) {
        console.error('Error cancelling payment:', error)
        return NextResponse.json({ 
          error: 'Failed to cancel payment',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
      }
    }

    // 주문 상태를 취소로 업데이트
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_reason: reason || '고객 요청에 의한 취소',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating order:', updateError)
      return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      order: updatedOrder,
      message: 'Order cancelled successfully'
    })
  } catch (error) {
    console.error('Error in order cancellation:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
