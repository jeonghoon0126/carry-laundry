import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = params.id;
    if (!orderId || isNaN(parseInt(orderId))) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // 주문이 사용자의 것인지 확인
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, user_id, status, delivered_at')
      .eq('id', orderId)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 배송 완료 상태가 아니면 에러
    if (order.status !== 'delivered') {
      return NextResponse.json({ 
        error: 'Order is not delivered yet',
        currentStatus: order.status 
      }, { status: 400 });
    }

    // 배송 확인 플래그 업데이트 (새로운 컬럼 추가 필요)
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        delivery_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating delivery confirmation:', updateError);
      return NextResponse.json({ 
        error: 'Failed to confirm delivery',
        details: updateError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Delivery confirmed successfully' 
    });

  } catch (error) {
    console.error('Error in delivery confirmation:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: (error as Error).message 
    }, { status: 500 });
  }
}
