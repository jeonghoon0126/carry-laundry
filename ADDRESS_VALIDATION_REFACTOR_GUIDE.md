# Address Validation Refactor - Test Guide

## Overview
This guide covers the refactored address validation system that prevents stale "not serviceable" state and ensures reliable validation during form submission.

## Key Changes

### 1. Enhanced `useAddressValidation` Hook
- **Immediate state reset**: Clears previous error/message on every keystroke
- **Request cancellation**: Cancels in-flight requests when address changes
- **`validateNow()` function**: Immediate validation without debounce for submit-time checks
- **AbortController support**: Proper request cancellation to prevent race conditions

### 2. OrderForm Submit Handler
- **Pre-submit validation**: Always calls `await validateNow()` before API call
- **422 error handling**: Clears only validation state, preserves draft data
- **Race condition prevention**: No reliance on cached hook state for submission

### 3. UX Improvements
- **Live feedback**: 500ms debounced validation for real-time feedback
- **Submit-time indicator**: "최종 주소 확인 중..." during final validation
- **Button state**: Disabled when address is not serviceable
- **Immediate error clearing**: Errors removed as soon as address becomes valid

## Test Scenarios

### 1. Real-time Validation
1. Navigate to `http://localhost:3000/order`
2. Start typing an address (e.g., "서울")
3. **Expected**: Validation state resets immediately on each keystroke
4. **Expected**: After 500ms pause, validation runs and shows result
5. **Expected**: "주소 확인 중..." message appears during validation

### 2. Address Change During Validation
1. Type "서울 강남구" and wait for validation to start
2. Immediately change to "서울 관악구" before first validation completes
3. **Expected**: Previous validation request is cancelled
4. **Expected**: New validation starts for "서울 관악구"
5. **Expected**: No stale error messages from previous address

### 3. Submit-time Validation
1. Fill out the form with a valid address (e.g., "서울 관악구 남현동")
2. Click "결제하기" button
3. **Expected**: "최종 주소 확인 중..." appears briefly
4. **Expected**: If valid, proceeds to payment
5. **Expected**: If invalid, shows error and blocks submission

### 4. Non-serviceable Address
1. Enter a non-serviceable address (e.g., "서울 강남구")
2. **Expected**: Red error message appears
3. **Expected**: Submit button becomes disabled
4. **Expected**: Change to serviceable address (e.g., "서울 관악구")
5. **Expected**: Error message disappears immediately
6. **Expected**: Submit button becomes enabled

### 5. Server Validation Error (422)
1. Enter a valid-looking address that fails server validation
2. Submit the form
3. **Expected**: Server returns 422 error
4. **Expected**: Form shows error message
5. **Expected**: Draft data is preserved (form fields remain filled)
6. **Expected**: User can correct address and resubmit without refresh

### 6. Race Condition Prevention
1. Type an address and wait for validation to start
2. Quickly change the address multiple times
3. **Expected**: Only the latest validation result is shown
4. **Expected**: No stale error messages from previous addresses
5. **Expected**: Submit uses the most current validation result

## Technical Implementation

### Hook Features
```typescript
const { isValidating, isServiceable, message, validateNow } = useAddressValidation(address)
```

- `isValidating`: Boolean indicating if validation is in progress
- `isServiceable`: Boolean indicating if address is serviceable
- `message`: String with validation message
- `validateNow()`: Async function for immediate validation

### Submit Handler Logic
```typescript
// Always validate before submitting
const validationResult = await validateNow()

if (!validationResult.isServiceable) {
  alert(validationResult.message)
  return
}

// Proceed with API call
```

### Error Handling
- **422 errors**: Clear validation state, preserve draft
- **401 errors**: Redirect to login with draft preservation
- **Other errors**: Show error message, preserve form state

## Validation States

### Visual Indicators
- **Blue spinner + "주소 확인 중..."**: Background validation in progress
- **Blue spinner + "최종 주소 확인 중..."**: Submit-time validation in progress
- **Green text**: Address is serviceable
- **Red text**: Address is not serviceable
- **Disabled button**: Address not serviceable or validation in progress

### State Transitions
1. **Empty address**: No validation, no message
2. **Short address (< 5 chars)**: No validation, no message
3. **Typing**: Immediate state reset, debounced validation starts
4. **Validation complete**: Show result (green/red message)
5. **Address change**: Cancel previous, start new validation
6. **Submit**: Immediate validation, then proceed or block

## Performance Considerations
- **Debounced validation**: 500ms delay for live feedback
- **Request cancellation**: Prevents unnecessary API calls
- **Immediate state reset**: Prevents stale error messages
- **Submit-time validation**: Ensures accuracy without debounce

## Browser Compatibility
- **AbortController**: Modern browsers (IE not supported)
- **Fetch API**: All modern browsers
- **Async/await**: ES2017+ support required

## Debugging
- Check browser console for validation errors
- Monitor network tab for cancelled requests
- Verify state transitions in React DevTools
- Test with slow network to see cancellation behavior
