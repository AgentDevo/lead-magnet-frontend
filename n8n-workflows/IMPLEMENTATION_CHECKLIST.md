# n8n Implementation Checklist - Phase 1 MVP

Complete checklist to implement, test, and deploy n8n workflows.

---

## Phase 1: Planning & Preparation

- [ ] **Review Architecture**
  - [ ] Read `ARCHITECTURE.md`
  - [ ] Understand all 4 workflows
  - [ ] Review data flow diagrams
  - [ ] Identify integration points

- [ ] **Gather Credentials**
  - [ ] OpenAI API key (https://platform.openai.com/account/api-keys)
  - [ ] Supabase URL and keys (Supabase dashboard)
  - [ ] Gmail app password (Google Account → App Passwords)
  - [ ] Mailchimp API key (if using)
  - [ ] ConvertKit API key (if using)
  - [ ] HubSpot private app token (if using)
  - [ ] Backend API URL and authentication token

- [ ] **Plan Deployment**
  - [ ] Decide: n8n Cloud vs Docker vs Kubernetes
  - [ ] Allocate budget
  - [ ] Plan domain name
  - [ ] Plan SSL certificate (Let's Encrypt free)

---

## Phase 2: Environment Setup

### 2.1 - Start n8n

**For Docker:**
- [ ] Install Docker & Docker Compose
- [ ] Create docker-compose.yml from template
- [ ] Create .env file from template
- [ ] Run: `docker-compose up -d`
- [ ] Verify: `curl http://localhost:5678/api/v1/health`
- [ ] Access UI: http://localhost:5678

**For n8n Cloud:**
- [ ] Create account at https://n8n.cloud
- [ ] Create new instance
- [ ] Wait for instance to be ready
- [ ] Copy webhook base URL
- [ ] Note instance URL

**For Kubernetes:**
- [ ] Create namespace
- [ ] Deploy PostgreSQL
- [ ] Deploy n8n
- [ ] Configure ingress
- [ ] Verify pods are running

### 2.2 - Prepare Database

- [ ] Create Supabase tables (see SETUP_GUIDE.md)
  - [ ] `lead_magnets`
  - [ ] `leads`
  - [ ] `activity_log`
  - [ ] `analytics_summaries`
  - [ ] `sync_retry_queue` (optional)
  - [ ] `user_integrations` (optional)

- [ ] Create Supabase storage bucket
  - [ ] Name: `pdfs`
  - [ ] Visibility: Private
  - [ ] Test write access

- [ ] Create indexes for performance
  ```sql
  CREATE INDEX idx_leads_user_id ON leads(user_id);
  CREATE INDEX idx_lead_magnets_user_id ON lead_magnets(user_id);
  ```

- [ ] Verify database schema
  ```bash
  psql -h host -U user -d db -c "\dt public.*"
  ```

### 2.3 - Configure Credentials in n8n

- [ ] PostgreSQL (Supabase)
  - [ ] Test connection
  - [ ] Verify SSL setting
  - [ ] Name: "Supabase Production"

- [ ] OpenAI
  - [ ] Test API key
  - [ ] Name: "OpenAI"
  - [ ] Verify model availability (gpt-4)

- [ ] Gmail
  - [ ] Choose OAuth2 or App Password method
  - [ ] Test by sending test email
  - [ ] Name: "Gmail"

- [ ] Mailchimp (if using)
  - [ ] Test API key
  - [ ] Name: "Mailchimp"
  - [ ] Note server prefix (us1, us2, etc.)

- [ ] ConvertKit (if using)
  - [ ] Test API key and secret
  - [ ] Name: "ConvertKit"

- [ ] HubSpot (if using)
  - [ ] Test private app token
  - [ ] Verify scopes: contacts.read, contacts.write
  - [ ] Name: "HubSpot"

- [ ] Backend API
  - [ ] Create HTTP Basic Auth credential
  - [ ] Or HTTP Bearer Token credential
  - [ ] Test connection to /api/health

---

## Phase 3: Import & Configure Workflows

### 3.1 - Import Workflows

- [ ] **Lead Magnet Creation (01)**
  - [ ] Import JSON file
  - [ ] Verify all nodes present
  - [ ] Check webhook path: `lead-magnet`
  - [ ] Update credentials references

- [ ] **PDF Generation (02)**
  - [ ] Import JSON file
  - [ ] Update Supabase credential
  - [ ] Update backend API endpoint
  - [ ] Update Gmail credential

- [ ] **Lead Capture & Email Sync (03)**
  - [ ] Import JSON file
  - [ ] Update Supabase credential
  - [ ] Update Gmail credential
  - [ ] Update Mailchimp credential (if used)
  - [ ] Update ConvertKit credential (if used)
  - [ ] Update HubSpot credential (if used)

- [ ] **Daily Analytics (04)**
  - [ ] Import JSON file
  - [ ] Verify cron schedule: 00:00 UTC
  - [ ] Update Supabase credential
  - [ ] Update backend API endpoint
  - [ ] Update Gmail credential

### 3.2 - Activate Workflows

- [ ] Enable Lead Magnet Creation
  - [ ] Click workflow
  - [ ] Click toggle (top-right) → ON
  - [ ] Verify status: "Active"
  - [ ] Copy webhook URL

- [ ] Enable PDF Generation
  - [ ] Can be called from other workflows
  - [ ] Don't need to manually activate (called internally)
  - [ ] But can toggle ON to enable manual testing

- [ ] Enable Lead Capture & Email Sync
  - [ ] Click toggle → ON
  - [ ] Verify status: "Active"
  - [ ] Copy webhook URL

- [ ] Enable Daily Analytics
  - [ ] Click toggle → ON
  - [ ] Verify cron: 00:00 UTC
  - [ ] Check timezone setting

### 3.3 - Verify Webhook Endpoints

- [ ] Lead Magnet: `http://your-url/webhook/lead-magnet`
- [ ] Lead Capture: `http://your-url/webhook/lead-capture`
- [ ] Update frontend with these URLs
- [ ] Test each endpoint with curl

---

## Phase 4: Testing

### 4.1 - Pre-Test Checklist

- [ ] All services running
  - [ ] n8n: `curl http://localhost:5678/api/v1/health`
  - [ ] Backend: `curl http://localhost:3001/api/health`
  - [ ] Database: `psql -h host -U user -d db -c "SELECT 1;"`

- [ ] All credentials tested
  - [ ] Each credential shows "Test successful"
  - [ ] No "Connection failed" errors

- [ ] All workflows active
  - [ ] Toggle is ON for each workflow
  - [ ] Status shows "Active"

### 4.2 - Unit Tests

**Test Webhook 1: Lead Magnet Creation**

```bash
curl -X POST http://localhost:5678/webhook/lead-magnet \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Magnet",
    "topic": "Testing",
    "niche": "QA",
    "type": "pdf",
    "user_id": "test-user-123"
  }'
```

- [ ] Response status: 200
- [ ] Response includes lead_magnet.id
- [ ] No errors in n8n logs
- [ ] Database has new record in `lead_magnets`
- [ ] PDF generation started (check executions)

**Test Webhook 2: Lead Capture**

```bash
curl -X POST http://localhost:5678/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "lead_magnet_id": "magnet-123",
    "user_id": "test-user-123",
    "source": "test"
  }'
```

- [ ] Response status: 200
- [ ] Response includes lead.id
- [ ] No errors in n8n logs
- [ ] Database has new record in `leads`
- [ ] Welcome email sent
- [ ] Activity logged

**Test Workflow 3: PDF Generation**

- [ ] Open workflow 02
- [ ] Click "Execute Workflow"
- [ ] Execution completes successfully
- [ ] PDF created in database
- [ ] PDF file in Supabase Storage
- [ ] Confirmation email sent

**Test Workflow 4: Daily Analytics**

- [ ] Open workflow 04
- [ ] Click "Execute Workflow"
- [ ] Execution completes (may take 5 minutes)
- [ ] Summary email sent
- [ ] Data stored in `analytics_summaries`

### 4.3 - Integration Tests

- [ ] **Email Delivery**
  - [ ] Welcome emails arrive
  - [ ] Subject line is correct
  - [ ] Content renders properly
  - [ ] Links work
  - [ ] Check spam folder

- [ ] **Database Integrity**
  ```sql
  SELECT COUNT(*) FROM lead_magnets;  -- Should increase
  SELECT COUNT(*) FROM leads;          -- Should increase
  SELECT COUNT(*) FROM activity_log;   -- Should increase
  ```

- [ ] **Third-party Integrations** (if configured)
  - [ ] Mailchimp: Check subscriber added
  - [ ] ConvertKit: Check subscriber list
  - [ ] HubSpot: Check contact created

### 4.4 - Load Testing

- [ ] Create 10 test leads
  ```bash
  for i in {1..10}; do
    curl -X POST http://localhost:5678/webhook/lead-capture \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"user$i@test.com\",\"lead_magnet_id\":\"magnet-123\",\"user_id\":\"load-test\"}"
  done
  ```

- [ ] Monitor performance
  - [ ] Response times <3 seconds
  - [ ] No timeouts
  - [ ] No errors
  - [ ] Database handles volume

### 4.5 - Run Automated Tests

```bash
chmod +x scripts/test-workflows.sh
bash scripts/test-workflows.sh
```

- [ ] All tests pass
- [ ] No service failures
- [ ] Review validation checklist
- [ ] Document results

---

## Phase 5: Configuration & Optimization

### 5.1 - Performance Tuning

- [ ] Optimize database queries
  - [ ] Create indexes
  - [ ] Run VACUUM ANALYZE
  - [ ] Check query plans

- [ ] Optimize OpenAI prompts
  - [ ] Test different max_tokens values
  - [ ] Reduce if possible (saves cost)
  - [ ] Keep quality high

- [ ] Optimize email sending
  - [ ] Test rate limits
  - [ ] Batch send if needed
  - [ ] Monitor quota

### 5.2 - Monitoring Setup

- [ ] n8n Execution History
  - [ ] Enable: Admin → Settings → Execution Data
  - [ ] Set retention: 30 days
  - [ ] Set alerts for failures

- [ ] Database Monitoring
  - [ ] Check slow queries
  - [ ] Monitor table sizes
  - [ ] Track index usage

- [ ] Error Notifications
  - [ ] Email on workflow failure
  - [ ] Slack webhook (if using)
  - [ ] Set severity thresholds

### 5.3 - Security Hardening

- [ ] Credentials security
  - [ ] All API keys in environment variables
  - [ ] No hardcoded secrets
  - [ ] Encrypted storage

- [ ] Network security
  - [ ] Enable HTTPS (SSL/TLS)
  - [ ] Add CORS headers if needed
  - [ ] Rate limiting enabled

- [ ] Database security
  - [ ] Enable RLS (Row Level Security) if needed
  - [ ] Regular backups encrypted
  - [ ] Access logs reviewed

---

## Phase 6: Documentation & Training

### 6.1 - Create Documentation

- [ ] **Runbook**
  - [ ] How to start/stop n8n
  - [ ] How to restart workflows
  - [ ] Common issues and fixes
  - [ ] Emergency procedures

- [ ] **Workflow Documentation**
  - [ ] Each workflow purpose
  - [ ] Input/output formats
  - [ ] Expected execution time
  - [ ] Error handling

- [ ] **API Documentation**
  - [ ] Webhook endpoints
  - [ ] Request/response examples
  - [ ] Error codes
  - [ ] Rate limits

### 6.2 - Team Training

- [ ] **Developers**
  - [ ] How to modify workflows
  - [ ] How to debug issues
  - [ ] How to test changes
  - [ ] Version control procedures

- [ ] **Operations**
  - [ ] How to monitor health
  - [ ] How to respond to alerts
  - [ ] How to restore from backup
  - [ ] Escalation procedures

- [ ] **Support**
  - [ ] Common user issues
  - [ ] How to debug
  - [ ] Troubleshooting guide
  - [ ] When to escalate

---

## Phase 7: Deployment to Production

### 7.1 - Pre-Deployment Review

- [ ] Code review complete
  - [ ] All workflows reviewed
  - [ ] No hardcoded secrets
  - [ ] Error handling in place
  - [ ] Comments added

- [ ] Testing complete
  - [ ] All unit tests pass
  - [ ] Integration tests pass
  - [ ] Load tests pass
  - [ ] Manual testing done

- [ ] Documentation complete
  - [ ] Architecture documented
  - [ ] Workflows documented
  - [ ] Runbook created
  - [ ] Training completed

- [ ] Monitoring ready
  - [ ] Alerts configured
  - [ ] Dashboards created
  - [ ] Logs centralized
  - [ ] Backup tested

### 7.2 - Deployment

**Choose deployment option:**

- [ ] **n8n Cloud**
  - [ ] Create production instance
  - [ ] Import workflows
  - [ ] Configure credentials
  - [ ] Update webhook URLs
  - [ ] Test all endpoints

- [ ] **Docker**
  - [ ] Deploy to production server
  - [ ] Configure SSL certificate
  - [ ] Set environment variables
  - [ ] Start containers
  - [ ] Verify health

- [ ] **Kubernetes**
  - [ ] Deploy to cluster
  - [ ] Configure ingress
  - [ ] Set secrets
  - [ ] Verify pods
  - [ ] Test endpoints

### 7.3 - Post-Deployment

- [ ] Verify all workflows active
- [ ] Test each webhook endpoint
- [ ] Monitor execution logs
- [ ] Check email delivery
- [ ] Monitor database
- [ ] Review performance metrics

---

## Phase 8: Ongoing Maintenance

### 8.1 - Daily Tasks

- [ ] Check execution logs for errors
- [ ] Monitor error rates
- [ ] Check email delivery status
- [ ] Verify database performance

### 8.2 - Weekly Tasks

- [ ] Review workflow statistics
- [ ] Check API usage/costs
- [ ] Review security logs
- [ ] Update documentation if needed

### 8.3 - Monthly Tasks

- [ ] Rotate API keys (optional)
- [ ] Review performance metrics
- [ ] Optimize slow queries
- [ ] Update dependencies
- [ ] Test disaster recovery

### 8.4 - Quarterly Tasks

- [ ] Security audit
- [ ] Load testing
- [ ] Disaster recovery drill
- [ ] Documentation review
- [ ] Team training refresh

---

## Quick Reference

### Webhook URLs

```
Lead Magnet: POST {{BASE_URL}}/webhook/lead-magnet
Lead Capture: POST {{BASE_URL}}/webhook/lead-capture
```

### Credentials Needed

1. Supabase (PostgreSQL)
2. OpenAI API
3. Gmail (OAuth2 or App Password)
4. Mailchimp (API key, optional)
5. ConvertKit (API key, optional)
6. HubSpot (Private app token, optional)
7. Backend API (JWT/Bearer token)

### Database Tables

1. `lead_magnets` - Generated content
2. `leads` - Captured emails
3. `activity_log` - Audit trail
4. `analytics_summaries` - Daily stats
5. `user_integrations` - Email platform config

### Key Files

- `README.md` - Overview
- `ARCHITECTURE.md` - System design
- `SETUP_GUIDE.md` - Implementation steps
- `DEPLOYMENT.md` - Production deploy
- `scripts/test-workflows.sh` - Automated testing
- `docs/troubleshooting.md` - Common issues

---

## Success Criteria

- [ ] All 4 workflows created and active
- [ ] All webhooks responding correctly
- [ ] Data flowing to Supabase
- [ ] Emails sending successfully
- [ ] Email platforms syncing (if configured)
- [ ] Daily analytics generating
- [ ] Error rate <1%
- [ ] Response time <5 seconds (webhooks)
- [ ] Uptime >99%
- [ ] All logs accessible
- [ ] Alerts configured
- [ ] Backup procedure tested
- [ ] Team trained
- [ ] Documentation complete

---

## Troubleshooting Quick Links

- Webhook errors → `docs/troubleshooting.md` - Category 1
- Credential errors → `docs/troubleshooting.md` - Category 2
- Execution errors → `docs/troubleshooting.md` - Category 3
- Database errors → `docs/troubleshooting.md` - Category 4
- Email errors → `docs/troubleshooting.md` - Category 5
- Performance → `docs/troubleshooting.md` - Category 6

---

## Sign-Off

**Implementation Manager:** _________________ Date: _______

**QA Lead:** _________________ Date: _______

**Operations Lead:** _________________ Date: _______

**Product Owner:** _________________ Date: _______

---

## Notes

```
[Space for implementation notes, discoveries, and lessons learned]
```

