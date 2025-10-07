-- Create addresses table for user address management
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address1 TEXT NOT NULL,
  address2 TEXT,
  address_detail TEXT,
  entrance_method TEXT CHECK (entrance_method IN ('free', 'password', 'security', 'call', 'other')),
  entrance_note TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_default ON public.addresses(user_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_addresses_created_at ON public.addresses(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own addresses
CREATE POLICY "Users can view their own addresses" ON public.addresses
  FOR SELECT USING (user_id = auth.uid()::text);

-- Policy: Users can insert their own addresses
CREATE POLICY "Users can insert their own addresses" ON public.addresses
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Policy: Users can update their own addresses
CREATE POLICY "Users can update their own addresses" ON public.addresses
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Policy: Users can delete their own addresses
CREATE POLICY "Users can delete their own addresses" ON public.addresses
  FOR DELETE USING (user_id = auth.uid()::text);

-- Add comments for documentation
COMMENT ON TABLE public.addresses IS 'User saved addresses for delivery';
COMMENT ON COLUMN public.addresses.user_id IS 'User ID from auth.users';
COMMENT ON COLUMN public.addresses.name IS 'Address nickname (e.g., 집, 회사)';
COMMENT ON COLUMN public.addresses.address1 IS 'Primary address (도로명주소)';
COMMENT ON COLUMN public.addresses.address2 IS 'Secondary address (상세주소)';
COMMENT ON COLUMN public.addresses.address_detail IS 'Additional address details (동/호수)';
COMMENT ON COLUMN public.addresses.entrance_method IS 'Entrance method for delivery';
COMMENT ON COLUMN public.addresses.entrance_note IS 'Additional notes for entrance';
COMMENT ON COLUMN public.addresses.is_default IS 'Whether this is the default address';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_addresses_updated_at();
