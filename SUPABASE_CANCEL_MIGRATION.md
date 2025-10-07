# Supabase 주문 취소 마이그레이션 실행 가이드

## 🚨 중요: 다음 SQL을 Supabase에서 실행해야 합니다

### 1. Supabase 대시보드 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. SQL Editor 메뉴 클릭

### 2. 다음 SQL 실행

```sql
-- Add cancellation fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

-- Update existing orders to have 'completed' status if they are paid
UPDATE orders 
SET status = 'completed' 
WHERE paid = true AND status IS NULL;

-- Update existing orders to have 'pending' status if they are not paid
UPDATE orders 
SET status = 'pending' 
WHERE paid = false AND status IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_cancelled_at ON orders(cancelled_at);

-- Add check constraint for status values
ALTER TABLE orders 
ADD CONSTRAINT IF NOT EXISTS check_status_values 
CHECK (status IN ('pending', 'completed', 'cancelled'));

-- Add comment to explain the status field
COMMENT ON COLUMN orders.status IS 'Order status: pending (default), completed (paid), cancelled';
COMMENT ON COLUMN orders.cancelled_at IS 'Timestamp when the order was cancelled';
COMMENT ON COLUMN orders.cancel_reason IS 'Reason for order cancellation';
```

### 3. 실행 확인
실행 후 다음 쿼리로 확인:
```sql
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('status', 'cancelled_at', 'cancel_reason');
```

## 📋 실행 후 확인사항
- [ ] status 컬럼이 추가되었는지 확인
- [ ] cancelled_at 컬럼이 추가되었는지 확인  
- [ ] cancel_reason 컬럼이 추가되었는지 확인
- [ ] 기존 주문들의 status가 올바르게 설정되었는지 확인

이 마이그레이션을 실행하지 않으면 주문 취소 기능이 작동하지 않습니다.
