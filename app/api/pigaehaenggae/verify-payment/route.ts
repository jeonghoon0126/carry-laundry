import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { PIGAEHAENGGAE_STORE_ID, findPlan } from '@/lib/pigaehaenggae/plans'
import { getSupabaseServer } from '@/lib/supabase-server'
import { verifyLinkToken } from '@/lib/pigaehaenggae/link-token'
import { recordLicense } from '@/lib/pigaehaenggae/licenses'
import type { PlanId } from '@/lib/pigaehaenggae/plan-benefits'

/**
 * 포트원(PortOne) V2 결제 단건 검증 API
 *
 * POST /api/pigaehaenggae/verify-payment
 *   body: { paymentId: string, planId: string, link?: string }
 *   link: 피개행개 앱이 발급한 연결 표(lib/pigaehaenggae/link-token.ts). 있으면 이용권을 그 앱 고객에게 묶는다.
 *
 * 브라우저 결제창이 끝났다는 사실만으로는 결제가 성사됐다고 볼 수 없으므로,
 * 서버가 포트원 REST API(GET /payments/{paymentId})로 실제 결제 상태·금액·상점을
 * 다시 조회해 검증한다.
 *
 * 검증 항목
 *  1) 결제 상태가 PAID 인가
 *  2) 우리 상점(storeId)에서 만들어진 결제인가
 *  3) 통화가 KRW 인가
 *  4) 결제 금액이 카탈로그(lib/pigaehaenggae/plans.ts)의 상품 금액과 같은가
 *
 * 필요한 환경변수: PORTONE_API_SECRET (서버 전용, 클라이언트에 노출 금지)
 */

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const PORTONE_API_BASE = 'https://api.portone.io'
/** PaymentButton.tsx 가 생성하는 결제 ID 형식만 허용한다. */
const PAYMENT_ID_PATTERN = /^pghg_[A-Za-z0-9_-]{4,80}$/

interface PortOnePayment {
  id?: string
  status?: string
  storeId?: string
  orderName?: string
  paidAt?: string
  currency?: string
  amount?: number | { total?: number; taxFree?: number; vat?: number }
  receiptUrl?: string
  method?: { type?: string }
  transactionId?: string
  channel?: { type?: string }
}

function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, code, message, ...(extra ?? {}) }, { status })
}

function readPaidAmount(payment: PortOnePayment): number | undefined {
  if (typeof payment.amount === 'number') return payment.amount
  if (payment.amount && typeof payment.amount === 'object' && typeof payment.amount.total === 'number') {
    return payment.amount.total
  }
  return undefined
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError(400, 'invalid_json', '요청 본문을 읽을 수 없습니다.')
  }

  const { paymentId, planId, link } = (body ?? {}) as { paymentId?: unknown; planId?: unknown; link?: unknown }

  if (typeof paymentId !== 'string' || !PAYMENT_ID_PATTERN.test(paymentId)) {
    return jsonError(400, 'invalid_payment_id', '결제 ID가 올바르지 않습니다.')
  }

  const plan = findPlan(planId)
  if (!plan) {
    return jsonError(400, 'invalid_plan', '알 수 없는 상품입니다.')
  }

  const apiSecret = process.env.PORTONE_API_SECRET?.trim()
  if (!apiSecret) {
    // 서버 환경설정이 없을 때 결제 자체를 실패로 오인하지 않도록, 설정 누락임을 코드로 구분해 알린다.
    logger.error('PortOne verification skipped: PORTONE_API_SECRET missing', {
      endpoint: '/api/pigaehaenggae/verify-payment',
      planId: plan.id,
    })
    return jsonError(
      503,
      'verification_not_configured',
      '서버에 결제 검증 키(PORTONE_API_SECRET)가 설정되지 않아 자동 검증을 진행하지 못했습니다.',
    )
  }

  let upstreamStatus = 0
  let payment: PortOnePayment | null = null
  let upstreamError: string | undefined

  try {
    const response = await fetch(`${PORTONE_API_BASE}/payments/${encodeURIComponent(paymentId)}`, {
      method: 'GET',
      headers: {
        Authorization: `PortOne ${apiSecret}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })

    upstreamStatus = response.status
    const raw = await response.text().catch(() => '')

    if (response.ok) {
      try {
        payment = JSON.parse(raw) as PortOnePayment
      } catch {
        logger.error('PortOne verification: unparsable response', {
          endpoint: '/api/pigaehaenggae/verify-payment',
          paymentId,
          status: upstreamStatus,
        })
        return jsonError(502, 'upstream_invalid_response', '결제 정보를 해석하지 못했습니다. 잠시 후 다시 확인해 주세요.')
      }
    } else {
      let parsed: any = null
      try {
        parsed = JSON.parse(raw)
      } catch {
        /* 본문이 JSON 이 아닐 수 있음 */
      }
      upstreamError = typeof parsed?.type === 'string' ? parsed.type : undefined

      logger.warn('PortOne verification: upstream error', {
        endpoint: '/api/pigaehaenggae/verify-payment',
        paymentId,
        status: upstreamStatus,
        errorType: upstreamError,
      })

      if (response.status === 401 || response.status === 403) {
        // 시크릿 키 값은 절대 로그/응답에 남기지 않는다.
        return jsonError(500, 'verification_configuration_error', '결제 검증 키가 올바르지 않습니다. 관리자 확인이 필요합니다.')
      }
      if (response.status === 404 || upstreamError === 'PAYMENT_NOT_FOUND') {
        return jsonError(404, 'payment_not_found', '포트원에서 해당 결제 건을 찾을 수 없습니다.')
      }
      return jsonError(502, 'upstream_error', '결제 정보를 조회하지 못했습니다. 잠시 후 다시 확인해 주세요.')
    }
  } catch (error) {
    logger.apiError('/api/pigaehaenggae/verify-payment', error, {
      paymentId,
      upstreamStatus,
    })
    return jsonError(502, 'verification_unreachable', '결제 확인 서버에 연결하지 못했습니다. 잠시 후 다시 확인해 주세요.')
  }

  if (!payment) {
    return jsonError(502, 'upstream_invalid_response', '결제 정보를 해석하지 못했습니다.')
  }

  const returnedId = payment.id
  if (returnedId && returnedId !== paymentId) {
    logger.error('PortOne verification: payment id mismatch', {
      endpoint: '/api/pigaehaenggae/verify-payment',
      requestedPaymentId: paymentId,
      returnedPaymentId: returnedId,
    })
    return jsonError(409, 'payment_id_mismatch', '결제 정보가 요청과 일치하지 않습니다.')
  }

  // 1) 상태
  if (payment.status !== 'PAID') {
    logger.info('PortOne verification: payment not paid', {
      endpoint: '/api/pigaehaenggae/verify-payment',
      paymentId,
      status: payment.status,
    })
    return jsonError(409, 'payment_not_paid', '아직 결제가 완료되지 않은 건입니다.', {
      paymentStatus: payment.status ?? 'UNKNOWN',
    })
  }

  // 1-1) 실결제 채널. 상점 ID는 공개값이라, 시험 채널 결제(돈이 안 나감)로 이용권을 받지 못하게 막는다.
  if (payment.channel?.type !== 'LIVE') {
    logger.error('PortOne verification: non-live channel', {
      endpoint: '/api/pigaehaenggae/verify-payment',
      paymentId,
      channelType: payment.channel?.type ?? 'missing',
    })
    return jsonError(409, 'test_channel', '실제 결제 건이 아닙니다.')
  }

  // 2) 상점 (값이 없어도 거부)
  if (payment.storeId !== PIGAEHAENGGAE_STORE_ID) {
    logger.error('PortOne verification: store mismatch', {
      endpoint: '/api/pigaehaenggae/verify-payment',
      paymentId,
      storeId: payment.storeId,
    })
    return jsonError(409, 'store_mismatch', '다른 상점의 결제 건입니다.')
  }

  // 3) 통화 (값이 없어도 거부)
  if (payment.currency !== plan.currency) {
    return jsonError(409, 'currency_mismatch', '통화 정보가 상품과 일치하지 않습니다.', {
      expectedCurrency: plan.currency,
      actualCurrency: payment.currency,
    })
  }

  // 4) 금액 — 브라우저가 보낸 금액이 아니라 서버 카탈로그 금액과 비교한다.
  const paidAmount = readPaidAmount(payment)
  if (paidAmount === undefined) {
    logger.error('PortOne verification: amount missing', {
      endpoint: '/api/pigaehaenggae/verify-payment',
      paymentId,
    })
    return jsonError(409, 'amount_unavailable', '결제 금액을 확인하지 못했습니다.')
  }
  if (paidAmount !== plan.amount) {
    logger.paymentFailed(paymentId, 'amount_mismatch', {
      endpoint: '/api/pigaehaenggae/verify-payment',
      planId: plan.id,
      expectedAmount: plan.amount,
      paidAmount,
    })
    return jsonError(409, 'amount_mismatch', '결제 금액이 상품 금액과 일치하지 않습니다.', {
      expectedAmount: plan.amount,
      paidAmount,
    })
  }

  if (!payment.paidAt) {
    // PAID 인데 승인 시각이 없으면 비정상 응답으로 본다.
    return jsonError(502, 'paid_at_missing', '결제 승인 시각을 확인하지 못했습니다.')
  }

  logger.paymentCompleted(paymentId, paidAmount, payment.transactionId ?? paymentId, {
    endpoint: '/api/pigaehaenggae/verify-payment',
    planId: plan.id,
    orderName: payment.orderName,
    currency: payment.currency,
    paidAt: payment.paidAt,
  })

  // 이용권 기록. 결제는 이미 확정됐으므로 기록이 실패해도 결제 성공 응답은 그대로 주고
  // entitlementRecorded=false 로 알린다(포트원 웹훅이나 같은 요청 재시도로 다시 기록된다).
  let linkStatus: 'none' | 'linked' | 'rejected' = 'none'
  let customerId: string | null = null
  if (link !== undefined && link !== null && link !== '') {
    const checked = verifyLinkToken(link, paymentId, Date.parse(payment.paidAt))
    if (checked.ok) {
      customerId = checked.payload.cid
      linkStatus = 'linked'
    } else {
      linkStatus = 'rejected'
      logger.warn('pigaehaenggae link token rejected', { paymentId, reason: checked.reason })
    }
  }

  let entitlementRecorded = false
  let customerLinked = false
  let expiresAt: string | null = null
  try {
    const recorded = await recordLicense(getSupabaseServer(), {
      paymentId,
      transactionId: payment.transactionId ?? null,
      planId: plan.id as PlanId,
      amount: paidAmount,
      paidAt: payment.paidAt,
      customerId,
    })
    if (recorded.ok) {
      entitlementRecorded = true
      customerLinked = recorded.customerLinked
      expiresAt = recorded.expiresAt
    }
  } catch (error) {
    logger.apiError('/api/pigaehaenggae/verify-payment', error, { paymentId, step: 'record_license' })
  }

  return NextResponse.json({
    ok: true,
    verified: true,
    entitlementRecorded,
    customerLinked,
    linkStatus,
    licenseExpiresAt: expiresAt,
    payment: {
      paymentId,
      status: payment.status,
      planId: plan.id,
      amount: paidAmount,
      currency: payment.currency ?? plan.currency,
      orderName: payment.orderName ?? plan.orderName,
      paidAt: payment.paidAt,
      method: payment.method?.type ?? null,
      receiptUrl: payment.receiptUrl ?? null,
    },
  })
}

export async function GET() {
  return jsonError(405, 'method_not_allowed', 'POST 로 요청해 주세요.')
}
