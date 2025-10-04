# Kakao Login Setup Guide

## 🔧 Environment Variables

### Local Development (.env.local)
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_long_random_secret_string_here_replace_with_actual_secret
KAKAO_CLIENT_ID=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=
```

### Vercel Production
Add these in Vercel Dashboard → Project Settings → Environment Variables:

```bash
NEXTAUTH_URL=https://carry-laundry.vercel.app
NEXTAUTH_SECRET=same_random_string_as_local
KAKAO_CLIENT_ID=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=
AUTH_TRUST_HOST=true
```

## 🎨 Kakao Developers Console Setup

### 1. Go to [Kakao Developers Console](https://developers.kakao.com/)

### 2. Create/Select Your App

### 3. Platform Settings
- **Platform Type:** Web
- **Site URL:** 
  - `http://localhost:3000` (for development)
  - `https://carry-laundry.vercel.app` (for production)

### 4. Redirect URI Settings
Add these redirect URIs:
- `http://localhost:3000/api/auth/callback/kakao`
- `https://carry-laundry.vercel.app/api/auth/callback/kakao`

### 5. Get Your Credentials
- **REST API Key** → Use as `KAKAO_CLIENT_ID`
- **Client Secret** → Use as `KAKAO_CLIENT_SECRET` (may be empty for some apps)

## 🧪 Testing Steps

### Local Development
1. Start server: `npm run dev`
2. Visit: `http://localhost:3000`
3. Click "카카오 로그인" button
4. Should redirect to Kakao OAuth
5. After login, redirect to `/order`

### Production Testing
1. Deploy to Vercel: `vercel --prod`
2. Visit: `https://carry-laundry.vercel.app`
3. Test Kakao login flow

## 🔍 Debugging

### Check Environment Variables
Visit: `http://localhost:3000/api/auth/signin`
- Should show Kakao provider
- Check browser console for errors

### Common Issues
- **"client_id is required"** → Check `KAKAO_CLIENT_ID` is set
- **"OAuthSignin error"** → Check redirect URIs match exactly
- **Hydration errors** → Ensure layout.tsx is server component

## 📱 Features Implemented

- ✅ Kakao OAuth integration
- ✅ Session management with NextAuth
- ✅ Redirect to `/order` after login
- ✅ Error handling and debugging
- ✅ Production-ready configuration
- ✅ No hydration errors



