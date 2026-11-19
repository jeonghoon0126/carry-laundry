import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { getSupabaseServer } from '@/lib/supabase-server'
import { PIGAEHAENGGAE_PLANS, PIGAEHAENGGAE_STORE_ID } from '@/lib/pigaehaenggae/plans'
import { fetchPortOnePayment, totalAmount, verifyWebhookSignature } from '@/lib/pigaehaenggae/portone'
import { recordLicense } from '@/lib/pigaehaenggae/licenses'
import type { PlanId } from '@/lib/pigaehaenggae/plan-benefits'

/**
 * 포트원 V2 웹훅: POST /api/pigaehaenggae/portone-webhook
 *
 * - Transaction.Paid: 브라우저가 결제 확인 요청을 못 보내고 닫혀도 이용권을 남긴다(고객 번호 없이).
 *   앱에서 산 경우 결제 확인 요청이 뒤늦게 와도 그때 고객 번호가 채워진다.
 * - Transaction.Cancelled: 전액 취소된 결제의 이용권을 환불 처리한다(status=refunded, refunded_at).
 * - Transaction.PartialCancelled: 이용권을 자동으로 끊지 않고 운영자 확인용 로그만 남긴다.
 *
 * 본문 내용은 믿지 않는다. 서명 확인 뒤 결제 ID만 꺼내 포트원에 상태를 다시 묻는다.
 * 필요한 환경변수: PORTONE_WEBHOOK_SECRET(포트원 콘솔 웹훅 시크릿), PORTONE_API_SECRET, SUPABASE_SERVICE_ROLE
 * 응답: 처리했거나 우리 결제가 아니면 200, 일시 오류는 5xx(포트원이 다시 보냄).
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const PAYMENT_ID_PATTERN = /^pghg_[A-Za-z0-9_-]{4,80}$/

function done(result: string, status = 200) {
  return NextResponse.json({ ok: status < 400, result }, { status })
}

export async function POST(request: NextRequest) {
  const secret = process.env.PORTONE_WEBHOOK_SECRET?.trim()
  if (!secret) {
    logger.error('pigaehaenggae webhook: PORTONE_WEBHOOK_SECRET missing', {})
    return done('not_configured', 503)
  }

  const raw = await request.text()
  if (raw.length > 64_000) return done('too_large', 413)
  const valid = verifyWebhookSignature(raw, {
    id: request.headers.get('webhook-id'),
    timestamp: request.headers.get('webhook-timestamp'),
    signature: request.headers.get('webhook-signature'),
  }, secret)
  if (!valid) return done('bad_signature', 401)

  let event: { type?: unknown; data?: { paymentId?: unknown; storeId?: unknown } }
  try {
    event = JSON.parse(raw)
  } catch {
    return done('invalid_json', 400)
  }
  const type = typeof event.type === 'string' ? event.type : ''
  const paymentId = event.data?.paymentId
  if (typeof paymentId !== 'string' || !PAYMENT_ID_PATTERN.test(paymentId)) return done('ignored_other_payment')
  if (type !== 'Transaction.Paid' && type !== 'Transaction.Cancelled' && type !== 'Transaction.PartialCancelled') {
    return done('ignored_type')
  }

  const fetched = await fetchPortOnePayment(paymentId)
  if (!fetched.ok) {
    logger.warn('pigaehaenggae webhook: payment lookup failed', { paymentId, reason: fetched.reason })
    return done(fetched.reason === 'not_found' ? 'payment_not_found' : 'lookup_failed', fetched.reason === 'not_found' ? 200 : 503)
  }
  const payment = fetched.payment
  if (payment.storeId !== PIGAEHAENGGAE_STORE_ID) return done('ignored_other_store')

  const db = getSupabaseServer()

  if (payment.status === 'PAID') {
    const amount = totalAmount(payment)
    const plan = PIGAEHAENGGAE_PLANS.find((p) => p.amount === amount && (!payment.orderName || p.orderName === payment.orderName))
    // 시험 채널 결제(돈이 안 나감)는 이용권으로 남기지 않는다.
    if (payment.channel?.type !== 'LIVE') return done('ignored_test_channel')
    if (!plan || !payment.paidAt || payment.currency !== plan.currency) {
      logger.error('pigaehaenggae webhook: paid payment does not match a plan', { paymentId, amount })
      return done('plan_mismatch')
    }
    const recorded = await recordLicense(db, {
      paymentId,
      transactionId: payment.transactionId ?? null,
      planId: plan.id as PlanId,
      amount: plan.amount,
      paidAt: payment.paidAt,
      customerId: null,
    })
    return recorded.ok ? done('recorded') : done('db_error', 500)
  }

  if (payment.status === 'CANCELLED') {
    const refundedAt = payment.cancelledAt ?? new Date().toISOString()
    const updated = await db
      .from('pigaehaenggae_licenses')
      .update({ status: 'refunded', refunded_at: refundedAt })
      .eq('payment_id', paymentId)
      .eq('status', 'active')
      .select('id')
    if (updated.error) {
      logger.error('pigaehaenggae webhook: refund update failed', { paymentId, code: updated.error.code })
      return done('db_error', 500)
    }
    logger.info('pigaehaenggae license refunded', { paymentId, rows: updated.data?.length ?? 0 })
    return done(updated.data?.length ? 'refunded' : 'no_active_license')
  }

  if (payment.status === 'PARTIAL_CANCELLED') {
    logger.warn('pigaehaenggae webhook: partial cancel needs operator review', { paymentId })
    return done('partial_cancel_logged')
  }

  return done('ignored_status')
}
