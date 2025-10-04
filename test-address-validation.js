/**
 * Test script for address validation API
 * Run with: node test-address-validation.js
 * Make sure the dev server is running: npm run dev
 */

async function testAddressValidation(address, expectedServiceable) {
  console.log(`\n🧪 Testing address: ${address}`);
  console.log(`Expected serviceable: ${expectedServiceable}`);
  
  try {
    const response = await fetch(`http://localhost:3000/api/geo/preview?address=${encodeURIComponent(address)}`);
    const result = await response.json();
    
    console.log(`✅ Response status: ${response.status}`);
    console.log(`📄 Response:`, result);
    
    if (response.ok && result.isServiceable === expectedServiceable) {
      console.log(`✅ Test PASSED: Service area validation correct`);
    } else if (response.ok) {
      console.log(`❌ Test FAILED: Expected serviceable=${expectedServiceable}, got ${result.isServiceable}`);
    } else {
      console.log(`❌ Test FAILED: API error - ${result.error}`);
    }
    
    return result;

  } catch (error) {
    console.log(`❌ Error:`, error.message);
    return null;
  }
}

async function runValidationTests() {
  console.log('🚀 Testing Address Validation API');
  console.log('Make sure the dev server is running on http://localhost:3000\n');

  // Test cases
  const testCases = [
    { address: '서울특별시 관악구 신림동', expected: true },
    { address: '서울특별시 관악구 봉천동', expected: true },
    { address: '서울특별시 강남구 역삼동', expected: false },
    { address: '서울특별시 종로구 청운동', expected: false },
    { address: '부산광역시 해운대구 우동', expected: false },
    { address: '잘못된 주소', expected: false }, // Should return error
    { address: '', expected: false }, // Should return error
  ];

  for (const testCase of testCases) {
    await testAddressValidation(testCase.address, testCase.expected);
    console.log('---');
  }

  console.log('\n🏁 Address validation tests completed!');
}

// Only run if this script is executed directly
if (require.main === module) {
  runValidationTests().catch(console.error);
}

module.exports = { testAddressValidation };
