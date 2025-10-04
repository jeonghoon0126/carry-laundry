# Toss Payments Integration Fix Summary

## Problem Fixed
Fixed the Toss Payments error "잘못된 요청입니다. - 주문 번호를 넣어주세요." by ensuring a valid orderId is passed to requestPayment and the same orderId/amount are confirmed on the server.

## Changes Made

### 1. Updated `/app/api/orders/route.ts`
**File**: `app/api/orders/route.ts`
**Change**: Modified API response format to return `{ id, amount }` instead of `{ success: true, order: data }`

```typescript
// Before
return NextResponse.json({
  success: true,
  order: data
}, { status: 201 })

// After  
return NextResponse.json({
  id: data.id,
  amount: 11900 // Fixed amount for laundry service
}, { status: 201 })
```

### 2. Updated `components/landing/OrderForm.tsx`
**File**: `components/landing/OrderForm.tsx`
**Changes**:

#### A) Enhanced `processPayment` function:
- Added proper orderId sanitization for Toss Payments
- Added comprehensive logging for debugging
- Ensured amount is passed as a number

```typescript
const processPayment = async (orderId: string, amount: number) => {
  // Build a safe orderId for Toss Payments
  const orderIdRaw = "order_" + String(orderId)
  const safe = orderIdRaw.replace(/[^A-Za-z0-9\-_]/g, "").slice(0, 64)
  const finalOrderId = safe.length < 6 ? (safe + "_xxxxxx").slice(0, 6) : safe
  
  console.info("[Toss] Opening widget", { 
    orderId: finalOrderId, 
    orderName, 
    amount, 
    successUrl, 
    failUrl 
  })
  
  await tossPayments.requestPayment('카드', {
    amount: amount,
    orderId: finalOrderId,
    orderName: orderName,
    // ... other params
  })
}
```

#### B) Updated order creation flow:
- Modified to pass both orderId and amount to processPayment

```typescript
// Success - store order ID and start payment process
setCurrentOrderId(result.id)
clearDraft()
await processPayment(result.id, Number(result.amount || 11900))
```

### 3. Updated `/app/api/payments/confirm/route.ts`
**File**: `app/api/payments/confirm/route.ts`
**Changes**:

#### A) Changed from POST to GET handler:
- Toss Payments redirects with query parameters, not JSON body

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const paymentKey = searchParams.get('paymentKey')
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')
  
  console.info("[Toss] Confirm request", { 
    hasPaymentKey: !!paymentKey, 
    orderId, 
    amount 
  })
```

#### B) Enhanced error handling:
- Proper validation and logging
- Consistent redirect responses instead of JSON

```typescript
if (!paymentKey || !orderId || !amount || isNaN(Number(amount))) {
  console.error("[Toss] Invalid parameters", { paymentKey, orderId, amount })
  return NextResponse.redirect(new URL('/order?error=payment_failed', request.url))
}

if (!tossResponse.ok) {
  const errorText = await tossResponse.text()
  console.error("[Toss] Confirm failed", tossResponse.status, errorText)
  return NextResponse.redirect(new URL('/order?error=payment_failed', request.url))
}
```

#### C) Fixed order ID handling:
- Remove "order_" prefix when updating database

```typescript
.eq('id', orderId.replace('order_', '')) // Remove prefix to get actual DB ID
```

#### D) Added success logging:
```typescript
console.info("[Toss] Confirm success", { orderId })
return NextResponse.redirect(new URL('/order/completed', request.url))
```

## Key Technical Details

### OrderId Sanitization
- Format: `order_<DB_ID>` (e.g., `order_123`)
- Toss Payments requirements: 6-64 characters, alphanumeric + `-` and `_`
- Fallback padding if too short: `order_123_xxxxxx`

### Amount Handling
- Server returns: `11900` (fixed amount for laundry service)
- Client passes: `Number(result.amount || 11900)`
- Toss expects: numeric value, not string

### Environment Variables
- Client: `process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY`
- Server: `process.env.TOSS_SECRET_KEY` (never exposed to client)

### Payment Flow
1. User submits order → API returns `{ id: 123, amount: 11900 }`
2. Client creates `orderId = "order_123"`
3. Toss widget opens with `orderId` and `amount`
4. User completes payment → Toss redirects to `/api/payments/confirm?paymentKey=...&orderId=order_123&amount=11900`
5. Server confirms with Toss API → Updates DB → Redirects to `/order/completed`

## Testing
- Build successful: `npm run build` ✅
- API authentication working: Returns 401 for unauthenticated requests ✅
- Dev server running: `npm run dev -- -p 3000` ✅

## Expected Behavior
1. On `/order`, fill valid Gwanak-gu address and submit
2. Console should show: `[Toss] Opening widget` with valid orderId
3. Complete test payment → Server logs `[Toss] Confirm request` then `[Toss] Confirm success`
4. Redirect to `/order/completed` page

## QA Test Card Details
- Card: `4111-1111-1111-1111`
- Expiry: `12/30`
- Password: `12`
- Birth: `921013`
