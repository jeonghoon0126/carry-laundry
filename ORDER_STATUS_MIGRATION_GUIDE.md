# 🚀 주문 상태 관리 시스템 마이그레이션 가이드

## ⚠️ 중요: 이 마이그레이션을 실행하지 않으면 새로운 주문 상태 관리 기능이 작동하지 않습니다!

### 📋 마이그레이션 개요

이 마이그레이션은 다음과 같은 기능을 추가합니다:

1. **주문 상태 관리**: `pending` → `processing` → `completed` → `delivered` → `cancelled`
2. **상태별 타임스탬프**: 각 상태 변경 시점 기록
3. **사진 업로드**: 수거/배송 사진 URL 저장
4. **상태 변경 이력**: 주문 상태 변경 로그 테이블
5. **예상 완료 시간**: 각 단계별 예상 완료 시간

### 🗄️ 1. Supabase 대시보드 접속

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. **SQL Editor** 메뉴 클릭

### 📝 2. 마이그레이션 SQL 실행

다음 SQL을 복사해서 실행하세요:

```sql
-- 주문 상태 관리 시스템을 위한 마이그레이션
-- 기존 status 컬럼을 확장하고 새로운 상태 값들을 추가

-- 주문 상태 값 제약 조건 업데이트 (pending, processing, completed, delivered, cancelled)
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS check_status_values;

ALTER TABLE orders 
ADD CONSTRAINT check_status_values 
CHECK (status IN ('pending', 'processing', 'completed', 'delivered', 'cancelled'));

-- 주문 진행 상황을 위한 컬럼들 추가
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pickup_photo_url TEXT,
ADD COLUMN IF NOT EXISTS delivery_photo_url TEXT,
ADD COLUMN IF NOT EXISTS estimated_completion_time TIMESTAMP WITH TIME ZONE;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_orders_processing_started_at ON orders(processing_started_at);
CREATE INDEX IF NOT EXISTS idx_orders_completed_at ON orders(completed_at);
CREATE INDEX IF NOT EXISTS idx_orders_delivered_at ON orders(delivered_at);

-- 컬럼 설명 추가
COMMENT ON COLUMN orders.processing_started_at IS '주문 처리 시작 시간';
COMMENT ON COLUMN orders.completed_at IS '세탁 완료 시간';
COMMENT ON COLUMN orders.delivered_at IS '배송 완료 시간';
COMMENT ON COLUMN orders.pickup_photo_url IS '수거 사진 URL';
COMMENT ON COLUMN orders.delivery_photo_url IS '배송 사진 URL';
COMMENT ON COLUMN orders.estimated_completion_time IS '예상 완료 시간';

-- 기존 주문들의 상태 업데이트
-- paid = true이고 status가 'completed'인 경우는 그대로 유지
-- paid = true이고 status가 'pending'인 경우는 'processing'으로 변경 (처리 중인 주문으로 간주)
UPDATE orders 
SET status = 'processing', 
    processing_started_at = COALESCE(created_at, NOW())
WHERE paid = true AND status = 'pending';

-- 주문 상태 로그 테이블 생성 (선택사항 - 상태 변경 이력 추적용)
CREATE TABLE IF NOT EXISTS order_status_logs (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by VARCHAR(100), -- 관리자 ID 또는 'system'
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_status_logs_order_id ON order_status_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_logs_changed_at ON order_status_logs(changed_at);

COMMENT ON TABLE order_status_logs IS '주문 상태 변경 이력 테이블';
COMMENT ON COLUMN order_status_logs.from_status IS '이전 상태';
COMMENT ON COLUMN order_status_logs.to_status IS '변경된 상태';
COMMENT ON COLUMN order_status_logs.changed_by IS '변경한 사용자 (관리자 ID 또는 system)';
COMMENT ON COLUMN order_status_logs.changed_at IS '변경 시간';
COMMENT ON COLUMN order_status_logs.notes IS '변경 사유 또는 메모';
```

### ✅ 3. 실행 확인

실행 후 다음 쿼리로 확인하세요:

```sql
-- 새로운 컬럼들이 추가되었는지 확인
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('processing_started_at', 'completed_at', 'delivered_at', 'pickup_photo_url', 'delivery_photo_url', 'estimated_completion_time');

-- 상태 제약 조건 확인
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass 
AND conname = 'check_status_values';

-- 로그 테이블 확인
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'order_status_logs';
```

### 📋 4. 실행 후 확인사항

- [ ] `processing_started_at` 컬럼이 추가되었는지 확인
- [ ] `completed_at` 컬럼이 추가되었는지 확인  
- [ ] `delivered_at` 컬럼이 추가되었는지 확인
- [ ] `pickup_photo_url` 컬럼이 추가되었는지 확인
- [ ] `delivery_photo_url` 컬럼이 추가되었는지 확인
- [ ] `estimated_completion_time` 컬럼이 추가되었는지 확인
- [ ] `order_status_logs` 테이블이 생성되었는지 확인
- [ ] 기존 주문들의 상태가 올바르게 설정되었는지 확인

### 🚀 5. 새로운 기능들

마이그레이션 완료 후 다음 기능들을 사용할 수 있습니다:

#### 관리자 기능
- **주문 상태 관리**: 관리자 페이지에서 주문 상태를 단계별로 변경
- **상태 변경 이력**: 모든 상태 변경이 로그에 기록됨

#### 사용자 기능
- **홈 화면 진행상황**: 활성 주문이 있을 때 홈 화면에서 진행상황 확인 가능
- **마이페이지 진행상황**: 주문 내역에서 상세한 진행상황과 다음 단계 정보 표시
- **실시간 업데이트**: 30초마다 자동으로 주문 상태 새로고침

#### 상태별 세부 기능
- **주문 접수** (`pending`): 주문이 접수된 상태
- **처리 중** (`processing`): 세탁소에서 세탁을 진행하는 상태
- **세탁 완료** (`completed`): 세탁이 완료되어 배송 준비 중인 상태
- **배송 완료** (`delivered`): 배송이 완료된 최종 상태
- **주문 취소** (`cancelled`): 주문이 취소된 상태

### 🔧 6. 트러블슈팅

#### 마이그레이션 실행 중 오류 발생 시
1. **권한 오류**: Supabase 프로젝트 관리자 권한이 있는지 확인
2. **제약 조건 오류**: 기존 데이터가 새로운 제약 조건을 위반하는지 확인
3. **테이블 락 오류**: 다른 작업이 진행 중인지 확인하고 잠시 후 재시도

#### 기능 작동하지 않을 시
1. **API 에러**: 브라우저 개발자 도구에서 네트워크 탭 확인
2. **상태 표시 오류**: 주문의 `status` 필드가 올바르게 설정되었는지 확인
3. **권한 오류**: 관리자 이메일이 `admin@carry-laundry.com` 또는 `@carry-laundry.com` 도메인인지 확인

### 📞 지원

마이그레이션 중 문제가 발생하면 다음을 확인하세요:

1. **Supabase 로그**: 대시보드의 로그 섹션에서 오류 메시지 확인
2. **브라우저 콘솔**: 개발자 도구에서 JavaScript 오류 확인
3. **API 응답**: 네트워크 탭에서 API 응답 상태 확인

---

**🎉 마이그레이션 완료 후 모든 새로운 주문 상태 관리 기능을 사용할 수 있습니다!**
