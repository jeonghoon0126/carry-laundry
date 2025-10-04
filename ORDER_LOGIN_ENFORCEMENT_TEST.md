# 🧪 Order Login Enforcement Test Guide

## Implementation Summary

### ✅ **API Changes** (`app/api/orders/route.ts`)
- Added session checking with `getServerSession(authOptions)`
- Returns `401` with "로그인이 필요합니다." if no session
- Uses `session.user.id` as `user_id` for order insertion
- Removed `user_id` from request body parsing

### ✅ **Frontend Changes** (`components/landing/OrderForm.tsx`)
- Added `useSession()` and `useRouter()` hooks
- Pre-submission session check with redirect to `/signin?from=order`
- Added `isRedirecting` state for better UX
- Enhanced submit button with redirect loading state
- Added 401 response handling with redirect

## Test Cases

### 1. **비회원 상태에서 주문 시도**

**Steps:**
1. Sign out (if signed in)
2. Navigate to `/order`
3. Fill out order form with valid Gwanak-gu address
4. Click "주문 접수하기"

**Expected Result:**
- ✅ Button shows "로그인 페이지로 이동 중..." with spinner
- ✅ Redirects to `/signin?from=order`
- ✅ No API call made to `/api/orders`

### 2. **로그인 후 다시 주문 페이지 접근**

**Steps:**
1. From `/signin?from=order`, complete Kakao login
2. Should return to `/order` page
3. Fill out order form again
4. Click "주문 접수하기"

**Expected Result:**
- ✅ Order submitted successfully
- ✅ Success message appears
- ✅ Order saved with correct `user_id`

### 3. **API 직접 호출 테스트 (비회원)**

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트",
    "phone": "010-1234-5678", 
    "address": "서울특별시 관악구 신림동"
  }'
```

**Expected Result:**
```json
{
  "error": "로그인이 필요합니다."
}
```
**Status Code:** `401`

### 4. **API 직접 호출 테스트 (로그인 상태)**

**Steps:**
1. Login through browser first
2. Get session cookie from browser dev tools
3. Make API call with session cookie

**Expected Result:**
- ✅ Order created successfully with user's `user_id`
- ✅ Returns success response with order data

## Manual Testing Steps

### **Setup:**
```bash
npm run dev
# Server should be running on http://localhost:3000
```

### **Test 1: 비회원 주문 시도**
1. Open browser in incognito/private mode
2. Navigate to `http://localhost:3000/order`
3. Fill form:
   - Name: "테스트 사용자"
   - Phone: "010-1234-5678"
   - Address: "서울특별시 관악구 신림동" (should show green validation)
4. Click "주문 접수하기"
5. **Verify**: Redirects to `/signin?from=order`

### **Test 2: 로그인 후 주문**
1. From signin page, click "카카오로 로그인"
2. Complete OAuth flow
3. **Verify**: Returns to `/order` page
4. Fill form again and submit
5. **Verify**: Order success message appears

### **Test 3: API Security**
```bash
# Test without session
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"010-1234-5678","address":"서울특별시 관악구 신림동"}'

# Should return: {"error":"로그인이 필요합니다."}
```

### **Test 4: Session Persistence**
1. Login and submit order successfully
2. Refresh page
3. Submit another order
4. **Verify**: Still works without re-login

## Expected Behaviors

### **Frontend UX**
| State | Button Text | Button Disabled | Action |
|-------|-------------|-----------------|--------|
| Not logged in | "주문 접수하기" | No | Redirect to signin |
| Redirecting | "로그인 페이지로 이동 중..." | Yes | Show spinner |
| Logged in, submitting | "주문 접수 중..." | Yes | Submit to API |
| Logged in, idle | "주문 접수하기" | No | Ready to submit |

### **API Responses**
| Scenario | Status | Response |
|----------|--------|----------|
| No session | 401 | `{"error":"로그인이 필요합니다."}` |
| Valid session + data | 201 | `{"success":true,"order":{...}}` |
| Invalid address | 422 | `{"error":"관악구 외 지역은..."}` |
| Missing fields | 400 | `{"error":"이름을 입력해주세요."}` |

## Database Verification

### **Check Order Records**
```sql
-- All orders should have user_id populated
SELECT id, name, user_id, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- No orders should have null user_id (after implementation)
SELECT COUNT(*) as null_user_orders 
FROM orders 
WHERE user_id IS NULL 
AND created_at > '2025-10-02';  -- After implementation date
```

## Error Scenarios

### **Network Issues**
- **API timeout**: Shows generic error message
- **Invalid response**: Shows generic error message
- **401 during submission**: Redirects to signin

### **Session Edge Cases**
- **Session expires during form fill**: 401 response triggers signin redirect
- **Multiple tabs**: Each tab checks session independently
- **Browser refresh**: Session persists, form works normally

## Acceptance Criteria Verification

✅ **비회원 상태에서 주문 시도** → `/signin?from=order`로 이동  
✅ **로그인 후 다시 `/order` 들어와서 주문** → 정상 접수  
✅ **API에 직접 POST 요청을 보내도 세션이 없으면** → 401 반환  
✅ **Frontend session check** → API 호출 전 미리 체크  
✅ **Proper UX states** → Loading, redirecting, submitting states  
✅ **Security enforcement** → Server-side session validation  

## Troubleshooting

**If redirects don't work:**
- Check NextAuth session configuration
- Verify `NEXTAUTH_URL` environment variable
- Check browser console for JavaScript errors

**If API returns 401 unexpectedly:**
- Verify user is actually logged in
- Check session cookie in browser dev tools
- Verify NextAuth configuration matches

**If orders don't save user_id:**
- Check session.user.id is populated
- Verify database schema has user_id column
- Check Supabase service role permissions
