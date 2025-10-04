# 🔒 Supabase Security Hardening - Key Rotation

## ⚠️ **CRITICAL SECURITY ALERT**

The current Supabase anon key has been exposed and needs immediate rotation for security.

## 🔄 **Key Rotation Process**

### 1. **Rotate Supabase Anon Key**

**In Supabase Dashboard:**
1. Go to **Project → Settings → API**
2. Click **"Reset anon key"** 
3. **Copy the NEW anon key immediately**
4. **Save it securely**

### 2. **Update Environment Variables**

**Local (.env.local):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xlbckmqdzzkwtboscjgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=NEW_ROTATED_KEY_HERE
```

**Vercel Production:**
- Go to **Vercel Dashboard → Project → Settings → Environment Variables**
- Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` with the new key
- **Save changes**

### 3. **Immediate Redeploy**

After updating the key:

```bash
vercel --prod
```

## 🛡️ **Security Benefits**

- ✅ **Old key invalidated** - Previous key no longer works
- ✅ **Fresh authentication** - New key starts clean
- ✅ **Reduced attack surface** - Compromised key is useless
- ✅ **Zero downtime** - Seamless transition

## 🧪 **Verification Steps**

### 4. **Test New Key**

1. **Local Testing:**
   ```bash
   npm run dev
   # Test order submission
   # Check DevTools → Network for Supabase requests
   ```

2. **Production Testing:**
   - Visit: `https://carry-laundry.vercel.app/order`
   - Test order submission
   - Verify Supabase requests use new key

### 5. **Confirm Old Key is Invalid**

- Try using old key in a test request
- Should return authentication error
- Confirms rotation was successful

## 📋 **Environment Variables Checklist**

**Vercel Production Environment:**
- [ ] `NEXTAUTH_URL=https://carry-laundry.vercel.app`
- [ ] `NEXTAUTH_SECRET=strong_random_secret_12345`
- [ ] `KAKAO_CLIENT_ID=d4d4b1bace236136ca0dea3bd5258ddf`
- [ ] `KAKAO_CLIENT_SECRET=ufyqImaWdxYPTOh0DybNHwdunzPO458z`
- [ ] `AUTH_TRUST_HOST=true`
- [ ] `NEXT_PUBLIC_SUPABASE_URL=https://xlbckmqdzzkwtboscjgr.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY=NEW_ROTATED_KEY`

## 🎯 **Expected Results**

- ✅ No "supabaseUrl is required" errors
- ✅ Order submission works with new key
- ✅ Old key returns authentication errors
- ✅ Production deployment successful
- ✅ Both localhost and production working

## 🚨 **Security Best Practices**

1. **Never commit keys to git**
2. **Rotate keys regularly**
3. **Use environment variables only**
4. **Monitor for unauthorized access**
5. **Keep keys secure and private**

---

**Status**: ⚠️ **IMMEDIATE ACTION REQUIRED** - Rotate Supabase anon key now!



