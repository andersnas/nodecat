#!/bin/bash

# Set your API endpoint
API_URL="http://localhost:3000"

# Test data to create a token
TOKEN_PAYLOAD='{"exp":1829693926,"sub":"TheCatHunter","catr":{"expext":70,"renewabletype":2,"deadline":0}}'

# Create token using the API
echo "Creating token..."
CREATE_TOKEN_RESPONSE=$(curl -s -X POST "$API_URL/generateToken" \
  -H "Content-Type: application/json" \
  --data-raw "$TOKEN_PAYLOAD")

# Check if token was generated successfully
if [ -z "$CREATE_TOKEN_RESPONSE" ]; then
  echo "Token generation failed."
  exit 1
fi

echo "Token generated: $CREATE_TOKEN_RESPONSE"

# Validate the generated token
echo "Validating token..."
VALIDATE_TOKEN_RESPONSE=$(curl -s -X POST "$API_URL/validateToken" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$CREATE_TOKEN_RESPONSE\"}")

# Check if token validation was successful
if echo "$VALIDATE_TOKEN_RESPONSE" | grep -q '"status":"Token is valid"'; then
  echo "Token is valid: $VALIDATE_TOKEN_RESPONSE"
else
  echo "Token validation failed: $VALIDATE_TOKEN_RESPONSE"
  exit 1
fi

echo "Test completed successfully."
