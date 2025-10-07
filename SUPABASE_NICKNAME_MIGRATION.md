# 🚨 Supabase 닉네임 컬럼 추가 마이그레이션

## ⚠️ 긴급: 이 마이그레이션을 실행하지 않으면 닉네임 기능이 작동하지 않습니다!

### 1. Supabase 대시보드 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. **SQL Editor** 메뉴 클릭

### 2. 다음 SQL을 복사해서 실행

```sql
-- Add nickname column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);

-- Add comment for the column
COMMENT ON COLUMN profiles.nickname IS 'User nickname generated automatically or set by user';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles(nickname);
```

### 3. 실행 확인
실행 후 다음 쿼리로 확인:
```sql
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'nickname';
```

## 📋 실행 후 확인사항
- [ ] nickname 컬럼이 profiles 테이블에 추가되었는지 확인
- [ ] 기존 사용자들에게 닉네임이 자동으로 생성되는지 확인
- [ ] 로컬에서 닉네임 API가 정상 작동하는지 확인

## 🔧 문제 해결
만약 여전히 에러가 발생한다면:
1. Supabase 대시보드에서 Table Editor로 profiles 테이블 확인
2. nickname 컬럼이 추가되었는지 확인
3. 브라우저 새로고침 후 다시 테스트
