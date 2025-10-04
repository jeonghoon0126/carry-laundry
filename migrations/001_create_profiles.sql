-- Create profiles table (idempotent)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add user_id column to orders table (idempotent)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);



