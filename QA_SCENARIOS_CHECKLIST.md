# 🧪 QA Scenarios Checklist

## Prerequisites
- Server running on http://localhost:3000
- Clean browser state (clear cookies/localStorage/sessionStorage)
- Valid test data ready

## ✅ **1. Runtime Error Check**

### Test: Module Resolution Error Fixed
**Steps:**
1. Navigate to http://localhost:3000/home
2. Check browser console for errors
3. Navigate to http://localhost:3000/order
4. Check browser console for errors

**Expected Results:**
- ✅ No "Cannot find module './611.js'" errors
- ✅ No "Cannot find module './996.js'" errors  
- ✅ Pages load successfully with 200 status
- ✅ No webpack module resolution errors in console

**Status:** ✅ PASS - Clean build and dev server running without module errors

---

## ✅ **2. Order Form Persistence (Guest User Flow)**

### Test: Draft Saved During Login Redirect
**Steps:**
1. Open incognito/private browser window
2. Navigate to http://localhost:3000/order
3. Fill in the form:
   - Name: "김철수"
   - Phone: "010-1234-5678" 
   - Address: "서울특별시 관악구 신림동 123-45"
   - Building Detail: "101호"
4. Click "주문 접수하기" button
5. Should redirect to `/signin?from=order`
6. Complete Kakao OAuth login
7. After login, should return to `/order`

**Expected Results:**
- ✅ Form fields are pre-filled with exact values from step 3
- ✅ All fields retain their values: name, phone, address, building detail
- ✅ User can continue with order submission without re-entering data

**Dev Console Check:**
```javascript
// Should see these logs only in development
console.info('Draft saved to sessionStorage')
console.info('Draft hydrated from sessionStorage')
```

---

## ✅ **3. Order Submission Reset**

### Test: Draft Cleared After Successful Order
**Steps:**
1. As a logged-in user, go to http://localhost:3000/order
2. Fill in complete order form with valid Gwanak-gu address:
   - Name: "이영희"
   - Phone: "010-9876-5432"
   - Address: "서울특별시 관악구 봉천동"
3. Submit the order
4. Wait for success message
5. Refresh the page (F5 or Ctrl+R)
6. Check form state

**Expected Results:**
- ✅ Order submission succeeds with success message
- ✅ After refresh, form is completely empty
- ✅ No previous values are restored
- ✅ sessionStorage is cleared

**Dev Console Check:**
```javascript
console.info('Draft cleared from sessionStorage')
```

---

## ✅ **4. Security Validation**

### Test 4A: API Authentication Enforcement
**Steps:**
1. Open terminal/command prompt
2. Run the following curl command:
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","phone":"010-1234-5678","address":"서울특별시 관악구 신림동"}'
```

**Expected Results:**
- ✅ HTTP Status: 401 Unauthorized
- ✅ Response Body: `{"error":"로그인이 필요합니다."}`
- ✅ No order created in database

### Test 4B: User ID Security
**Steps:**
1. Login as a valid user
2. Open browser developer tools → Network tab
3. Fill and submit order form
4. Inspect the POST request to `/api/orders`
5. Check the request payload
6. Check the database entry (if accessible)

**Expected Results:**
- ✅ Client request body does NOT contain `user_id` field
- ✅ Server automatically assigns `user_id` from session
- ✅ Database record has correct `user_id` matching the logged-in user
- ✅ Client cannot manipulate `user_id` to impersonate other users

---

## ✅ **5. Edge Case Testing**

### Test 5A: Session Expiration During Form Fill
**Steps:**
1. Login and go to `/order`
2. Fill form partially
3. Wait for session to expire (or manually clear auth cookies)
4. Complete form and submit
5. Check behavior

**Expected Results:**
- ✅ API returns 401 status
- ✅ Form data is preserved
- ✅ User redirected to `/signin?from=order`
- ✅ After re-login, form data is restored

### Test 5B: Storage Validation
**Steps:**
1. Go to `/order` and fill form
2. Open browser DevTools → Application → Session Storage
3. Find key `orderDraft:v1`
4. Manually corrupt the JSON (invalid format)
5. Refresh page

**Expected Results:**
- ✅ Corrupted data is ignored gracefully
- ✅ Form starts with empty state
- ✅ No JavaScript errors in console

### Test 5C: Network Issues
**Steps:**
1. Fill form and submit
2. Simulate network failure (disconnect internet)
3. Try to submit

**Expected Results:**
- ✅ Error message displayed to user
- ✅ Form data remains intact
- ✅ User can retry submission when network restored

---

## ✅ **6. Browser Compatibility**

### Test 6A: sessionStorage Support
**Steps:**
1. Test in Chrome, Firefox, Safari, Edge
2. Fill form and go through login flow
3. Verify persistence works in each browser

**Expected Results:**
- ✅ Draft persistence works in all modern browsers
- ✅ Graceful degradation if sessionStorage unavailable

---

## ✅ **7. Performance Validation**

### Test 7A: Debounced Writes
**Steps:**
1. Open DevTools → Application → Session Storage
2. Go to `/order` form
3. Type rapidly in the name field
4. Observe sessionStorage updates

**Expected Results:**
- ✅ sessionStorage updates are debounced (not on every keystroke)
- ✅ Final value is correctly saved after 300ms delay
- ✅ No excessive storage API calls

---

## 🎯 **Quick Smoke Test Checklist**

For rapid verification, run these core scenarios:

- [ ] **Clean Start**: Visit `/home` → No module errors
- [ ] **Guest Flow**: Fill `/order` → Submit → Login → Return with data intact  
- [ ] **Submit Reset**: Logged user submits order → Form clears after success
- [ ] **API Security**: `curl` without auth → Returns 401 + "로그인이 필요합니다."
- [ ] **Data Security**: Submitted orders have correct `user_id` from session

---

## 📋 **Test Data Templates**

### Valid Gwanak-gu Addresses (for successful orders):
```
서울특별시 관악구 신림동
서울특별시 관악구 봉천동  
서울 관악구 신림로 123
서울 관악구 관악로 456
```

### Invalid Addresses (should be rejected):
```
서울특별시 강남구 역삼동
부산광역시 해운대구
경기도 성남시 분당구
```

### Valid Phone Numbers:
```
010-1234-5678
010-9876-5432
011-123-4567
016-987-6543
```

### Invalid Phone Numbers:
```
02-123-4567  
1234-5678
010-12345
abc-defg-hijk
```

---

## 🚨 **Failure Scenarios to Watch For**

1. **Form data lost** during login redirect
2. **Previous order data** appearing in fresh form
3. **Unauthorized API access** succeeding  
4. **Client-side user_id** being accepted by server
5. **Module resolution errors** returning
6. **Memory leaks** from uncleared timeouts
7. **XSS vulnerabilities** from unsanitized draft data

---

## ✅ **Success Criteria Summary**

All tests must pass for deployment readiness:

- **Runtime Stability**: No module errors, clean dev/build
- **Data Persistence**: Form values survive login flow  
- **Security**: Authentication enforced, user_id server-controlled
- **UX**: Seamless experience, no data loss
- **Performance**: Efficient storage usage, no excessive API calls
