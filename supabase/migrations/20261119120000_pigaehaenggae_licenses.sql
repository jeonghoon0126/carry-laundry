-- 피개행개 이용권(유료 결제) 기록 표 — 제안 스키마
--
-- ⚠️ 이 파일은 "생성만" 한 제안 스키마다. 운영 DB에는 아직 적용하지 않았다.
--    정훈님 승인 후 Supabase SQL Editor 또는 `supabase db push` 로 적용한다.
--
-- 적용 대상: carry-laundry 가 쓰는 Supabase 프로젝트
-- 목적:
--   1) 포트원 결제 검증(POST /api/pigaehaenggae/verify-payment)이 성공한 결제를 기록
--   2) 같은 payment_id 가 두 번 적재되지 않게 해 중복 지급 방지
--   3) 이용권에 포함된 혜택(캐리 침구 세탁 할인권)의 발급·사용 여부 기록
--      → "7일 이내 미사용 전액 환불" 판단 근거
--
-- 주의: service_role 키로만 쓰기. 브라우저(anon)에서 직접 쓰지 않는다.

-- 1) 이용권(결제) 기록
CREATE TABLE IF NOT EXISTS public.pigaehaenggae_licenses (
  id BIGSERIAL PRIMARY KEY,
  payment_id TEXT NOT NULL UNIQUE,                 -- 포트원 paymentId (pghg_...) 중복 방지
  transaction_id TEXT,                             -- 포트원 transactionId
  plan_id TEXT NOT NULL,                           -- 'basic-monthly' | 'premium-yearly'
  amount INTEGER NOT NULL,                         -- 실제 결제 금액(원)
  currency TEXT NOT NULL DEFAULT 'KRW',
  status TEXT NOT NULL DEFAULT 'active',           -- active | refunded | expired
  user_id TEXT,                                    -- 로그인 사용자 ID(비회원이면 NULL)
  customer_email TEXT,
  customer_phone TEXT,
  paid_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,                          -- paid_at + 1개월 / 1년
  receipt_url TEXT,
  raw JSONB,                                       -- 포트원 응답 원문(감사용)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pgl_user ON public.pigaehaenggae_licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_pgl_paid_at ON public.pigaehaenggae_licenses(paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_pgl_status ON public.pigaehaenggae_licenses(status);

ALTER TABLE public.pigaehaenggae_licenses ENABLE ROW LEVEL SECURITY;

-- 서버(service_role)는 RLS 를 우회하므로 별도 정책이 필요 없다.
-- 로그인 사용자가 자기 이용권만 읽을 수 있게 할 때만 아래 정책을 켠다.
-- CREATE POLICY "own licenses" ON public.pigaehaenggae_licenses
--   FOR SELECT TO authenticated USING (auth.uid()::text = user_id);

-- 2) 이용권 혜택(세탁 할인권·무료 쿠폰) 발급/사용 기록
--    환불 판정과 실제 사용 확인에 쓰인다. 혜택 내용을 바꾸면 benefit_type 값만 늘리면 된다.
CREATE TABLE IF NOT EXISTS public.pigaehaenggae_license_benefits (
  id BIGSERIAL PRIMARY KEY,
  license_id BIGINT NOT NULL REFERENCES public.pigaehaenggae_licenses(id) ON DELETE CASCADE,
  benefit_type TEXT NOT NULL,                      -- 'laundry_discount_20' | 'laundry_free_once'
  coupon_code TEXT NOT NULL UNIQUE,                -- 사용자에게 보여줄 할인권 번호
  discount_rate INTEGER,                           -- % (무료 쿠폰이면 NULL)
  used_at TIMESTAMPTZ,                             -- 사용 시각 (NULL 이면 미사용)
  used_order_ref TEXT,                             -- 캐리 세탁 주문번호 등
  expires_at TIMESTAMPTZ,                          -- 이용권 만료일과 동일
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pglb_license ON public.pigaehaenggae_license_benefits(license_id);
CREATE INDEX IF NOT EXISTS idx_pglb_used ON public.pigaehaenggae_license_benefits(used_at);

ALTER TABLE public.pigaehaenggae_license_benefits ENABLE ROW LEVEL SECURITY;

-- 3) 환불 처리 시 참고용 뷰 (사용한 혜택 수)
--    security_invoker = true 로 두어야 조회자 권한(RLS)이 그대로 적용된다.
--    (기본값은 뷰 소유자 권한으로 실행되어 anon 에게 노출될 수 있음)
CREATE OR REPLACE VIEW public.pigaehaenggae_license_usage
WITH (security_invoker = true) AS
SELECT
  l.id AS license_id,
  l.payment_id,
  l.plan_id,
  l.paid_at,
  l.expires_at,
  COUNT(b.id) AS benefit_count,
  COUNT(b.used_at) AS used_benefit_count,
  MAX(b.used_at) AS last_used_at
FROM public.pigaehaenggae_licenses l
LEFT JOIN public.pigaehaenggae_license_benefits b ON b.license_id = l.id
GROUP BY l.id, l.payment_id, l.plan_id, l.paid_at, l.expires_at;

-- 브라우저(anon/authenticated)에서는 이 뷰를 직접 못 읽게 막아 둔다. 운영은 service_role 로만 조회.
REVOKE ALL ON public.pigaehaenggae_license_usage FROM anon, authenticated;

-- 적용 후 확인:
--   SELECT count(*) FROM public.pigaehaenggae_licenses;
--   SELECT * FROM public.pigaehaenggae_license_usage LIMIT 5;
