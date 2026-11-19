import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

const PORTONE_API_BASE = 'https://api.portone.io'

export interface PortOnePaymentSummary {
  id?: string
  status?: string
  storeId?: string
  orderName?: string
  paidAt?: string
  cancelledAt?: string
  currency?: string
  amount?: number | { total?: number; cancelled?: number }
  transactionId?: string
}

export type FetchResult =
  | { ok: true; payment: PortOnePaymentSummary }
  | { ok: false; reason: 'not_configured' | 'not_found' | 'auth' | 'upstream' }

/** 포트원 V2 결제 단건 조회. 시크릿 값은 로그나 응답에 남기지 않는다. */
export async function fetchPortOnePayment(paymentId: string): Promise<FetchResult> {
  const apiSecret = process.env.PORTONE_API_SECRET?.trim()
  if (!apiSecret) return { ok: false, reason: 'not_configured' }
  try {
    const res = await fetch(`${PORTONE_API_BASE}/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `PortOne ${apiSecret}`, Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })
    if (res.status === 404) return { ok: false, reason: 'not_found' }
    if (res.status === 401 || res.status === 403) return { ok: false, reason: 'auth' }
    if (!res.ok) return { ok: false, reason: 'upstream' }
    return { ok: true, payment: (await res.json()) as PortOnePaymentSummary }
  } catch {
    return { ok: false, reason: 'upstream' }
  }
}

export function totalAmount(payment: PortOnePaymentSummary): number | undefined {
  if (typeof payment.amount === 'number') return payment.amount
  if (payment.amount && typeof payment.amount.total === 'number') return payment.amount.total
  return undefined
}

/**
 * 포트원 V2 웹훅 서명 확인 (Standard Webhooks 규격)
 * 서명 대상: `${webhook-id}.${webhook-timestamp}.${원문 본문}`, 키: whsec_ 뒤 base64 값을 디코드한 바이트.
 * webhook-signature 헤더에는 "v1,<base64>"가 공백으로 여러 개 올 수 있다. 시각은 5분 안만 받는다.
 */
export function verifyWebhookSignature(
  rawBody: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  const { id, timestamp, signature } = headers
  if (!id || !timestamp || !signature || !/^\d{1,12}$/.test(timestamp)) return false
  if (Math.abs(nowSeconds - Number(timestamp)) > 300) return false
  const keyText = secret.startsWith('whsec_') ? secret.slice(6) : secret
  let key: Buffer
  try {
    key = Buffer.from(keyText, 'base64')
  } catch {
    return false
  }
  if (key.length === 0) return false
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${rawBody}`).digest()
  for (const part of signature.split(' ')) {
    const [version, value] = part.split(',', 2)
    if (version !== 'v1' || !value) continue
    const given = Buffer.from(value, 'base64')
    if (given.length === expected.length && timingSafeEqual(given, expected)) return true
  }
  return false
}
