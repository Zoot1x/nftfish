#!/bin/bash

# Test script for Gift Spin Wheel Backend API
# Make sure backend is running on http://localhost:3001

API_URL="http://localhost:3001"
PHONE="+79991234567"  # Change this to your phone number

echo "Testing Gift Spin Wheel Backend API"
echo "===================================="
echo ""

# Test 1: Send authentication code
echo "Test 1: Sending authentication code..."
echo "Phone: $PHONE"
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/api/auth/send-code" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"$PHONE\"}")

echo "Response:"
echo "$RESPONSE" | json_pp 2>/dev/null || echo "$RESPONSE"
echo ""

# Extract phone_code_hash from response
PHONE_CODE_HASH=$(echo "$RESPONSE" | grep -o '"phone_code_hash":"[^"]*' | cut -d'"' -f4)

if [ -z "$PHONE_CODE_HASH" ]; then
  echo "ERROR: Could not extract phone_code_hash from response"
  exit 1
fi

echo "Phone Code Hash: $PHONE_CODE_HASH"
echo ""
echo "Check your Telegram for the 5-digit code and enter it below:"
read -p "Code: " CODE

if [ -z "$CODE" ]; then
  echo "No code entered. Exiting."
  exit 1
fi

# Test 2: Verify authentication code
echo ""
echo "Test 2: Verifying authentication code..."
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/api/auth/verify-code" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"$PHONE\", \"code\": \"$CODE\", \"phone_code_hash\": \"$PHONE_CODE_HASH\"}")

echo "Response:"
echo "$RESPONSE" | json_pp 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if password is needed
if echo "$RESPONSE" | grep -q '"password_needed"'; then
  echo "2FA password required!"
  read -sp "Enter 2FA password: " PASSWORD
  echo ""
  
  # Test 3: Verify password
  echo "Test 3: Verifying 2FA password..."
  echo ""
  
  RESPONSE=$(curl -s -X POST "$API_URL/api/auth/verify-password" \
    -H "Content-Type: application/json" \
    -d "{\"phone\": \"$PHONE\", \"password\": \"$PASSWORD\", \"phone_code_hash\": \"$PHONE_CODE_HASH\", \"code\": \"$CODE\"}")
  
  echo "Response:"
  echo "$RESPONSE" | json_pp 2>/dev/null || echo "$RESPONSE"
else
  echo "Authentication successful without 2FA!"
fi

echo ""
echo "Test completed!"
