# n8n Workflow Automation Backbone - Phase 1 MVP

Complete production-ready n8n workflow setup that ties together the frontend, backend, and integrations for the Lead Magnet platform.

## 📁 Directory Structure

```
n8n-workflows/
├── README.md                          # This file
├── ARCHITECTURE.md                    # Complete architecture design
├── SETUP_GUIDE.md                     # Step-by-step setup instructions
├── workflows/
│   ├── 01-lead-magnet-creation.json   # Main lead magnet generation
│   ├── 02-pdf-generation.json         # PDF creation & storage
│   ├── 03-lead-capture-email-sync.json # Lead capture & email sync
│   ├── 04-daily-analytics.json        # Scheduled analytics summary
│   └── workflow-export-all.json       # All workflows combined
├── configs/
│   ├── .env.n8n.template              # Environment variables template
│   ├── credentials.md                 # How to set up credentials
│   └── backend-auth.md                # Backend API authentication
├── scripts/
│   ├── test-workflows.sh              # Testing script
│   ├── curl-examples.sh               # cURL testing commands
│   └── validation-checklist.md        # Verification checklist
├── docs/
│   ├── architecture-diagram.md        # Mermaid diagram & ASCII art
│   ├── workflow-reference.md          # Detailed workflow steps
│   ├── email-templates.md             # All email templates
│   ├── api-reference.md               # API endpoint reference
│   └── troubleshooting.md             # Common issues & solutions
├── templates/
│   ├── email-welcome.html             # Welcome email template
│   ├── email-confirmation.html        # PDF confirmation email
│   ├── email-daily-summary.html       # Analytics summary email
│   ├── pdf-template.html              # Lead magnet PDF template
│   └── error-notification.html        # Error notification email
└── DEPLOYMENT.md                      # Deployment guide (Docker, Cloud, Self-hosted)
```

## 🚀 Quick Start

1. **Setup Environment** → See `SETUP_GUIDE.md`
2. **Configure Credentials** → See `configs/credentials.md`
3. **Import Workflows** → Import JSON files into n8n
4. **Test Workflows** → Run `scripts/test-workflows.sh`
5. **Deploy** → Follow `DEPLOYMENT.md`

## 📋 What's Included

### Workflows (4 Main)
- **Lead Magnet Creation** - Generate content via OpenAI
- **PDF Generation** - Convert content to PDF & store
- **Lead Capture & Email Sync** - Capture leads & sync to email platforms
- **Daily Analytics** - Scheduled summary email with metrics

### Integrations
- ✅ OpenAI API (content generation)
- ✅ Supabase (data storage & file storage)
- ✅ Gmail SMTP (transactional emails)
- ✅ Mailchimp API (lead sync)
- ✅ ConvertKit API (lead sync)
- ✅ HubSpot API (lead sync)
- ✅ Backend API (custom endpoints)

### Documentation
- Complete architecture overview with diagrams
- Step-by-step setup guide
- All API configurations
- Email templates (HTML)
- Testing commands & validation checklist
- Troubleshooting guide
- Deployment options (Docker, n8n Cloud, Self-hosted)

## 🔑 Key Features

✅ **Error Handling** - Retry logic, email notifications on failure
✅ **Logging** - All activities logged to Supabase
✅ **Webhooks** - REST API triggers from frontend
✅ **Scheduling** - Cron triggers for daily analytics
✅ **Async Processing** - PDF generation runs in background
✅ **Production Ready** - Rate limiting, timeouts, validation
✅ **Testable** - cURL commands for every trigger
✅ **Documented** - Every step explained with examples

## 📝 Files to Read First

1. **ARCHITECTURE.md** - Understand the overall design
2. **SETUP_GUIDE.md** - Get everything running
3. **DEPLOYMENT.md** - Deploy to your environment
4. **workflows/workflow-reference.md** - See what each workflow does

## 🔗 Integration Points

- **Frontend** → Webhooks to n8n (HTTP POST)
- **n8n** → Backend API (REST calls)
- **n8n** → Supabase (PostgreSQL + Storage)
- **n8n** → Email Services (Gmail, Mailchimp, ConvertKit, HubSpot)
- **n8n** → OpenAI (Content generation)

## 📊 Data Flow

```
Frontend Form
    ↓
POST /webhook/lead-magnet
    ↓
Lead Magnet Creation Workflow
    ├→ Call OpenAI API
    ├→ Store in Supabase
    ├→ Trigger PDF Workflow
    └→ Return to Frontend
         ↓
    PDF Generation Workflow
         ├→ Fetch from Supabase
         ├→ Call Backend PDF Endpoint
         ├→ Upload to Storage
         ├→ Update Supabase
         └→ Send Email

Frontend Lead Capture Form
    ↓
POST /webhook/lead-capture
    ↓
Lead Capture & Email Sync Workflow
    ├→ Store in Supabase
    ├→ Send Welcome Email
    ├→ Check Email Integrations
    ├→ Sync to Mailchimp/ConvertKit/HubSpot
    └→ Log Activity

Daily at 00:00 UTC
    ↓
Daily Analytics Workflow
    ├→ Fetch Metrics from Supabase
    ├→ Calculate Stats
    ├→ Format Email
    ├→ Send via Gmail
    └→ Store Summary
```

## ⚙️ Technology Stack

- **n8n** - Workflow automation
- **Supabase** - Database & file storage
- **OpenAI** - Content generation
- **Gmail SMTP** - Transactional emails
- **Mailchimp/ConvertKit/HubSpot** - Email platform integrations
- **Backend API** - Custom endpoints (PDF generation, etc.)

## 📞 Support

All workflows include:
- Error notifications
- Retry logic with backoff
- Detailed logging
- Activity tracking

See `docs/troubleshooting.md` for common issues.

---

**Ready?** Start with `SETUP_GUIDE.md` → import workflows → test with `scripts/test-workflows.sh` → deploy!
