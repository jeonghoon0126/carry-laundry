# 🧪 Sign-in UX Test Guide

## Quick Manual Test Steps

### 1. **Basic Auth Flow Test**
```bash
# Start dev server
npm run dev
```

**Test unauthenticated user flow:**
1. Navigate to `http://localhost:3000/mypage` (while signed out)
2. **Expected**: Automatic redirect to `/signin?from=mypage`
3. **Verify**: URL shows `/signin?from=mypage`
4. **Verify**: Page shows "로그인" heading and "카카오로 로그인" button

**Test sign-in process:**
1. Click "카카오로 로그인" button
2. **Expected**: Direct redirect to Kakao OAuth (no provider selection)
3. Complete Kakao authentication
4. **Expected**: Return to `/mypage` after successful login

### 2. **Return URL Test**
**Test different 'from' parameters:**

✅ **Valid routes:**
- Visit `/signin?from=mypage` → login → should land at `/mypage`
- Visit `/signin?from=order` → login → should land at `/order`
- Visit `/signin?from=home` → login → should land at `/home`

❌ **Invalid/dangerous routes (should fallback to /mypage):**
- Visit `/signin?from=admin` → login → should land at `/mypage`
- Visit `/signin?from=/external` → login → should land at `/mypage`
- Visit `/signin?from=../../../etc` → login → should land at `/mypage`

### 3. **Already Authenticated Test**
1. Sign in first (complete auth flow)
2. Navigate to `/signin` directly
3. **Expected**: Immediate redirect to `/mypage` (no sign-in form shown)
4. Navigate to `/signin?from=order`
5. **Expected**: Immediate redirect to `/order`

### 4. **Error Handling Test**
1. Navigate to `/signin?error=true`
2. **Expected**: Red error message "로그인에 실패했어요. 다시 시도해주세요."
3. **Verify**: Error message is displayed above the login button

### 5. **Header Integration Test**
**Test header login button:**
1. Sign out (if signed in)
2. Look for login button in header
3. Click "🔑 카카오로 로그인" button
4. **Expected**: Navigate to `/signin` (not `/api/auth/signin`)
5. **Verify**: No direct Kakao OAuth redirect from header

### 6. **Legacy Link Verification**
**Search codebase for old references:**
```bash
grep -r "/api/auth/signin" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v "route.ts"
```
**Expected**: No results (all user-facing links should use `/signin`)

### 7. **Mobile UX Test**
**Test responsive design:**
1. Open `/signin` on mobile device or narrow browser
2. **Verify**: Logo, heading, and button are properly sized
3. **Verify**: Button is touch-friendly (48px+ height)
4. **Verify**: Text is readable and properly spaced

### 8. **Loading States Test**
1. Navigate to `/signin`
2. Click "카카오로 로그인"
3. **Expected**: Button shows loading spinner and "로그인 중..." text
4. **Expected**: Button is disabled during loading
5. **Verify**: No double-clicks possible

## Validation Checklist

### **Route Behavior**
| Route | Signed Out | Signed In | Notes |
|-------|------------|-----------|-------|
| `/mypage` | → `/signin?from=mypage` | Shows mypage | ✅ |
| `/signin` | Shows login form | → `/mypage` | ✅ |
| `/signin?from=order` | Shows login form | → `/order` | ✅ |
| `/signin?error=true` | Shows error message | → `/mypage` | ✅ |

### **NextAuth Integration**
- ✅ **Custom pages**: `pages: { signIn: '/signin' }` in authOptions
- ✅ **No provider list**: Direct Kakao OAuth via `signIn('kakao')`
- ✅ **Callback URL**: Properly set based on `from` parameter
- ✅ **Session handling**: Existing callbacks and providers unchanged

### **Security & Sanitization**
- ✅ **Route whitelist**: Only `['mypage', 'order', 'home']` allowed
- ✅ **Path traversal protection**: Leading slashes and dangerous paths blocked
- ✅ **Fallback behavior**: Invalid routes default to `/mypage`

### **UX & Branding**
- ✅ **Consistent branding**: "carry" logo and blue accent color
- ✅ **Clear messaging**: "주문 내역을 보려면 로그인하세요"
- ✅ **Native feel**: No NextAuth provider selection screen
- ✅ **Error feedback**: Clear error messages for failed attempts

## Browser Testing Matrix

| Browser | Desktop | Mobile | Auth Flow | Return URL | Notes |
|---------|---------|---------|-----------|------------|-------|
| Chrome | ✅ | ✅ | ✅ | ✅ | Primary test browser |
| Safari | ✅ | ✅ | ✅ | ✅ | Test iOS behavior |
| Firefox | ✅ | ✅ | ✅ | ✅ | Test cross-browser |
| Edge | ✅ | ✅ | ✅ | ✅ | Test Windows |

## Environment Testing

### **Local Development**
```bash
# Test on localhost:3000
npm run dev
# Visit: http://localhost:3000/mypage (signed out)
# Expected: Redirect to http://localhost:3000/signin?from=mypage
```

### **Vercel Deployment**
```bash
# After deployment
# Visit: https://your-app.vercel.app/mypage (signed out)
# Expected: Redirect to https://your-app.vercel.app/signin?from=mypage
```

## Acceptance Criteria Verification

✅ **No /api/auth/signin for users**: All user-facing flows use `/signin`  
✅ **Custom branded page**: "carry" branding with proper messaging  
✅ **Direct Kakao OAuth**: No provider selection, immediate Kakao redirect  
✅ **Return URL handling**: Proper `from` parameter processing with security  
✅ **Header integration**: Login button routes to `/signin`  
✅ **Already authenticated**: Immediate redirect when logged in  
✅ **Error handling**: Clear error messages for failed attempts  
✅ **Build/lint pass**: No compilation or linting errors  
✅ **Environment compatibility**: Works on both localhost and Vercel  

## Expected User Journey

1. **User visits protected page** → Redirected to `/signin?from=page`
2. **User sees branded login** → Clean "carry" interface, no NextAuth UI
3. **User clicks Kakao button** → Direct OAuth, no provider selection
4. **User completes OAuth** → Returns to intended destination
5. **User sees content** → Seamless experience, no auth friction

## Troubleshooting

**If redirects don't work:**
- Check `NEXTAUTH_URL` environment variable
- Verify Kakao app settings allow the callback URL
- Check browser console for JavaScript errors

**If return URLs are wrong:**
- Verify `from` parameter sanitization logic
- Check allowed routes whitelist
- Test with various `from` values
