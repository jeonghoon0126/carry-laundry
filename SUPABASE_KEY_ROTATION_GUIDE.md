# 🔐 Supabase Service Role Key Rotation Guide

## ⚠️ CRITICAL SECURITY ACTION REQUIRED

The current Supabase service role key has been exposed and needs immediate rotation.

## 🎯 Current Status
- ✅ Admin Basic Auth: Working
- ✅ Diagnostics: Added to `/api/orders`
- ❌ Orders API: `{"error":"Invalid API key"}` - Service role key needs rotation

## 📋 Step-by-Step Rotation Process

### 1. Rotate Service Role Key in Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `xlbckmqdzzkwtboscjgr`
3. Navigate to **Settings** → **API**
4. Find the **"service_role"** key section
5. Click **"Reset service_role key"** or **"Generate new key"**
6. **⚠️ CRITICAL**: Copy the NEW service role key immediately
7. **⚠️ WARNING**: The old key is now invalid - update immediately

### 2. Update Local Environment Variables

Replace the placeholder in `.env.local`:

```bash
# Current (placeholder):
SUPABASE_SERVICE_ROLE=REPLACE_WITH_NEW_ROTATED_SERVICE_ROLE_KEY

# Replace with your new key:
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_NEW_SERVICE_ROLE_KEY_HERE
```

**Complete `.env.local` should look like:**
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=strong_random_secret_12345
KAKAO_CLIENT_ID=d4d4b1bace236136ca0dea3bd5258ddf
KAKAO_CLIENT_SECRET=ufyqImaWdxYPTOh0DybNHwdunzPO458z

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xlbckmqdzzkwtboscjgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsYmNrbXFkenprd3Rib3NjamdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Njk0ODcsImV4cCI6MjA3NDU0NTQ4N30.8XQjSUhGgaECIUzmZJia0Ri2GBzZF-tjOwiwbB6pALw

# Admin Configuration (Basic Auth)
ADMIN_USER=admin
ADMIN_PASS=secure_admin_password_123

# Supabase Service Role (Server-only)
SUPABASE_SERVICE_ROLE=YOUR_NEW_ROTATED_SERVICE_ROLE_KEY_HERE
SUPABASE_URL=https://xlbckmqdzzkwtboscjgr.supabase.co
```

### 3. Update Vercel Production Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `carry-laundry`
3. Go to **Settings** → **Environment Variables**
4. Update these variables:

```bash
SUPABASE_URL = https://xlbckmqdzzkwtboscjgr.supabase.co
SUPABASE_SERVICE_ROLE = YOUR_NEW_ROTATED_SERVICE_ROLE_KEY_HERE
ADMIN_USER = admin
ADMIN_PASS = secure_admin_password_123
```

**⚠️ IMPORTANT**: 
- Do NOT use `NEXT_PUBLIC_` prefix for any admin or service role variables
- All these variables are server-only and must never be exposed to the client

### 4. Restart and Test Local Development

```bash
# Stop current dev server (Ctrl+C)
# Then restart:
cd /Users/hamjeonghun/carry-laundry
npm run dev
```

### 5. Test Local Functionality

```bash
# Test admin access without credentials (should get 401):
curl -i http://localhost:3000/admin

# Test admin access with credentials (should get 200):
curl -i -u "admin:secure_admin_password_123" http://localhost:3000/admin

# Test orders API (should get 200 with data or empty array):
curl -i -u "admin:secure_admin_password_123" http://localhost:3000/api/orders
```

### 6. Deploy to Production

```bash
# Deploy with new environment variables:
cd /Users/hamjeonghun/carry-laundry
vercel --prod
```

### 7. Verify Production

1. Visit your production admin page: `https://your-vercel-url.vercel.app/admin`
2. Should prompt for Basic Auth credentials
3. After login, should load admin interface
4. Orders should load without "Invalid API key" error

## 🔍 Security Verification

### ✅ Server-Only Usage Confirmed
- `SUPABASE_SERVICE_ROLE` only referenced in:
  - `app/api/orders/route.ts` (API route - server-side)
  - `lib/supabase-server.ts` (server-only utility)
- No client-side components access service role
- No `NEXT_PUBLIC_` prefixes on sensitive variables

### ✅ Admin Protection Confirmed
- `ADMIN_USER`/`ADMIN_PASS` only in `middleware.ts` (server-side)
- Basic Auth properly implemented
- No client-side admin credential exposure

## 🧹 Cleanup After Verification

Once everything works, remove the temporary diagnostics from `app/api/orders/route.ts`:

```typescript
// Remove these diagnostic lines:
if (!supabaseUrl || !supabaseServiceRole) {
  return NextResponse.json({
    ok: false,
    why: "env",
    urlSet: !!supabaseUrl,
    roleSet: !!supabaseServiceRole,
    urlHost: supabaseUrl ? new URL(supabaseUrl).hostname : "missing"
  }, { status: 400 })
}
```

## 🚨 Troubleshooting

### If you still get "Invalid API key":
1. Verify the new service role key is correctly copied (no extra spaces)
2. Ensure you're using the `service_role` key, not the `anon` key
3. Check that the key starts with `eyJ` (JWT format)
4. Restart the dev server after updating `.env.local`

### If admin page doesn't load:
1. Verify `ADMIN_USER` and `ADMIN_PASS` are set in both local and Vercel
2. Check that Basic Auth credentials match exactly
3. Ensure no typos in environment variable names

## ✅ Success Criteria

- [ ] New service role key rotated in Supabase Dashboard
- [ ] Local `.env.local` updated with new key
- [ ] Vercel environment variables updated
- [ ] Local dev server restarted and tested
- [ ] Production deployed with `vercel --prod`
- [ ] `/admin` loads with Basic Auth (401 without, 200 with credentials)
- [ ] `/api/orders` returns 200 without "Invalid API key" error
- [ ] All secrets remain server-side only
- [ ] Temporary diagnostics removed after verification

---

**🎉 Once complete, your admin system will be secure and fully functional!**



