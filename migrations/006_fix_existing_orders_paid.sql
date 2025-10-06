-- Fix existing orders that have NULL paid field
-- Migration: 006_fix_existing_orders_paid.sql

-- Update existing orders where paid is NULL to false
UPDATE public.orders 
SET paid = false 
WHERE paid IS NULL;

-- Update existing orders where payment_amount is NULL to 0
UPDATE public.orders 
SET payment_amount = 0 
WHERE payment_amount IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.orders.paid IS 'Payment status of the order (false = unpaid, true = paid)';
COMMENT ON COLUMN public.orders.payment_amount IS 'Amount paid for the order (0 = unpaid)';
