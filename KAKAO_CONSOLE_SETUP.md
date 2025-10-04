# 🎯 Kakao Developers Console Setup Guide

## 📋 **Required Configuration**

### 1. **Platform Settings (플랫폼 설정)**
**앱 설정 → 플랫폼 → Web 플랫폼 등록**

Add these domains EXACTLY:
- `http://localhost:3000`
- `https://carry-laundry.vercel.app`

### 2. **Redirect URI Settings (리다이렉트 URI)**
**앱 설정 → Redirect URI**

Add these URIs EXACTLY (case-sensitive, no trailing slashes):
- `http://localhost:3000/api/auth/callback/kakao`
- `https://carry-laundry.vercel.app/api/auth/callback/kakao`

### 3. **Enable Kakao Login Product**
**제품 설정 → 카카오 로그인 → 활성화 설정**

- Click **활성화 설정** (Enable)
- Save changes

## 🔧 **Environment Variables**

### Local Development (.env.local)
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=strong_random_secret_12345
KAKAO_CLIENT_ID=d4d4b1bace236136ca0dea3bd5258ddf
KAKAO_CLIENT_SECRET=ufyqImaWdxYPTOh0DybNHwdunzPO458z
```

### Vercel Production
```bash
NEXTAUTH_URL=https://carry-laundry.vercel.app
NEXTAUTH_SECRET=strong_random_secret_12345
KAKAO_CLIENT_ID=d4d4b1bace236136ca0dea3bd5258ddf
KAKAO_CLIENT_SECRET=ufyqImaWdxYPTOh0DybNHwdunzPO458z
AUTH_TRUST_HOST=true
```

## 🧪 **Testing Steps**

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Test OAuth Flow:**
   - Visit: `http://localhost:3000/api/auth/signin`
   - Click "Kakao" provider
   - Should open Kakao OAuth popup (no KOE101 error)
   - After consent, redirects to `/order`

3. **Verify Authorization URL:**
   - Check DevTools Network tab
   - Authorization URL should contain: `client_id=d4d4b1bace236136ca0dea3bd5258ddf`

## ✅ **Expected Results**

- ✅ No "client_id is required" errors
- ✅ No "KOE101 서비스 설정 오류" errors
- ✅ Kakao OAuth popup opens immediately
- ✅ Successful login and redirect to `/order`
- ✅ Works on both localhost and production

## 🚨 **Troubleshooting**

If KOE101 persists:
1. **Double-check Redirect URIs** - must match exactly
2. **Clear browser cache** for `kauth.kakao.com`
3. **Verify same app** - REST API key must match console
4. **Check for trailing spaces** in console settings
5. **Ensure Kakao Login product is enabled**

---

**Status**: ✅ Environment variables updated, NextAuth configured, server restarted



