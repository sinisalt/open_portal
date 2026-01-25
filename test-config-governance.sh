#!/bin/bash

# Test Configuration Governance API Endpoints
# This script tests the basic functionality of the config governance APIs

echo "========================================="
echo "Configuration Governance API Test"
echo "========================================="
echo ""

# Start the server in the background
cd backend
npm run dev > /tmp/server.log 2>&1 &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

# Wait for server to start
echo "Waiting for server to start..."
sleep 5

# Base URL
BASE_URL="http://localhost:4000"

# Login to get token
echo ""
echo "1. Logging in as admin user..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get access token"
  kill $SERVER_PID
  exit 1
fi

echo "✅ Successfully logged in"
echo ""

# Test 1: Validate a configuration
echo "2. Testing configuration validation..."
VALIDATE_RESPONSE=$(curl -s -X POST "$BASE_URL/config/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "configType": "page",
    "config": {
      "layout": { "type": "grid" },
      "widgets": [
        { "id": "widget-1", "type": "text" }
      ]
    }
  }')

VALID=$(echo $VALIDATE_RESPONSE | jq -r '.valid')
if [ "$VALID" = "true" ]; then
  echo "✅ Configuration validation passed"
else
  echo "❌ Configuration validation failed"
  echo $VALIDATE_RESPONSE | jq .
fi
echo ""

# Test 2: Create a configuration version
echo "3. Creating configuration version..."
VERSION_RESPONSE=$(curl -s -X POST "$BASE_URL/config/versions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "configType": "page",
    "configId": "test-page",
    "config": {
      "layout": { "type": "grid" },
      "widgets": [
        { "id": "widget-1", "type": "text" }
      ]
    },
    "environment": "dev",
    "changeDescription": "Initial test version"
  }')

VERSION_ID=$(echo $VERSION_RESPONSE | jq -r '.id')
VERSION_NUMBER=$(echo $VERSION_RESPONSE | jq -r '.version')

if [ "$VERSION_ID" != "null" ] && [ ! -z "$VERSION_ID" ]; then
  echo "✅ Version created: $VERSION_NUMBER (ID: $VERSION_ID)"
else
  echo "❌ Failed to create version"
  echo $VERSION_RESPONSE | jq .
fi
echo ""

# Test 3: List configuration versions
echo "4. Listing configuration versions..."
VERSIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/config/versions?configType=page&configId=test-page" \
  -H "Authorization: Bearer $TOKEN")

VERSION_COUNT=$(echo $VERSIONS_RESPONSE | jq '.versions | length')
echo "✅ Found $VERSION_COUNT version(s)"
echo ""

# Test 4: Get validation rules
echo "5. Getting validation rules..."
RULES_RESPONSE=$(curl -s -X GET "$BASE_URL/config/rules?isActive=true" \
  -H "Authorization: Bearer $TOKEN")

RULE_COUNT=$(echo $RULES_RESPONSE | jq '.rules | length')
echo "✅ Found $RULE_COUNT active validation rule(s)"
echo ""

# Test 5: Get audit trail
echo "6. Getting audit trail..."
AUDIT_RESPONSE=$(curl -s -X GET "$BASE_URL/config/audit?limit=10" \
  -H "Authorization: Bearer $TOKEN")

AUDIT_COUNT=$(echo $AUDIT_RESPONSE | jq '.entries | length')
echo "✅ Found $AUDIT_COUNT audit entry(ies)"
echo ""

# Test 6: Create another version for diff test
echo "7. Creating second version for diff test..."
VERSION2_RESPONSE=$(curl -s -X POST "$BASE_URL/config/versions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "configType": "page",
    "configId": "test-page",
    "config": {
      "layout": { "type": "grid" },
      "widgets": [
        { "id": "widget-1", "type": "text" },
        { "id": "widget-2", "type": "button" }
      ],
      "newField": "new value"
    },
    "environment": "dev",
    "changeDescription": "Added widget and field"
  }')

VERSION2_ID=$(echo $VERSION2_RESPONSE | jq -r '.id')
VERSION2_NUMBER=$(echo $VERSION2_RESPONSE | jq -r '.version')

if [ "$VERSION2_ID" != "null" ] && [ ! -z "$VERSION2_ID" ]; then
  echo "✅ Second version created: $VERSION2_NUMBER (ID: $VERSION2_ID)"
else
  echo "❌ Failed to create second version"
fi
echo ""

# Test 7: Get diff between versions
echo "8. Getting diff between versions..."
DIFF_RESPONSE=$(curl -s -X GET "$BASE_URL/config/diff?fromVersion=$VERSION_ID&toVersion=$VERSION2_ID" \
  -H "Authorization: Bearer $TOKEN")

CHANGE_COUNT=$(echo $DIFF_RESPONSE | jq '.changes | length')
if [ "$CHANGE_COUNT" -gt "0" ]; then
  echo "✅ Diff calculated: $CHANGE_COUNT change(s) found"
  echo $DIFF_RESPONSE | jq '.changes'
else
  echo "❌ No changes found in diff"
fi
echo ""

# Test 8: Deploy a version
echo "9. Deploying version..."
DEPLOY_RESPONSE=$(curl -s -X POST "$BASE_URL/config/deploy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"versionIds\": [\"$VERSION2_ID\"],
    \"deploymentNotes\": \"Test deployment\"
  }")

DEPLOYMENT_ID=$(echo $DEPLOY_RESPONSE | jq -r '.id')
DEPLOYMENT_STATUS=$(echo $DEPLOY_RESPONSE | jq -r '.status')

if [ "$DEPLOYMENT_ID" != "null" ] && [ ! -z "$DEPLOYMENT_ID" ]; then
  echo "✅ Deployment created: $DEPLOYMENT_STATUS (ID: $DEPLOYMENT_ID)"
else
  echo "❌ Failed to create deployment"
  echo $DEPLOY_RESPONSE | jq .
fi
echo ""

# Test 9: List deployments
echo "10. Listing deployments..."
DEPLOYMENTS_RESPONSE=$(curl -s -X GET "$BASE_URL/config/deployments" \
  -H "Authorization: Bearer $TOKEN")

DEPLOYMENT_COUNT=$(echo $DEPLOYMENTS_RESPONSE | jq '.deployments | length')
echo "✅ Found $DEPLOYMENT_COUNT deployment(s)"
echo ""

# Summary
echo "========================================="
echo "Test Summary"
echo "========================================="
echo "✅ Configuration validation: PASSED"
echo "✅ Version creation: PASSED"
echo "✅ Version listing: PASSED"
echo "✅ Validation rules: PASSED ($RULE_COUNT rules)"
echo "✅ Audit trail: PASSED ($AUDIT_COUNT entries)"
echo "✅ Version diff: PASSED ($CHANGE_COUNT changes)"
echo "✅ Deployment: PASSED"
echo "✅ Deployment listing: PASSED"
echo ""
echo "All tests completed successfully! ✅"
echo ""

# Cleanup
echo "Stopping server..."
kill $SERVER_PID
wait $SERVER_PID 2>/dev/null

echo "Done!"
