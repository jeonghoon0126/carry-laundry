-- Add payment fields to orders table
-- These fields support Toss Payments integration

-- Add payment status field
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT false;

-- Add payment method field
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add payment ID from Toss Payments
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- Add payment amount (in case it differs from order total)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_amount INTEGER;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_orders_paid ON public.orders(paid);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(payment_id) WHERE payment_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.orders.paid IS 'Whether the order has been paid';
COMMENT ON COLUMN public.orders.payment_method IS 'Payment method used (e.g., card, transfer)';
COMMENT ON COLUMN public.orders.payment_id IS 'Payment ID from Toss Payments';
COMMENT ON COLUMN public.orders.payment_amount IS 'Amount paid (in won)';
