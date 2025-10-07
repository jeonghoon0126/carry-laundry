-- 배송 완료 확인 기능을 위한 마이그레이션
-- 사용자가 배송 완료를 확인했는지 추적하는 컬럼 추가

-- 배송 확인 컬럼 추가
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_confirmed_at TIMESTAMP WITH TIME ZONE;

-- 컬럼 설명 추가
COMMENT ON COLUMN orders.delivery_confirmed_at IS '사용자가 배송 완료를 확인한 시간';

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_orders_delivery_confirmed_at ON orders(delivery_confirmed_at);

-- 기존 배송 완료된 주문들의 delivery_confirmed_at을 NULL로 설정 (사용자가 아직 확인하지 않음)
UPDATE orders 
SET delivery_confirmed_at = NULL 
WHERE delivery_confirmed_at IS NULL AND status = 'delivered';
