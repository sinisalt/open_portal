#!/bin/bash

# Phase 1 Integration Testing Script
# Tests backend APIs and captures results

BASE_URL="http://localhost:4000"
OUTPUT_DIR="/tmp/phase1-test-results"
mkdir -p "$OUTPUT_DIR"

echo "==================================="
echo "Phase 1 Integration Testing"
echo "==================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Function to test an endpoint
test_endpoint() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local token="$5"
    local expected_status="$6"
    
    echo -e "${YELLOW}Testing: ${test_name}${NC}"
    
    # Build curl command
    if [ -n "$token" ]; then
        auth_header="-H \"Authorization: Bearer $token\""
    else
        auth_header=""
    fi
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" $auth_header "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" $auth_header -d "$data" "$BASE_URL$endpoint")
    fi
    
    # Split response and status code
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    # Save response
    echo "$body" | jq '.' > "$OUTPUT_DIR/${test_name// /-}.json" 2>/dev/null || echo "$body" > "$OUTPUT_DIR/${test_name// /-}.txt"
    
    # Check status code
    if [ "$status_code" == "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} - Status: $status_code"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAILED${NC} - Expected: $expected_status, Got: $status_code"
        FAILED=$((FAILED + 1))
    fi
    
    # Show response summary
    echo "Response: $(echo "$body" | jq -c '.' 2>/dev/null || echo "$body" | head -c 200)"
    echo ""
}

# Test 1: Health Check
test_endpoint "01 Health Check" "GET" "/health" "" "" "200"

# Test 2: Login as Admin
echo -e "${YELLOW}Testing: 02 Admin Login${NC}"
login_response=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"username":"admin@example.com","password":"admin123"}' \
  "$BASE_URL/auth/login")
echo "$login_response" | jq '.' > "$OUTPUT_DIR/02-Admin-Login.json"
admin_token=$(echo "$login_response" | jq -r '.token')
if [ -n "$admin_token" ] && [ "$admin_token" != "null" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Admin token obtained"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} - Could not get admin token"
    FAILED=$((FAILED + 1))
    exit 1
fi
echo ""

# Test 3: Login as User
echo -e "${YELLOW}Testing: 03 User Login${NC}"
user_login_response=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"username":"user@example.com","password":"user123"}' \
  "$BASE_URL/auth/login")
echo "$user_login_response" | jq '.' > "$OUTPUT_DIR/03-User-Login.json"
user_token=$(echo "$user_login_response" | jq -r '.token')
if [ -n "$user_token" ] && [ "$user_token" != "null" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - User token obtained"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} - Could not get user token"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 4: Bootstrap Configuration
echo -e "${YELLOW}Testing: 04 Bootstrap Configuration${NC}"
bootstrap_response=$(curl -s -H "Authorization: Bearer $admin_token" "$BASE_URL/ui/bootstrap")
echo "$bootstrap_response" | jq '.' > "$OUTPUT_DIR/04-Bootstrap-Configuration.json"
if echo "$bootstrap_response" | jq -e '.user.id' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC} - Bootstrap config retrieved"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} - Bootstrap config invalid"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 5: Branding Configuration
echo -e "${YELLOW}Testing: 05 Branding Configuration${NC}"
branding_response=$(curl -s -H "Authorization: Bearer $admin_token" "$BASE_URL/ui/branding")
echo "$branding_response" | jq '.' > "$OUTPUT_DIR/05-Branding-Configuration.json"
if echo "$branding_response" | jq -e '.colors.primary' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC} - Branding config retrieved"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} - Branding config invalid"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 6: Route Resolution
echo -e "${YELLOW}Testing: 06 Route Resolution${NC}"
route_response=$(curl -s -H "Authorization: Bearer $admin_token" "$BASE_URL/ui/routes/resolve?path=/dashboard")
echo "$route_response" | jq '.' > "$OUTPUT_DIR/06-Route-Resolution.json"
if echo "$route_response" | jq -e '.pageId' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC} - Route resolved"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} - Route resolution failed"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 7: Dashboard Page Config
echo -e "${YELLOW}Testing: 07 Dashboard Page Configuration${NC}"
dashboard_response=$(curl -s -H "Authorization: Bearer $admin_token" "$BASE_URL/ui/pages/dashboard-enhanced")
echo "$dashboard_response" | jq '.' > "$OUTPUT_DIR/07-Dashboard-Page-Configuration.json"
if echo "$dashboard_response" | jq -e '.config.widgets' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC} - Dashboard config retrieved"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} - Dashboard config invalid"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 8: Profile Page Config
echo -e "${YELLOW}Testing: 08 Profile Page Configuration${NC}"
profile_response=$(curl -s -H "Authorization: Bearer $admin_token" "$BASE_URL/ui/pages/profile")
echo "$profile_response" | jq '.' > "$OUTPUT_DIR/08-Profile-Page-Configuration.json"
if echo "$profile_response" | jq -e '.config.widgets' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC} - Profile config retrieved"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} - Profile config invalid"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 9: Listings Page Config
echo -e "${YELLOW}Testing: 09 Listings Page Configuration${NC}"
listings_response=$(curl -s -H "Authorization: Bearer $admin_token" "$BASE_URL/ui/pages/listings")
echo "$listings_response" | jq '.' > "$OUTPUT_DIR/09-Listings-Page-Configuration.json"
if echo "$listings_response" | jq -e '.config.widgets' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC} - Listings config retrieved"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} - Listings config invalid"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 10: Create Record Action
echo -e "${YELLOW}Testing: 10 Create Record Action${NC}"
create_response=$(curl -s -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer $admin_token" \
  -d '{"actionId":"createRecord","params":{"collection":"tasks","data":{"title":"Test Task","status":"pending"}}}' \
  "$BASE_URL/ui/actions/execute")
echo "$create_response" | jq '.' > "$OUTPUT_DIR/10-Create-Record-Action.json"
record_id=$(echo "$create_response" | jq -r '.data.id')
if [ -n "$record_id" ] && [ "$record_id" != "null" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Record created with ID: $record_id"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} - Record creation failed"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 11: Query Records
echo -e "${YELLOW}Testing: 11 Query Records${NC}"
query_response=$(curl -s -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer $admin_token" \
  -d '{"actionId":"executeQuery","params":{"collection":"tasks"}}' \
  "$BASE_URL/ui/actions/execute")
echo "$query_response" | jq '.' > "$OUTPUT_DIR/11-Query-Records.json"
if echo "$query_response" | jq -e '.data.records' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC} - Query executed"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} - Query failed"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 12: Update Record
echo -e "${YELLOW}Testing: 12 Update Record Action${NC}"
update_response=$(curl -s -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer $admin_token" \
  -d "{\"actionId\":\"updateRecord\",\"params\":{\"collection\":\"tasks\",\"id\":\"$record_id\",\"data\":{\"status\":\"completed\"}}}" \
  "$BASE_URL/ui/actions/execute")
echo "$update_response" | jq '.' > "$OUTPUT_DIR/12-Update-Record-Action.json"
if echo "$update_response" | jq -e '.data.record' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC} - Record updated"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} - Record update failed"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 13: Delete Record
echo -e "${YELLOW}Testing: 13 Delete Record Action${NC}"
delete_response=$(curl -s -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer $admin_token" \
  -d "{\"actionId\":\"deleteRecord\",\"params\":{\"collection\":\"tasks\",\"id\":\"$record_id\"}}" \
  "$BASE_URL/ui/actions/execute")
echo "$delete_response" | jq '.' > "$OUTPUT_DIR/13-Delete-Record-Action.json"
if echo "$delete_response" | jq -e '.data' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC} - Record deleted"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} - Record deletion failed"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 14: Get Audit Logs
echo -e "${YELLOW}Testing: 14 Get Audit Logs${NC}"
audit_response=$(curl -s -H "Authorization: Bearer $admin_token" "$BASE_URL/ui/actions/audit?limit=10")
echo "$audit_response" | jq '.' > "$OUTPUT_DIR/14-Audit-Logs.json"
if echo "$audit_response" | jq -e '.[0].id' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC} - Audit logs retrieved"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} - Audit logs retrieval failed"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 15: Permission Check (User trying to delete - should fail)
echo -e "${YELLOW}Testing: 15 Permission Check (User Delete - Should Fail)${NC}"
perm_response=$(curl -s -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer $user_token" \
  -d '{"actionId":"deleteRecord","params":{"collection":"tasks","id":"test-id"}}' \
  "$BASE_URL/ui/actions/execute")
echo "$perm_response" | jq '.' > "$OUTPUT_DIR/15-Permission-Check.json"
if echo "$perm_response" | jq -e '.errors' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC} - Permission denied as expected"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} - Permission check failed"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 16: Invalid Action ID
echo -e "${YELLOW}Testing: 16 Invalid Action ID${NC}"
invalid_response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer $admin_token" \
  -d '{"actionId":"nonExistentAction","params":{}}' \
  "$BASE_URL/ui/actions/execute")
status_code=$(echo "$invalid_response" | tail -n1)
body=$(echo "$invalid_response" | head -n-1)
echo "$body" | jq '.' > "$OUTPUT_DIR/16-Invalid-Action.json"
if [ "$status_code" == "404" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Invalid action rejected with 404"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} - Expected 404, got $status_code"
    FAILED=$((FAILED + 1))
fi
echo ""

# Summary
echo "==================================="
echo "Test Results Summary"
echo "==================================="
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""
echo "Test results saved to: $OUTPUT_DIR"
echo "==================================="

# Exit with error if any tests failed
if [ $FAILED -gt 0 ]; then
    exit 1
fi
