/**
 * Unit-style integration test for server-side geocoder
 * Tests Gwanak-gu validation with specific address
 */

const { geocodeAddress } = require('../lib/kakao.ts');

// Mock environment variable for testing
process.env.KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || 'test_key';

describe('Geocoder Integration Test', () => {
  const testAddress = '서울 관악구 과천대로 863 (남현동)';
  
  test('should return serviceable=true for Gwanak-gu address', async () => {
    console.log(`Testing address: ${testAddress}`);
    
    try {
      const result = await geocodeAddress(testAddress);
      
      console.log('Geocoding result:', JSON.stringify(result, null, 2));
      
      // Assert serviceability
      expect(result.isServiceable).toBe(true);
      
      // Assert region info
      expect(result.si).toBeDefined();
      expect(result.gu).toBeDefined();
      expect(result.dong).toBeDefined();
      
      // Assert coordinates
      expect(result.lat).toBeDefined();
      expect(result.lng).toBeDefined();
      expect(typeof result.lat).toBe('number');
      expect(typeof result.lng).toBe('number');
      
      // Log the specific validation path that succeeded
      if (result.gu === '관악구') {
        console.log('✅ Validation passed via region_2depth_name check');
      } else {
        console.log('✅ Validation passed via fallback query string check');
      }
      
      console.log('✅ All assertions passed');
      
    } catch (error) {
      console.error('❌ Test failed with error:', error.message);
      throw error;
    }
  }, 10000); // 10 second timeout for API call
  
  test('should handle non-serviceable address', async () => {
    const nonServiceableAddress = '서울 강남구 역삼동';
    
    try {
      const result = await geocodeAddress(nonServiceableAddress);
      
      console.log('Non-serviceable result:', JSON.stringify(result, null, 2));
      
      // Assert non-serviceability
      expect(result.isServiceable).toBe(false);
      
      console.log('✅ Non-serviceable address correctly rejected');
      
    } catch (error) {
      console.error('❌ Non-serviceable test failed:', error.message);
      throw error;
    }
  }, 10000);
  
  test('should validate both road_address and address branches', async () => {
    // Test with an address that might have different road_address vs address
    const testAddresses = [
      '서울 관악구 남현동',
      '서울 관악구 신림동',
      '서울 관악구 봉천동'
    ];
    
    for (const address of testAddresses) {
      try {
        const result = await geocodeAddress(address);
        
        console.log(`Testing ${address}:`, {
          isServiceable: result.isServiceable,
          si: result.si,
          gu: result.gu,
          dong: result.dong
        });
        
        // All Gwanak-gu addresses should be serviceable
        expect(result.isServiceable).toBe(true);
        
      } catch (error) {
        console.error(`❌ Failed for ${address}:`, error.message);
        throw error;
      }
    }
    
    console.log('✅ All Gwanak-gu addresses validated successfully');
  }, 15000);
});

// Simple assertion helper for Node.js environment
function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error('Expected value to be defined, but got undefined');
      }
    },
    toBeInstanceOf(constructor) {
      if (!(actual instanceof constructor)) {
        throw new Error(`Expected ${actual} to be instance of ${constructor.name}`);
      }
    }
  };
}

// Export for use as standalone script
module.exports = { expect };
