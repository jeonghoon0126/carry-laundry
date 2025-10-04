/**
 * Test script for the orders API endpoint
 * Make sure the dev server is running: npm run dev
 */

async function testOrderAPI(orderData, expectedStatus) {
  console.log(`\n🧪 Testing order creation:`);
  console.log(`Name: ${orderData.name}`);
  console.log(`Address: ${orderData.address}`);
  console.log(`Expected status: ${expectedStatus}`);
  
  try {
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();
    
    console.log(`✅ Response status: ${response.status}`);
    console.log(`📄 Response body:`, result);
    
    if (response.status === expectedStatus) {
      console.log(`✅ Test PASSED: Got expected status ${expectedStatus}`);
    } else {
      console.log(`❌ Test FAILED: Expected ${expectedStatus}, got ${response.status}`);
    }
    
    return { status: response.status, data: result };

  } catch (error) {
    console.log(`❌ Error:`, error.message);
    return null;
  }
}

async function runAPITests() {
  console.log('🚀 Testing Orders API Endpoint');
  console.log('Make sure the dev server is running on http://localhost:3000\n');

  // Test 1: Valid Gwanak-gu address (should succeed)
  await testOrderAPI({
    name: '테스트 사용자',
    phone: '010-1234-5678',
    address: '서울특별시 관악구 신림동',
    user_id: 'test-user-123'
  }, 201);

  // Test 2: Invalid address outside Gwanak-gu (should fail with 422)
  await testOrderAPI({
    name: '테스트 사용자2',
    phone: '010-9876-5432',
    address: '서울특별시 강남구 역삼동',
    user_id: 'test-user-456'
  }, 422);

  // Test 3: Missing required fields (should fail with 400)
  await testOrderAPI({
    phone: '010-1111-2222',
    address: '서울특별시 관악구 봉천동'
    // Missing name
  }, 400);

  // Test 4: Invalid address format (should fail with 400)
  await testOrderAPI({
    name: '테스트 사용자3',
    phone: '010-3333-4444',
    address: '잘못된 주소 형식'
  }, 400);

  console.log('\n🏁 API tests completed!');
}

// Only run if this script is executed directly
if (require.main === module) {
  runAPITests().catch(console.error);
}

module.exports = { testOrderAPI };
