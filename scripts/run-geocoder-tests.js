#!/usr/bin/env node

/**
 * Simple test runner for geocoder tests
 * Runs without external dependencies
 */

const { runTests } = require('./test-geocoder.js');

async function main() {
  console.log('🚀 Running Geocoder Integration Tests\n');
  
  try {
    await runTests();
    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
