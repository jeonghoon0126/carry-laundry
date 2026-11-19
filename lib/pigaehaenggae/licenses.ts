import 'server-only'
import { randomInt } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import type { PlanId } from './plan-benefits'

/**
 * 피개행개 이용권 기록과 조회 (서버 키 전용)
 * 표 구조: supabase/migrations/20261119120000_pigaehaenggae_licenses.sql, 20261119130000_pigaehaenggae_license_coupons.sql
 * 할인권 구성은 lib/pigaehaenggae/plan-benefits.ts 판매 문구와 같아야 한다.
 */

interface CouponRule {
  benefitCode: string
  percentOff: number
  count: number
  /** true 면 n번째 할인권을 이용권 시작 뒤 (n-1)개월부터 쓸 수 있다(매월 1매). */
  monthly: boolean
}

export const PLAN_COUPONS: Record<PlanId, readonly CouponRule[]> = {
  'basic-monthly': [{ benefitCode: 'laundry_discount_20', percentOff: 20, count: 3, monthly: false }],
  'premium-yearly': [
    { benefitCode: 'laundry_discount_20', percentOff: 20, count: 12, monthly: true },
    { benefitCode: 'laundry_free_once', percentOff: 100, count: 1, monthly: false },
  ],
}

const PLAN_MONTHS: Record<PlanId, number> = { 'basic-monthly': 1, 'premium-yearly': 12 }

/** 달력 기준으로 개월을 더한다. 1월 31일 + 1개월은 2월 말일. */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime())
  const day = d.getUTCDate()
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() + months)
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
  d.setUTCDate(Math.min(day, last))
  return d
}

const COUPON_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function couponCode(): string {
  let s = 'PG-'
  for (let i = 0; i < 10; i++) s += COUPON_ALPHABET[randomInt(COUPON_ALPHABET.length)]
  return s
}

export function buildCoupons(licenseId: number, planId: PlanId, startsAt: Date, expiresAt: Date) {
  const rows: Record<string, unknown>[] = []
  for (const rule of PLAN_COUPONS[planId]) {
    for (let seq = 1; seq <= rule.count; seq++) {
      const from = rule.monthly ? addMonths(startsAt, seq - 1) : startsAt
      rows.push({
        license_id: licenseId,
        benefit_code: rule.benefitCode,
        seq,
        coupon_code: couponCode(),
        percent_off: rule.percentOff,
        available_from: from.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
    }
  }
  return rows
}

export interface RecordInput {
  paymentId: string
  transactionId: string | null
  planId: PlanId
  amount: number
  paidAt: string
  customerId: string | null
}

export type RecordResult =
  | { ok: true; licenseId: number; created: boolean; customerLinked: boolean; couponsIssued: boolean; expiresAt: string }
  | { ok: false; reason: 'db_error' }

interface LicenseRow {
  id: number
  plan_id: PlanId
  app_customer_id: string | null
  expires_at: string
  starts_at: string
  status: string
}

/**
 * 검증된 결제를 이용권으로 남긴다. 같은 결제가 다시 와도 행은 하나다.
 * 이미 있는 행에 고객 번호가 비어 있고 이번 요청에 검증된 고객 번호가 있으면 채운다(웹훅이 먼저 기록한 경우).
 */
export async function recordLicense(db: SupabaseClient, input: RecordInput): Promise<RecordResult> {
  const cols = 'id, plan_id, app_customer_id, expires_at, starts_at, status'
  let row: LicenseRow | null = null
  let created = false

  const existing = await db.from('pigaehaenggae_licenses').select(cols).eq('payment_id', input.paymentId).maybeSingle()
  if (existing.error) {
    logger.error('pigaehaenggae license lookup failed', { paymentId: input.paymentId, code: existing.error.code })
    return { ok: false, reason: 'db_error' }
  }
  row = existing.data as LicenseRow | null

  if (!row) {
    const startsAt = new Date(input.paidAt)
    const expiresAt = addMonths(startsAt, PLAN_MONTHS[input.planId])
    const inserted = await db
      .from('pigaehaenggae_licenses')
      .insert({
        payment_id: input.paymentId,
        transaction_id: input.transactionId,
        plan_id: input.planId,
        amount: input.amount,
        app_customer_id: input.customerId,
        paid_at: startsAt.toISOString(),
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select(cols)
      .single()
    if (inserted.error) {
      // 동시에 두 요청이 들어온 경우(23505) 먼저 들어간 행을 다시 읽는다.
      if (inserted.error.code !== '23505') {
        logger.error('pigaehaenggae license insert failed', { paymentId: input.paymentId, code: inserted.error.code })
        return { ok: false, reason: 'db_error' }
      }
      const again = await db.from('pigaehaenggae_licenses').select(cols).eq('payment_id', input.paymentId).maybeSingle()
      if (again.error || !again.data) {
        // payment_id 가 아니라 transaction_id 가 겹친 경우: 같은 결제가 다른 결제 ID로 온 것이라 새로 지급하지 않는다.
        logger.error('pigaehaenggae license duplicate transaction', { paymentId: input.paymentId })
        return { ok: false, reason: 'db_error' }
      }
      row = again.data as LicenseRow
    } else {
      row = inserted.data as LicenseRow
      created = true
    }
  }

  let customerLinked = row.app_customer_id !== null
  if (!customerLinked && input.customerId) {
    const linked = await db
      .from('pigaehaenggae_licenses')
      .update({ app_customer_id: input.customerId })
      .eq('id', row.id)
      .is('app_customer_id', null)
    if (linked.error) logger.error('pigaehaenggae license link failed', { licenseId: row.id, code: linked.error.code })
    else customerLinked = true
  }

  let couponsIssued = false
  if (row.status === 'active') {
    const coupons = buildCoupons(row.id, row.plan_id, new Date(row.starts_at), new Date(row.expires_at))
    const issued = await db
      .from('pigaehaenggae_license_coupons')
      .upsert(coupons, { onConflict: 'license_id,benefit_code,seq', ignoreDuplicates: true })
    if (issued.error) logger.error('pigaehaenggae coupon issue failed', { licenseId: row.id, code: issued.error.code })
    else couponsIssued = true
  }

  return { ok: true, licenseId: row.id, created, customerLinked, couponsIssued, expiresAt: row.expires_at }
}

export interface LicenseStatus {
  active: boolean
  license: null | { planId: PlanId; startsAt: string; expiresAt: string }
  coupons: Array<{
    code: string
    benefitCode: string
    percentOff: number
    availableFrom: string
    expiresAt: string
    usedAt: string | null
  }>
}

/** 이 고객 번호에 지금 유효한 이용권과 그 할인권. 환불, 취소, 만료된 이용권은 없는 것으로 본다. */
export async function findLicenseStatus(db: SupabaseClient, customerId: string, now = new Date()): Promise<LicenseStatus | null> {
  const at = now.toISOString()
  const lic = await db
    .from('pigaehaenggae_licenses')
    .select('id, plan_id, starts_at, expires_at')
    .eq('app_customer_id', customerId)
    .eq('status', 'active')
    .lte('starts_at', at)
    .gt('expires_at', at)
    .order('expires_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (lic.error) {
    logger.error('pigaehaenggae license status failed', { code: lic.error.code })
    return null
  }
  if (!lic.data) return { active: false, license: null, coupons: [] }

  const cps = await db
    .from('pigaehaenggae_license_coupons')
    .select('coupon_code, benefit_code, percent_off, available_from, expires_at, used_at, seq')
    .eq('license_id', lic.data.id)
    .order('benefit_code', { ascending: true })
    .order('seq', { ascending: true })
  if (cps.error) logger.error('pigaehaenggae coupon status failed', { code: cps.error.code })

  return {
    active: true,
    license: { planId: lic.data.plan_id, startsAt: lic.data.starts_at, expiresAt: lic.data.expires_at },
    coupons: (cps.data ?? []).map((c) => ({
      code: c.coupon_code,
      benefitCode: c.benefit_code,
      percentOff: c.percent_off,
      availableFrom: c.available_from,
      expiresAt: c.expires_at,
      usedAt: c.used_at,
    })),
  }
}
