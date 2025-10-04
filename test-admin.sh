#!/bin/bash

echo "🔐 Testing Admin System Security"
echo "================================"

echo ""
echo "1. Testing admin access without credentials (should get 401):"
echo "------------------------------------------------------------"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/admin

echo ""
echo "2. Testing admin access with correct credentials (should get 200):"
echo "------------------------------------------------------------------"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" -u "admin:secure_admin_password_123" http://localhost:3000/admin

echo ""
echo "3. Testing orders API with credentials (should get 200):"
echo "--------------------------------------------------------"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" -u "admin:secure_admin_password_123" http://localhost:3000/api/orders

echo ""
echo "4. Testing orders API response content:"
echo "---------------------------------------"
echo "Response:"
curl -s -u "admin:secure_admin_password_123" http://localhost:3000/api/orders | jq . 2>/dev/null || curl -s -u "admin:secure_admin_password_123" http://localhost:3000/api/orders

echo ""
echo "✅ Test complete!"
echo ""
echo "Expected results:"
echo "- Admin without credentials: 401"
echo "- Admin with credentials: 200" 
echo "- Orders API: 200 with data (not 'Invalid API key')"



