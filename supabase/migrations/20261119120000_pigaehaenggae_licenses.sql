-- 피개행개 이용권 기록 표. 2026-11-19 운영(carry Supabase xlbckmqdzzkwtboscjgr) SQL Editor로 적용 완료(정훈님 승인).
-- 적용 뒤 확인: 두 표 RLS 켜짐, anon/authenticated 권한 없음, service_role만 읽기 쓰기, 시험 행 되돌림 뒤 0건.
-- 이전 초안(user_id, customer_email, customer_phone, raw)은 개인정보를 줄이려고 앱 고객 번호(app_customer_id)로 바꿨다.
-- 혜택별 할인권 발급과 사용 기록은 다음 마이그레이션(20261119130000)에 있다.

begin;

create table if not exists public.pigaehaenggae_license_benefits (
  id bigint generated always as identity primary key,
  plan_id text not null check (plan_id in ('basic-monthly', 'premium-yearly')),
  benefit_code text not null check (benefit_code ~ '^[a-z0-9_]{3,40}$'),
  label text not null check (char_length(label) between 1 and 80),
  amount_off integer check (amount_off is null or amount_off > 0),
  percent_off integer check (percent_off is null or percent_off between 1 and 100),
  uses_per_period integer check (uses_per_period is null or uses_per_period > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (plan_id, benefit_code),
  check (amount_off is null or percent_off is null)
);

create table if not exists public.pigaehaenggae_licenses (
  id bigint generated always as identity primary key,
  payment_id text not null unique check (payment_id ~ '^pghg_[A-Za-z0-9_-]{4,80}$'),
  transaction_id text,
  plan_id text not null check (plan_id in ('basic-monthly', 'premium-yearly')),
  amount integer not null check (amount > 0),
  currency text not null default 'KRW' check (currency = 'KRW'),
  status text not null default 'active' check (status in ('active', 'refunded', 'cancelled')),
  app_customer_id text check (app_customer_id is null or app_customer_id ~ '^[A-Za-z0-9_-]{16,128}$'),
  paid_at timestamptz not null,
  starts_at timestamptz not null,
  expires_at timestamptz not null,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at > starts_at),
  check ((status = 'refunded') = (refunded_at is not null)),
  check (refunded_at is null or refunded_at >= paid_at)
);

-- 같은 PortOne 결제가 다른 payment_id로 두 번 들어와도 이용권은 하나.
create unique index if not exists pigaehaenggae_licenses_transaction_uq
  on public.pigaehaenggae_licenses (transaction_id) where transaction_id is not null;

create index if not exists pigaehaenggae_licenses_customer_idx
  on public.pigaehaenggae_licenses (app_customer_id, expires_at desc)
  where app_customer_id is not null;

create or replace function public.pigaehaenggae_licenses_touch() returns trigger
  language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
revoke all on function public.pigaehaenggae_licenses_touch() from public, anon, authenticated;

create trigger pigaehaenggae_licenses_touch before update on public.pigaehaenggae_licenses
  for each row execute function public.pigaehaenggae_licenses_touch();

-- 공개 키(anon)와 로그인 사용자(authenticated)는 표와 번호 생성기 모두 못 쓴다. 서버 키(service_role)만 쓴다.
alter table public.pigaehaenggae_license_benefits enable row level security;
alter table public.pigaehaenggae_licenses enable row level security;
revoke all on public.pigaehaenggae_license_benefits, public.pigaehaenggae_licenses from public, anon, authenticated;
revoke all on sequence public.pigaehaenggae_license_benefits_id_seq, public.pigaehaenggae_licenses_id_seq from public, anon, authenticated;
grant select, insert, update on public.pigaehaenggae_license_benefits, public.pigaehaenggae_licenses to service_role;
grant usage, select on sequence public.pigaehaenggae_license_benefits_id_seq, public.pigaehaenggae_licenses_id_seq to service_role;

commit;
