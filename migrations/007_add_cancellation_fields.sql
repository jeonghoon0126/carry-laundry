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
