# 🏠 Address Validation Implementation Guide

## Overview

This implementation adds client-side pre-validation for addresses in the OrderForm component, ensuring users get immediate feedback about service availability in their area (Gwanak-gu only).

## Components

### 1. **API Endpoint: `/api/geo/preview`** ✅
- **Method**: GET
- **Query Parameter**: `address` (string)
- **Response**: 
  ```json
  {
    "isServiceable": boolean,
    "si": string,
    "gu": string, 
    "dong": string
  }
  ```
- **Error Response**: 
  ```json
  {
    "error": "주소를 찾을 수 없습니다. 정확한 주소를 입력해주세요."
  }
  ```

### 2. **Custom Hook: `useAddressValidation`** ✅
- **Location**: `lib/hooks/useAddressValidation.ts`
- **Features**:
  - 500ms debouncing
  - Automatic validation when address changes
  - Loading states
  - Error handling
- **Returns**:
  ```typescript
  {
    validationResult: AddressValidationResult | null,
    isValidating: boolean,
    validationError: string | null,
    isServiceable: boolean
  }
  ```

### 3. **Updated OrderForm Component** ✅
- **Location**: `components/landing/OrderForm.tsx`
- **New Features**:
  - Real-time address validation with visual feedback
  - Loading indicator during validation
  - Red error message for non-serviceable areas
  - Green success message for serviceable areas
  - Submit button disabled when address is not serviceable
  - Maintains existing styles and functionality

## User Experience Flow

1. **User types address** → Debounced validation starts after 500ms
2. **Loading state** → Shows "주소 확인 중..." with spinner
3. **Validation complete** → Shows one of:
   - ✅ **Green success**: "서비스 가능 지역입니다 (서울 관악구)"
   - ❌ **Red error**: "관악구 외 지역은 아직 서비스하지 않습니다."
   - ❌ **Red error**: "주소를 찾을 수 없습니다. 정확한 주소를 입력해주세요."
4. **Submit button** → Disabled when address is not serviceable

## Security & Performance

- ✅ **No secrets on client**: Uses same server-side geocoding as orders API
- ✅ **Debounced requests**: Prevents excessive API calls
- ✅ **Error handling**: Graceful fallbacks for network issues
- ✅ **Consistent validation**: Same logic as backend order processing

## Testing

### Manual Testing
1. Start dev server: `npm run dev`
2. Navigate to order form
3. Test addresses:
   - **Serviceable**: "서울특별시 관악구 신림동"
   - **Not serviceable**: "서울특별시 강남구 역삼동"
   - **Invalid**: "잘못된 주소"

### API Testing
```bash
# Test the API directly
curl "http://localhost:3000/api/geo/preview?address=서울특별시%20관악구%20신림동"
```

### Automated Testing
```bash
node test-address-validation.js
```

## Implementation Notes

- **Maintains backward compatibility**: Existing form functionality unchanged
- **Progressive enhancement**: Validation is additive, form works without it
- **Consistent styling**: Uses existing Pretendard font and color scheme
- **Accessibility**: Clear visual indicators and error messages
- **Mobile friendly**: Responsive design maintained

## Future Enhancements

- Add postal code validation
- Cache validation results for better performance
- Add more detailed error messages for specific address issues
- Implement retry logic for network failures
