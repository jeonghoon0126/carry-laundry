# 🔧 Kakao OAuth KOE101 Error Fix Guide

## 🚨 **Current Issue: KOE101 (앱 관리자 설정 오류)**

The error occurs because the Kakao REST API key is not properly configured. Here's the complete fix:

## 📋 **Step-by-Step Solution**

### 1. **Get Your Kakao REST API Key**

1. Go to [Kakao Developers Console](https://developers.kakao.com/)
2. Select your app (or create one if needed)
3. Go to **앱 설정 > 앱 키**
4. Copy the **REST API 키** (NOT JavaScript 키)
5. This will be your `KAKAO_CLIENT_ID`

### 2. **Enable Kakao Login Product**

1. In Kakao Developers Console
2. Go to **제품 설정 > 카카오 로그인**
3. Click **활성화 설정** (Enable)
4. Save changes

### 3. **Configure Platform Settings**

**Platform > Web:**
- Add these domains EXACTLY (no trailing slashes):
  - `http://localhost:3000`
  - `https://carry-laundry.vercel.app`

### 4. **Configure Redirect URIs**

**카카오 로그인 > Redirect URI:**
- Add these URIs EXACTLY (case-sensitive, no trailing slashes):
  - `http://localhost:3000/api/auth/callback/kakao`
  - `https://carry-laundry.vercel.app/api/auth/callback/kakao`

### 5. **Update Environment Variables**

**Local (.env.local):**
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_long_random_secret_string_here
KAKAO_CLIENT_ID=YOUR_ACTUAL_KAKAO_REST_API_KEY
KAKAO_CLIENT_SECRET=
```

**Vercel Production:**
```bash
NEXTAUTH_URL=https://carry-laundry.vercel.app
NEXTAUTH_SECRET=your_long_random_secret_string_here
KAKAO_CLIENT_ID=YOUR_ACTUAL_KAKAO_REST_API_KEY
KAKAO_CLIENT_SECRET=
AUTH_TRUST_HOST=true
```

### 6. **Verify NextAuth Configuration**

The current configuration in `/app/api/auth/[...nextauth]/route.ts` is correct:

```typescript
export const authOptions = {
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // ... rest of config
}
```

### 7. **Test the Flow**

1. **Update your `.env.local`** with the actual REST API key
2. **Restart the development server**: `npm run dev`
3. **Visit**: `http://localhost:3000`
4. **Click "카카오 로그인"** button
5. **Should redirect to Kakao OAuth** (no KOE101 error)

### 8. **Production Deployment**

1. **Set environment variables in Vercel Dashboard**
2. **Redeploy**: `vercel --prod`
3. **Test**: `https://carry-laundry.vercel.app`

## 🔍 **Debugging Checklist**

### ✅ **Verify These Match Exactly:**

- [ ] Kakao Console REST API Key = `.env.local` KAKAO_CLIENT_ID
- [ ] Kakao Console Platform domains match NEXTAUTH_URL
- [ ] Kakao Console Redirect URIs match NextAuth callback path
- [ ] No trailing slashes in any URLs
- [ ] Case-sensitive matching
- [ ] HTTP for localhost, HTTPS for production

### 🚨 **Common KOE101 Causes:**

1. **Wrong API Key**: Using JavaScript key instead of REST API key
2. **Domain Mismatch**: NEXTAUTH_URL doesn't match Kakao console
3. **Redirect URI Mismatch**: Callback URL doesn't match exactly
4. **Product Not Enabled**: Kakao Login product not activated
5. **Caching Issues**: Browser cache needs clearing

### 🧹 **Clear Cache Steps:**

1. Clear browser cache for `kauth.kakao.com`
2. Clear NextAuth cookies
3. Restart development server
4. Try incognito/private browsing

## 📱 **Expected Flow After Fix:**

1. Click "카카오 로그인" → Kakao OAuth popup opens
2. User consents → Redirects to `/order`
3. Session established → User logged in
4. No KOE101 errors

## 🎯 **Final Verification:**

- [ ] `/api/auth/signin` shows Kakao provider
- [ ] Clicking Kakao opens OAuth (no KOE101)
- [ ] After consent, redirects to `/order`
- [ ] Works on both localhost and production
- [ ] DevTools shows correct `client_id` and `redirect_uri`

---

**Next Step**: Replace `YOUR_ACTUAL_KAKAO_REST_API_KEY` in `.env.local` with your real Kakao REST API key and restart the server.



