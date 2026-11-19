# 피개행개 웹 결제 서버 검증 (PortOne V2)

웹 랜딩(`/pigaehaenggae`)의 유료 이용권 결제는 브라우저에서 포트원 V2 SDK로 결제창을 띄운 뒤,
**서버가 포트원 REST API로 결제 건을 다시 조회해 검증**하는 구조로 바뀌었습니다.
브라우저가 "결제 성공"이라고 돌려줬다는 사실만으로는 유료 기능을 열지 않습니다.

## 추가된 것

| 파일 | 역할 |
| --- | --- |
| `app/api/pigaehaenggae/verify-payment/route.ts` | `POST /api/pigaehaenggae/verify-payment` — 결제 단건 검증 |
| `lib/pigaehaenggae/plans.ts` | 상품 카탈로그(상품 ID·주문명·금액·통화) — **서버가 신뢰하는 금액의 유일한 기준** |
| `app/pigaehaenggae/PaymentButton.tsx` | 결제창 종료 후 위 API 호출, 검증 결과를 화면에 표시 |
| `app/pigaehaenggae/page.tsx` | 각 버튼에 `planId` 전달 |

### 검증하는 항목

1. 결제 상태가 `PAID` 인가 — 실패/대기/취소 건이면 거부
2. 우리 상점(`store-b5db7fb0-7efb-488a-9436-96e195c272e1`)에서 만들어진 결제인가
3. 통화가 `KRW` 인가
4. 결제 금액이 `lib/pigaehaenggae/plans.ts` 의 상품 금액과 **정확히** 같은가
   (브라우저가 보낸 금액은 신뢰하지 않습니다. 금액을 바꿔 요청해도 서버가 거부합니다.)

부가 방어: 결제 ID는 `pghg_` 로 시작하는 형식만 허용(경로 삽입 차단), 시크릿 키는 로그·응답에 남기지 않음,
조회 타임아웃 10초.

### 응답

성공 `200`

```json
{
  "ok": true,
  "verified": true,
  "entitlementRecorded": false,
  "payment": {
    "paymentId": "pghg_...", "status": "PAID", "planId": "basic-monthly",
    "amount": 14900, "currency": "KRW", "orderName": "피개행개 베이직 1개월 이용권",
    "paidAt": "...", "method": "PaymentMethodCard", "receiptUrl": "..."
  }
}
```

실패는 `ok: false` + `code` 로 구분합니다.

| code | HTTP | 의미 |
| --- | --- | --- |
| `invalid_payment_id` / `invalid_plan` / `invalid_json` | 400 | 요청 형식 오류 |
| `payment_not_found` | 404 | 포트원에 해당 결제 없음 |
| `payment_not_paid` | 409 | 결제 미완료(실패·취소·대기). `paymentStatus` 동봉 |
| `store_mismatch` / `currency_mismatch` / `amount_mismatch` | 409 | 우리 결제가 아니거나 금액·통화 불일치 |
| `verification_configuration_error` | 500 | `PORTONE_API_SECRET` 가 틀렸거나 권한 없음 |
| `verification_not_configured` | 503 | `PORTONE_API_SECRET` 미설정 |
| `upstream_error` / `verification_unreachable` / `upstream_invalid_response` | 502 | 포트원 조회 실패(잠시 후 재시도) |

`verification_not_configured`(503)일 때는 **결제 자체는 됐을 수 있으므로** 버튼은 "결제 실패"가 아니라
"서버 확인 미완료 + 결제번호 안내"로 표시합니다.

## 남은 설정 (사람이 해야 하는 것)

### 1. 환경변수 — Vercel `carry-laundry` 프로젝트

```
PORTONE_API_SECRET = (포트원 콘솔 > 결제연동 > API Keys > V2 API Secret)
```

- 서버 전용입니다. `NEXT_PUBLIC_` 접두사를 붙이면 안 됩니다(브라우저 노출).
- 추가 후 **재배포**해야 반영됩니다.
- 현재 시크릿 값은 `projects/pigaehaenggae/portone-keys.md`(워크스페이스, 리포지토리 밖)에만 있습니다.

### 2. 유료 플랜(이용권) 적재 테이블 — 아직 DB에 없음

지금은 결제가 진짜 성사됐는지만 검증하고, 이용권 부여는 아무 데도 기록하지 않습니다
(`entitlementRecorded: false`). 아래 스키마를 **정한 뒤에** 라우트에 적재를 붙입니다.
아직 적용하지 않았습니다 — 임의로 테이블을 만들지 않았습니다.

> 실행 가능한 SQL 파일은 `supabase/migrations/20261119120000_pigaehaenggae_licenses.sql` 에 있다
> (이용권 표 + 혜택(할인권) 표 + 사용 현황 뷰 · 운영 DB에는 미적용).

```sql
-- 제안 스키마 (미적용)
CREATE TABLE IF NOT EXISTS public.pigaehaenggae_licenses (
  id BIGSERIAL PRIMARY KEY,
  payment_id TEXT NOT NULL UNIQUE,            -- 포트원 paymentId (중복 적재 방지)
  transaction_id TEXT,
  plan_id TEXT NOT NULL,                      -- 'basic-monthly' | 'premium-yearly'
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KRW',
  status TEXT NOT NULL DEFAULT 'active',      -- active | refunded | expired
  user_id TEXT,                               -- 카카오 로그인 사용자(NextAuth profile.id), 비회원이면 NULL
  customer_email TEXT,
  paid_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,                     -- 1개월/1년 이용권 만료일
  receipt_url TEXT,
  raw JSONB,                                  -- 포트원 응답 원문(감사용)
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pgl_user ON public.pigaehaenggae_licenses(user_id);
ALTER TABLE public.pigaehaenggae_licenses ENABLE ROW LEVEL SECURITY;
-- 서버(service_role)만 쓰기. 사용자는 본인 것만 읽기:
-- CREATE POLICY "own licenses" ON public.pigaehaenggae_licenses
--   FOR SELECT TO authenticated USING (auth.uid()::text = user_id);
```

적재를 붙일 때 지켜야 할 것

- `payment_id` UNIQUE + `upsert(on_conflict=payment_id)` 로 **중복 지급 방지**(새로고침·재시도 대비)
- 검증 성공과 적재를 같은 요청에서 처리하되, 적재 실패 시에도 결제 사실은 로그로 남기기
- 만료일은 `paidAt + 1개월` / `paidAt + 1년` 로 계산
- 환불은 별도 경로(`POST /payments/{paymentId}/cancel`)로 처리하고 `status='refunded'` 반영

### 3. 테스트 결제 확인 (선택)

`PORTONE_API_SECRET` 을 넣은 뒤, 포트원 **테스트 채널키**로 한 번 결제해 `ok:true` 응답까지 확인하면
전 구간이 검증됩니다. 현재 라이브 채널키만 연결돼 있어 실제 카드 승인이 필요합니다.

## 참고 — 기존 토스 직접 연동(세탁 주문)과는 별개

`app/api/payments/confirm/route.ts` 는 캐리 세탁 주문용 토스페이먼츠 승인 API입니다.
피개행개 이용권은 포트원 V2 경유이므로 위 검증 API를 사용합니다. 두 흐름은 서로 건드리지 않습니다.

## 이용권 기록, 조회, 환불 (2026-11-19 추가)

| 경로 | 하는 일 |
| --- | --- |
| `POST /api/pigaehaenggae/verify-payment` | 검증 성공 뒤 `pigaehaenggae_licenses`에 이용권을 남기고 할인권을 발급. `link`(앱 연결 표)가 맞으면 앱 고객 번호를 묶는다. 응답 `entitlementRecorded`, `customerLinked`, `linkStatus`, `licenseExpiresAt` |
| `POST /api/pigaehaenggae/license-status` | 피개행개 앱 서버 전용. 서명 헤더 `x-pghg-timestamp`, `x-pghg-signature`. 유효 이용권과 할인권 반환 |
| `POST /api/pigaehaenggae/portone-webhook` | 포트원 웹훅. 결제 완료면 이용권 기록(브라우저가 닫혀도), 전액 취소면 `status=refunded`. 부분 취소는 로그만 |

표: `supabase/migrations/20261119120000_pigaehaenggae_licenses.sql`(운영 적용 완료), `20261119130000_pigaehaenggae_license_coupons.sql`(할인권 표, 운영 적용 대기).
할인권 사용 처리(`used_at`, `used_order_ref`)는 아직 세탁 주문 화면에 없어서 운영자가 Supabase에서 표시한다.

필요한 환경변수(값은 사람이 Vercel에 등록, 채팅이나 코드에 남기지 않음)

| 이름 | 용도 |
| --- | --- |
| `PORTONE_API_SECRET` | 포트원 결제 조회 |
| `PORTONE_WEBHOOK_SECRET` | 포트원 콘솔 웹훅 시크릿(`whsec_...`). 웹훅 주소: `https://carry-laundry.vercel.app/api/pigaehaenggae/portone-webhook` |
| `SUPABASE_SERVICE_ROLE` | 이용권 표 쓰기 |
| `PIGAEHAENGGAE_LICENSE_LINK_SECRET` | 앱 연결 표 서명. 피개행개 앱 Vercel과 같은 값, 32자 이상 |
| `PIGAEHAENGGAE_LICENSE_QUERY_SECRET` | 앱 서버의 이용권 조회 서명. 피개행개 앱 Vercel과 같은 값, 32자 이상 |
