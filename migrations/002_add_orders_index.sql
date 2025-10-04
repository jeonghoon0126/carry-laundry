-- Add index for efficient user order queries
-- This index optimizes queries filtering by user_id and ordering by created_at
CREATE INDEX IF NOT EXISTS idx_orders_user_id_created_at 
ON public.orders(user_id, created_at DESC);



