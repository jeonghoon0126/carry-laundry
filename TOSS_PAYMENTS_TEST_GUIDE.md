# Toss Payments Integration Test Guide

## Overview
This guide provides step-by-step instructions for testing the Toss Payments integration in the carry-laundry application.

## Prerequisites
- Development server running on `http://localhost:3000`
- Valid Kakao login credentials
- Test card details (provided below)

## Test Card Details
```
Card Number: 4111-1111-1111-1111
Expiry Date: 12/30
Password: 12
Birth Date: 921013
```

## Test Scenarios

### 1. Basic Payment Flow
1. Navigate to `http://localhost:3000/order`
2. Fill out the order form:
   - Name: 테스트 사용자
   - Phone: 010-1234-5678
   - Address: 서울 관악구 남현동 (use postcode search)
3. Click "결제하기" button
4. Toss Payments widget should open
5. Use test card details above
6. Complete payment
7. Should redirect to `/order/completed` page

### 2. Payment Failure Handling
1. Navigate to `http://localhost:3000/order`
2. Fill out the order form
3. Click "결제하기" button
4. In Toss widget, use invalid card details or cancel payment
5. Should redirect back to `/order` with error message
6. Form data should be preserved (draft persistence)

### 3. Authentication Flow
1. Navigate to `http://localhost:3000/order` (while logged out)
2. Fill out the order form
3. Click "결제하기" button
4. Should redirect to `/signin?from=order`
5. Complete Kakao login
6. Should return to `/order` with form data preserved
7. Complete payment flow

### 4. Order Completion Page
1. Complete a successful payment
2. Should see "결제가 완료되었습니다!" message
3. Should show payment amount (100원 - test amount)
4. "마이페이지로 이동" button should work
5. "홈으로 이동" button should work

## API Endpoints

### Payment Confirmation
- **URL**: `/api/payments/confirm`
- **Method**: POST
- **Purpose**: Verify payment with Toss Payments and update order status
- **Authentication**: Required (session-based)

### Order Creation
- **URL**: `/api/orders`
- **Method**: POST
- **Purpose**: Create new order before payment
- **Authentication**: Required (session-based)

## Database Changes
The following fields have been added to the `orders` table:
- `paid` (BOOLEAN): Payment status
- `payment_method` (TEXT): Payment method used
- `payment_id` (TEXT): Toss Payments payment key
- `payment_amount` (INTEGER): Amount paid in won

## Environment Variables
```bash
# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq
TOSS_SECRET_KEY=test_sk_6BYk7mMKLkKw5fO9Ba4P4W7v2ak5
```

## Security Notes
- Client key is safe to expose (frontend only)
- Secret key is server-side only (never exposed to client)
- All payment verification happens server-side
- User authentication required for all payment operations

## Troubleshooting

### Common Issues
1. **Payment widget doesn't load**: Check if `NEXT_PUBLIC_TOSS_CLIENT_KEY` is set
2. **Payment verification fails**: Check if `TOSS_SECRET_KEY` is set correctly
3. **Order not updating**: Check database connection and user authentication
4. **Redirect loops**: Check success/fail URL configuration

### Debug Steps
1. Check browser console for JavaScript errors
2. Check server logs for API errors
3. Verify environment variables are loaded
4. Test with different test card numbers if needed

## Expected Behavior
- ✅ Payment widget opens on "결제하기" click
- ✅ Test card payment succeeds
- ✅ Order status updates to `paid: true`
- ✅ Redirects to completion page on success
- ✅ Shows error message on failure
- ✅ Draft data persists through login/payment flow
- ✅ All API endpoints return appropriate status codes
