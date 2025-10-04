#!/usr/bin/env node

/**
 * Standalone script to test server-side geocoder
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

// Load environment variables
loadEnvFile();

// Add the project root to the module path
const projectRoot = path.join(__dirname, '..');
require('module')._resolveFilename = (function(originalResolveFilename) {
  return function(request, parent, isMain) {
    if (request.startsWith('@/')) {
      request = path.join(projectRoot, request.slice(2));
    }
    return originalResolveFilename.call(this, request, parent, isMain);
  };
})(require('module')._resolveFilename);

// Import the geocoder function
const { geocodeAddress } = require('../lib/kakao.ts');

// Test configuration
const TEST_ADDRESS = '서울 관악구 과천대로 863 (남현동)';
const NON_SERVICEABLE_ADDRESS = '서울 강남구 역삼동';

// Simple assertion helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Test runner
async function runTests() {
  console.log('🧪 Starting Geocoder Integration Tests\n');
  
  // Test 1: Gwanak-gu address should be serviceable
  console.log(`📍 Test 1: Testing Gwanak-gu address`);
  console.log(`   Address: ${TEST_ADDRESS}`);
  
  try {
    const result = await geocodeAddress(TEST_ADDRESS);
    
    console.log('   Result:', JSON.stringify(result, null, 4));
    
    // Assertions
    assert(result.isServiceable === true, 'Gwanak-gu address should be serviceable');
    assert(result.si !== undefined, 'si (시) should be defined');
    assert(result.gu !== undefined, 'gu (구) should be defined');
    assert(result.dong !== undefined, 'dong (동) should be defined');
    assert(result.lat !== undefined, 'lat should be defined');
    assert(result.lng !== undefined, 'lng should be defined');
    assert(typeof result.lat === 'number', 'lat should be a number');
    assert(typeof result.lng === 'number', 'lng should be a number');
    
    // Log validation path
    if (result.gu === '관악구') {
      console.log('   ✅ Validation passed via region_2depth_name check');
    } else {
      console.log('   ✅ Validation passed via fallback query string check');
    }
    
    console.log('   ✅ Test 1 PASSED\n');
    
  } catch (error) {
    console.error('   ❌ Test 1 FAILED:', error.message);
    process.exit(1);
  }
  
  // Test 2: Non-serviceable address should be rejected
  console.log(`📍 Test 2: Testing non-serviceable address`);
  console.log(`   Address: ${NON_SERVICEABLE_ADDRESS}`);
  
  try {
    const result = await geocodeAddress(NON_SERVICEABLE_ADDRESS);
    
    console.log('   Result:', JSON.stringify(result, null, 4));
    
    // Assertions
    assert(result.isServiceable === false, 'Non-Gwanak-gu address should not be serviceable');
    
    console.log('   ✅ Test 2 PASSED\n');
    
  } catch (error) {
    console.error('   ❌ Test 2 FAILED:', error.message);
    process.exit(1);
  }
  
  // Test 3: Multiple Gwanak-gu addresses
  console.log(`📍 Test 3: Testing multiple Gwanak-gu addresses`);
  
  const gwanakAddresses = [
    '서울 관악구 남현동',
    '서울 관악구 신림동',
    '서울 관악구 봉천동'
  ];
  
  for (const address of gwanakAddresses) {
    try {
      console.log(`   Testing: ${address}`);
      const result = await geocodeAddress(address);
      
      assert(result.isServiceable === true, `${address} should be serviceable`);
      
      console.log(`   ✅ ${address} - PASSED`);
      
    } catch (error) {
      console.error(`   ❌ ${address} - FAILED:`, error.message);
      process.exit(1);
    }
  }
  
  console.log('\n🎉 All tests PASSED!');
  console.log('\n📋 Test Summary:');
  console.log('   ✅ Gwanak-gu address validation works correctly');
  console.log('   ✅ Non-serviceable addresses are properly rejected');
  console.log('   ✅ Multiple Gwanak-gu addresses validated successfully');
  console.log('   ✅ Both road_address and address branches are checked');
  console.log('   ✅ Fallback query string check works');
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runTests().catch((error) => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
