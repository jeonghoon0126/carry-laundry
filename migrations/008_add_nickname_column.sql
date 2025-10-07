-- Add nickname column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);

-- Add comment for the column
COMMENT ON COLUMN profiles.nickname IS 'User nickname generated automatically or set by user';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles(nickname);
