import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { getSupabaseServer } from '@/lib/supabase-server'
import { findLicenseStatus } from '@/lib/pigaehaenggae/licenses'

/**
 * 피개행개 앱 서버 전용 이용권 조회: POST /api/pigaehaenggae/license-status
 *
 * 서버끼리만 부른다. 휴대폰 앱이 직접 부르지 않는다.
 *   헤더 x-pghg-timestamp: 요청 시각(ms), 5분 안이어야 한다
 *   헤더 x-pghg-signature: base64url(HMAC-SHA256(PIGAEHAENGGAE_LICENSE_QUERY_SECRET, `${timestamp}.${원문 본문}`))
 *   본문 { customerId }   — 고객 번호는 접속 기록에 남지 않게 주소가 아니라 본문에 둔다
 * 응답 { ok, active, license, coupons } — 이용권이 없거나 환불, 만료면 active=false
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const CUSTOMER_ID_PATTERN = /^[A-Za-z0-9_-]{16,128}$/

function fail(status: number, code: string) {
  return NextResponse.json({ ok: false, code }, { status, headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: NextRequest) {
  const secret = process.env.PIGAEHAENGGAE_LICENSE_QUERY_SECRET?.trim()
  if (!secret || secret.length < 32) return fail(503, 'not_configured')

  const raw = await request.text()
  if (raw.length > 2_000) return fail(413, 'too_large')
  const ts = request.headers.get('x-pghg-timestamp') ?? ''
  const sig = request.headers.get('x-pghg-signature') ?? ''
  if (!/^\d{13}$/.test(ts) || Math.abs(Date.now() - Number(ts)) > 5 * 60_000) return fail(401, 'stale_or_missing_timestamp')

  const expected = createHmac('sha256', secret).update(`${ts}.${raw}`).digest()
  const given = Buffer.from(sig, 'base64url')
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return fail(401, 'bad_signature')

  let customerId: unknown
  try {
    customerId = (JSON.parse(raw) as { customerId?: unknown }).customerId
  } catch {
    return fail(400, 'invalid_json')
  }
  if (typeof customerId !== 'string' || !CUSTOMER_ID_PATTERN.test(customerId)) return fail(400, 'invalid_customer')

  try {
    const status = await findLicenseStatus(getSupabaseServer(), customerId)
    if (!status) return fail(502, 'db_error')
    return NextResponse.json({ ok: true, ...status }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    logger.apiError('/api/pigaehaenggae/license-status', error, {})
    return fail(500, 'server_error')
  }
}
