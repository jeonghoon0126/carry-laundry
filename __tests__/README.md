# Geocoder Integration Tests

This directory contains integration tests for the server-side geocoder functionality.

## Test Files

### `geocoder.integration.test.js`
Jest-style integration test for the geocoder. Tests Gwanak-gu validation with specific addresses.

**Test Cases:**
- Gwanak-gu address validation (`서울 관악구 과천대로 863 (남현동)`)
- Non-serviceable address rejection (`서울 강남구 역삼동`)
- Multiple Gwanak-gu addresses validation
- Validation logic branches (road_address vs address)
- Fallback query string check
- Error handling for invalid addresses

### `geocoder.test.js`
Simple Node.js test file with basic assertion helpers. Can be run without Jest.

## Running Tests

### Using npm scripts (recommended)
```bash
# Run the main geocoder test
npm run test:geocoder

# Run the test runner
npm run test:geocoder:run
```

### Direct execution
```bash
# Run the main test script
node scripts/test-geocoder.js

# Run the test runner
node scripts/run-geocoder-tests.js
```

## Test Requirements

- `KAKAO_CLIENT_ID` environment variable must be set
- Internet connection for Kakao Local API calls
- Test timeout: 10-15 seconds for API calls

## Test Results

The tests verify that:
- ✅ Gwanak-gu addresses return `isServiceable: true`
- ✅ Non-Gwanak-gu addresses return `isServiceable: false`
- ✅ Both `road_address` and `address` branches are checked
- ✅ Fallback query string check works
- ✅ Coordinates are properly extracted
- ✅ Region information (si, gu, dong) is correct

## Example Output

```
🧪 Starting Geocoder Integration Tests

📍 Test 1: Testing Gwanak-gu address
   Address: 서울 관악구 과천대로 863 (남현동)
   Result: {
    "si": "서울",
    "gu": "관악구",
    "dong": "남현동",
    "isServiceable": true,
    "lng": 126.985456910406,
    "lat": 37.4684519716459
}
   ✅ Validation passed via region_2depth_name check
   ✅ Test 1 PASSED

🎉 All tests PASSED!
```

## Environment Setup

The tests automatically load environment variables from `.env.local`:
- `KAKAO_CLIENT_ID`: Required for Kakao Local API access
- Other environment variables are loaded but not required for geocoder tests

## Troubleshooting

### Common Issues

1. **"KAKAO_CLIENT_ID environment variable is required"**
   - Ensure `.env.local` exists and contains `KAKAO_CLIENT_ID`
   - Check that the environment variable is properly formatted

2. **"Address not found" errors**
   - Verify internet connection
   - Check if Kakao Local API is accessible
   - Ensure the test address is valid

3. **Timeout errors**
   - Increase timeout values in test files
   - Check network connectivity
   - Verify Kakao API response times

### Debug Mode

To see detailed API responses, check the console output during test execution. The tests log the full geocoding results for debugging purposes.
