# 🚀 Vercel + Supabase Production Setup

## 📋 **Environment Variables Setup**

### 1. **Vercel Dashboard Configuration**

Go to: **Vercel Dashboard → Project → Settings → Environment Variables**

Add these EXACT values (no quotes, no spaces):

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://carry-laundry.vercel.app
NEXTAUTH_SECRET=strong_random_secret_12345
KAKAO_CLIENT_ID=d4d4b1bace236136ca0dea3bd5258ddf
KAKAO_CLIENT_SECRET=ufyqImaWdxYPTOh0DybNHwdunzPO458z
AUTH_TRUST_HOST=true

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xlbckmqdzzkwtboscjgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsYmNrbXFkenprd3Rib3NjamdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Njk0ODcsImV4cCI6MjA3NDU0NTQ4N30.8XQjSUhGgaECIUzmZJia0Ri2GBzZF-tjOwiwbB6pALw
```

### 2. **Deploy to Production**

After setting environment variables:

```bash
vercel --prod
```

## 🔒 **Security Hardening - Supabase Key Rotation**

### 3. **Rotate Supabase Anon Key**

**CRITICAL SECURITY STEP:**

1. **Go to Supabase Dashboard:**
   - Project → Settings → API
   - Click **"Reset anon key"**
   - Copy the NEW anon key

2. **Update Environment Variables:**
   - Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel
   - Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

## 🧪 **Verification Steps**

### 4. **Test Supabase Integration**

1. **Local Testing:**
   ```bash
   npm run dev
   # Visit: http://localhost:3000/order
   # Test order submission
   ```

2. **Production Testing:**
   - Visit: `https://carry-laundry.vercel.app/order`
   - Test order submission
   - Check DevTools → Network for Supabase requests

### 5. **Debug Checklist**

If errors persist:

- ✅ **Check Environment Variables:** No trailing spaces/newlines
- ✅ **Verify Supabase URL:** `https://xlbckmqdzzkwtboscjgr.supabase.co`
- ✅ **Check Network Tab:** Supabase requests should hit correct URL
- ✅ **Verify Anon Key:** Must match Supabase dashboard
- ✅ **Check Client-Side:** `lib/supabase-browser.ts` reads `NEXT_PUBLIC_*` vars

## 🎯 **Expected Results**

- ✅ No "supabaseUrl is required" errors
- ✅ Order submission reaches Supabase successfully
- ✅ Works on both localhost and production
- ✅ New rotated anon key is active
- ✅ Old anon key is invalidated

## 📱 **Current Status**

- ✅ Kakao OAuth working perfectly
- ✅ Environment variables configured
- ⏳ Supabase integration pending verification
- ⏳ Production deployment pending

---

**Next Steps:**
1. Set Vercel environment variables
2. Deploy to production: `vercel --prod`
3. Rotate Supabase anon key for security
4. Test order flow on production



