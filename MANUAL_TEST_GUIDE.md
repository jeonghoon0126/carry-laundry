# 🧪 Manual Test Guide - Address Validation

## Quick Test Instructions

### To see GREEN (서비스 가능) messages:
1. Navigate to the order form
2. Type any of these addresses in the address field:
   - `서울특별시 관악구 신림동`
   - `서울 관악구 봉천동`
   - `서울특별시 관악구 남현동`

**Expected Result**: Green checkmark with "서비스 가능 지역입니다 (서울 관악구)"

### To see RED (서비스 불가) messages:
1. Type any of these addresses:
   - `서울특별시 강남구 역삼동`
   - `서울특별시 종로구 청운동`
   - `부산광역시 해운대구 우동`

**Expected Result**: Red X with "관악구 외 지역은 아직 서비스하지 않습니다."

### To see validation behavior:
1. **Loading state**: Type an address and watch for "주소 확인 중..." with spinner (500ms delay)
2. **Empty address**: Clear the field → no validation message
3. **Short address**: Type "서울" → no validation (< 5 characters)
4. **Submit button**: Should be disabled when:
   - Address is empty
   - Currently validating
   - Address is not serviceable (red message)

### Invalid address test:
- Type: `잘못된주소123`
- **Expected**: Red message "주소를 찾을 수 없습니다. 정확한 주소를 입력해주세요."

## Acceptance Criteria Verification

✅ **GET /api/geo/preview endpoint**: Created using existing Kakao geocoding util  
✅ **Response format**: `{ isServiceable: boolean, si?: string, gu?: string, dong?: string }`  
✅ **500ms debouncing**: Implemented in useAddressValidation hook  
✅ **Inline status display**: Shows below address input with proper styling  
✅ **Loading state**: "주소 확인 중..." with Tailwind animate-spin  
✅ **Success state**: Green text for 관악구 addresses  
✅ **Error state**: Red text for non-관악구 addresses  
✅ **Submit button control**: Disabled during validation, when not serviceable, or when empty  
✅ **Non-blocking typing**: Debounce only affects network calls  
✅ **Existing UX preserved**: All form fields and functionality maintained  
✅ **No client secrets**: All geocoding happens server-side  
✅ **Minimal hook**: Returns {isValidating, isServiceable, message}  
✅ **Build passes**: No compilation errors  
✅ **Lint passes**: No linting errors
