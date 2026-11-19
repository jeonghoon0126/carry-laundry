-- 피개행개 이용권 할인권(혜택) 발급과 사용 기록. 운영 적용은 정훈님 승인 뒤에만 한다.
-- 이용권 한 장마다 혜택 수만큼 할인권 행을 만든다. used_at 이 비어 있으면 미사용이다.
-- 환불 규정 "유료 혜택을 한 번도 사용하지 않은 경우"는 이 표에서 used_at 이 모두 비어 있는지로 판단한다.
-- 실행 전 확인: select to_regclass('public.pigaehaenggae_license_coupons');  -- null 이어야 한다

begin;

create table if not exists public.pigaehaenggae_license_coupons (
  id bigint generated always as identity primary key,
  license_id bigint not null references public.pigaehaenggae_licenses(id) on delete restrict,
  benefit_code text not null check (benefit_code ~ '^[a-z0-9_]{3,40}$'),
  seq integer not null check (seq between 1 and 60),
  coupon_code text not null unique check (coupon_code ~ '^PG-[A-Z0-9]{10}$'),
  percent_off integer not null check (percent_off between 1 and 100),
  available_from timestamptz not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_order_ref text check (used_order_ref is null or char_length(used_order_ref) between 1 and 120),
  created_at timestamptz not null default now(),
  unique (license_id, benefit_code, seq),
  check (expires_at > available_from),
  check ((used_at is null) = (used_order_ref is null))
);

create index if not exists pigaehaenggae_license_coupons_license_idx
  on public.pigaehaenggae_license_coupons (license_id);

alter table public.pigaehaenggae_license_coupons enable row level security;
revoke all on public.pigaehaenggae_license_coupons from public, anon, authenticated;
revoke all on sequence public.pigaehaenggae_license_coupons_id_seq from public, anon, authenticated;
grant select, insert, update on public.pigaehaenggae_license_coupons to service_role;
grant usage, select on sequence public.pigaehaenggae_license_coupons_id_seq to service_role;

-- 상품별 혜택 목록. lib/pigaehaenggae/plan-benefits.ts 의 판매 문구와 같은 내용이다.
insert into public.pigaehaenggae_license_benefits (plan_id, benefit_code, label, percent_off, uses_per_period)
values
  ('basic-monthly', 'laundry_discount_20', '캐리 침구 세탁 20% 할인권', 20, 3),
  ('premium-yearly', 'laundry_discount_20', '캐리 침구 세탁 20% 할인권 (매월 1매)', 20, 12),
  ('premium-yearly', 'laundry_free_once', '반려견 이불, 방석 침구 세탁 1회 무료 쿠폰', 100, 1)
on conflict (plan_id, benefit_code) do nothing;

commit;

-- 되돌리기(할인권이 발급된 뒤에는 쓰지 않는다):
-- drop table if exists public.pigaehaenggae_license_coupons;
-- delete from public.pigaehaenggae_license_benefits where benefit_code in ('laundry_discount_20', 'laundry_free_once');
