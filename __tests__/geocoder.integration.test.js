/**
 * Jest integration test for server-side geocoder
 * Tests Gwanak-gu validation with specific address
 */

const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    }
  }
}

// Load environment variables before importing the module
loadEnvFile();

// Import the geocoder function
const { geocodeAddress } = require('../lib/kakao.ts');

describe('Geocoder Integration Tests', () => {
  const testAddress = '서울 관악구 과천대로 863 (남현동)';
  const nonServiceableAddress = '서울 강남구 역삼동';
  
  beforeAll(() => {
    // Ensure KAKAO_CLIENT_ID is available
    if (!process.env.KAKAO_CLIENT_ID) {
      throw new Error('KAKAO_CLIENT_ID environment variable is required for tests');
    }
  });
  
  describe('Gwanak-gu address validation', () => {
    test('should return serviceable=true for Gwanak-gu address', async () => {
      console.log(`Testing address: ${testAddress}`);
      
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
    }, 10000); // 10 second timeout for API call
    
    test('should handle non-serviceable address', async () => {
      console.log(`Testing non-serviceable address: ${nonServiceableAddress}`);
      
      const result = await geocodeAddress(nonServiceableAddress);
      
      console.log('Non-serviceable result:', JSON.stringify(result, null, 2));
      
      // Assert non-serviceability
      expect(result.isServiceable).toBe(false);
      
      // Should still have region info
      expect(result.si).toBeDefined();
      expect(result.gu).toBeDefined();
      expect(result.dong).toBeDefined();
    }, 10000);
    
    test('should validate multiple Gwanak-gu addresses', async () => {
      const gwanakAddresses = [
        '서울 관악구 남현동',
        '서울 관악구 신림동',
        '서울 관악구 봉천동'
      ];
      
      for (const address of gwanakAddresses) {
        console.log(`Testing: ${address}`);
        
        const result = await geocodeAddress(address);
        
        // All Gwanak-gu addresses should be serviceable
        expect(result.isServiceable).toBe(true);
        expect(result.gu).toBe('관악구');
        
        console.log(`✅ ${address} - PASSED`);
      }
    }, 15000);
  });
  
  describe('Validation logic branches', () => {
    test('should check both road_address and address branches', async () => {
      // Test with an address that might have different road_address vs address
      const result = await geocodeAddress(testAddress);
      
      expect(result.isServiceable).toBe(true);
      expect(result.si).toBe('서울');
      expect(result.gu).toBe('관악구');
      expect(result.dong).toBe('남현동');
      
      // Verify coordinates are reasonable for Seoul
      expect(result.lat).toBeGreaterThan(37);
      expect(result.lat).toBeLessThan(38);
      expect(result.lng).toBeGreaterThan(126);
      expect(result.lng).toBeLessThan(128);
    }, 10000);
    
    test('should handle fallback query string check', async () => {
      // Test with an address that might only pass the fallback check
      const fallbackAddress = '관악구 테스트 주소';
      
      const result = await geocodeAddress(fallbackAddress);
      
      // Should be serviceable due to fallback check
      expect(result.isServiceable).toBe(true);
    }, 10000);
  });
  
  describe('Error handling', () => {
    test('should throw error for empty address', async () => {
      await expect(geocodeAddress('')).rejects.toThrow('Valid address is required');
    });
    
    test('should throw error for invalid address', async () => {
      await expect(geocodeAddress('invalid address that does not exist')).rejects.toThrow();
    });
  });
});
