# n8n Workflow Troubleshooting Guide

Solutions for common issues and how to debug problems.

---

## Quick Diagnostics

### Check Service Status

```bash
# n8n
curl -s http://localhost:5678/api/v1/health | jq .

# Backend API
curl -s http://localhost:3001/api/health | jq .

# Supabase
curl -s https://your-project.supabase.co/rest/v1/ \
  -H "apikey: YOUR_KEY" | jq .
```

### View n8n Logs

```bash
# Docker
docker logs -f n8n

# Docker Compose
docker-compose logs -f n8n

# Self-hosted
pm2 logs n8n

# Kubernetes
kubectl logs -f deployment/n8n -n n8n
```

### Check Workflow Execution

1. Open n8n UI
2. Click **Workflows**
3. Click workflow name
4. Click **Executions** tab
5. Review recent executions for errors

---

## Category 1: Webhook Errors

### "Webhook not found" or 404 Error

**Symptom:** cURL returns 404 when posting to webhook

**Causes & Solutions:**

1. **Wrong path in workflow**
   ```bash
   # Check what path your webhook expects
   # In n8n, open workflow → click Webhook node → check "Path" field
   
   # Correct: http://localhost:5678/webhook/lead-magnet
   # Wrong: http://localhost:5678/webhook/lead_magnet
   ```

2. **Workflow is not Active**
   ```
   - Open workflow
   - Check toggle in top-right is ON (blue)
   - If OFF, click to enable
   - Webhook only works when workflow is Active
   ```

3. **n8n not running**
   ```bash
   curl http://localhost:5678/api/v1/health
   # If connection refused: n8n is down
   # Start with: docker-compose up -d n8n
   ```

4. **Wrong URL format**
   ```bash
   # Should be (no trailing slash):
   curl -X POST http://localhost:5678/webhook/lead-magnet ...
   
   # Not:
   curl -X POST http://localhost:5678/webhook/lead-magnet/ ...
   ```

### "Request timeout"

**Symptom:** Webhook request times out after 30+ seconds

**Causes & Solutions:**

1. **OpenAI API is slow**
   ```
   - Reduce max_tokens in prompt (default 2000)
   - Check OpenAI API status: https://status.openai.com/
   - Try simpler prompt
   - Add timeout handling in error node
   ```

2. **Backend PDF endpoint is slow**
   ```
   - Check backend logs
   - Optimize PDF generation
   - Increase timeout in workflow (max 35s for webhooks)
   ```

3. **Database is slow**
   ```bash
   # Test database directly
   psql -h host -U user -d db -c "SELECT 1;"
   
   # Check connection pool
   # Add indexes if needed
   CREATE INDEX idx_leads_user_id ON leads(user_id);
   ```

### "Method Not Allowed" (405 Error)

**Symptom:** POST to webhook returns 405

**Causes & Solutions:**

1. **Using wrong HTTP method**
   ```bash
   # Should be POST:
   curl -X POST http://localhost:5678/webhook/lead-magnet ...
   
   # Not GET:
   curl -X GET http://localhost:5678/webhook/lead-magnet ...
   ```

2. **Webhook configured for different method**
   ```
   - Open workflow
   - Click Webhook node
   - Check "HTTP Method" is POST
   ```

---

## Category 2: Credential & Authentication Errors

### "Invalid API key" for OpenAI

**Symptom:** OpenAI node fails with "Unauthorized"

**Solutions:**

1. **Check API key format**
   ```bash
   # OpenAI keys start with "sk-"
   # If not, it's wrong
   
   # Generate new key:
   # 1. Go to https://platform.openai.com/account/api-keys
   # 2. Click "Create new secret key"
   # 3. Copy immediately (only shown once)
   ```

2. **Check key is not expired**
   ```
   - Some keys expire after certain time
   - Check key creation date
   - Generate new one if needed
   ```

3. **Check organization has credits**
   ```
   - Go to https://platform.openai.com/account/billing/overview
   - Check "Available balance"
   - Add payment method if needed
   ```

4. **Update credential in n8n**
   ```
   - Go to Credentials
   - Find "OpenAI" credential
   - Click it
   - Update API key
   - Click "Save"
   - Test connection
   ```

### "Authentication failed" for Email Platforms

**Symptom:** Mailchimp/ConvertKit/HubSpot returns 401 or 403

**Solutions:**

1. **Mailchimp - Check API Key**
   ```
   - Go to https://mailchimp.com/account/
   - Click "Account" → "Extras" → "API keys"
   - Copy key (format: "key-us1")
   - Verify server prefix (us1, us2, etc.)
   - Update in n8n Credentials
   ```

2. **ConvertKit - Check API Key & Secret**
   ```
   - Go to https://app.convertkit.com/account/integrations
   - Find "API" section
   - Copy API Key and Secret
   - Update in n8n Credentials
   ```

3. **HubSpot - Check Private App Token**
   ```
   - Go to https://app.hubspot.com/ → Settings
   - Click "Integrations" → "Private apps"
   - Check app has required scopes:
     ✓ crm.objects.contacts.read
     ✓ crm.objects.contacts.write
   - Copy token
   - Update in n8n Credentials
   ```

4. **Gmail - OAuth Token Expired**
   ```
   - Go to Credentials → Gmail
   - Click "Reconnect with account"
   - Follow OAuth2 flow again
   - Authorize n8n app
   ```

### "Database connection failed"

**Symptom:** PostgreSQL node fails with connection error

**Solutions:**

1. **Check Supabase is running**
   ```bash
   # Test connection
   curl https://your-project.supabase.co
   
   # If fails, check Supabase status:
   # https://status.supabase.com/
   ```

2. **Check credentials**
   ```
   - Open n8n Credentials → PostgreSQL
   - Verify all fields:
     ✓ Host: your-project.supabase.co
     ✓ Port: 5432
     ✓ Database: postgres
     ✓ User: postgres
     ✓ Password: ••••
   - Test connection
   ```

3. **Check SSL setting**
   ```
   - Most managed databases require SSL
   - In PostgreSQL credential, enable SSL
   - Toggle: SSL/TLS → "On"
   ```

4. **Network access**
   ```bash
   # Check if server can reach database
   curl -v telnet://your-project.supabase.co:5432
   
   # If blocked:
   - Check firewall rules
   - Whitelist n8n server IP in Supabase
   ```

---

## Category 3: Execution Errors

### "Lead magnet creation failed" - Workflow Execution Error

**Symptom:** Workflow shows red X in Executions tab

**Debug Steps:**

1. **Check OpenAI Node Error**
   ```
   - Click Executions tab
   - Click failed execution
   - Look for error in OpenAI node
   - Common errors:
     • "Rate limit exceeded" - Wait 1 minute
     • "Invalid request" - Check prompt syntax
     • "Timeout" - API too slow
   ```

2. **Check Supabase Node Error**
   ```
   - Same process as above
   - Common errors:
     • "Column not found" - Check table schema
     • "Duplicate key" - ID already exists
     • "Connection timeout" - Database too slow
   ```

3. **Enable Debug Mode**
   ```
   - Open workflow
   - Click "Test" button
   - Send sample data
   - See detailed error messages
   ```

### "Timeout" on PDF Generation

**Symptom:** PDF workflow execution times out after 60 seconds

**Solutions:**

1. **Backend /api/pdf-generate is slow**
   ```bash
   # Test directly:
   curl -X POST http://localhost:3001/api/pdf-generate \
     -H "Content-Type: application/json" \
     -d '{"content":"<html>Test</html>"}'
   
   # Should respond in <10 seconds
   # If slower: optimize PDF generation
   ```

2. **Increase workflow timeout**
   ```
   - Open workflow
   - Click workflow settings (gear icon)
   - Set "Timeout": 120 seconds (max)
   - For longer, use background task
   ```

3. **Split into smaller tasks**
   ```
   - Instead of generating in one step
   - Queue task for background worker
   - Return immediately
   - Process PDF asynchronously
   ```

### "Data missing" in Email Sync

**Symptom:** Email sent but fields are empty ({{FIRST_NAME}} shows as blank)

**Solutions:**

1. **Check request payload includes data**
   ```bash
   # When sending to webhook, include:
   curl -X POST http://localhost:5678/webhook/lead-capture \
     -d '{
       "email": "...",
       "first_name": "John",  # This is important!
       "lead_magnet_id": "..."
     }'
   ```

2. **Check node is extracting data correctly**
   ```
   - Open workflow
   - Click Webhook node
   - Click "Test"
   - Send sample data
   - See parsed body
   ```

3. **Check email template references correct field**
   ```
   - In email node, template should use:
     {{$node["Webhook - Lead Capture"].json.first_name}}
   
   - Not:
     {{first_name}}  (won't work)
   ```

---

## Category 4: Database Issues

### "Table does not exist"

**Symptom:** PostgreSQL node fails with "relation not found"

**Solutions:**

1. **Create missing tables**
   ```sql
   -- Run in Supabase SQL editor:
   CREATE TABLE lead_magnets (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL,
     title VARCHAR(255) NOT NULL,
     -- ... other fields
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Check table name spelling**
   ```
   - SQL is case-sensitive for table names
   - "lead_magnets" vs "Lead_Magnets" are different
   - Always use lowercase with underscores
   ```

3. **Verify table is in public schema**
   ```sql
   -- Check tables in public schema:
   SELECT * FROM information_schema.tables 
   WHERE table_schema = 'public';
   
   -- If table in different schema:
   SELECT COUNT(*) FROM your_schema.table_name;
   ```

### "Permission denied" on Database

**Symptom:** Query runs in SQL editor but fails in n8n

**Solutions:**

1. **Check user permissions**
   ```sql
   -- In Supabase, verify role has permissions:
   GRANT SELECT, INSERT, UPDATE ON public.leads TO postgres;
   GRANT USAGE ON SCHEMA public TO postgres;
   ```

2. **Use correct user**
   ```
   - Check n8n credential uses correct user
   - Supabase usually uses: postgres user
   - Not: dashboard user
   ```

3. **Enable RLS (Row Level Security) carefully**
   ```sql
   -- If RLS is enabled, add policies:
   CREATE POLICY "Enable all for authenticated users"
   ON leads FOR ALL
   USING (true)
   WITH CHECK (true);
   ```

### "Data not appearing" in Database

**Symptom:** Workflow shows success but no data in table

**Solutions:**

1. **Check INSERT query syntax**
   ```
   - Open workflow → PostgreSQL node
   - Click "Test"
   - Check generated SQL
   - Verify column names match table schema
   ```

2. **Missing NOT NULL columns**
   ```
   - If column is NOT NULL, must provide value
   - Check all required fields are in INSERT
   - Use DEFAULT values if available
   ```

3. **Check table has correct columns**
   ```sql
   -- List all columns:
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'leads';
   ```

4. **Transaction not committed**
   ```
   - PostgreSQL node auto-commits
   - If workflow fails before commit, data lost
   - Check workflow completes successfully
   ```

---

## Category 5: Email Issues

### "Email not sending"

**Symptom:** No error in logs but email never arrives

**Solutions:**

1. **Check Gmail configuration**
   ```
   - Gmail node requires 2FA enabled
   - Generate app password (not regular password)
   - Update in n8n Gmail credential
   - Test with manual workflow
   ```

2. **Check recipient email**
   ```
   - Verify email address is valid
   - Not: user@example (missing domain)
   - Not: user @example.com (space in email)
   - Check in spam/junk folder
   ```

3. **Check email quota**
   ```
   - Gmail has daily limits
   - Default: 100 emails/day
   - Check at: https://myaccount.google.com/
   - If limit reached, wait 24 hours
   ```

4. **Check email content**
   ```
   - If email is too long, may fail
   - Keep under 25MB
   - Avoid certain HTML tags
   - Test with simple text first
   ```

### "Email arrives but content is wrong"

**Symptom:** Email sent but {{variables}} not replaced

**Solutions:**

1. **Check template syntax**
   ```
   - Should be: {{$node["Node Name"].json.field}}
   - Not: {{field}}
   - Not: {{Node Name.field}}
   - Node names must be exact (case-sensitive)
   ```

2. **Check data is available at that point**
   ```
   - Click workflow
   - Run with Test data
   - Verify each node has expected data
   - Check "Output" tab for each node
   ```

3. **Use Code node to debug**
   ```javascript
   // Add before email node:
   return {
     first_name: $node["Webhook"].json.first_name,
     email: $node["Webhook"].json.email
   };
   ```

---

## Category 6: Performance Issues

### "Workflow is too slow"

**Symptom:** Executions take >10 seconds

**Causes & Solutions:**

1. **OpenAI API timeout**
   ```
   - Check OpenAI API status
   - Reduce max_tokens
   - Use simpler prompt
   - Switch to gpt-3.5-turbo (faster)
   ```

2. **Database query slow**
   ```sql
   -- Add indexes:
   CREATE INDEX idx_leads_user_id ON leads(user_id);
   CREATE INDEX idx_leads_created_at ON leads(created_at);
   
   -- Check query plan:
   EXPLAIN ANALYZE SELECT * FROM leads WHERE user_id = '...';
   ```

3. **Network latency**
   ```
   - n8n server far from database
   - Check ping time to server
   - Use VPC/private network if available
   ```

4. **Supabase Storage upload slow**
   ```
   - File too large
   - Network connection slow
   - Check upload speed:
     time curl -X PUT ... --data-binary @file
   ```

### "High memory usage"

**Symptom:** n8n process uses excessive memory

**Solutions:**

1. **Reduce execution data retention**
   ```
   - n8n stores all execution data
   - Delete old executions:
     • Admin → Execution Data → Prune Executions
   ```

2. **Disable detailed logging**
   ```
   - Set LOG_LEVEL to "warn" instead of "debug"
   - In .env: LOG_LEVEL=warn
   ```

3. **Increase container memory**
   ```yaml
   # In docker-compose.yml:
   n8n:
     mem_limit: 2g  # Increase from default 512m
   ```

---

## Debugging Tools

### n8n Expression Debugger

1. Click any node
2. Click "Expression" (function icon)
3. Type: `$json`
4. See all available data

### cURL Testing

```bash
# Test webhook with real data:
curl -X POST http://localhost:5678/webhook/lead-magnet \
  -H "Content-Type: application/json" \
  -d @test-payload.json \
  -v  # Verbose: shows request/response

# Save response:
curl ... > response.json

# Pretty print:
curl ... | jq .
```

### Database Query Testing

```bash
# Test Supabase directly:
psql -h your-project.supabase.co \
  -U postgres \
  -d postgres \
  -c "SELECT COUNT(*) FROM leads;"

# Or use Supabase UI:
# 1. Open https://supabase.com/dashboard
# 2. Go to SQL Editor
# 3. Run test queries
```

### API Testing with Postman

1. Import Postman collection from `scripts/curl-examples.sh`
2. Set environment variables
3. Run requests one by one
4. See responses

---

## Getting Help

### Where to Find Logs

- **n8n logs:** Dashboard → Executions tab
- **n8n container logs:** `docker logs n8n`
- **Database logs:** Supabase dashboard
- **Backend logs:** Check backend server
- **Browser console:** F12 → Console tab

### Support Resources

- **n8n Docs:** https://docs.n8n.io/
- **n8n Community:** https://community.n8n.io/
- **Supabase Support:** https://supabase.com/docs/
- **OpenAI Status:** https://status.openai.com/

### Collecting Debug Info

When asking for help, provide:

```
- n8n version: (Settings → About)
- Error message (full text)
- Workflow name
- Execution ID (from Executions tab)
- Recent logs
- Payload you sent
- Expected vs actual result
```

---

## Recovery Procedures

### Restore from Backup

```bash
# PostgreSQL backup:
docker exec n8n-db psql -U n8n n8n < backup.sql

# n8n data backup:
docker cp backup.tar.gz n8n-app:/tmp/
docker exec n8n tar -xzf /tmp/backup.tar.gz -C /home/node/
```

### Reset to Default State

```bash
# Warning: This deletes all workflows and credentials!

# Docker:
docker-compose down -v
docker-compose up -d

# This will start fresh (warning: data lost)
```

### Manual Rollback

```bash
# If deployment fails:

# Docker:
docker rollback n8n  # or restart with previous image

# Kubernetes:
kubectl rollout undo deployment/n8n -n n8n
```

---

## Performance Benchmarks (Expected Times)

| Operation | Expected Time | Alert Threshold |
|-----------|----------------|-----------------|
| Lead magnet creation | 3-5 seconds | >10 seconds |
| PDF generation | 5-10 seconds | >30 seconds |
| Lead capture | 2-3 seconds | >10 seconds |
| Daily analytics | 2-5 minutes | >15 minutes |
| Email send | <1 second | >5 seconds |
| Database query | <100ms | >500ms |

If you're seeing longer times, check troubleshooting section above.

