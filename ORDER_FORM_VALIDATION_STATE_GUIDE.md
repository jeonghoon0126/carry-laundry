# OrderForm Validation State Management - Test Guide

## Overview
This guide covers the enhanced validation state management in OrderForm that handles 422 rejections, clears validation state on address changes, and prevents stale validation flags from persisting.

## Key Changes

### 1. Enhanced `useOrderDraft` Hook
- **Validation state tracking**: Added `submitRejectedNotServiceable`, `validationTimestamp`, and `lastAddress` fields
- **Timestamp-based expiry**: Validation flags expire after 10 minutes
- **Address change detection**: Clears validation state when address changes
- **Guarded hydration**: Prevents stale validation state from being restored

### 2. OrderForm State Management
- **422 handling**: Sets `submitRejectedNotServiceable = true` when API returns 422
- **Address change clearing**: Immediately clears validation state when address changes
- **Visual feedback**: Shows rejection message when submit was previously rejected
- **Clean resubmission**: Form can resubmit cleanly after address correction

### 3. Storage Management
- **Expiry check**: Validates timestamps on storage read
- **Address mismatch**: Clears validation state if address has changed
- **Clean storage**: Removes expired validation flags automatically

## Implementation Details

### OrderDraft Interface
```typescript
interface OrderDraft {
  name?: string
  phone?: string
  address?: string
  submitRejectedNotServiceable?: boolean
  validationTimestamp?: number
  lastAddress?: string
}
```

### Validation State Flow
1. **Submit with invalid address** → API returns 422
2. **Set rejection flag** → `setSubmitRejected(true)` with timestamp
3. **User changes address** → Validation state cleared automatically
4. **Clean resubmission** → Form can submit without stale validation state

### Storage Guards
- **10-minute expiry**: `VALIDATION_EXPIRY_MS = 10 * 60 * 1000`
- **Address mismatch**: Clears validation if `lastAddress !== currentAddress`
- **Automatic cleanup**: Expired validation state removed on read

## Test Scenarios

### 1. 422 Rejection and State Setting
1. Fill out form with non-serviceable address (e.g., "서울 강남구")
2. Submit the form
3. **Expected**: API returns 422
4. **Expected**: `submitRejectedNotServiceable = true` is set
5. **Expected**: Validation timestamp is recorded
6. **Expected**: Rejection message appears: "이전 주문이 서비스 가능한 지역이 아니어서 거부되었습니다. 주소를 수정해주세요."

### 2. Address Change Clearing
1. After 422 rejection, change address to serviceable one (e.g., "서울 관악구")
2. **Expected**: `submitRejectedNotServiceable` flag is cleared immediately
3. **Expected**: Rejection message disappears
4. **Expected**: Form can submit successfully
5. **Expected**: No stale validation state persists

### 3. Storage Persistence and Expiry
1. Submit with invalid address, get 422
2. Close browser tab/window
3. Reopen and navigate to `/order`
4. **Expected**: Rejection state is restored from sessionStorage
5. **Expected**: Rejection message is shown
6. **Expected**: Changing address clears the state

### 4. Timestamp Expiry
1. Submit with invalid address, get 422
2. Wait 10+ minutes (or manually adjust system time)
3. Refresh the page
4. **Expected**: Validation state is expired and cleared
5. **Expected**: No rejection message is shown
6. **Expected**: Form behaves normally

### 5. Address Mismatch Detection
1. Submit with "서울 강남구", get 422
2. Change address to "서울 관악구"
3. Close browser and reopen
4. **Expected**: Validation state is cleared due to address mismatch
5. **Expected**: No rejection message is shown

### 6. Multiple Address Changes
1. Submit with invalid address, get 422
2. Change address multiple times quickly
3. **Expected**: Validation state is cleared on first address change
4. **Expected**: Subsequent changes don't re-trigger validation state
5. **Expected**: Form remains clean for resubmission

### 7. Successful Submission Clearing
1. Submit with valid address successfully
2. **Expected**: `clearDraft()` is called
3. **Expected**: All validation state is cleared
4. **Expected**: Form resets completely

## API Integration

### 422 Error Handling
```typescript
if (response.status === 422) {
  console.error('Address validation failed:', result.error)
  setSubmitRejected(true)
  alert(result.error || '주소가 서비스 가능한 지역이 아닙니다.')
  return
}
```

### Address Change Detection
```typescript
// Clear validation state when address changes
if (key === 'address' && prev.submitRejectedNotServiceable) {
  const { submitRejectedNotServiceable, validationTimestamp, lastAddress, ...cleanNext } = next
  const finalNext = { ...cleanNext, lastAddress: value }
  return finalNext
}
```

### Storage Expiry Check
```typescript
if (parsed.submitRejectedNotServiceable && parsed.validationTimestamp) {
  const isExpired = (now - parsed.validationTimestamp) > VALIDATION_EXPIRY_MS
  if (isExpired) {
    // Clear expired validation state
    const { submitRejectedNotServiceable, validationTimestamp, lastAddress, ...cleanDraft } = parsed
    writeToStorage(cleanDraft)
    return cleanDraft
  }
}
```

## Visual States

### Rejection Message
- **Condition**: `draft.submitRejectedNotServiceable && !isValidating`
- **Message**: "이전 주문이 서비스 가능한 지역이 아니어서 거부되었습니다. 주소를 수정해주세요."
- **Style**: Red text, appears below address validation feedback

### State Transitions
1. **Normal**: No rejection state, form submits normally
2. **Rejected**: Red rejection message, submit blocked
3. **Address Changed**: Rejection message cleared, form ready for resubmission
4. **Expired**: Rejection state cleared automatically after 10 minutes

## Performance Considerations
- **Debounced writes**: 300ms delay for storage writes
- **Immediate clearing**: Address changes clear state immediately
- **Expiry cleanup**: Automatic cleanup prevents storage bloat
- **Minimal re-renders**: State updates are optimized

## Security Features
- **Timestamp validation**: Prevents replay of old validation states
- **Address verification**: Ensures validation state matches current address
- **Automatic expiry**: Limits persistence of validation state
- **Clean storage**: Removes expired data automatically

## Error Handling
- **Storage errors**: Gracefully handled, no crashes
- **Invalid data**: Validated before use
- **Network failures**: Validation state persists through network issues
- **Browser compatibility**: Works across modern browsers

## Testing Commands

### Test 422 Rejection
```bash
# Submit with non-serviceable address
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트","phone":"010-1234-5678","address":"서울 강남구 역삼동"}'
```

### Test Address Validation
```bash
# Check address validation
curl "http://localhost:3000/api/geo/preview?address=서울 강남구 역삼동"
```

### Test Storage Persistence
1. Submit invalid address, get 422
2. Check browser DevTools → Application → Session Storage
3. Verify `orderDraft:v1` contains validation state
4. Refresh page and verify state restoration

## Monitoring
- **Rejection rate**: Monitor 422 responses
- **State persistence**: Track validation state duration
- **Storage usage**: Monitor sessionStorage size
- **User experience**: Track form abandonment after rejection

## Rollback Plan
If issues arise, the validation state management can be reverted by:
1. Removing validation fields from `OrderDraft` interface
2. Reverting `setSubmitRejected` function
3. Removing validation state clearing logic
4. Restoring original 422 error handling

## Future Enhancements
- **Analytics**: Track validation rejection patterns
- **User guidance**: Suggest nearby serviceable areas
- **Caching**: Cache validation results for common addresses
- **A/B testing**: Test different rejection message styles
