-- Add location and geocoding fields to orders table
-- These fields support the Gwanak-gu only service enforcement

-- Add region fields
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS si TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gu TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS dong TEXT;

-- Add coordinate fields
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS lat DECIMAL(10, 8);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS lng DECIMAL(11, 8);

-- Add service area flag
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_serviceable BOOLEAN DEFAULT false;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_orders_si_gu ON public.orders(si, gu);
CREATE INDEX IF NOT EXISTS idx_orders_is_serviceable ON public.orders(is_serviceable);
CREATE INDEX IF NOT EXISTS idx_orders_location ON public.orders(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.orders.si IS 'Region 1st depth (시/도) from Kakao geocoding';
COMMENT ON COLUMN public.orders.gu IS 'Region 2nd depth (구/군) from Kakao geocoding';
COMMENT ON COLUMN public.orders.dong IS 'Region 3rd depth (동/면) from Kakao geocoding';
COMMENT ON COLUMN public.orders.lat IS 'Latitude from Kakao geocoding';
COMMENT ON COLUMN public.orders.lng IS 'Longitude from Kakao geocoding';
COMMENT ON COLUMN public.orders.is_serviceable IS 'Whether the address is in serviceable area (Gwanak-gu)';
