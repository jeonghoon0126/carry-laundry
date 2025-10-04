# 🧪 User Signup System Test Checklist

## ✅ Implementation Status
- [x] **Schema**: `public.profiles` table with required columns
- [x] **Login Upsert**: NextAuth callback upserts profiles on Kakao login
- [x] **Order Linking**: Server action links orders to signed-in users
- [x] **Admin Updates**: Shows user statistics and linked orders

## 🧪 Test Steps

### 1. Database Schema Test
```sql
-- Run in Supabase SQL Editor:
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public';
```

### 2. Login Flow Test
1. **Login with Kakao**: Visit `/home` → Click "카카오 로그인" → Complete OAuth
2. **Check Profile Created**: 
   ```sql
   SELECT * FROM public.profiles ORDER BY created_at DESC LIMIT 5;
   ```
3. **Expected**: Row with `id = <kakao_user_id>`, `name`, `email` populated

### 3. Order Creation Test
1. **Create Order**: After login, visit `/order` → Fill form → Submit
2. **Check Order Linked**:
   ```sql
   SELECT id, user_id, name, created_at 
   FROM public.orders 
   ORDER BY created_at DESC LIMIT 5;
   ```
3. **Expected**: New order has `user_id = <kakao_user_id>`

### 4. Admin Dashboard Test
1. **Visit Admin**: Go to `/admin` with Basic Auth
2. **Check Stats**: Should show "가입 사용자 수" > 0
3. **Check Orders**: Should show "✓ 가입" for new orders

## 🔍 Verification Queries

### Check User Profiles
```sql
SELECT COUNT(*) as total_profiles FROM public.profiles;
SELECT id, name, email, created_at FROM public.profiles ORDER BY created_at DESC LIMIT 5;
```

### Check Order Linking
```sql
SELECT 
  COUNT(*) as total_orders,
  COUNT(user_id) as linked_orders,
  COUNT(DISTINCT user_id) as distinct_users
FROM public.orders;
```

### Check Recent Activity
```sql
SELECT 
  o.id, o.user_id, o.name, o.created_at,
  p.name as profile_name, p.email as profile_email
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC LIMIT 10;
```

## 🚨 Expected Results

- **After Kakao Login**: Profile row exists in `public.profiles`
- **After Order Creation**: Order has `user_id` populated
- **Admin Dashboard**: Shows user statistics and linked orders
- **Security**: No service role secrets exposed to client

## 🔧 Troubleshooting

### If Profile Not Created
- Check NextAuth logs for upsert errors
- Verify `SUPABASE_SERVICE_ROLE` is set correctly
- Check Supabase logs for database errors

### If Order Not Linked
- Verify user is logged in (`/api/auth/session`)
- Check server action logs for errors
- Verify session contains `user.id`

### If Admin Stats Wrong
- Check RLS policies allow service role access
- Verify `user_id` column exists in orders table
- Check for data type mismatches

---

**🎯 Success Criteria:**
- [ ] Kakao login creates profile row
- [ ] Order creation links to user
- [ ] Admin shows correct user statistics
- [ ] No security vulnerabilities



