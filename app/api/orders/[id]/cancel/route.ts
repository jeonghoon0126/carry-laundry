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
    console.log('Cancel API - Session:', session)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
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
      .eq('user_id', userId)
      .single()

    if (fetchError || !order) {
      console.error('Error fetching order:', fetchError)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    console.log('Order details:', {
      id: order.id,
      paid: order.paid,
      payment_id: order.payment_id,
      status: order.status,
      payment_amount: order.payment_amount
    })

    // 이미 취소된 주문인지 확인
    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'Order already cancelled' }, { status: 400 })
    }

    // 결제가 완료된 주문인 경우 토스페이먼츠 취소 처리
    let paymentCancelled = false
    if (order.paid && order.payment_id) {
      try {
        console.log('Attempting Toss Payments cancellation for payment_id:', order.payment_id)
        
        const cancelResponse = await fetch(`https://api.tosspayments.com/v1/payments/${order.payment_id}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cancelReason: reason || '고객 요청에 의한 취소'
          })
        })

        if (!cancelResponse.ok) {
          const errorData = await cancelResponse.json()
          console.error('Toss cancellation failed:', errorData)
          // 토스페이먼츠 취소 실패해도 주문 취소는 진행 (부분 취소 허용)
          console.log('Continuing with order cancellation despite payment cancellation failure')
        } else {
          const cancelData = await cancelResponse.json()
          console.log('Payment cancelled successfully:', cancelData)
          paymentCancelled = true
        }
      } catch (error) {
        console.error('Error cancelling payment:', error)
        // 네트워크 에러 등으로 토스페이먼츠 취소 실패해도 주문 취소는 진행
        console.log('Continuing with order cancellation despite payment cancellation error')
      }
    } else {
      console.log('Order not paid or no payment_id, skipping payment cancellation')
    }

    // 주문 상태를 취소로 업데이트
    const updateData: any = {
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason || '고객 요청에 의한 취소',
      updated_at: new Date().toISOString()
    }
    
    // status 필드가 존재하는 경우에만 추가
    if (order.status !== undefined) {
      updateData.status = 'cancelled'
    }
    
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating order:', updateError)
      return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      order: updatedOrder,
      message: paymentCancelled 
        ? 'Order and payment cancelled successfully' 
        : 'Order cancelled successfully (payment cancellation may have failed)'
    })
  } catch (error) {
    console.error('Error in order cancellation:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
