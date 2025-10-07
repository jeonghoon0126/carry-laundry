import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== ORDER CANCELLATION START ===')
    console.log('Request params:', params)
    
    const session = await getServerSession(authOptions)
    console.log('Cancel API - Session:', session)
    
    if (!session?.user) {
      console.log('No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    console.log('User ID:', userId)
    if (!userId) {
      console.log('No user ID in session')
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    const orderId = params.id
    console.log('Order ID:', orderId)
    
    let body
    try {
      body = await request.json()
      console.log('Request body:', body)
    } catch (e) {
      console.log('No request body, using default reason')
      body = {}
    }
    const { reason } = body

    console.log('Getting Supabase client...')
    const supabase = getSupabaseServer()
    console.log('Supabase client obtained')
    
    // 주문 정보 조회
    console.log('Fetching order from database...')
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single()

    console.log('Order fetch result:', { order, fetchError })

    if (fetchError) {
      console.error('Error fetching order:', fetchError)
      return NextResponse.json({ 
        error: 'Order not found or access denied',
        details: fetchError.message,
        debug: {
          orderId,
          userId,
          error: fetchError
        }
      }, { status: 404 })
    }

    if (!order) {
      console.error('No order found for ID:', orderId, 'User ID:', userId)
      
      // 사용자의 모든 주문 조회해서 디버그 정보 제공
      const { data: userOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', userId)
      
      return NextResponse.json({ 
        error: 'Order not found or you do not have permission to cancel this order',
        debug: {
          requestedOrderId: orderId,
          userId,
          userOrderIds: userOrders?.map(o => o.id) || []
        }
      }, { status: 404 })
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
      return NextResponse.json({ 
        error: '이미 취소된 주문입니다',
        details: '해당 주문은 이미 취소되었습니다.',
        debug: {
          orderId,
          currentStatus: order.status
        }
      }, { status: 400 })
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
    console.log('Updating order status to cancelled...')
    
    const updateData: any = {
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason || '고객 요청에 의한 취소',
      updated_at: new Date().toISOString()
    }
    
    // status 필드가 존재하는 경우에만 추가
    if (order.status !== undefined) {
      updateData.status = 'cancelled'
      console.log('Adding status field to update')
    } else {
      console.log('Status field not found, skipping status update')
    }
    
    console.log('Update data:', updateData)
    
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .eq('user_id', userId)
      .select()
      .single()

    console.log('Update result:', { updatedOrder, updateError })

    if (updateError) {
      console.error('Error updating order:', updateError)
      return NextResponse.json({ 
        error: 'Failed to cancel order',
        details: updateError.message 
      }, { status: 500 })
    }

    if (!updatedOrder) {
      console.error('No order returned after update')
      return NextResponse.json({ error: 'Order update failed' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      order: updatedOrder,
      message: paymentCancelled 
        ? 'Order and payment cancelled successfully' 
        : 'Order cancelled successfully (payment cancellation may have failed)'
    })
  } catch (error) {
    console.error('=== ORDER CANCELLATION ERROR ===')
    console.error('Error in order cancellation:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      cause: error instanceof Error ? error.cause : undefined
    })
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
