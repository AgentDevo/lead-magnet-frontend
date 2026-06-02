# n8n Setup Guide - Phase 1 MVP

Complete step-by-step guide to set up n8n workflows for the Lead Magnet platform.

---

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] n8n installed (Docker or self-hosted)
- [ ] Supabase project set up
- [ ] Backend API running on `http://localhost:3001`
- [ ] OpenAI API key
- [ ] Gmail account with app password
- [ ] Mailchimp account with API key
- [ ] ConvertKit account with API key
- [ ] HubSpot account with private app token

---

## Phase 1: Environment Setup

### Step 1.1 - Start n8n

**Option A: Docker (Recommended)**

```bash
# Create n8n directory
mkdir -p ~/n8n-data

# Start n8n with Docker
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/n8n-data:/home/node/.n8n \
  -e N8N_USER_EMAIL="admin@example.com" \
  -e N8N_USER_PASSWORD="your-secure-password" \
  n8nio/n8n

# Check logs
docker logs -f n8n
```

**Option B: Docker Compose**

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: n8n_user
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: n8n
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: n8n
      DB_POSTGRESDB_USER: n8n_user
      DB_POSTGRESDB_PASSWORD: secure_password
      N8N_USER_EMAIL: admin@example.com
      N8N_USER_PASSWORD: your-secure-password
      N8N_HOST: 0.0.0.0
      N8N_PORT: 5678
    depends_on:
      - postgres
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - n8n-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - n8n-network

volumes:
  postgres_data:
  n8n_data:

networks:
  n8n-network:
    driver: bridge
```

Run with:
```bash
docker-compose up -d
```

**Option C: Self-Hosted (Node.js)**

```bash
# Install n8n globally
npm install -g n8n

# Start n8n
n8n
```

Access at: `http://localhost:5678`

### Step 1.2 - Create Environment File

```bash
# Copy template
cp configs/.env.n8n.template configs/.env.n8n

# Edit with your values
nano configs/.env.n8n
```

Fill in all required keys:
- OpenAI API key
- Supabase credentials
- Gmail app password
- Mailchimp API key
- ConvertKit API key
- HubSpot token
- Backend API URL and key

---

## Phase 2: Credentials Configuration

### Step 2.1 - Set Up All Credentials

Follow `configs/credentials.md` to add:

1. **PostgreSQL** - Connect to Supabase
2. **OpenAI** - For content generation
3. **Gmail** - For sending emails
4. **Mailchimp** - For lead sync
5. **ConvertKit** - For lead sync
6. **HubSpot** - For lead sync
7. **HTTP Auth** - For backend API calls

### Step 2.2 - Test Each Credential

In n8n UI:
1. Go to **Credentials**
2. For each credential, click the credential name
3. Click **Test** button
4. Should see "Test successful!" or similar

---

## Phase 3: Import Workflows

### Step 3.1 - Prepare Workflow Files

All workflow JSON files are in `workflows/`:

```
workflows/
├── 01-lead-magnet-creation.json
├── 02-pdf-generation.json
├── 03-lead-capture-email-sync.json
├── 04-daily-analytics.json
└── workflow-export-all.json
```

### Step 3.2 - Import Workflows

**Option A: Import Individual Workflows**

1. In n8n, click **Workflows** (left sidebar)
2. Click **Create New**
3. Click menu (three dots) → **Import from file**
4. Select `01-lead-magnet-creation.json`
5. Click **Open** → **Import**
6. Repeat for each workflow

**Option B: Import All at Once**

```bash
# Copy workflow files to n8n data directory
cp workflows/*.json ~/n8n-data/workflows/

# Restart n8n
docker restart n8n

# Or reload page in browser
```

**Option C: Use API**

```bash
#!/bin/bash

# Set your n8n URL and auth
N8N_URL="http://localhost:5678"
N8N_API_TOKEN="your-api-token"

# Import each workflow
for workflow in workflows/*.json; do
  curl -X POST "$N8N_URL/api/v1/workflows" \
    -H "Authorization: Bearer $N8N_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d @"$workflow"
done
```

### Step 3.3 - Verify Imports

1. Go to **Workflows** in n8n
2. You should see:
   - `01 - Lead Magnet Creation`
   - `02 - PDF Generation`
   - `03 - Lead Capture & Email Sync`
   - `04 - Daily Analytics Summary`

---

## Phase 4: Configure Workflows

### Step 4.1 - Lead Magnet Creation Workflow

1. Open workflow `01 - Lead Magnet Creation`
2. Click each node and configure:

**Webhook Node:**
- Path should be `lead-magnet` (auto-set)
- Copy webhook URL: `http://your-n8n-url/webhook/lead-magnet`

**OpenAI Node:**
- Select credential: "OpenAI"
- Model: `gpt-4`
- Temperature: `0.7`
- Max tokens: `2000`

**Supabase Node:**
- Select credential: "PostgreSQL"
- Database: `postgres`
- Table: `lead_magnets`

3. Click **Save** (top right)
4. Toggle **Active** to enable

**Test:**
```bash
curl -X POST http://localhost:5678/webhook/lead-magnet \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Complete SEO Guide",
    "topic": "Search Engine Optimization",
    "niche": "SaaS",
    "type": "pdf",
    "user_id": "test-user-123"
  }'
```

### Step 4.2 - PDF Generation Workflow

1. Open workflow `02 - PDF Generation`
2. Configure nodes:

**Fetch Lead Magnet Node:**
- Credential: "PostgreSQL"
- Table: `lead_magnets`

**Backend PDF Endpoint:**
- URL: `http://localhost:3001/api/pdf-generate`
- Method: POST
- Credential: "HTTP Bearer Token" (backend API)

**Supabase Storage:**
- Credential: Supabase
- Bucket: `pdfs`

**Gmail Node:**
- Credential: "Gmail"
- Subject: Use template variables

3. Click **Save**
4. Toggle **Active**

**Important:** This workflow is triggered from Lead Magnet Creation, not manually.

### Step 4.3 - Lead Capture & Email Sync Workflow

1. Open workflow `03 - Lead Capture & Email Sync`
2. Configure nodes:

**Webhook Node:**
- Path: `lead-capture`
- Copy URL for frontend

**Supabase - Store Lead:**
- Credential: PostgreSQL
- Table: `leads`

**Gmail - Welcome Email:**
- Credential: Gmail
- Subject: "Welcome! Your Lead Magnet is Ready"

**Mailchimp Node:**
- Credential: HTTP Basic Auth (Mailchimp)
- URL: `https://us1.api.mailchimp.com/3.0/lists/{list_id}/members`
- Method: POST

**ConvertKit Node:**
- Credential: HTTP Header Auth
- URL: `https://api.convertkit.com/v3/subscribers`

**HubSpot Node:**
- Credential: HTTP Bearer Token
- URL: `https://api.hubapi.com/crm/v3/objects/contacts`

3. Save and activate

**Test:**
```bash
curl -X POST http://localhost:5678/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "lead_magnet_id": "magnet-123",
    "user_id": "user-456",
    "source": "landing-page"
  }'
```

### Step 4.4 - Daily Analytics Workflow

1. Open workflow `04 - Daily Analytics Summary`
2. Configure nodes:

**Cron Node:**
- Trigger Type: "Every Day"
- Hour: `0`
- Minute: `0`
- Timezone: `UTC`

**Backend Analytics:**
- URL: `http://localhost:3001/api/analytics`
- Method: GET
- Credential: Bearer Token

**PostgreSQL Nodes:**
- Credential: PostgreSQL
- Database queries for leads, magnets, etc.

**Gmail - Send Summary:**
- Credential: Gmail
- To: Use `$env.USER_EMAIL`
- Subject: "Daily Summary - {{date}}"

3. Save and activate

**Test Manually:**
1. Open the workflow
2. Click **Execute Workflow** (play button)
3. Check logs for execution status

---

## Phase 5: Database Schema

### Step 5.1 - Create Tables in Supabase

```sql
-- Lead Magnets Table
CREATE TABLE lead_magnets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  topic VARCHAR(255),
  niche VARCHAR(255),
  type VARCHAR(50),
  content JSONB,
  pdf_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'generating',
  views INT DEFAULT 0,
  conversions INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Leads Table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lead_magnet_id UUID,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  status VARCHAR(50) DEFAULT 'new',
  integrations_synced JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (lead_magnet_id) REFERENCES lead_magnets(id)
);

-- Activity Log Table
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics Summaries Table
CREATE TABLE analytics_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  leads INT,
  conversions INT,
  conversion_rate FLOAT,
  top_magnets JSONB,
  revenue FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Sync Retry Queue Table
CREATE TABLE sync_retry_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  integration_type VARCHAR(50),
  status VARCHAR(50),
  error_message TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  next_retry_at TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- User Integrations Table
CREATE TABLE user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  integration_type VARCHAR(50),
  api_key VARCHAR(500),
  config JSONB,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_lead_magnets_user_id ON lead_magnets(user_id);
CREATE INDEX idx_lead_magnets_status ON lead_magnets(status);
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);
CREATE INDEX idx_sync_retry_queue_status ON sync_retry_queue(status);
CREATE INDEX idx_user_integrations_user_id ON user_integrations(user_id);
```

### Step 5.2 - Create Storage Bucket

In Supabase:
1. Go to **Storage** (left sidebar)
2. Click **Create new bucket**
3. Name: `pdfs`
4. Private: Yes
5. Click **Create bucket**

---

## Phase 6: Testing

### Step 6.1 - Run Test Script

```bash
bash scripts/test-workflows.sh
```

This will:
- Test Lead Magnet Creation
- Test Lead Capture
- Verify database writes
- Check email sending

### Step 6.2 - Manual Testing

**Test Lead Magnet Creation:**

```bash
curl -X POST http://localhost:5678/webhook/lead-magnet \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Complete Guide to Email Marketing",
    "topic": "Email Marketing",
    "niche": "E-commerce",
    "type": "pdf",
    "user_id": "123e4567-e89b-12d3-a456-426614174000"
  }' | jq
```

**Test Lead Capture:**

```bash
curl -X POST http://localhost:5678/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "lead_magnet_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "source": "landing-page"
  }' | jq
```

**Test Daily Analytics (manually trigger):**

1. Open Daily Analytics workflow
2. Click **Execute Workflow** button
3. Check n8n logs for execution

### Step 6.3 - Verify in Dashboard

1. Check Supabase:
   - `lead_magnets` table has new records
   - `leads` table has new records
   - `activity_log` has entries

2. Check emails received:
   - Welcome email sent
   - PDF confirmation email sent

3. Check integrations:
   - Mailchimp: Lead synced
   - ConvertKit: Lead synced
   - HubSpot: Contact created

---

## Phase 7: Connect Frontend

### Step 7.1 - Update Frontend Endpoints

In your React/Next.js app, update API calls:

```javascript
// Lead Magnet Creation
const createLeadMagnet = async (data) => {
  const response = await fetch('http://localhost:5678/webhook/lead-magnet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      user_id: currentUser.id
    })
  });
  return response.json();
};

// Lead Capture
const captureLead = async (email, magnetId) => {
  const response = await fetch('http://localhost:5678/webhook/lead-capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      lead_magnet_id: magnetId,
      user_id: currentUser.id,
      source: 'landing-page'
    })
  });
  return response.json();
};
```

### Step 7.2 - Handle Responses

```javascript
// In React component
const handleCreateMagnet = async (formData) => {
  try {
    const result = await createLeadMagnet(formData);
    if (result.success) {
      // Show success message
      setContent(result.lead_magnet.content);
      setStatus('success');
    } else {
      // Show error
      setError(result.error);
    }
  } catch (error) {
    setError('Failed to create lead magnet');
  }
};
```

---

## Phase 8: Deploy to Production

### Step 8.1 - Production n8n Setup

See `DEPLOYMENT.md` for:
- Docker production setup
- n8n Cloud deployment
- Self-hosted production guide
- SSL/TLS configuration
- Monitoring setup

### Step 8.2 - Environment Variables

Set production environment variables:

```bash
export N8N_HOST=app.example.com
export N8N_PROTOCOL=https
export WEBHOOK_URL=https://app.example.com
export DB_POSTGRESDB_HOST=prod-postgres.example.com
export OPENAI_API_KEY=sk-prod-...
# ... all other keys
```

### Step 8.3 - Test Production Webhooks

```bash
curl -X POST https://app.example.com/webhook/lead-magnet \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## Troubleshooting

### Webhook Not Triggering

1. Check webhook URL is correct
2. Verify workflow is **Active** (toggle on)
3. Check n8n logs: `docker logs n8n`
4. Test with curl command
5. Check firewall/network rules

### API Credential Errors

1. Verify API key format
2. Test credential directly
3. Check if API key has required scopes
4. Verify rate limits not exceeded
5. Check token expiration

### Database Connection Failed

1. Verify Supabase credentials
2. Check host/port are accessible
3. Test with psql: `psql -h host -U user -d db`
4. Check network firewall rules
5. Verify SSL setting matches

### Email Not Sending

1. Check Gmail app password is correct
2. Verify 2FA is enabled
3. Check recipient email address
4. Look at n8n execution logs
5. Test with simple email first

### Slow Workflow Execution

1. Check OpenAI API response time
2. Reduce max_tokens if too large
3. Check database query performance
4. Monitor n8n server resources
5. Check network latency

---

## Next Steps

1. ✅ Complete all phases above
2. Run test suite in `scripts/test-workflows.sh`
3. Follow `DEPLOYMENT.md` for production
4. Set up monitoring (see `docs/monitoring.md`)
5. Train team on n8n administration

---

## Support Resources

- **n8n Docs:** https://docs.n8n.io/
- **n8n Community:** https://community.n8n.io/
- **OpenAI Docs:** https://platform.openai.com/docs/
- **Supabase Docs:** https://supabase.com/docs/
- **This Project Docs:** See `docs/` folder

