# 🧪 MyPage Test Guide

## Quick Test Steps

### 1. **Authentication Test**
```bash
# Start dev server
npm run dev
```

**Test signed-out user:**
1. Navigate to `http://localhost:3000/mypage`
2. **Expected**: Automatic redirect to `/api/auth/signin`
3. **Verify**: User cannot access mypage without authentication

**Test signed-in user:**
1. Sign in with Kakao (use `/api/auth/signin`)
2. Navigate to `http://localhost:3000/mypage`
3. **Expected**: Access granted, page loads successfully

### 2. **UI Components Test**

**Header & Navigation:**
- ✅ Title: "마이 주문 내역"
- ✅ Subtitle: "최근 주문한 세탁 서비스를 확인하세요"
- ✅ Tab: "전체" (placeholder for future expansion)

**Empty State (no orders):**
- ✅ Message: "주문 내역이 아직 없어요."
- ✅ CTA Button: "🛒 주문하러 가기" → redirects to `/order`

**Orders List (with data):**
- ✅ **Desktop**: Table view with columns (시간, 이름, 전화, 주소, 주문번호)
- ✅ **Mobile**: Card view with responsive layout
- ✅ **Data**: Shows 시간(로컬), 이름, 전화(masked), 주소(truncated)

### 3. **Pagination Test**

**Load More Functionality:**
1. If user has >10 orders, "더 보기" button appears
2. Click "더 보기" → loads next 10 orders
3. **Loading state**: Shows spinner with "불러오는 중..."
4. **End state**: Button disappears when no more orders

### 4. **Mobile Responsiveness Test**

**Desktop (≥768px):**
- Table layout with all columns visible
- Proper spacing and hover effects

**Mobile (<768px):**
- Card layout with stacked information
- Touch-friendly buttons and spacing
- Readable text sizes

### 5. **Accessibility Test**

**Landmarks:**
- ✅ `<main>` element wraps content
- ✅ Proper heading hierarchy (h1)

**ARIA Labels:**
- ✅ "더 보기" button: `aria-label="더 많은 주문 내역 불러오기"`
- ✅ "다시 시도" button: `aria-label="주문 내역 다시 불러오기"`
- ✅ "주문하러 가기" button: `aria-label="주문 페이지로 이동"`

### 6. **SEO Test**

**Metadata:**
- ✅ Title: "마이페이지 - carry"
- ✅ Description: "내 주문 내역을 확인하세요"

**Check in browser:**
```javascript
// In browser console
document.title // Should show "마이페이지 - carry"
```

### 7. **Data Security Test**

**Server-side Data Fetching:**
- ✅ Uses `getSupabaseServer()` (service role)
- ✅ Filters by `user_id = session.user.id`
- ✅ No client-side anon key usage

**Privacy:**
- ✅ Phone numbers are masked (e.g., "010-****-5678")
- ✅ Addresses are truncated for display
- ✅ Users only see their own orders

## Expected Behavior Summary

| Scenario | Expected Result |
|----------|----------------|
| **Signed-out user visits /mypage** | Redirect to `/api/auth/signin` |
| **Signed-in user, no orders** | Empty state with "🛒 주문하러 가기" button |
| **Signed-in user, has orders** | List of orders (table on desktop, cards on mobile) |
| **>10 orders available** | "더 보기" button for pagination |
| **Mobile device** | Responsive card layout |
| **Error loading orders** | Error message with "다시 시도" button |

## Acceptance Criteria Verification

✅ **Route**: `/mypage` as Server Component  
✅ **Auth**: Redirects to `/api/auth/signin` when not signed in  
✅ **Data**: Server-side Supabase with user_id filtering  
✅ **UI**: Mobile-first design with proper header and tabs  
✅ **Empty State**: Correct message and CTA button  
✅ **Pagination**: Cursor-based "더 보기" functionality  
✅ **SEO**: Proper title and metadata  
✅ **Accessibility**: Main landmark and aria-labels  
✅ **Security**: No admin tooling, proper data isolation  
✅ **Build**: Passes build and lint checks
