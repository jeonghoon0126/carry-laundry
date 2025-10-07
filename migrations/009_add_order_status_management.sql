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
