import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * 피개행개 앱 → 결제 페이지 연결 표
 *
 * 앱 서버가 인증번호로 로그인한 고객에게만 발급한다. 형식: base64url(JSON).base64url(HMAC-SHA256)
 *   payload = { v: 1, cid: 앱 고객 번호, pid: 미리 만든 결제 ID(pghg_...), exp: 만료(ms) }
 * 결제 ID를 표에 묶어 두므로, 남의 결제 ID에 자기 고객 번호를 붙이는 요청은 서명이 맞아도 거부된다.
 * 같은 결제 ID는 이용권 표의 unique 제약 때문에 한 번만 쓰인다.
 *
 * 비밀값: PIGAEHAENGGAE_LICENSE_LINK_SECRET (앱 서버와 같은 값, 32자 이상)
 */

export interface LinkPayload {
  v: 1
  cid: string
  pid: string
  exp: number
}

const CUSTOMER_ID_PATTERN = /^[A-Za-z0-9_-]{16,128}$/
const PAYMENT_ID_PATTERN = /^pghg_[A-Za-z0-9_-]{4,80}$/
/** 앱 서버가 10분짜리로 만든다. 결제 승인 시각 기준으로 남은 기간이 15분을 넘는 표는 받지 않는다. */
const MAX_LIFETIME_MS = 15 * 60_000

export type LinkResult =
  | { ok: true; payload: LinkPayload }
  | { ok: false; reason: 'not_configured' | 'malformed' | 'bad_signature' | 'expired' | 'payment_mismatch' }

function secret(): string | undefined {
  const value = process.env.PIGAEHAENGGAE_LICENSE_LINK_SECRET?.trim()
  return value && value.length >= 32 ? value : undefined
}

export function signLinkPayload(payload: LinkPayload, key: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const mac = createHmac('sha256', key).update(body).digest('base64url')
  return `${body}.${mac}`
}

/**
 * @param paidAtMs 포트원이 알려 준 결제 승인 시각. 만료는 확인 요청 시각이 아니라 이 시각으로 따진다
 *   (결제창에서 오래 머물거나 확인이 늦게 다시 와도 결제 당시 유효했던 표는 인정).
 */
export function verifyLinkToken(token: unknown, paymentId: string, paidAtMs: number): LinkResult {
  const key = secret()
  if (!key) return { ok: false, reason: 'not_configured' }
  if (typeof token !== 'string' || token.length > 1024) return { ok: false, reason: 'malformed' }
  const parts = token.split('.')
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, reason: 'malformed' }

  const expected = createHmac('sha256', key).update(parts[0]).digest()
  let given: Buffer
  try {
    given = Buffer.from(parts[1], 'base64url')
  } catch {
    return { ok: false, reason: 'malformed' }
  }
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { ok: false, reason: 'bad_signature' }
  }

  let payload: LinkPayload
  try {
    payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'))
  } catch {
    return { ok: false, reason: 'malformed' }
  }
  if (
    payload?.v !== 1 ||
    typeof payload.cid !== 'string' || !CUSTOMER_ID_PATTERN.test(payload.cid) ||
    typeof payload.pid !== 'string' || !PAYMENT_ID_PATTERN.test(payload.pid) ||
    typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)
  ) {
    return { ok: false, reason: 'malformed' }
  }
  if (!Number.isFinite(paidAtMs) || payload.exp < paidAtMs || payload.exp > paidAtMs + MAX_LIFETIME_MS) return { ok: false, reason: 'expired' }
  if (payload.pid !== paymentId) return { ok: false, reason: 'payment_mismatch' }
  return { ok: true, payload }
}
