#!/bin/bash

##############################################################################
# n8n Workflow Testing Script
# Tests all 4 main workflows for Phase 1 MVP
##############################################################################

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
N8N_URL="${N8N_URL:-http://localhost:5678}"
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
WEBHOOK_LEAD_MAGNET="${N8N_URL}/webhook/lead-magnet"
WEBHOOK_LEAD_CAPTURE="${N8N_URL}/webhook/lead-capture"
SUPABASE_URL="${SUPABASE_URL:-http://localhost:54321}"

# Test data
TEST_USER_ID="test-user-$(date +%s)"
TEST_LEAD_MAGNET_ID=""
TEST_EMAIL="test-$(date +%s)@example.com"

##############################################################################
# Helper Functions
##############################################################################

print_header() {
  echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

# Check if service is running
check_service() {
  local service=$1
  local url=$2
  
  if curl -s "$url" > /dev/null 2>&1; then
    print_success "$service is running"
    return 0
  else
    print_error "$service is not running at $url"
    return 1
  fi
}

# Wait for service to be ready
wait_for_service() {
  local url=$1
  local max_attempts=30
  local attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if curl -s "$url" > /dev/null 2>&1; then
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 1
  done
  
  return 1
}

##############################################################################
# Pre-Flight Checks
##############################################################################

test_preflight() {
  print_header "Pre-Flight Checks"
  
  echo "Checking required services..."
  
  check_service "n8n" "$N8N_URL" || exit 1
  check_service "Backend API" "$BACKEND_URL" || exit 1
  
  # Check required tools
  if ! command -v curl &> /dev/null; then
    print_error "curl is required but not installed"
    exit 1
  fi
  print_success "curl is installed"
  
  if ! command -v jq &> /dev/null; then
    print_warning "jq is not installed (optional for pretty output)"
  else
    print_success "jq is installed"
  fi
  
  print_success "All pre-flight checks passed!"
}

##############################################################################
# Test 1: Lead Magnet Creation
##############################################################################

test_lead_magnet_creation() {
  print_header "Test 1: Lead Magnet Creation Workflow"
  
  print_info "Testing workflow trigger: POST $WEBHOOK_LEAD_MAGNET"
  
  local payload=$(cat <<EOF
{
  "title": "The Complete Guide to Content Marketing",
  "topic": "Content Marketing",
  "niche": "SaaS",
  "type": "pdf",
  "user_id": "$TEST_USER_ID"
}
EOF
)
  
  print_info "Payload:"
  echo "$payload" | jq '.' 2>/dev/null || echo "$payload"
  
  print_info "Sending request..."
  
  local response=$(curl -s -X POST "$WEBHOOK_LEAD_MAGNET" \
    -H "Content-Type: application/json" \
    -d "$payload")
  
  echo "Response:"
  echo "$response" | jq '.' 2>/dev/null || echo "$response"
  
  # Check for success
  if echo "$response" | grep -q '"success":true'; then
    print_success "Lead magnet creation successful"
    
    # Extract lead magnet ID
    TEST_LEAD_MAGNET_ID=$(echo "$response" | jq -r '.lead_magnet.id' 2>/dev/null || echo "")
    if [ -n "$TEST_LEAD_MAGNET_ID" ]; then
      print_success "Lead magnet ID: $TEST_LEAD_MAGNET_ID"
    fi
    
    return 0
  else
    print_error "Lead magnet creation failed"
    return 1
  fi
}

##############################################################################
# Test 2: Lead Capture & Email Sync
##############################################################################

test_lead_capture() {
  print_header "Test 2: Lead Capture & Email Sync Workflow"
  
  # Use the magnet ID from previous test, or use a default
  if [ -z "$TEST_LEAD_MAGNET_ID" ]; then
    TEST_LEAD_MAGNET_ID="test-magnet-id-$(date +%s)"
    print_warning "Using generated magnet ID: $TEST_LEAD_MAGNET_ID"
  fi
  
  print_info "Testing workflow trigger: POST $WEBHOOK_LEAD_CAPTURE"
  
  local payload=$(cat <<EOF
{
  "email": "$TEST_EMAIL",
  "first_name": "Test",
  "last_name": "User",
  "lead_magnet_id": "$TEST_LEAD_MAGNET_ID",
  "user_id": "$TEST_USER_ID",
  "source": "test-script"
}
EOF
)
  
  print_info "Payload:"
  echo "$payload" | jq '.' 2>/dev/null || echo "$payload"
  
  print_info "Sending request..."
  
  local response=$(curl -s -X POST "$WEBHOOK_LEAD_CAPTURE" \
    -H "Content-Type: application/json" \
    -d "$payload")
  
  echo "Response:"
  echo "$response" | jq '.' 2>/dev/null || echo "$response"
  
  # Check for success
  if echo "$response" | grep -q '"success":true'; then
    print_success "Lead capture successful"
    return 0
  else
    print_error "Lead capture failed"
    return 1
  fi
}

##############################################################################
# Test 3: Check Database
##############################################################################

test_database() {
  print_header "Test 3: Database Verification"
  
  print_info "Checking Supabase database..."
  
  # Note: This requires Supabase access. Adjust for your setup.
  print_info "Waiting 5 seconds for data to be written..."
  sleep 5
  
  print_info "You should manually verify:"
  echo "  1. Check 'lead_magnets' table in Supabase:"
  echo "     - SELECT * FROM lead_magnets WHERE user_id = '$TEST_USER_ID';"
  echo ""
  echo "  2. Check 'leads' table in Supabase:"
  echo "     - SELECT * FROM leads WHERE email = '$TEST_EMAIL';"
  echo ""
  echo "  3. Check 'activity_log' table in Supabase:"
  echo "     - SELECT * FROM activity_log WHERE user_id = '$TEST_USER_ID';"
  
  print_warning "Manual database verification required"
}

##############################################################################
# Test 4: Email Delivery
##############################################################################

test_email_delivery() {
  print_header "Test 4: Email Delivery Verification"
  
  print_info "Testing email delivery..."
  echo ""
  echo "Expected emails:"
  echo "  1. Welcome email to: $TEST_EMAIL"
  echo "  2. PDF confirmation email (after PDF generation completes)"
  echo ""
  
  print_info "You should manually verify:"
  echo "  1. Check inbox for email: $TEST_EMAIL"
  echo "  2. Verify email subject and content"
  echo "  3. Check spam/junk folder if not found"
  echo ""
  
  print_warning "Manual email verification required"
}

##############################################################################
# Test 5: Check n8n Execution Logs
##############################################################################

test_execution_logs() {
  print_header "Test 5: n8n Execution Logs"
  
  print_info "To check workflow execution logs:"
  echo "  1. Open n8n UI: $N8N_URL"
  echo "  2. Go to Workflows section"
  echo "  3. Open each workflow:"
  echo "     - 01 - Lead Magnet Creation"
  echo "     - 03 - Lead Capture & Email Sync"
  echo "  4. Click 'Executions' tab"
  echo "  5. Review recent executions"
  echo ""
  
  print_info "Check logs for:"
  echo "  - Success: Green checkmark"
  echo "  - Errors: Red X mark with error details"
  echo "  - Warnings: Yellow triangle"
}

##############################################################################
# Validation Checklist
##############################################################################

print_validation_checklist() {
  print_header "Validation Checklist"
  
  cat << 'EOF'
After running tests, verify:

DATABASE:
  ☐ lead_magnets table has new record
  ☐ leads table has new record with correct email
  ☐ activity_log has entries for both operations
  ☐ All timestamps are current

EMAILS:
  ☐ Welcome email received at test email address
  ☐ Email subject matches template
  ☐ Email body contains correct data
  ☐ Download link is valid

INTEGRATIONS:
  ☐ Mailchimp: Check if lead was synced (optional)
  ☐ ConvertKit: Check if subscriber was added (optional)
  ☐ HubSpot: Check if contact was created (optional)

N8N WORKFLOWS:
  ☐ All workflows show "Active" status
  ☐ No errors in execution logs
  ☐ Execution times are acceptable (<5 seconds for webhooks)
  ☐ Data is correctly parsed and passed between nodes

BACKEND API:
  ☐ PDF generation endpoint is working
  ☐ Analytics endpoint is returning data
  ☐ Authentication is working correctly

FRONTEND INTEGRATION:
  ☐ Frontend can call webhook endpoints
  ☐ Responses are in expected format
  ☐ Error handling works correctly
EOF
}

##############################################################################
# Performance Benchmarks
##############################################################################

test_performance() {
  print_header "Test 6: Performance Benchmarks"
  
  print_info "Testing response times..."
  
  # Test Lead Magnet Creation Response Time
  print_info "Testing Lead Magnet Creation response time..."
  
  local start_time=$(date +%s%N)
  
  curl -s -X POST "$WEBHOOK_LEAD_MAGNET" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Perf Test",
      "topic": "Test",
      "niche": "Test",
      "type": "pdf",
      "user_id": "perf-test"
    }' > /dev/null
  
  local end_time=$(date +%s%N)
  local response_time=$((($end_time - $start_time) / 1000000))
  
  echo "Response time: ${response_time}ms"
  
  if [ $response_time -lt 5000 ]; then
    print_success "Response time is acceptable (<5s)"
  else
    print_warning "Response time is slow (>${response_time}ms)"
  fi
}

##############################################################################
# Summary Report
##############################################################################

print_summary() {
  print_header "Test Summary Report"
  
  cat << 'EOF'
All automated tests completed!

NEXT STEPS:
1. Review n8n execution logs (see Test 5)
2. Verify database entries (see Test 3)
3. Check email delivery (see Test 4)
4. Review validation checklist (see above)
5. Connect frontend to webhook URLs
6. Deploy to production (see DEPLOYMENT.md)

WEBHOOK URLS FOR FRONTEND:
EOF
  
  echo "  Lead Magnet Creation: $WEBHOOK_LEAD_MAGNET"
  echo "  Lead Capture: $WEBHOOK_LEAD_CAPTURE"
  
  echo ""
  echo "TEST DATA USED:"
  echo "  User ID: $TEST_USER_ID"
  echo "  Test Email: $TEST_EMAIL"
  echo "  Lead Magnet ID: $TEST_LEAD_MAGNET_ID"
  
  echo ""
  echo "SUPPORT:"
  echo "  - See docs/troubleshooting.md for common issues"
  echo "  - Check n8n logs: docker logs n8n"
  echo "  - n8n Community: https://community.n8n.io/"
}

##############################################################################
# Main Execution
##############################################################################

main() {
  print_header "n8n Workflow Testing Suite"
  echo "Test started at: $(date)"
  echo "n8n URL: $N8N_URL"
  echo "Backend URL: $BACKEND_URL"
  
  # Run tests
  test_preflight
  test_lead_magnet_creation
  test_lead_capture
  test_database
  test_email_delivery
  test_execution_logs
  test_performance
  
  # Print validation checklist
  print_validation_checklist
  
  # Print summary
  print_summary
  
  echo ""
  echo -e "${GREEN}Test suite completed at: $(date)${NC}"
}

# Run main function
main "$@"
