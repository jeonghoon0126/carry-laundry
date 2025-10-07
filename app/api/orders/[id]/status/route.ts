import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { OrderStatus } from '@/lib/types/order'
import { canChangeOrderStatus } from '@/lib/utils/orderStatus'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // 관리자 권한 확인
    const userEmail = session.user.email || ''
    const userName = session.user.name || ''
    const userIdString = session.user.id?.toString() || ''
    
    console.log('Admin check - Session user:', {
      email: userEmail,
      name: userName,
      id: userIdString,
      fullSession: session.user
    })
    
    // 관리자 확인: 이메일, 이름, 또는 특정 사용자 ID로 확인
    const isAdmin = userEmail === 'admin@carry-laundry.com' || 
                   userEmail.endsWith('@carry-laundry.com') ||
                   userName === 'admin' ||
                   userIdString === '4475158066' // 현재 로그인된 사용자 ID
    
    console.log('Admin check result:', {
      userEmail,
      userName,
      userIdString,
      isAdmin
    })
    
    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Admin access required',
        debug: {
          userEmail,
          userName,
          userIdString,
          hasEmail: !!userEmail,
          hasName: !!userName
        }
      }, { status: 403 })
    }

    const { id } = await params
    const orderId = parseInt(id)
    
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    // 요청 본문 파싱
    const body = await request.json()
    const { status, notes, photos } = body

    if (!status || typeof status !== 'string') {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // 유효한 상태 값 확인
    const validStatuses: OrderStatus[] = ['pending', 'processing', 'completed', 'delivered', 'cancelled']
    if (!validStatuses.includes(status as OrderStatus)) {
      return NextResponse.json({ 
        error: 'Invalid status', 
        validStatuses 
      }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    // 주문 조회
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 상태 변경 가능 여부 확인
    if (!canChangeOrderStatus(order.status as OrderStatus, status as OrderStatus)) {
      return NextResponse.json({ 
        error: 'Invalid status transition',
        currentStatus: order.status,
        targetStatus: status
      }, { status: 400 })
    }

    // 상태별 타임스탬프 설정
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    // 상태별 특별 처리
    switch (status) {
      case 'processing':
        updateData.processing_started_at = new Date().toISOString()
        updateData.estimated_completion_time = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24시간 후
        break
      case 'completed':
        updateData.completed_at = new Date().toISOString()
        updateData.estimated_completion_time = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2시간 후
        break
      case 'delivered':
        updateData.delivered_at = new Date().toISOString()
        updateData.estimated_completion_time = null
        break
      case 'cancelled':
        updateData.cancelled_at = new Date().toISOString()
        updateData.cancel_reason = notes || '관리자에 의한 취소'
        updateData.estimated_completion_time = null
        break
    }

    // 사진 URL 업데이트 (안전하게 처리)
    if (photos && typeof photos === 'object') {
      if (photos.pickup && typeof photos.pickup === 'string') {
        updateData.pickup_photo_url = photos.pickup
      }
      if (photos.delivery && typeof photos.delivery === 'string') {
        updateData.delivery_photo_url = photos.delivery
      }
    }

    // 주문 상태 업데이트
    let updatedOrder
    const { data: initialResult, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('Order status update error:', updateError)
      console.error('Update data that caused error:', updateData)
      
      // 특정 컬럼 오류 처리 - 컬럼이 없는 경우 fallback으로 재시도
      if (updateError.message.includes('column') && updateError.message.includes('does not exist')) {
        console.log('Attempting fallback update without problematic columns...')
        
        // estimated_completion_time 컬럼 제거하고 재시도
        const fallbackData = { ...updateData }
        delete fallbackData.estimated_completion_time
        
        console.log('Fallback update data:', fallbackData)
        
        const { data: fallbackResult, error: fallbackError } = await supabase
          .from('orders')
          .update(fallbackData)
          .eq('id', orderId)
          .select()
          .single()
          
        if (fallbackError) {
          console.error('Fallback update also failed:', fallbackError)
          return NextResponse.json({ 
            error: 'Database schema mismatch - please run the migration',
            details: updateError.message,
            fallbackError: fallbackError.message,
            updateData: updateData
          }, { status: 500 })
        }
        
        console.log('Fallback update succeeded:', fallbackResult)
        updatedOrder = fallbackResult
      } else {
        return NextResponse.json({ 
          error: 'Failed to update order status',
          details: updateError.message,
          updateData: updateData
        }, { status: 500 })
      }
    } else {
      updatedOrder = initialResult
    }

    // 상태 변경 로그 기록 (안전하게 처리)
    try {
      const { error: logError } = await supabase
        .from('order_status_logs')
        .insert({
          order_id: orderId,
          from_status: order.status,
          to_status: status,
          changed_by: userId.toString(),
          notes: notes || `상태 변경: ${order.status} → ${status}`
        })
        
      if (logError) {
        console.error('Failed to log status change:', logError)
        // 로그 실패는 치명적이지 않으므로 계속 진행
      } else {
        console.log('Status change logged successfully')
      }
    } catch (logError) {
      console.error('Failed to log status change (catch):', logError)
      // 로그 실패는 치명적이지 않으므로 계속 진행
    }

    console.log(`Order ${orderId} status changed from ${order.status} to ${status} by ${userEmail}`)

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to ${status}`
    })

  } catch (error) {
    console.error('Order status update error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
