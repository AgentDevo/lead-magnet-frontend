#!/bin/bash

##############################################################################
# cURL Examples for Testing n8n Workflows
# Copy and paste these commands to test workflows manually
##############################################################################

# Configuration
N8N_URL="http://localhost:5678"

##############################################################################
# 1. LEAD MAGNET CREATION WEBHOOK
##############################################################################

# Basic test
echo "TEST 1: Create Lead Magnet (Basic)"
curl -X POST ${N8N_URL}/webhook/lead-magnet \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Complete Guide to Content Marketing",
    "topic": "Content Marketing",
    "niche": "SaaS",
    "type": "pdf",
    "user_id": "user-123"
  }' | jq .

# Advanced test with all fields
echo -e "\n\nTEST 2: Create Lead Magnet (Advanced)"
curl -X POST ${N8N_URL}/webhook/lead-magnet \
  -H "Content-Type: application/json" \
  -d '{
    "title": "10 Email Marketing Secrets",
    "topic": "Email Marketing",
    "niche": "E-commerce",
    "type": "pdf",
    "user_id": "user-456",
    "format": "markdown",
    "language": "en",
    "template": "premium"
  }' | jq .

# Multiple types
echo -e "\n\nTEST 3: Create Video Lead Magnet"
curl -X POST ${N8N_URL}/webhook/lead-magnet \
  -H "Content-Type: application/json" \
  -d '{
    "title": "LinkedIn Sales Navigator Masterclass",
    "topic": "LinkedIn Marketing",
    "niche": "B2B Sales",
    "type": "video",
    "user_id": "user-789"
  }' | jq .

echo -e "\n\nTEST 4: Create Checklist Lead Magnet"
curl -X POST ${N8N_URL}/webhook/lead-magnet \
  -H "Content-Type: application/json" \
  -d '{
    "title": "SEO Optimization Checklist",
    "topic": "SEO",
    "niche": "Blogging",
    "type": "checklist",
    "user_id": "user-999"
  }' | jq .

##############################################################################
# 2. LEAD CAPTURE WEBHOOK
##############################################################################

echo -e "\n\n═══════════════════════════════════════════════════════════════"
echo "LEAD CAPTURE WEBHOOK TESTS"
echo "═══════════════════════════════════════════════════════════════"

# Basic lead capture
echo -e "\nTEST 5: Capture Lead (Basic)"
curl -X POST ${N8N_URL}/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "lead_magnet_id": "magnet-123",
    "user_id": "user-123",
    "source": "landing-page"
  }' | jq .

# Lead capture with phone
echo -e "\n\nTEST 6: Capture Lead (With Phone)"
curl -X POST ${N8N_URL}/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "phone": "+1234567890",
    "company": "ACME Corp",
    "lead_magnet_id": "magnet-456",
    "user_id": "user-456",
    "source": "webinar",
    "utm_source": "facebook",
    "utm_campaign": "summer-sale"
  }' | jq .

# Lead capture minimal
echo -e "\n\nTEST 7: Capture Lead (Minimal)"
curl -X POST ${N8N_URL}/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "lead_magnet_id": "magnet-789",
    "user_id": "user-789"
  }' | jq .

# Bulk leads (loop)
echo -e "\n\nTEST 8: Capture Multiple Leads (Loop)"
for i in {1..5}; do
  curl -X POST ${N8N_URL}/webhook/lead-capture \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"user${i}@example.com\",
      \"first_name\": \"User\",
      \"last_name\": \"${i}\",
      \"lead_magnet_id\": \"magnet-123\",
      \"user_id\": \"user-bulk\",
      \"source\": \"test-bulk\"
    }" > /dev/null
  echo "Created lead $i"
done

##############################################################################
# 3. PERFORMANCE TESTING
##############################################################################

echo -e "\n\n═══════════════════════════════════════════════════════════════"
echo "PERFORMANCE TESTING"
echo "═══════════════════════════════════════════════════════════════"

# Time lead magnet creation
echo -e "\nTEST 9: Measure Lead Magnet Response Time"
time curl -X POST ${N8N_URL}/webhook/lead-magnet \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Performance Test",
    "topic": "Testing",
    "niche": "QA",
    "type": "pdf",
    "user_id": "perf-test"
  }' > /dev/null

# Time lead capture
echo -e "\n\nTEST 10: Measure Lead Capture Response Time"
time curl -X POST ${N8N_URL}/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "email": "perf@example.com",
    "lead_magnet_id": "perf-magnet",
    "user_id": "perf-user"
  }' > /dev/null

##############################################################################
# 4. ERROR TESTING
##############################################################################

echo -e "\n\n═══════════════════════════════════════════════════════════════"
echo "ERROR HANDLING TESTS"
echo "═══════════════════════════════════════════════════════════════"

# Missing required fields
echo -e "\nTEST 11: Missing Required Fields"
curl -X POST ${N8N_URL}/webhook/lead-magnet \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test"
  }' | jq .

# Invalid email
echo -e "\n\nTEST 12: Invalid Email Format"
curl -X POST ${N8N_URL}/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "lead_magnet_id": "magnet-test",
    "user_id": "user-test"
  }' | jq .

# Empty payload
echo -e "\n\nTEST 13: Empty Payload"
curl -X POST ${N8N_URL}/webhook/lead-magnet \
  -H "Content-Type: application/json" \
  -d '{}' | jq .

# Invalid JSON
echo -e "\n\nTEST 14: Invalid JSON"
curl -X POST ${N8N_URL}/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{invalid json}' | jq .

##############################################################################
# 5. HEADER TESTING
##############################################################################

echo -e "\n\n═══════════════════════════════════════════════════════════════"
echo "HEADER & AUTHENTICATION TESTS"
echo "═══════════════════════════════════════════════════════════════"

# With authorization header
echo -e "\nTEST 15: With Authorization Header"
curl -X POST ${N8N_URL}/webhook/lead-magnet \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token-123" \
  -d '{
    "title": "Test with Auth",
    "topic": "Testing",
    "niche": "QA",
    "type": "pdf",
    "user_id": "auth-test"
  }' | jq .

# With custom headers
echo -e "\n\nTEST 16: With Custom Headers"
curl -X POST ${N8N_URL}/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -H "X-Source: mobile-app" \
  -H "X-Version: 1.0" \
  -d '{
    "email": "mobile@example.com",
    "lead_magnet_id": "magnet-mobile",
    "user_id": "mobile-user"
  }' | jq .

##############################################################################
# 6. BATCH OPERATIONS
##############################################################################

echo -e "\n\n═══════════════════════════════════════════════════════════════"
echo "BATCH OPERATIONS"
echo "═══════════════════════════════════════════════════════════════"

# Create multiple lead magnets
echo -e "\nTEST 17: Create Multiple Lead Magnets"

titles=("Email Marketing Secrets" "SEO Master Guide" "Social Media Strategies" "Content Creation Blueprint")
topics=("Email" "SEO" "Social Media" "Content")
niches=("SaaS" "E-commerce" "B2B" "Digital Marketing")

for i in "${!titles[@]}"; do
  curl -X POST ${N8N_URL}/webhook/lead-magnet \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"${titles[$i]}\",
      \"topic\": \"${topics[$i]}\",
      \"niche\": \"${niches[$i]}\",
      \"type\": \"pdf\",
      \"user_id\": \"batch-user\"
    }" > /dev/null
  echo "Created: ${titles[$i]}"
done

##############################################################################
# 7. POSTMAN / API TESTING
##############################################################################

echo -e "\n\n═══════════════════════════════════════════════════════════════"
echo "POSTMAN COLLECTION (JSON)"
echo "═══════════════════════════════════════════════════════════════"

cat > postman-collection.json << 'EOF'
{
  "info": {
    "name": "Lead Magnet Platform - n8n Workflows",
    "description": "Testing collection for n8n webhooks",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Lead Magnet Creation",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\\n  \\\"title\\\": \\\"The Complete Guide to Content Marketing\\\",\\n  \\\"topic\\\": \\\"Content Marketing\\\",\\n  \\\"niche\\\": \\\"SaaS\\\",\\n  \\\"type\\\": \\\"pdf\\\",\\n  \\\"user_id\\\": \\\"user-123\\\"\\n}"
        },
        "url": {
          "raw": "http://localhost:5678/webhook/lead-magnet",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5678",
          "path": ["webhook", "lead-magnet"]
        }
      }
    },
    {
      "name": "Lead Capture",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\\n  \\\"email\\\": \\\"john@example.com\\\",\\n  \\\"first_name\\\": \\\"John\\\",\\n  \\\"last_name\\\": \\\"Doe\\\",\\n  \\\"lead_magnet_id\\\": \\\"magnet-123\\\",\\n  \\\"user_id\\\": \\\"user-123\\\",\\n  \\\"source\\\": \\\"landing-page\\\"\\n}"
        },
        "url": {
          "raw": "http://localhost:5678/webhook/lead-capture",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5678",
          "path": ["webhook", "lead-capture"]
        }
      }
    }
  ]
}
EOF

echo "Postman collection saved to: postman-collection.json"
echo "Import this file in Postman to test workflows"

##############################################################################
# QUICK REFERENCE
##############################################################################

echo -e "\n\n═══════════════════════════════════════════════════════════════"
echo "QUICK REFERENCE"
echo "═══════════════════════════════════════════════════════════════"

cat << 'EOF'

LEAD MAGNET CREATION ENDPOINT:
  POST http://localhost:5678/webhook/lead-magnet
  
  Required fields:
    - title (string)
    - topic (string)
    - niche (string)
    - type (string: "pdf", "video", "checklist", etc.)
    - user_id (string)

LEAD CAPTURE ENDPOINT:
  POST http://localhost:5678/webhook/lead-capture
  
  Required fields:
    - email (string)
    - lead_magnet_id (string)
    - user_id (string)
  
  Optional fields:
    - first_name (string)
    - last_name (string)
    - phone (string)
    - company (string)
    - source (string)
    - utm_source (string)
    - utm_campaign (string)

RESPONSE FORMAT:
  Success (200):
    {
      "success": true,
      "lead_magnet": {...} | "lead": {...},
      "message": "..."
    }
  
  Error (400/500):
    {
      "success": false,
      "error": "Error message",
      "details": "..."
    }

USEFUL cURL OPTIONS:
  -X POST                 # HTTP method
  -H "Content-Type: application/json"  # Header
  -d '{...}'              # Data payload
  -i                      # Include response headers
  -v                      # Verbose (show request/response)
  -w "\n%{http_code}\n"   # Show HTTP status code
  | jq .                  # Pretty print JSON (requires jq)

BATCH TESTING:
  # Test 10 times
  for i in {1..10}; do
    curl -X POST http://localhost:5678/webhook/lead-magnet ...
  done

PERFORMANCE TESTING:
  # Measure response time
  time curl -X POST http://localhost:5678/webhook/lead-magnet ...
  
  # Load test with apache bench
  ab -n 100 -c 10 http://localhost:5678/webhook/lead-magnet

EOF

echo -e "\n═══════════════════════════════════════════════════════════════"
