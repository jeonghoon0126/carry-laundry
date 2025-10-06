import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// 빌드 시점 모듈 평가를 피하기 위해 핸들러 내부에서 Supabase 클라이언트를 생성하도록 변경.
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('[Toss] Supabase config check:', {
    hasUrl: !!url,
    hasServiceRoleKey: !!key,
    urlHost: url ? new URL(url).hostname : 'missing'
  });
  
  if (!url || !key) {
    throw new Error(`Supabase env missing: url=${!!url}, serviceRoleKey=${!!key}`);
  }
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient(); // <-- 핸들러 내부에서 생성
    
    // Log incoming request
    logger.info('Payment confirmation request received', {
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      endpoint: '/api/payments/confirm'
    })

    // Extract query parameters
    const { searchParams } = new URL(request.url)
    const paymentKey = searchParams.get('paymentKey') || ''
    const orderId = searchParams.get('orderId') || ''
    const amountRaw = searchParams.get('amount') || ''
    const amount = Number(amountRaw)

    console.info('[Toss] params', { 
      paymentKey, 
      orderId, 
      amountRaw, 
      amount, 
      hasSecret: !!process.env.TOSS_SECRET_KEY,
      secretKeyPrefix: process.env.TOSS_SECRET_KEY?.substring(0, 10) + '...'
    })

    console.log('[Toss] env check', {
      hasSecret: !!process.env.TOSS_SECRET_KEY,
      secretPrefix: process.env.TOSS_SECRET_KEY?.slice(0, 8) || 'none',
      amountType: typeof amount,
    });

    // Validate parameters
    if (!paymentKey || !orderId || !amountRaw || isNaN(amount)) {
      console.warn('[Toss] invalid-params', { paymentKey: !!paymentKey, orderId, amountRaw, amount })
      const params = new URLSearchParams({
        error: 'payment_failed',
        reason: '결제 파라미터가 올바르지 않습니다'
      })
      return Response.redirect(new URL(`/order?${params.toString()}`, request.url), 302)
    }

    // Extract dbId from orderId format: "order_<dbId>_<timestamp>"
    const parts = orderId.split('_')
    const dbId = Number(parts[1])
    if (!dbId) {
      console.warn('[Toss] invalid-orderId-format', { orderId, parts })
      const params = new URLSearchParams({
        error: 'payment_failed',
        reason: '주문 ID 형식이 올바르지 않습니다'
      })
      return Response.redirect(new URL(`/order?${params.toString()}`, request.url), 302)
    }

    // Build Basic auth header exactly as specified
    const secretKey = process.env.TOSS_SECRET_KEY!;
    const authHeader = 'Basic ' + Buffer.from(`${secretKey}:`).toString('base64'); // note the colon after the key
    console.info('[Toss] auth-header', { 
      authLength: authHeader.length,
      secretKeyLength: secretKey?.length 
    })

    // Call Toss confirm
    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paymentKey, orderId, amount }) // amount must be a Number, not a string
    })

    const raw = await tossRes.text().catch(() => '')
    let body: any = null
    try { 
      body = JSON.parse(raw) 
    } catch {}

    console.info('[Toss] confirm-out', { 
      status: tossRes.status, 
      ok: tossRes.ok, 
      body: body || raw 
    })

    if (tossRes.ok) {
      // Derive DB id from orderId like 'order_28_1699999999999'
      const parts = orderId.split('_')
      const dbId = Number(parts[1])
      console.info('[Toss] confirm-ok', { 
        dbId, 
        amount, 
        method: body?.method, 
        totalAmount: body?.totalAmount 
      })

      // Check if already paid to prevent duplicate updates
      const { data: before } = await supabase
        .from("orders")
        .select("id, paid, payment_id, payment_amount")
        .eq("id", dbId)
        .single();

      if (before?.paid) {
        console.log("[Toss] Already paid, skipping update:", dbId);
        return NextResponse.redirect(new URL("/order/completed", request.url));
      }

      const { error: upErr, data: updateData } = await supabase
        .from("orders")
        .update({
          paid: true,
          payment_id: paymentKey,
          payment_amount: body?.totalAmount || amount,
        })
        .eq("id", dbId)
        .eq("paid", false)
        .select();

      console.info('[Toss] Update result:', { 
        dbId, 
        error: upErr, 
        updatedRows: updateData?.length || 0,
        updateData 
      });

      if (upErr) {
        console.error("Update failed", upErr);
        const params = new URLSearchParams({
          error: 'payment_failed',
          reason: '주문 정보 업데이트에 실패했습니다'
        })
        return NextResponse.redirect(new URL(`/order?${params.toString()}`, request.url));
      }

      logger.paymentCompleted(orderId, amount, paymentKey, {
        method: body?.method,
        totalAmount: body?.totalAmount,
        endpoint: '/api/payments/confirm'
      })
      
      return Response.redirect(new URL('/order/completed', request.url), 302)
    } else {
      // Use the already parsed body or raw text
      let reason = ''
      if (body && typeof body === 'object') {
        reason = body?.message || body?.code || body?.error || ''
      } else {
        reason = raw || ''
      }
      
      // reason이 비어있을 때 기본 메시지 제공
      if (!reason || reason.trim() === '') {
        reason = `결제 확인 실패 (HTTP ${tossRes.status})`
      }
      
      logger.paymentFailed(orderId, reason, {
        status: tossRes.status,
        body: body || raw,
        paymentKey: paymentKey?.slice(0, 10) + '...',
        endpoint: '/api/payments/confirm'
      })
      
      const params = new URLSearchParams({
        error: 'payment_failed',
        status: String(tossRes.status),
        reason: reason.slice(0, 200)
      })
      
      console.warn('[Toss] redirecting with params:', {
        params: params.toString(),
        reason: reason,
        status: tossRes.status,
        redirectUrl: `/order?${params.toString()}`
      })
      
      return Response.redirect(new URL(`/order?${params.toString()}`, request.url), 302)
    }

  } catch (error) {
    logger.apiError('/api/payments/confirm', error, {
      endpoint: '/api/payments/confirm'
    })
    
    // 에러 메시지 추출
    let errorMessage = '결제 처리 중 오류가 발생했습니다.'
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }
    
    const params = new URLSearchParams({
      error: 'payment_failed',
      reason: errorMessage.slice(0, 200)
    })
    
    console.warn('[Toss] catch block redirecting with params:', {
      params: params.toString(),
      errorMessage: errorMessage,
      redirectUrl: `/order?${params.toString()}`,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.redirect(new URL(`/order?${params.toString()}`, request.url), 302)
  }
}
