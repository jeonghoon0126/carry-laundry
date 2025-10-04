/**
 * Test script for Kakao geocoding functionality
 * Run with: node test-geocoding.js
 */

// Simple test of the geocoding logic (without TypeScript)
async function testGeocode(addr) {
  // Read from environment - make sure to set KAKAO_CLIENT_ID
  const kakaoClientId = process.env.KAKAO_CLIENT_ID || 'd4d4b1bace236136ca0dea3bd5258ddf';
  
  if (!kakaoClientId) {
    throw new Error('KAKAO_CLIENT_ID environment variable is required');
  }

  console.log(`Testing address: ${addr}`);
  
  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(addr)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `KakaoAK ${kakaoClientId}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Kakao API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.documents || data.documents.length === 0) {
      console.log('❌ Address not found');
      return null;
    }

    const firstResult = data.documents[0];
    const addressInfo = firstResult.road_address || firstResult.address;
    
    if (!addressInfo) {
      console.log('❌ No address information available');
      return null;
    }

    const result = {
      si: addressInfo.region_1depth_name,
      gu: addressInfo.region_2depth_name,
      dong: addressInfo.region_3depth_name,
      lat: firstResult.y ? parseFloat(firstResult.y) : null,
      lng: firstResult.x ? parseFloat(firstResult.x) : null,
    };

    console.log('✅ Geocoding result:', result);
    
    // Test Gwanak-gu validation
    const isGwanakGu = (result.si === "서울특별시" && result.gu === "관악구") || 
                       (result.si === "서울" && result.gu === "관악구");
    
    console.log(`🏠 Service area check: ${isGwanakGu ? '✅ Serviceable (Gwanak-gu)' : '❌ Not serviceable'}`);
    
    return result;

  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Testing Kakao Geocoding API\n');
  
  // Test cases
  const testAddresses = [
    '서울특별시 관악구 신림동', // Should be serviceable
    '서울특별시 관악구 봉천동', // Should be serviceable
    '서울특별시 강남구 역삼동', // Should NOT be serviceable
    '서울특별시 종로구 청운동', // Should NOT be serviceable
    '부산광역시 해운대구 우동', // Should NOT be serviceable
  ];

  for (const addr of testAddresses) {
    await testGeocode(addr);
    console.log('---');
  }
}

runTests().catch(console.error);
