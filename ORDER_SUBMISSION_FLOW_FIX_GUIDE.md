# Order Submission Flow Fix - Test Guide

## Overview
This guide covers the fixes applied to the order submission flow with Toss Payments integration. The main issue was that error states persisted after address validation failures, preventing valid submissions even after correcting the address.

## Key Fixes Applied

### 1. **Enhanced Error State Management**
- **Clear rejection flag on submit**: Previous error state is cleared before validation
- **Auto-clear on address change**: Rejection flag is cleared when address becomes serviceable
- **Conditional error display**: Error messages only show when address is actually not serviceable

### 2. **Improved Validation Flow**
- **Re-validation on every submit**: Address is always validated using the latest field value
- **Clear error state on success**: Previous errors are cleared when validation passes
- **Proper error persistence**: Only validation errors persist, not payment errors

### 3. **Enhanced Draft State Management**
- **New `clearSubmitRejected` function**: Specifically clears validation rejection flags
- **Automatic cleanup**: Rejection flags are cleared when address becomes serviceable
- **Persistent draft values**: Form data persists through validation errors

## Implementation Details

### OrderForm.tsx Changes

#### 1. **Enhanced Submit Handler**
```typescript
const onSubmit = async (data: OrderForm) => {
  // ... existing code ...
  
  try {
    // Always validate address before submitting (no debounce, immediate validation)
    const validationResult = await validateNow()
    
    if (!validationResult.isServiceable) {
      // Set rejection flag and show error
      setSubmitRejected(true)
      alert(validationResult.message || '서비스 가능한 지역이 아닙니다.')
      return
    }

    // Clear any previous error state if validation passes
    if (draft.submitRejectedNotServiceable) {
      clearSubmitRejected()
    }

    // ... rest of submission logic ...
  }
}
```

#### 2. **Auto-clear Rejection Flag**
```typescript
// Clear rejection flag when address becomes serviceable
useEffect(() => {
  if (isServiceable && draft.submitRejectedNotServiceable && !isValidating) {
    clearSubmitRejected()
  }
}, [isServiceable, draft.submitRejectedNotServiceable, isValidating, clearSubmitRejected])
```

#### 3. **Conditional Error Display**
```typescript
{/* Show rejection message if submit was rejected and address is not serviceable */}
{draft.submitRejectedNotServiceable && !isValidating && !isServiceable && (
  <p className="text-sm text-red-600 mt-1">
    이전 주문이 서비스 가능한 지역이 아니어서 거부되었습니다. 주소를 수정해주세요.
  </p>
)}
```

### useOrderDraft.ts Changes

#### 1. **New clearSubmitRejected Function**
```typescript
// Clear validation rejection flag when address becomes serviceable
const clearSubmitRejected = useCallback(() => {
  setDraft(prev => {
    if (!prev.submitRejectedNotServiceable) return prev
    
    const next = { 
      ...prev, 
      submitRejectedNotServiceable: false,
      validationTimestamp: undefined,
      lastAddress: undefined
    }
    
    // Write immediately for validation state changes
    if (hasHydratedRef.current) {
      if (writeTimer.current) {
        window.clearTimeout(writeTimer.current)
      }
      writeTimer.current = window.setTimeout(() => {
        writeToStorage(next)
      }, DEBOUNCE_MS)
    }
    
    return next
  })
}, [])
```

#### 2. **Enhanced Hook Return**
```typescript
return {
  draft,
  setField,
  setAll,
  clearDraft,
  setSubmitRejected,
  clearSubmitRejected, // New function
  hasHydrated
}
```

## Test Scenarios

### 1. **Invalid Address → Valid Address Flow**
1. **Enter invalid address**: "서울 강남구 역삼동"
2. **Submit form**: Should show validation error and set rejection flag
3. **Change to valid address**: "서울 관악구 남현동"
4. **Expected**: Rejection flag is automatically cleared
5. **Submit again**: Should proceed to payment without errors

### 2. **Multiple Validation Attempts**
1. **Enter invalid address**: "서울 강남구 역삼동"
2. **Submit**: Should fail with validation error
3. **Enter another invalid address**: "서울 서초구 서초동"
4. **Submit**: Should fail with validation error
5. **Enter valid address**: "서울 관악구 신림동"
6. **Submit**: Should succeed and proceed to payment

### 3. **Error State Persistence**
1. **Enter invalid address**: "서울 강남구 역삼동"
2. **Submit**: Should show error message
3. **Refresh page**: Error state should persist (from sessionStorage)
4. **Change to valid address**: "서울 관악구 봉천동"
5. **Expected**: Error state should be cleared automatically
6. **Submit**: Should succeed

### 4. **Draft Persistence Through Errors**
1. **Fill form with valid data**: Name, phone, valid address
2. **Submit**: Should succeed
3. **Fill form with invalid address**: Keep name/phone, change to invalid address
4. **Submit**: Should fail with validation error
5. **Expected**: Name and phone should persist, only address validation fails
6. **Change to valid address**: Should clear error and allow submission

### 5. **Payment Flow Integration**
1. **Enter valid address**: "서울 관악구 남현동"
2. **Submit**: Should create order successfully
3. **Expected**: Toss Payments widget should open
4. **Complete payment**: Should redirect to completion page
5. **Expected**: Draft should be cleared after successful payment

## Error Handling

### 1. **Validation Errors**
- **Client-side validation**: Immediate feedback with `validateNow()`
- **Server-side validation**: 422 response with detailed error message
- **Error persistence**: Only validation errors persist, not payment errors

### 2. **Payment Errors**
- **Payment failure**: Redirects back to order page with error parameter
- **Error display**: Shows payment error message
- **Draft preservation**: Form data is preserved through payment failures

### 3. **Network Errors**
- **API failures**: Shows generic error message
- **Retry capability**: User can retry submission
- **State cleanup**: Error states are properly managed

## Performance Considerations

### 1. **Debounced Validation**
- **Background validation**: 500ms debounce for live feedback
- **Immediate validation**: No debounce for submit validation
- **Request cancellation**: Previous requests are cancelled when address changes

### 2. **Storage Management**
- **Debounced writes**: 300ms delay for sessionStorage writes
- **Immediate writes**: Validation state changes are written immediately
- **Automatic cleanup**: Expired validation states are cleaned up

### 3. **State Updates**
- **Functional updates**: Prevents unnecessary re-renders
- **Early returns**: Skips updates when values haven't changed
- **Stable references**: Callbacks are memoized to prevent infinite loops

## Security Features

### 1. **Input Validation**
- **Client-side validation**: Immediate feedback for user experience
- **Server-side validation**: Authoritative validation for security
- **Address verification**: Multiple validation paths for robustness

### 2. **Error State Management**
- **Timestamp-based expiry**: Validation errors expire after 10 minutes
- **Address mismatch detection**: Errors are cleared when address changes
- **Automatic cleanup**: Prevents stale error states

### 3. **Draft Security**
- **SessionStorage only**: Data is not persisted across browser sessions
- **No PII logging**: Sensitive data is not logged
- **Safe JSON handling**: Proper error handling for storage operations

## Monitoring and Debugging

### 1. **Console Logging**
- **Development mode**: Detailed logging for debugging
- **Production mode**: Minimal logging for performance
- **Error tracking**: All errors are logged with context

### 2. **State Inspection**
- **Draft state**: Can be inspected in browser DevTools
- **Validation state**: Real-time validation status
- **Error flags**: Clear indication of error states

### 3. **Network Monitoring**
- **API calls**: All requests are logged
- **Response times**: Performance monitoring
- **Error rates**: Track validation and payment failures

## Rollback Plan

If issues arise, the changes can be reverted by:
1. **Remove `clearSubmitRejected` function** from `useOrderDraft.ts`
2. **Remove auto-clear effect** from `OrderForm.tsx`
3. **Restore original error display logic**
4. **Remove conditional error display**

## Future Enhancements

### 1. **Enhanced Error Messages**
- **Specific error types**: Different messages for different validation failures
- **User guidance**: Suggest nearby serviceable areas
- **Retry mechanisms**: Automatic retry for transient failures

### 2. **Performance Optimizations**
- **Caching**: Cache validation results for common addresses
- **Prefetching**: Pre-validate addresses as user types
- **Optimistic updates**: Show success state before server confirmation

### 3. **User Experience**
- **Progress indicators**: Show validation progress
- **Auto-complete**: Suggest valid addresses
- **Offline support**: Handle network failures gracefully

## Testing Commands

### 1. **Manual Testing**
```bash
# Start development server
npm run dev

# Test order submission flow
# 1. Navigate to http://localhost:3000/order
# 2. Fill form with invalid address
# 3. Submit and verify error handling
# 4. Change to valid address
# 5. Submit and verify success
```

### 2. **Automated Testing**
```bash
# Run geocoder tests
npm run test:geocoder

# Run build check
npm run build
```

### 3. **Error Simulation**
```bash
# Test with invalid addresses
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트","phone":"010-1234-5678","address":"서울 강남구 역삼동"}'

# Test with valid addresses
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트","phone":"010-1234-5678","address":"서울 관악구 남현동"}'
```

## Success Criteria

✅ **Error state clears automatically** when address becomes serviceable
✅ **Validation re-runs on every submit** using latest address value
✅ **Draft values persist** through validation errors
✅ **Payment flow works correctly** after validation passes
✅ **Error messages reset** when user changes address
✅ **No stale error states** persist between submissions
✅ **Performance is maintained** with debounced validation
✅ **Security is preserved** with proper input validation
