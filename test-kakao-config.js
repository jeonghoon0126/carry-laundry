#!/usr/bin/env node

// Test script to verify Kakao OAuth configuration
const fs = require('fs');
const path = require('path');

console.log('🔍 Kakao OAuth Configuration Test\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('Please create .env.local with your Kakao credentials.');
  process.exit(1);
}

// Read .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

console.log('📋 Environment Variables Check:');
console.log('NEXTAUTH_URL:', envVars.NEXTAUTH_URL || '❌ NOT SET');
console.log('NEXTAUTH_SECRET:', envVars.NEXTAUTH_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('KAKAO_CLIENT_ID:', envVars.KAKAO_CLIENT_ID ? '✅ SET' : '❌ NOT SET');
console.log('KAKAO_CLIENT_SECRET:', envVars.KAKAO_CLIENT_SECRET ? '✅ SET' : '⚠️  NOT SET (may be OK)');

// Validate KAKAO_CLIENT_ID
if (!envVars.KAKAO_CLIENT_ID) {
  console.error('\n❌ KAKAO_CLIENT_ID is not set!');
} else if (envVars.KAKAO_CLIENT_ID === 'your_kakao_rest_api_key' || 
           envVars.KAKAO_CLIENT_ID === 'REPLACE_WITH_YOUR_ACTUAL_KAKAO_REST_API_KEY') {
  console.error('\n❌ KAKAO_CLIENT_ID is using placeholder value!');
  console.log('Please replace with your actual Kakao REST API key.');
} else {
  console.log('\n✅ KAKAO_CLIENT_ID appears to be set correctly');
  console.log('Key (last 4 chars):', envVars.KAKAO_CLIENT_ID.slice(-4));
}

// Validate NEXTAUTH_URL
if (envVars.NEXTAUTH_URL === 'http://localhost:3000') {
  console.log('\n✅ NEXTAUTH_URL is correct for localhost');
} else {
  console.log('\n⚠️  NEXTAUTH_URL:', envVars.NEXTAUTH_URL);
}

console.log('\n📝 Next Steps:');
console.log('1. Update KAKAO_CLIENT_ID with your actual Kakao REST API key');
console.log('2. Configure Kakao Developers Console:');
console.log('   - Platform > Web: http://localhost:3000');
console.log('   - Redirect URI: http://localhost:3000/api/auth/callback/kakao');
console.log('3. Restart development server: npm run dev');
console.log('4. Test: http://localhost:3000/api/auth/signin');



