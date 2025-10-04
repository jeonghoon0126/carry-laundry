# Gwanak-gu Validation Hardening - Test Guide

## Overview
This guide covers the hardened server-side Gwanak-gu validation that checks both `road_address` and `address` fields from Kakao Local API, with fallback to original query string matching.

## Key Changes

### 1. Enhanced `lib/kakao.ts`
- **Dual address checking**: Checks both `road_address.region_2depth_name` AND `address.region_2depth_name`
- **Fallback validation**: If original query contains "관악구", treat as serviceable
- **Serviceability flag**: Added `isServiceable` to `GeocodeResult` interface
- **Minimal logging**: Logs only `{ si, gu, dong }` and decision, never PII

### 2. Updated API Routes
- **`/api/geo/preview`**: Uses hardened validation with minimal logging
- **`/api/orders`**: Returns consistent 422 JSON with `{ error, detail: { si, gu, dong } }`
- **Consistent error handling**: Both routes use the same validation logic

### 3. Validation Logic
```typescript
function isGwanakGuServiceable(roadAddress, address, originalQuery) {
  // Check road_address first
  if (roadAddress?.region_2depth_name === "관악구") {
    const si = roadAddress.region_1depth_name;
    if (si === "서울특별시" || si === "서울") return true;
  }
  
  // Check address as fallback
  if (address?.region_2depth_name === "관악구") {
    const si = address.region_1depth_name;
    if (si === "서울특별시" || si === "서울") return true;
  }
  
  // Fallback: check if original query contains "관악구"
  if (originalQuery.includes("관악구")) return true;
  
  return false;
}
```

## Test Scenarios

### 1. Road Address Validation
1. Test with road address: "서울특별시 관악구 남현동 123-45"
2. **Expected**: `road_address.region_2depth_name` = "관악구" → serviceable
3. **Expected**: Returns `{ isServiceable: true, si: "서울특별시", gu: "관악구", dong: "남현동" }`

### 2. Address Fallback Validation
1. Test with address that only has `address` field: "서울 관악구 신림동 456-78"
2. **Expected**: `address.region_2depth_name` = "관악구" → serviceable
3. **Expected**: Returns `{ isServiceable: true, si: "서울", gu: "관악구", dong: "신림동" }`

### 3. Query String Fallback
1. Test with query containing "관악구": "관악구 봉천동 아파트"
2. **Expected**: Original query contains "관악구" → serviceable
3. **Expected**: Returns `{ isServiceable: true }` even if API doesn't return proper region info

### 4. Non-Serviceable Address
1. Test with non-Gwanak-gu address: "서울특별시 강남구 역삼동 123-45"
2. **Expected**: Neither `road_address` nor `address` has "관악구" → not serviceable
3. **Expected**: Returns `{ isServiceable: false, si: "서울특별시", gu: "강남구", dong: "역삼동" }`

### 5. API Error Handling
1. Test with invalid address: "존재하지않는주소"
2. **Expected**: Geocoding fails → returns 400 with error message
3. **Expected**: No PII logged, only "Geocoding failed" or "Geocoding preview failed"

### 6. Order Submission Validation
1. Submit order with Gwanak-gu address
2. **Expected**: Order created successfully
3. **Expected**: Log shows "Order validation passed: si=서울특별시, gu=관악구, dong=남현동"

### 7. Order Rejection
1. Submit order with non-Gwanak-gu address
2. **Expected**: Returns 422 with:
   ```json
   {
     "error": "관악구 외 지역은 아직 서비스하지 않습니다.",
     "detail": { "si": "서울특별시", "gu": "강남구", "dong": "역삼동" }
   }
   ```

## API Endpoints

### GET `/api/geo/preview?address={address}`
- **Purpose**: Client-side address validation preview
- **Response**: `{ isServiceable: boolean, si: string, gu: string, dong: string }`
- **Error**: 400 with error message if geocoding fails

### POST `/api/orders`
- **Purpose**: Create order with server-side validation
- **Validation**: Uses same hardened logic as preview endpoint
- **Error**: 422 with `{ error: string, detail: { si, gu, dong } }` if not serviceable

## Logging Standards

### Allowed Logs (Minimal)
```typescript
// Success
console.log(`Geocoding preview: si=${si}, gu=${gu}, dong=${dong}, serviceable=${isServiceable}`)
console.log(`Order validation passed: si=${si}, gu=${gu}, dong=${dong}`)

// Failure
console.log(`Service area validation failed: si=${si}, gu=${gu}, dong=${dong}`)
console.log(`Geocoding failed`)
console.log(`Geocoding preview failed`)
```

### Prohibited Logs (PII)
- ❌ Full address text
- ❌ User names
- ❌ Phone numbers
- ❌ Any personally identifiable information

## Boundary Cases

### 1. Edge Cases
- **Empty address**: Returns 400
- **Very short address**: Returns 400
- **Special characters**: Handled by URL encoding
- **Unicode characters**: Properly handled

### 2. API Failures
- **Kakao API timeout**: Returns 400 with timeout message
- **Kakao API error**: Returns 400 with generic error
- **Network failure**: Returns 400 with generic error

### 3. Data Inconsistencies
- **Missing region info**: Falls back to query string check
- **Inconsistent region names**: Handles both "서울" and "서울특별시"
- **Missing coordinates**: Still validates serviceability

## Performance Considerations
- **4-second timeout**: Prevents hanging requests
- **Single API call**: Efficient validation
- **Caching**: No caching to ensure real-time validation
- **Error handling**: Graceful degradation

## Security Features
- **No PII logging**: Protects user privacy
- **Input validation**: Sanitizes address input
- **Error masking**: Doesn't expose internal errors
- **Rate limiting**: Inherits from Next.js API routes

## Testing Commands

### Test Preview Endpoint
```bash
# Serviceable address
curl "http://localhost:3000/api/geo/preview?address=서울특별시 관악구 남현동"

# Non-serviceable address
curl "http://localhost:3000/api/geo/preview?address=서울특별시 강남구 역삼동"

# Query string fallback
curl "http://localhost:3000/api/geo/preview?address=관악구 봉천동"
```

### Test Order Endpoint
```bash
# Serviceable order (requires authentication)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트","phone":"010-1234-5678","address":"서울특별시 관악구 남현동"}'

# Non-serviceable order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트","phone":"010-1234-5678","address":"서울특별시 강남구 역삼동"}'
```

## Monitoring
- **Success rate**: Monitor 200/201 responses
- **Error rate**: Monitor 400/422 responses
- **Response time**: Monitor API latency
- **Log volume**: Ensure minimal logging

## Rollback Plan
If issues arise, the previous validation logic can be restored by:
1. Reverting `lib/kakao.ts` to single address check
2. Reverting API routes to original validation
3. Removing `isServiceable` from `GeocodeResult`

## Future Enhancements
- **Caching**: Add Redis cache for frequent addresses
- **Metrics**: Add detailed validation metrics
- **A/B testing**: Test different validation strategies
- **Geofencing**: Add coordinate-based validation
