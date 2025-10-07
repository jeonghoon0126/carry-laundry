# Supabase Addresses Table Setup

배송지 관리 기능을 사용하기 위해 Supabase에 `addresses` 테이블을 생성해야 합니다.

## 🚀 **방법 1: Supabase Dashboard에서 직접 실행**

1. **Supabase Dashboard 접속**: https://supabase.com/dashboard
2. **프로젝트 선택**: carry-laundry 프로젝트 선택
3. **SQL Editor 이동**: 좌측 메뉴에서 "SQL Editor" 클릭
4. **새 쿼리 생성**: "New query" 버튼 클릭
5. **SQL 실행**: 아래 SQL 코드를 복사해서 실행

```sql
-- Create addresses table for user address management
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address1 TEXT NOT NULL,
  address2 TEXT,
  address_detail TEXT,
  entrance_method TEXT CHECK (entrance_method IN ('free', 'password', 'security', 'call', 'other')),
  entrance_note TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_default ON public.addresses(user_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_addresses_created_at ON public.addresses(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own addresses
CREATE POLICY "Users can view their own addresses" ON public.addresses
  FOR SELECT USING (user_id = auth.uid()::text);

-- Policy: Users can insert their own addresses
CREATE POLICY "Users can insert their own addresses" ON public.addresses
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Policy: Users can update their own addresses
CREATE POLICY "Users can update their own addresses" ON public.addresses
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Policy: Users can delete their own addresses
CREATE POLICY "Users can delete their own addresses" ON public.addresses
  FOR DELETE USING (user_id = auth.uid()::text);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_addresses_updated_at();
```

## 🛠️ **방법 2: Supabase CLI 사용 (선택사항)**

로컬에서 Supabase CLI가 설치되어 있다면:

```bash
# Supabase 프로젝트 연결 (이미 연결되어 있다면 생략)
supabase link --project-ref YOUR_PROJECT_REF

# 마이그레이션 실행
supabase db push
```

## ✅ **확인 방법**

테이블이 생성되었는지 확인:

1. **Supabase Dashboard** → **Table Editor**
2. **addresses 테이블**이 목록에 표시되는지 확인
3. **마이페이지** → **배송지 관리**에서 배송지 추가 테스트

## 🔧 **문제 해결**

### "Failed to create address" 오류가 계속 발생하는 경우:

1. **테이블 생성 확인**: Supabase Dashboard에서 addresses 테이블이 생성되었는지 확인
2. **RLS 정책 확인**: Row Level Security가 활성화되어 있는지 확인
3. **권한 확인**: 사용자가 테이블에 접근할 수 있는 권한이 있는지 확인

### 환경 변수 확인:

```bash
# 다음 환경 변수들이 설정되어 있는지 확인
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📋 **테이블 구조**

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID | 기본키 (자동 생성) |
| user_id | TEXT | 사용자 ID |
| name | TEXT | 배송지 이름 (예: 집, 회사) |
| address1 | TEXT | 주소 (필수) |
| address2 | TEXT | 상세주소 |
| address_detail | TEXT | 추가 상세주소 |
| entrance_method | TEXT | 출입방법 (free, password, security, call, other) |
| entrance_note | TEXT | 출입메모 |
| is_default | BOOLEAN | 기본 배송지 여부 |
| created_at | TIMESTAMP | 생성일시 |
| updated_at | TIMESTAMP | 수정일시 |

테이블 생성 후 배송지 관리 기능을 정상적으로 사용할 수 있습니다! 🎉
