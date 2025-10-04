# 🗄️ Database Schema Setup for User Signup System

## Required Tables

### 1. Create `public.profiles` table

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add unique constraint on email (optional)
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Create index for performance
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at);
```

### 2. Update `public.orders` table

```sql
-- Add user_id column to existing orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at);
```

## Row Level Security (RLS) Policies

### 1. Enable RLS on profiles table

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.jwt() ->> 'sub' = id);

-- Allow service role to upsert profiles (for server actions)
CREATE POLICY "Service role can upsert profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');
```

### 2. Enable RLS on orders table

```sql
-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

-- Allow users to insert their own orders
CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

-- Allow service role to manage all orders (for admin)
CREATE POLICY "Service role can manage all orders" ON public.orders
  FOR ALL USING (auth.role() = 'service_role');
```

## Verification Queries

### Check if tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'orders');
```

### Check profiles table structure:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public';
```

### Check orders table structure:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public';
```

### Test data after implementation:
```sql
-- Check profiles
SELECT * FROM public.profiles ORDER BY created_at DESC LIMIT 10;

-- Check orders with user linking
SELECT o.*, p.name as user_name, p.email as user_email 
FROM public.orders o 
LEFT JOIN public.profiles p ON o.user_id = p.id 
ORDER BY o.created_at DESC LIMIT 10;

-- Count distinct users
SELECT COUNT(DISTINCT user_id) as distinct_users FROM public.orders WHERE user_id IS NOT NULL;
```

## Security Notes

- ✅ `user_id` uses stable NextAuth token.sub (Kakao user ID)
- ✅ Service role is only used server-side (never exposed to client)
- ✅ RLS policies ensure users can only access their own data
- ✅ Admin operations use service role for full access
- ✅ No sensitive data exposed to client components

## Migration Steps

1. **Run the SQL commands above in Supabase SQL Editor**
2. **Test the schema with verification queries**
3. **Deploy the updated application**
4. **Test user signup and order creation**
5. **Verify admin dashboard shows user statistics**

---

**🎯 Expected Results:**
- Users who login with Kakao will have profiles created automatically
- Orders will be linked to signed-in users via `user_id`
- Admin dashboard will show total orders and distinct user counts
- All data access is properly secured with RLS policies



