#!/bin/bash

# CORS Test Script
# Tests if WordPress is sending correct CORS headers

echo "🧪 Testing CORS Headers for Custom Reviews API"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
WORDPRESS_URL="https://woocommerce.rshossain.com"
ORIGIN="http://localhost:5300"
ENDPOINT="${WORDPRESS_URL}/wp-json/custom/v1/reviews"

echo "📍 Testing endpoint: ${ENDPOINT}"
echo "🌐 Origin: ${ORIGIN}"
echo ""

# Test 1: OPTIONS Preflight
echo "Test 1: OPTIONS Preflight Request"
echo "-----------------------------------"
RESPONSE=$(curl -s -X OPTIONS \
  -H "Origin: ${ORIGIN}" \
  -H "Access-Control-Request-Method: POST" \
  -i \
  "${ENDPOINT}" 2>&1)

echo "$RESPONSE"
echo ""

# Check for correct origin
if echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin: ${ORIGIN}"; then
    echo -e "${GREEN}✅ Correct: Access-Control-Allow-Origin: ${ORIGIN}${NC}"
elif echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin: \*"; then
    echo -e "${RED}❌ WRONG: Access-Control-Allow-Origin: * (wildcard found!)${NC}"
    echo -e "${YELLOW}⚠️  This is the problem! See CORS-TROUBLESHOOTING.md${NC}"
else
    echo -e "${YELLOW}⚠️  No Access-Control-Allow-Origin header found${NC}"
fi

# Check for credentials
if echo "$RESPONSE" | grep -q "Access-Control-Allow-Credentials: true"; then
    echo -e "${GREEN}✅ Correct: Access-Control-Allow-Credentials: true${NC}"
else
    echo -e "${RED}❌ Missing: Access-Control-Allow-Credentials: true${NC}"
fi

echo ""
echo "Test 2: GET Request"
echo "-----------------------------------"
RESPONSE2=$(curl -s -X GET \
  -H "Origin: ${ORIGIN}" \
  -i \
  "${ENDPOINT}" 2>&1)

echo "$RESPONSE2" | head -20
echo ""

# Check for correct origin in GET
if echo "$RESPONSE2" | grep -q "Access-Control-Allow-Origin: ${ORIGIN}"; then
    echo -e "${GREEN}✅ GET: Correct origin${NC}"
elif echo "$RESPONSE2" | grep -q "Access-Control-Allow-Origin: \*"; then
    echo -e "${RED}❌ GET: Wildcard found${NC}"
fi

echo ""
echo "================================================"
echo "📋 Summary"
echo "================================================"

# Final verdict
if echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin: \*"; then
    echo -e "${RED}❌ FAILED: Wildcard '*' detected${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Update WordPress plugin (upload new custom-reviews-api.php)"
    echo "2. Check .htaccess for CORS headers"
    echo "3. Disable other plugins temporarily"
    echo "4. Read CORS-TROUBLESHOOTING.md for full guide"
elif echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin: ${ORIGIN}"; then
    echo -e "${GREEN}✅ PASSED: Correct CORS headers${NC}"
    echo ""
    echo "Headers are correct! If still having issues:"
    echo "1. Clear browser cache (Cmd+Shift+R)"
    echo "2. Check browser console for other errors"
    echo "3. Verify you're logged in to WordPress"
else
    echo -e "${YELLOW}⚠️  UNKNOWN: No CORS headers detected${NC}"
    echo ""
    echo "Possible issues:"
    echo "1. Plugin not activated"
    echo "2. Wrong endpoint URL"
    echo "3. Server configuration blocking headers"
fi

echo ""
