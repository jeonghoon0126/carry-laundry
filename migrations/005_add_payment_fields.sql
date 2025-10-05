-- Add payment-related fields to orders table
-- Migration: 005_add_payment_fields.sql

-- Add payment columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_orders_paid ON public.orders(paid);
CREATE INDEX IF NOT EXISTS idx_orders_payment_amount ON public.orders(payment_amount);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders(payment_method);

-- Add comments for documentation
COMMENT ON COLUMN public.orders.paid IS 'Payment status of the order';
COMMENT ON COLUMN public.orders.payment_amount IS 'Amount paid for the order';
COMMENT ON COLUMN public.orders.payment_method IS 'Method used for payment (e.g., "카드", "계좌이체")';
COMMENT ON COLUMN public.orders.payment_receipt_url IS 'URL to payment receipt or confirmation';

-- Update RLS policies to allow anonymous insert/update for payment fields
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.orders;
DROP POLICY IF EXISTS "Allow users to view own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow users to update own orders" ON public.orders;

-- Create new policies that include payment fields
CREATE POLICY "Allow anonymous insert" ON public.orders
    FOR INSERT 
    TO anon 
    WITH CHECK (true);

CREATE POLICY "Allow users to view own orders" ON public.orders
    FOR SELECT 
    TO authenticated 
    USING (auth.uid()::text = user_id);

CREATE POLICY "Allow users to update own orders" ON public.orders
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

-- Allow anonymous users to update payment fields for their orders
CREATE POLICY "Allow anonymous payment update" ON public.orders
    FOR UPDATE 
    TO anon 
    USING (true)
    WITH CHECK (true);

-- Enable RLS on orders table if not already enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
