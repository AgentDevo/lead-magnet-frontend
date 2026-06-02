# Workflow Reference Guide

Complete reference for all 4 workflows in the Phase 1 MVP.

---

## 1. Lead Magnet Creation Workflow

**File:** `01-lead-magnet-creation.json`  
**Trigger:** HTTP POST webhook  
**Execution Time:** <5 seconds  
**Timeout:** 35 seconds

### Webhook Endpoint

```
POST http://localhost:5678/webhook/lead-magnet
```

### Request Payload

```json
{
  "title": "The Complete Guide to Content Marketing",
  "topic": "Content Marketing",
  "niche": "SaaS",
  "type": "pdf",
  "user_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

### Request Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| title | string | Yes | Lead magnet title | "10 SEO Tips" |
| topic | string | Yes | Main topic | "SEO" |
| niche | string | Yes | Target niche | "E-commerce" |
| type | string | Yes | Content type | "pdf", "video", "checklist" |
| user_id | string | Yes | User ID | UUID or string |

### Response (Success)

```json
{
  "success": true,
  "lead_magnet": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "The Complete Guide to Content Marketing",
    "content": {
      "chapters": [
        {
          "name": "Chapter 1: Introduction",
          "content": "..."
        },
        {
          "name": "Chapter 2: Strategies",
          "content": "..."
        }
      ],
      "intro": "Welcome to the complete guide...",
      "cta": "Download your free guide now"
    }
  },
  "message": "Lead magnet created successfully. PDF generation in progress."
}
```

### Response (Error)

```json
{
  "success": false,
  "error": "Failed to generate lead magnet content",
  "details": "OpenAI API error: Rate limit exceeded"
}
```

### Workflow Steps

1. **Webhook Trigger** (Receive Request)
   - Accepts POST request
   - Validates content type
   - Parses JSON body

2. **Validate Input** (Code Node)
   - Check required fields present
   - Validate field types
   - Check user_id format

3. **Call OpenAI API** (OpenAI Node)
   - Prompt: Generate lead magnet structure
   - Model: gpt-4
   - Max tokens: 2000
   - Temperature: 0.7
   - Timeout: 30 seconds

4. **Store in Supabase** (PostgreSQL Node)
   - Table: `lead_magnets`
   - Fields: id, user_id, title, topic, niche, type, content, status
   - Status: "generating"
   - Timestamp: Current time

5. **Trigger PDF Generation** (Execute Workflow Node)
   - Calls: `02 - PDF Generation`
   - Waits: No (async)
   - Passes: lead_magnet_id, content

6. **Return Success** (Respond to Webhook)
   - Status: 200 OK
   - Body: Success response with lead magnet data
   - Headers: Content-Type: application/json

7. **Error Handler** (On Failure)
   - Send email to admin with error details
   - Return 500 error response
   - Log error to database

### Database Changes

**Table:** `lead_magnets`

```sql
INSERT INTO lead_magnets (
  id, user_id, title, topic, niche, type, 
  content, status, created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '123e4567-e89b-12d3-a456-426614174000',
  'The Complete Guide to Content Marketing',
  'Content Marketing',
  'SaaS',
  'pdf',
  '{...}',
  'generating',
  NOW(),
  NOW()
);
```

### Error Scenarios

| Error | Cause | Resolution |
|-------|-------|-----------|
| OpenAI timeout | API slow or down | Retry with backoff |
| Invalid API key | Wrong OPENAI_API_KEY | Update credential |
| Database error | Connection failed | Check Supabase status |
| Missing fields | Incomplete request | Validate request |
| Rate limit | Too many requests | Implement queue |

### Monitoring

- **Success rate:** Should be >95%
- **Avg execution time:** <5 seconds
- **OpenAI API calls:** ~1 per request
- **Database writes:** 1 per request

---

## 2. PDF Generation Workflow

**File:** `02-pdf-generation.json`  
**Trigger:** Internal (from Lead Magnet Creation)  
**Execution Time:** <10 seconds  
**Timeout:** 60 seconds  
**Retry:** Yes (3 attempts, 5 min backoff)

### Trigger

Called from workflow `01 - Lead Magnet Creation` with lead_magnet_id.

### Workflow Steps

1. **Fetch Lead Magnet Data** (PostgreSQL Node)
   - Query: `SELECT * FROM lead_magnets WHERE id = {{id}}`
   - Returns: All magnet data and content

2. **Format Content** (Code Node - Optional)
   - Convert markdown to HTML
   - Apply CSS styles
   - Format for PDF

3. **Call Backend PDF Endpoint** (HTTP Request Node)
   - Endpoint: `POST http://localhost:3001/api/pdf-generate`
   - Auth: Bearer token
   - Timeout: 35 seconds
   - Retry: 2 times

4. **Upload PDF to Storage** (Supabase Storage Node)
   - Bucket: `pdfs`
   - Filename: `{{lead_magnet_id}}.pdf`
   - Path: `/pdfs/{{lead_magnet_id}}.pdf`
   - Visibility: Private

5. **Update Supabase** (PostgreSQL Node)
   - Table: `lead_magnets`
   - Update: pdf_url, status="published", updated_at
   - Query: `UPDATE lead_magnets SET ... WHERE id = {{id}}`

6. **Send Confirmation Email** (Gmail Node)
   - To: `{{user_email}}`
   - Subject: "Your Lead Magnet is Ready: {{title}}"
   - Template: Welcome email with download link

7. **Error Handler** (On Failure)
   - Send notification email to admin
   - Update status to "error"
   - Queue for retry

### Backend API Integration

**Endpoint:** `POST /api/pdf-generate`

**Request:**
```json
{
  "content": "<html>...</html>",
  "title": "Lead Magnet Title",
  "filename": "lead-magnet-uuid.pdf",
  "options": {
    "format": "A4",
    "margin": "1cm"
  }
}
```

**Response:**
```json
{
  "success": true,
  "pdf_url": "https://storage.supabase.co/object/public/pdfs/...",
  "file_size": 1024000,
  "pages": 12
}
```

### Database Changes

```sql
UPDATE lead_magnets SET
  pdf_url = 'https://storage.supabase.co/object/public/pdfs/id.pdf',
  status = 'published',
  updated_at = NOW()
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

### File Storage

- **Bucket:** `pdfs`
- **Path:** `/pdfs/{lead_magnet_id}.pdf`
- **Access:** Private (signed URLs for downloads)
- **Retention:** 30 days

### Error Scenarios

| Error | Cause | Resolution |
|-------|-------|-----------|
| PDF generation fails | Backend down | Queue for retry |
| Upload fails | Storage quota | Increase quota |
| Email not sent | Gmail error | Retry with backoff |
| Database update fails | Connection issue | Retry entire workflow |

### Monitoring

- **Success rate:** >95%
- **Avg execution time:** 8-10 seconds
- **PDF size:** <5MB
- **Upload speed:** >1MB/s

---

## 3. Lead Capture & Email Sync Workflow

**File:** `03-lead-capture-email-sync.json`  
**Trigger:** HTTP POST webhook  
**Execution Time:** <3 seconds  
**Timeout:** 30 seconds

### Webhook Endpoint

```
POST http://localhost:5678/webhook/lead-capture
```

### Request Payload

```json
{
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "lead_magnet_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "source": "landing-page",
  "phone": "+1234567890",
  "company": "ACME Corp",
  "utm_source": "facebook",
  "utm_campaign": "summer-sale"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Lead email address |
| lead_magnet_id | string | Yes | Which magnet they downloaded |
| user_id | string | Yes | Owner of the magnet |
| first_name | string | No | Lead first name |
| last_name | string | No | Lead last name |
| phone | string | No | Phone number |
| company | string | No | Company name |
| source | string | No | Where they came from |
| utm_source | string | No | UTM source |
| utm_campaign | string | No | UTM campaign |

### Response (Success)

```json
{
  "success": true,
  "lead": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "email": "john@example.com",
    "status": "captured"
  },
  "message": "Lead captured and synced successfully"
}
```

### Workflow Steps

1. **Webhook Trigger** (Receive Request)
   - Validates email format
   - Parses all fields

2. **Store Lead in Supabase** (PostgreSQL Node)
   - Table: `leads`
   - Status: "new"
   - Records email, name, source, etc.

3. **Send Welcome Email** (Gmail Node)
   - To: Lead email address
   - Subject: "Welcome! Your Lead Magnet is Ready"
   - Template: Welcome email with download link

4. **Fetch User Integrations** (PostgreSQL Node)
   - Query: User's connected integrations
   - Returns: Mailchimp list ID, ConvertKit form, HubSpot API key

5. **Conditional Sync** (If blocks)
   - If Mailchimp enabled → Sync to Mailchimp
   - If ConvertKit enabled → Sync to ConvertKit
   - If HubSpot enabled → Sync to HubSpot

6. **Sync to Email Platforms**

   **Mailchimp (POST /3.0/lists/{id}/members):**
   ```json
   {
     "email_address": "john@example.com",
     "status": "subscribed",
     "merge_fields": {
       "FNAME": "John",
       "LNAME": "Doe",
       "MAGNET": "550e8400-..."
     }
   }
   ```

   **ConvertKit (POST /v3/subscribers):**
   ```json
   {
     "email": "john@example.com",
     "first_name": "John",
     "api_secret": "secret..."
   }
   ```

   **HubSpot (POST /crm/v3/objects/contacts):**
   ```json
   {
     "properties": [
       {"name": "email", "value": "john@example.com"},
       {"name": "firstname", "value": "John"},
       {"name": "lastname", "value": "Doe"}
     ]
   }
   ```

7. **Log Activity** (PostgreSQL Node)
   - Table: `activity_log`
   - Action: "lead_captured"
   - Records details for analytics

8. **Return Success** (Respond to Webhook)
   - Status: 200 OK
   - Includes lead ID and status

9. **Error Handlers** (On failure for each integration)
   - If sync fails → Queue for retry
   - Don't fail the whole workflow
   - Log error for manual review

### Database Changes

```sql
INSERT INTO leads (
  id, user_id, lead_magnet_id, email, 
  first_name, last_name, status, created_at
) VALUES (
  '660e8400-e29b-41d4-a716-446655440001',
  '123e4567-e89b-12d3-a456-426614174000',
  '550e8400-e29b-41d4-a716-446655440000',
  'john@example.com',
  'John',
  'Doe',
  'new',
  NOW()
);

INSERT INTO activity_log (
  id, user_id, action, entity_type, entity_id, details
) VALUES (
  '770e8400-e29b-41d4-a716-446655440002',
  '123e4567-e89b-12d3-a456-426614174000',
  'lead_captured',
  'lead',
  '660e8400-e29b-41d4-a716-446655440001',
  '{"email":"john@example.com","source":"landing-page"}'
);
```

### Integration Retry Queue

If sync fails, entry added to `sync_retry_queue`:

```sql
INSERT INTO sync_retry_queue (
  id, lead_id, integration_type, status, 
  error_message, retry_count, next_retry_at
) VALUES (
  '880e8400-e29b-41d4-a716-446655440003',
  '660e8400-e29b-41d4-a716-446655440001',
  'mailchimp',
  'failed',
  'API error: Invalid email',
  0,
  NOW() + INTERVAL '5 minutes'
);
```

### Error Scenarios

| Error | Cause | Resolution |
|-------|-------|-----------|
| Invalid email | Bad format | Return error to frontend |
| Duplicate email | Already exists | Update existing record |
| Mailchimp failure | API error | Queue for retry |
| Database error | Connection lost | Retry request |
| Email send failure | Gmail quota | Retry with backoff |

### Monitoring

- **Success rate:** >98%
- **Avg execution time:** 2-3 seconds
- **Email delivery:** >95% within 5 min
- **Integration sync:** >90% on first attempt

---

## 4. Daily Analytics Summary Workflow

**File:** `04-daily-analytics.json`  
**Trigger:** Cron (00:00 UTC daily)  
**Execution Time:** <5 minutes  
**Timeout:** 30 minutes

### Cron Schedule

```
Every day at 00:00 UTC
```

### Workflow Steps

1. **Cron Trigger** (Scheduled)
   - Time: 00:00 UTC
   - Frequency: Daily
   - Timezone: UTC

2. **Call Backend Analytics** (HTTP Request Node)
   - Endpoint: `GET /api/analytics?date=2024-03-16`
   - Auth: Bearer token
   - Timeout: 30 seconds

3. **Fetch Today's Leads** (PostgreSQL Node)
   - Query: Leads created today
   - Returns: Count and details

4. **Fetch Top Magnets** (PostgreSQL Node)
   - Query: Top 5 magnets by views
   - Returns: Title, views, conversions

5. **Calculate Stats** (Code Node)
   ```javascript
   const leads = todaysLeads.length;
   const conversions = backendData.conversions;
   const conversionRate = (conversions / leads) * 100;
   const topPerformer = topMagnets[0].title;
   const revenue = backendData.revenue;
   
   return {
     leads,
     conversions,
     conversionRate,
     topPerformer,
     revenue
   };
   ```

6. **Format Email** (Gmail Node)
   - To: `{{USER_EMAIL}}`
   - Subject: "Daily Summary - 2024-03-16"
   - Template: Daily summary HTML email

7. **Store in Database** (PostgreSQL Node)
   - Table: `analytics_summaries`
   - Records: date, leads, conversions, rate, revenue

8. **Error Handler** (On failure)
   - Send notification to admin
   - Log error but don't fail workflow

### Backend API Integration

**Endpoint:** `GET /api/analytics?date=YYYY-MM-DD`

**Response:**
```json
{
  "date": "2024-03-16",
  "leads": 42,
  "conversions": 12,
  "revenue": 1200,
  "top_magnets": [
    {
      "id": "magnet-1",
      "title": "SEO Guide",
      "views": 150
    }
  ]
}
```

### Email Content

Subject: `Daily Summary - 2024-03-16`

Body:
```
Key Metrics
-----------
Leads: 42
Conversions: 12
Conversion Rate: 28.57%
Revenue: $1,200

Top Performer
-----------
SEO Guide - 150 views

Top 5 Lead Magnets
-----------
1. SEO Guide (150 views)
2. Email Marketing (98 views)
3. Content Tips (87 views)
...

View Full Dashboard
[Link]
```

### Database Changes

```sql
INSERT INTO analytics_summaries (
  id, user_id, date, leads, conversions, 
  conversion_rate, top_magnets, revenue, created_at
) VALUES (
  '990e8400-e29b-41d4-a716-446655440004',
  '123e4567-e89b-12d3-a456-426614174000',
  '2024-03-16',
  42,
  12,
  28.57,
  '[{"title":"SEO Guide","views":150}]',
  1200.00,
  NOW()
);
```

### Error Scenarios

| Error | Cause | Resolution |
|-------|-------|-----------|
| No data for day | New user | Skip silently |
| Email not sent | Gmail quota | Log and continue |
| Database error | Connection lost | Retry tomorrow |

### Monitoring

- **Success rate:** >99%
- **Execution time:** 2-5 minutes
- **Email delivery:** >95%
- **Data accuracy:** Verify daily

---

## Common Issues & Solutions

### Webhook Not Triggering

1. Check webhook path is correct
2. Verify workflow is Active (toggle on)
3. Check n8n logs: `docker logs n8n`
4. Test with curl

### Slow Execution

1. Check OpenAI API response time
2. Reduce max_tokens in prompt
3. Check database query performance
4. Monitor n8n server resources

### Integration Sync Failures

1. Verify API credentials are correct
2. Check rate limits aren't exceeded
3. Check email format validation
4. Review API error messages

### Database Connection Issues

1. Verify Supabase URL and credentials
2. Check network connectivity
3. Verify table and column names
4. Check for typos in queries

---

## Testing Each Workflow

See `scripts/test-workflows.sh` and `scripts/curl-examples.sh` for complete testing procedures.

