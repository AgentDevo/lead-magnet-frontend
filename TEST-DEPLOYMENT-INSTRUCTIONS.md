# Lead Magnet SaaS - TEST Environment Deployment on 192.168.1.193

**Environment:** Test/Staging  
**Target Server:** 192.168.1.193 (SaaS-TST)  
**Application:** Lead Magnet Generator SaaS MVP  
**Date:** 2026-03-18  
**Purpose:** End-to-end application testing before production deployment

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Setup & Seeding](#database-setup--seeding)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Testing Protocol](#testing-protocol)
7. [Troubleshooting & Support](#troubleshooting--support)

---

## Pre-Deployment Checklist

### Prerequisites

- [x ] SSH access to 192.168.1.193
- [x ] Docker & Docker Compose installed on test server
- [ ] Supabase project created (test environment)
- [ ] Stripe test keys obtained
- [ ] OpenAI API key available
- [ ] n8n instance (can use cloud or self-hosted)
- [ ] Upstash Redis instance (or local Redis)
- [ ] 2+ GB free disk space
- [ ] Ports available: 3000, 5432, 6379, 8080 (n8n)

### Required Credentials

```
Create a .env.test file with:

# Supabase (Test Project)
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[TEST_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[TEST_SERVICE_ROLE_KEY]

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_[TEST_SECRET_KEY]
STRIPE_PUBLISHABLE_KEY=pk_test_[TEST_PUBLISHABLE_KEY]
STRIPE_WEBHOOK_SECRET=whsec_test_[TEST_WEBHOOK_SECRET]

# OpenAI
OPENAI_API_KEY=sk-[TEST_API_KEY]

# Redis
UPSTASH_REDIS_URL=redis://[TEST_REDIS_URL]
UPSTASH_REDIS_TOKEN=[TEST_REDIS_TOKEN]

# n8n Webhook
N8N_WEBHOOK_URL=http://localhost:8080/webhook

# Email (SendGrid or similar for test)
SENDGRID_API_KEY=[TEST_KEY]

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@localhost:5432/lead_magnet_test
```

---

## Environment Setup

### Step 1: SSH into Test Server

```bash
# SSH to test server
ssh svalbuena@192.168.1.193

# Verify available ports
netstat -tlnp | grep -E ":(3000|5432|6379|8080)"

# Create project directory
mkdir -p /opt/lead-magnet-saas
cd /opt/lead-magnet-saas

# Set permissions
sudo chown -R $USER:$USER /opt/lead-magnet-saas
```

### Step 2: Install Dependencies on Test Server

```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js (v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs npm

# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
node --version
npm --version
docker --version
docker-compose --version

# Install additional tools
npm install -g pm2 pnpm
```

### Step 3: Clone Repository

```bash
# Navigate to project directory
cd /opt/lead-magnet-saas

# Clone the MVP repository (or copy from existing workspace)
git clone <REPO_URL> .
# OR copy from workspace
cp -r /home/svalbuena/.openclaw/workspace/lead-magnet-mvp/* .

# Verify directory structure
ls -la
# Expected: backend/, database/, docs/, *.md files

# Check git status
git status
```

### Step 4: Setup Environment Variables

```bash
# Create test environment file
cat > .env.test << 'EOF'
# Application Environment
NODE_ENV=test
APP_ENV=test
LOG_LEVEL=debug

# Supabase (Test Project)
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_TEST_PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_TEST_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_TEST_SERVICE_ROLE_KEY]

# Stripe (Test Mode - use sk_test_ keys)
STRIPE_SECRET_KEY=sk_test_[TEST_KEY]
STRIPE_PUBLISHABLE_KEY=pk_test_[TEST_KEY]
STRIPE_WEBHOOK_SECRET=whsec_test_[TEST_SECRET]
STRIPE_PRODUCT_IDS_STARTER=price_test_starter
STRIPE_PRODUCT_IDS_PRO=price_test_pro
STRIPE_PRODUCT_IDS_ENTERPRISE=price_test_enterprise

# OpenAI
OPENAI_API_KEY=sk-[TEST_API_KEY]
OPENAI_MODEL=gpt-3.5-turbo

# Redis (Upstash or local)
UPSTASH_REDIS_URL=redis://default:[PASSWORD]@[UPSTASH_HOST]:39xxx
UPSTASH_REDIS_TOKEN=[TOKEN]

# n8n Webhooks
N8N_WEBHOOK_URL=http://192.168.1.193:8080/webhook
N8N_API_KEY=[N8N_API_KEY]

# Database (Local or Supabase)
DATABASE_URL=postgresql://postgres:testpass@localhost:5432/lead_magnet_test

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=[GENERATE_RANDOM_SECRET]

# Email Configuration (SendGrid or test provider)
SENDGRID_API_KEY=[TEST_SENDGRID_KEY]
FROM_EMAIL=noreply@test.leadmagnet.local

# Feature Flags
ENABLE_AI_GENERATION=true
ENABLE_PDF_GENERATION=true
ENABLE_EMAIL_SYNC=true
ENABLE_STRIPE_WEBHOOKS=true
EOF

# Set environment variables for current session
export $(cat .env.test | xargs)

# Verify key variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $STRIPE_SECRET_KEY
```

---

## Database Setup & Seeding

### Step 1: Create Local PostgreSQL Database (Optional) or Use Supabase

#### Option A: Local Docker PostgreSQL

```bash
# Create docker-compose.yml for database
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: testpass
      POSTGRES_DB: lead_magnet_test
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
EOF

# Start database services
docker-compose up -d

# Verify services are running
docker-compose ps

# Wait for PostgreSQL to be ready
sleep 10
```

#### Option B: Use Supabase Cloud (Recommended for testing)

```bash
# No additional setup needed - Supabase handles database hosting
# Just verify connection with test query

# Test Supabase connection
cat > test-supabase.js << 'EOF'
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase.from('templates').select('count(*)');
console.log('Connection test:', error ? 'FAILED' : 'SUCCESS');
EOF

node test-supabase.js
```

### Step 2: Run Database Migrations

```bash
# Navigate to database directory
cd /opt/lead-magnet-saas/database

# List available migrations
ls -la migrations/

# If using local PostgreSQL:
psql postgresql://postgres:testpass@localhost:5432/lead_magnet_test < migrations/001_initial_schema.sql

# If using Supabase, run migrations via SQL editor:
# 1. Go to Supabase dashboard > SQL Editor
# 2. Create new query
# 3. Copy SQL from migrations/001_initial_schema.sql
# 4. Execute

# Verify database creation
psql postgresql://postgres:testpass@localhost:5432/lead_magnet_test -c "\dt"
```

### Step 3: Seed Test Data

```bash
# Navigate to database directory
cd /opt/lead-magnet-saas/database

# Create seed data script
cat > seed-test-data.sql << 'EOF'
-- Insert test users
INSERT INTO public.users (id, email, full_name, company_name, subscription_tier) VALUES
  (uuid_generate_v4(), 'test@example.com', 'Test User', 'Test Company', 'free'),
  (uuid_generate_v4(), 'pro@example.com', 'Pro User', 'Pro Company', 'pro');

-- Insert test templates
INSERT INTO public.templates (id, name, type, category, style_config, content_structure, is_premium) VALUES
  (uuid_generate_v4(), 'Basic Ebook', 'ebook', 'business', '{}', '{}', false),
  (uuid_generate_v4(), 'Advanced Checklist', 'checklist', 'productivity', '{}', '{}', true),
  (uuid_generate_v4(), 'Quick Guide', 'guide', 'education', '{}', '{}', false);

-- Verify data
SELECT COUNT(*) FROM public.users;
SELECT COUNT(*) FROM public.templates;
EOF

# Run seed script
if [ "$DATABASE_URL" == "postgresql://postgres:testpass@localhost:5432/lead_magnet_test" ]; then
  psql "$DATABASE_URL" < seed-test-data.sql
else
  # For Supabase: copy content to SQL Editor
  echo "Please run seed-test-data.sql in Supabase SQL Editor"
fi
```

---

## Backend Deployment

### Step 1: Install Backend Dependencies

```bash
# Navigate to backend directory
cd /opt/lead-magnet-saas/backend

# Check backend structure
ls -la
# Expected: app.js, package.json, routes/, middleware/, etc.

# Install dependencies
npm install
# or if using pnpm:
pnpm install

# Verify installation
npm list | head -20
```

### Step 2: Build Backend

```bash
# Build backend (if needed)
npm run build
# or
npm run compile

# Check for build errors
echo $?
```

### Step 3: Start Backend Service

#### Option A: Using PM2 (Recommended for persistence)

```bash
# Install PM2 globally (already done in dependencies setup)
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'lead-magnet-backend',
      script: 'app.js',
      cwd: '/opt/lead-magnet-saas/backend',
      env: {
        NODE_ENV: 'test',
        PORT: 5000,
      },
      error_file: '/var/log/pm2/backend-error.log',
      out_file: '/var/log/pm2/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      instances: 2,
      exec_mode: 'cluster',
    },
  ],
};
EOF

# Start backend with PM2
pm2 start ecosystem.config.js

# Verify service is running
pm2 status

# View logs
pm2 logs lead-magnet-backend

# Setup PM2 to start on system reboot
pm2 startup
pm2 save
```

#### Option B: Using Docker

```bash
# Create Dockerfile for backend (if not exists)
cat > Dockerfile.backend << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY backend/ .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "app.js"]
EOF

# Build Docker image
docker build -f Dockerfile.backend -t lead-magnet-backend:test .

# Run backend container
docker run -d \
  --name lead-magnet-backend \
  -p 5000:5000 \
  --env-file .env.test \
  lead-magnet-backend:test

# Check logs
docker logs -f lead-magnet-backend
```

### Step 4: Verify Backend Health

```bash
# Test backend health endpoint
curl -s http://localhost:5000/health | jq .

# Test API connectivity
curl -s http://localhost:5000/api/v1/templates | jq .

# Check open ports
netstat -tlnp | grep 5000
```

---

## Frontend Deployment

### Step 1: Install Frontend Dependencies

```bash
# Navigate to frontend directory (or use lead-magnet-mvp root if it's Next.js)
cd /opt/lead-magnet-saas

# Check if lead-magnet-frontend exists separately, or if it's in MVR root
ls -la lead-magnet-frontend/ 2>/dev/null || echo "Frontend may be in current directory"

# Install dependencies
npm install
# or for workspace/monorepo:
pnpm install --recursive

# Verify installation
npm list | grep next
```

### Step 2: Build Frontend

```bash
# Set environment for build
export NODE_ENV=test
export NEXT_PUBLIC_API_URL=http://192.168.1.193:5000/api/v1

# Build Next.js application
npm run build

# Verify build succeeded
ls -la .next/

# Check build output
echo "Build completed with exit code: $?"
```

### Step 3: Start Frontend Service

#### Option A: Using PM2

```bash
# Create PM2 ecosystem entry for frontend
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'lead-magnet-frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/opt/lead-magnet-saas',
      env: {
        NODE_ENV: 'test',
        PORT: 3000,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      },
      error_file: '/var/log/pm2/frontend-error.log',
      out_file: '/var/log/pm2/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
};
EOF

# Start frontend
pm2 start ecosystem.config.js --only lead-magnet-frontend

# Verify service
pm2 status

# View logs
pm2 logs lead-magnet-frontend
```

#### Option B: Using Docker Compose

```bash
# Create comprehensive docker-compose for test environment
cat > docker-compose.test.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: testpass
      POSTGRES_DB: lead_magnet_test
    volumes:
      - postgres_test_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_test_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: test
      PORT: 5000
      DATABASE_URL: postgresql://postgres:testpass@postgres:5432/lead_magnet_test
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: test
      NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      STRIPE_PUBLISHABLE_KEY: ${STRIPE_PUBLISHABLE_KEY}
      NEXT_PUBLIC_API_URL: http://backend:5000/api/v1
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  n8n:
    image: n8nio/n8n:latest
    ports:
      - "8080:80"
    environment:
      NODE_ENV: test
      N8N_BASIC_AUTH_ACTIVE: "true"
      N8N_BASIC_AUTH_USER: admin
      N8N_BASIC_AUTH_PASSWORD: testpassword
    volumes:
      - n8n_test_data:/home/node/.n8n
    depends_on:
      - postgres
      - redis

volumes:
  postgres_test_data:
  redis_test_data:
  n8n_test_data:
EOF

# Start all services
docker-compose -f docker-compose.test.yml up -d

# Wait for services to be ready
sleep 15

# Check service status
docker-compose -f docker-compose.test.yml ps

# View logs
docker-compose -f docker-compose.test.yml logs -f frontend
```

### Step 4: Verify Frontend Access

```bash
# Test frontend health
curl -s http://localhost:3000 | head -50

# Test API proxy
curl -s http://localhost:3000/api/v1/templates | jq .

# Check open ports
netstat -tlnp | grep -E ":(3000|5000)"

# From local machine: test in browser
# http://192.168.1.193:3000
```

---

## Testing Protocol

### Phase 1: Smoke Testing (15 minutes)

```bash
# 1. Connectivity Tests
echo "=== Testing Connectivity ==="
curl -s http://localhost:3000 && echo "✓ Frontend accessible"
curl -s http://localhost:5000/health && echo "✓ Backend healthy"
curl -s http://localhost:6379 && echo "✓ Redis responding" || true

# 2. API Tests
echo -e "\n=== Testing API Endpoints ==="
curl -s http://localhost:5000/api/v1/templates | jq '.data | length'
curl -s http://localhost:5000/api/v1/health | jq '.status'

# 3. Database Tests
echo -e "\n=== Testing Database Connectivity ==="
curl -s -X POST http://localhost:5000/api/v1/health/db | jq '.database'
```

### Phase 2: Feature Testing

#### 2.1 Authentication Testing

```bash
# Create test user account
echo "=== Authentication Testing ==="

# 1. Register new user
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!",
    "fullName": "Test User"
  }')

echo "Registration Response: $REGISTER_RESPONSE"
TEST_USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.data.user.id')

# 2. Verify email (if applicable)
# 3. Login with credentials
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }')

echo "Login Response: $LOGIN_RESPONSE"
AUTH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

# 4. Test protected endpoint
curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
  http://localhost:5000/api/v1/user/profile | jq '.'
```

#### 2.2 Lead Magnet Creation Testing

```bash
# Create lead magnet
echo "=== Lead Magnet Creation Testing ==="

MAGNET_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/lead-magnets \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Lead Magnet",
    "type": "ebook",
    "templateId": "template-id-here",
    "prompt": "Create a comprehensive guide on digital marketing strategies",
    "content": {
      "sections": [
        {
          "title": "Introduction",
          "content": "Test content",
          "order": 1
        }
      ]
    }
  }')

echo "Lead Magnet Response: $MAGNET_RESPONSE"
MAGNET_ID=$(echo $MAGNET_RESPONSE | jq -r '.data.id')

# Verify creation
curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
  http://localhost:5000/api/v1/lead-magnets/$MAGNET_ID | jq '.'
```

#### 2.3 PDF Generation Testing

```bash
# Test PDF generation
echo "=== PDF Generation Testing ==="

PDF_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/pdf/generate \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"leadMagnetId\": \"$MAGNET_ID\",
    \"format\": \"pdf\",
    \"template\": \"standard\"
  }")

echo "PDF Generation Response: $PDF_RESPONSE"
PDF_URL=$(echo $PDF_RESPONSE | jq -r '.data.url')

# Download and verify PDF
curl -s "$PDF_URL" -o /tmp/test_magnet.pdf
file /tmp/test_magnet.pdf
ls -lh /tmp/test_magnet.pdf
```

#### 2.4 Landing Page Creation Testing

```bash
# Create landing page
echo "=== Landing Page Creation Testing ==="

LANDING_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/landing-pages \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"leadMagnetId\": \"$MAGNET_ID\",
    \"title\": \"Free Digital Marketing Guide\",
    \"description\": \"Get access to our comprehensive digital marketing guide\",
    \"slug\": \"test-landing-page-$(date +%s)\",
    \"formConfig\": {
      \"fields\": [
        {
          \"name\": \"email\",
          \"type\": \"email\",
          \"required\": true,
          \"label\": \"Email Address\"
        },
        {
          \"name\": \"fullName\",
          \"type\": \"text\",
          \"required\": true,
          \"label\": \"Full Name\"
        }
      ],
      \"buttonText\": \"Get Access Now\",
      \"successMessage\": \"Check your email for access!\"
    }
  }")

echo "Landing Page Response: $LANDING_RESPONSE"
LANDING_PAGE_ID=$(echo $LANDING_RESPONSE | jq -r '.data.id')
LANDING_PAGE_SLUG=$(echo $LANDING_RESPONSE | jq -r '.data.slug')

# Test public access to landing page
curl -s http://localhost:3000/l/$LANDING_PAGE_SLUG | grep -o "<h1" && echo "✓ Landing page accessible"
```

#### 2.5 Lead Capture Testing

```bash
# Simulate lead form submission
echo "=== Lead Capture Testing ==="

LEAD_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/landing-pages/$LANDING_PAGE_SLUG/submit \
  -H "Content-Type: application/json" \
  -d '{
    "email": "captured@example.com",
    "fullName": "Captured User",
    "gdprConsent": true,
    "formData": {
      "customField1": "value1"
    }
  }')

echo "Lead Capture Response: $LEAD_RESPONSE"

# Verify lead was captured
curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
  http://localhost:5000/api/v1/leads?landingPageId=$LANDING_PAGE_ID | jq '.data[] | {email, fullName}'
```

#### 2.6 Stripe Payment Testing

```bash
# Test Stripe integration
echo "=== Stripe Payment Testing ==="

# Create checkout session for "Pro" plan
CHECKOUT_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/stripe/checkout \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "pro",
    "priceId": "price_test_pro"
  }')

echo "Checkout Response: $CHECKOUT_RESPONSE"
CHECKOUT_URL=$(echo $CHECKOUT_RESPONSE | jq -r '.data.checkoutUrl')

echo "Test checkout URL: $CHECKOUT_URL"
echo "Use test card: 4242 4242 4242 4242, exp: 12/34, CVC: 123"
```

#### 2.7 Email Integration Testing

```bash
# Test email provider integration
echo "=== Email Integration Testing ==="

# Add email integration (Mailchimp example)
INTEGRATION_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/integrations \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "mailchimp",
    "apiKey": "test-mailchimp-key-here",
    "listId": "test-list-id",
    "config": {
      "autoSync": true,
      "syncInterval": 3600
    }
  }')

echo "Integration Response: $INTEGRATION_RESPONSE"

# Verify integration
curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
  http://localhost:5000/api/v1/integrations | jq '.data[] | {provider, isActive}'
```

#### 2.8 Analytics Testing

```bash
# Test analytics tracking
echo "=== Analytics Testing ==="

# Track page view
curl -s -X POST http://localhost:5000/api/v1/analytics/event \
  -H "Content-Type: application/json" \
  -d "{
    \"landingPageId\": \"$LANDING_PAGE_ID\",
    \"eventType\": \"page_view\",
    \"sessionId\": \"test-session-$(date +%s)\",
    \"eventData\": {
      \"referrer\": \"google.com\",
      \"userAgent\": \"Mozilla/5.0 Test\"
    }
  }"

# Get analytics dashboard
curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
  "http://localhost:5000/api/v1/analytics?dateRange=7d" | jq '.data'
```

### Phase 3: Load Testing (Optional)

```bash
# Install Apache Bench
sudo apt-get install -y apache2-utils

# Test frontend performance
echo "=== Load Testing Frontend ==="
ab -n 100 -c 10 http://localhost:3000/

# Test API performance
echo -e "\n=== Load Testing API ==="
ab -n 100 -c 10 http://localhost:5000/api/v1/templates

# Test with API key authentication
ab -n 100 -c 10 -H "Authorization: Bearer $AUTH_TOKEN" \
  http://localhost:5000/api/v1/lead-magnets
```

### Phase 4: Error Handling & Edge Cases

```bash
# Test error scenarios
echo "=== Error Handling Testing ==="

# 1. Missing required fields
curl -s -X POST http://localhost:5000/api/v1/lead-magnets \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": ""}' | jq '.error'

# 2. Invalid authentication
curl -s http://localhost:5000/api/v1/lead-magnets \
  -H "Authorization: Bearer invalid-token" | jq '.error'

# 3. Non-existent resource
curl -s http://localhost:5000/api/v1/lead-magnets/non-existent-id \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.error'

# 4. Rate limiting
for i in {1..50}; do
  curl -s http://localhost:5000/api/v1/templates > /dev/null
done
```

### Phase 5: Database Verification

```bash
# Connect to database and verify data
if [ -n "$DATABASE_URL" ] && [[ "$DATABASE_URL" == postgresql* ]]; then
  psql "$DATABASE_URL" << 'EOF'
-- Verify tables exist
\dt

-- Check user count
SELECT COUNT(*) as total_users FROM public.users;

-- Check lead magnets created
SELECT id, title, status FROM public.lead_magnets LIMIT 5;

-- Check leads captured
SELECT email, full_name, created_at FROM public.leads LIMIT 5;

-- Check analytics events
SELECT event_type, COUNT(*) FROM public.analytics_events GROUP BY event_type;

-- View subscription status
SELECT user_id, stripe_subscription_id, status FROM public.subscriptions;
EOF
fi
```

---

## Post-Testing Verification Checklist

- [ ] Frontend loads without errors (http://192.168.1.193:3000)
- [ ] User can register and login
- [ ] Lead magnet can be created and edited
- [ ] PDF generation works and downloads correctly
- [ ] Landing page is created and publicly accessible
- [ ] Lead form submission works and stores data
- [ ] Email provider integration syncs leads correctly
- [ ] Stripe test payment completes successfully
- [ ] Analytics events are tracked and displayed
- [ ] Admin dashboard shows all created resources
- [ ] Database contains expected test data
- [ ] No console errors in browser DevTools
- [ ] API responses follow correct format
- [ ] Rate limiting is functional
- [ ] Error handling returns appropriate messages
- [ ] Performance is acceptable (<2s page load)
- [ ] Mobile responsiveness works (test on device or browser inspector)

---

## Troubleshooting & Support

### Common Issues & Solutions

#### Issue: Port Already in Use

```bash
# Find and kill process using port
fuser -k 3000/tcp
fuser -k 5000/tcp
fuser -k 6379/tcp

# Or specify different ports in .env.test
PORT=3001
BACKEND_PORT=5001
REDIS_PORT=6380
```

#### Issue: Database Connection Refused

```bash
# Verify PostgreSQL is running
docker-compose ps postgres
# or
systemctl status postgresql

# Check database credentials in .env.test
# Test connection directly:
psql postgresql://postgres:testpass@localhost:5432/lead_magnet_test -c "SELECT 1"
```

#### Issue: Supabase API Errors

```bash
# Verify credentials are correct
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Check for CORS issues in browser console
# Ensure API endpoints are properly configured

# Test Supabase directly:
curl -s -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  $NEXT_PUBLIC_SUPABASE_URL/rest/v1/templates?select=* | jq '.'
```

#### Issue: Node Modules Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
# or with pnpm:
pnpm install --force
```

#### Issue: Out of Memory During Build

```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Or use production build with optimizations
NODE_ENV=production npm run build
```

#### Issue: n8n Workflows Not Triggering

```bash
# Verify n8n is running
docker-compose ps n8n

# Check webhook URL configuration
# Ensure N8N_WEBHOOK_URL in .env.test matches n8n instance

# Test webhook manually:
curl -s -X POST http://192.168.1.193:8080/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Check n8n logs
docker-compose logs n8n | tail -50
```

### Debugging Tips

```bash
# Enable verbose logging
export LOG_LEVEL=debug
export DEBUG=*

# Monitor real-time logs
pm2 logs lead-magnet-frontend --lines 100 --stream
pm2 logs lead-magnet-backend --lines 100 --stream

# Monitor system resources
watch -n 1 'docker stats'
# or
top
htop

# Network monitoring
tcpdump -i any -n port 3000 or port 5000
ss -tlnp | grep -E "(3000|5000|6379)"

# Database query logging
# In psql:
SET log_statement = 'all';
SET log_duration = on;
```

### Support Contact Information

**Development Team Lead:** Sergio  
**Email:** sergio@example.com  
**Test Server Admin:** svalbuena  
**Emergency Contact:** [Contact info]

### Escalation Path

1. Check logs first: `pm2 logs` or `docker logs`
2. Verify environment variables: `env | grep NEXT_PUBLIC_`
3. Test connectivity: `curl http://localhost:3000`
4. Check database: `psql $DATABASE_URL -c "SELECT 1"`
5. Review error documentation above
6. Contact development team if issue persists

---

## Next Steps After Testing

### If All Tests Pass ✓

1. Document any issues found and fixes applied
2. Update this document with lessons learned
3. Create production deployment plan
4. Prepare for staging → production transition
5. Set up monitoring and alerting
6. Plan user acceptance testing (UAT)

### If Issues Found ✗

1. Create bug reports with:
   - Detailed error messages
   - Steps to reproduce
   - Expected vs. actual behavior
   - Environment details (Node version, database version, etc.)
2. Schedule debugging session
3. Retest after fixes applied
4. Document root cause and resolution

---

## Appendix: Useful Commands

```bash
# View all services status
pm2 status

# Restart specific service
pm2 restart lead-magnet-frontend

# Stop all services
pm2 stop all

# Delete services
pm2 delete all

# View real-time metrics
pm2 monit

# Export PM2 configuration
pm2 save && pm2 startup

# Docker commands
docker-compose down -v  # Stop and remove containers/volumes
docker-compose up --build  # Rebuild and start
docker exec -it container_name bash  # Shell into container

# Database backup
pg_dump postgresql://postgres:testpass@localhost:5432/lead_magnet_test > backup.sql

# Database restore
psql postgresql://postgres:testpass@localhost:5432/lead_magnet_test < backup.sql
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-18  
**Status:** Ready for Test Deployment
