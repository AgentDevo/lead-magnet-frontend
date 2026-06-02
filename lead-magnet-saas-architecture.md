# Lead Magnet Generator SaaS - Architecture Design

## 1. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐     ┌─────────────────┐    ┌─────────────────┐  │
│  │   Next.js App   │     │ Landing Pages   │    │   Analytics     │  │
│  │  (Dashboard)    │     │   (Dynamic)     │    │   Dashboard     │  │
│  └────────┬────────┘     └────────┬────────┘    └────────┬────────┘  │
│           │                       │                       │            │
└───────────┼───────────────────────┼───────────────────────┼────────────┘
            │                       │                       │
            ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐     ┌─────────────────┐    ┌─────────────────┐  │
│  │  Next.js API    │     │   n8n Webhooks  │    │  Supabase Edge  │  │
│  │   Routes        │◄────►│   (Workflows)   │◄──►│   Functions     │  │
│  └────────┬────────┘     └────────┬────────┘    └────────┬────────┘  │
│           │                       │                       │            │
└───────────┼───────────────────────┼───────────────────────┼────────────┘
            │                       │                       │
            ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SERVICES LAYER                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────┐  │
│  │   OpenAI API    │  │  PDF Generator  │  │  Email Providers    │  │
│  │  (GPT-4)        │  │  (Puppeteer)    │  │  (Mailchimp, etc)   │  │
│  └─────────────────┘  └─────────────────┘  └──────────────────────┘  │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────┐  │
│  │   Stripe API    │  │   Redis Cache   │  │   CDN (Vercel)      │  │
│  │  (Payments)     │  │  (Performance)   │  │   (Static Assets)   │  │
│  └─────────────────┘  └─────────────────┘  └──────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                        Supabase                                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │  │
│  │  │  PostgreSQL │  │    Auth     │  │   Realtime Updates     │ │  │
│  │  │  Database   │  │  (JWT/RLS)  │  │   (Subscriptions)      │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │  │
│  │                                                                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │  │
│  │  │   Storage   │  │    Vector   │  │   Row Level Security   │ │  │
│  │  │  (S3-like)  │  │  Embeddings │  │   (RLS Policies)       │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. Detailed Supabase Schema with RLS Policies

### Database Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free', -- free, starter, pro, enterprise
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'inactive', -- active, inactive, past_due, canceled
  plan_id TEXT NOT NULL, -- starter, pro, enterprise
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Templates table (system-wide templates)
CREATE TABLE public.templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- ebook, checklist, guide, cheatsheet
  category TEXT,
  style_config JSONB NOT NULL, -- fonts, colors, layout settings
  content_structure JSONB NOT NULL, -- sections, prompts, etc
  thumbnail_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead magnets table
CREATE TABLE public.lead_magnets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.templates(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- ebook, checklist, guide, cheatsheet
  content JSONB NOT NULL, -- structured content
  ai_prompt TEXT,
  ai_response JSONB,
  pdf_url TEXT,
  cover_image_url TEXT,
  status TEXT DEFAULT 'draft', -- draft, generating, published, archived
  generation_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Landing pages table
CREATE TABLE public.landing_pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  lead_magnet_id UUID REFERENCES public.lead_magnets(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  form_config JSONB NOT NULL, -- form fields, styling, etc
  page_config JSONB NOT NULL, -- colors, fonts, layout
  custom_domain TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Leads table (captured emails)
CREATE TABLE public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  landing_page_id UUID REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  form_data JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  gdpr_consent BOOLEAN DEFAULT FALSE,
  gdpr_consent_timestamp TIMESTAMPTZ,
  email_verified BOOLEAN DEFAULT FALSE,
  synced_to_provider BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE public.analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  landing_page_id UUID REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  lead_magnet_id UUID REFERENCES public.lead_magnets(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- page_view, form_submission, download, etc
  event_data JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email integrations table
CREATE TABLE public.email_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- mailchimp, convertkit, hubspot
  api_key_encrypted TEXT,
  list_id TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_lead_magnets_user_id ON public.lead_magnets(user_id);
CREATE INDEX idx_lead_magnets_status ON public.lead_magnets(status);
CREATE INDEX idx_landing_pages_slug ON public.landing_pages(slug);
CREATE INDEX idx_landing_pages_user_id ON public.landing_pages(user_id);
CREATE INDEX idx_leads_landing_page_id ON public.leads(landing_page_id);
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_magnets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_integrations ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Templates policies (public read, admin write)
CREATE POLICY "Anyone can view active templates" ON public.templates
  FOR SELECT USING (is_active = true);

-- Lead magnets policies
CREATE POLICY "Users can view own lead magnets" ON public.lead_magnets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lead magnets" ON public.lead_magnets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lead magnets" ON public.lead_magnets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lead magnets" ON public.lead_magnets
  FOR DELETE USING (auth.uid() = user_id);

-- Landing pages policies
CREATE POLICY "Users can view own landing pages" ON public.landing_pages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published landing pages" ON public.landing_pages
  FOR SELECT USING (is_published = true);

CREATE POLICY "Users can create own landing pages" ON public.landing_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own landing pages" ON public.landing_pages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own landing pages" ON public.landing_pages
  FOR DELETE USING (auth.uid() = user_id);

-- Leads policies
CREATE POLICY "Users can view leads from their landing pages" ON public.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.landing_pages 
      WHERE landing_pages.id = leads.landing_page_id 
      AND landing_pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can create leads" ON public.leads
  FOR INSERT WITH CHECK (true);

-- Analytics events policies
CREATE POLICY "Users can view own analytics" ON public.analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

-- Email integrations policies
CREATE POLICY "Users can manage own integrations" ON public.email_integrations
  FOR ALL USING (auth.uid() = user_id);
```

## 3. Next.js File Structure and API Routes

```
lead-magnet-saas/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── lead-magnets/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── landing-pages/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── edit/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── leads/
│   │   │   │   └── page.tsx
│   │   │   ├── integrations/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       └── billing/
│   │   │           └── page.tsx
│   │   └── layout.tsx
│   ├── l/
│   │   └── [slug]/
│   │       └── page.tsx          # Public landing pages
│   ├── api/
│   │   ├── auth/
│   │   │   ├── callback/
│   │   │   │   └── route.ts     # Supabase auth callback
│   │   │   └── signout/
│   │   │       └── route.ts
│   │   ├── lead-magnets/
│   │   │   ├── route.ts          # GET (list), POST (create)
│   │   │   ├── [id]/
│   │   │   │   └── route.ts      # GET, PUT, DELETE
│   │   │   └── generate/
│   │   │       └── route.ts      # POST - AI generation
│   │   ├── landing-pages/
│   │   │   ├── route.ts          # GET (list), POST (create)
│   │   │   ├── [id]/
│   │   │   │   └── route.ts      # GET, PUT, DELETE
│   │   │   └── [slug]/
│   │   │       └── submit/
│   │   │           └── route.ts  # POST - lead capture
│   │   ├── pdf/
│   │   │   └── generate/
│   │   │       └── route.ts      # POST - PDF generation
│   │   ├── analytics/
│   │   │   ├── route.ts          # GET - analytics data
│   │   │   └── event/
│   │   │       └── route.ts      # POST - track event
│   │   ├── integrations/
│   │   │   ├── route.ts          # GET, POST
│   │   │   ├── [id]/
│   │   │   │   └── route.ts      # PUT, DELETE
│   │   │   └── sync/
│   │   │       └── route.ts      # POST - sync leads
│   │   ├── stripe/
│   │   │   ├── webhook/
│   │   │   │   └── route.ts      # Stripe webhooks
│   │   │   ├── checkout/
│   │   │   │   └── route.ts      # Create checkout session
│   │   │   └── portal/
│   │   │       └── route.ts      # Customer portal
│   │   └── n8n/
│   │       └── webhook/
│   │           └── route.ts      # n8n webhook endpoint
│   ├── layout.tsx
│   └── page.tsx                  # Homepage/marketing
├── components/
│   ├── ui/                       # Shadcn UI components
│   ├── auth/
│   │   ├── AuthProvider.tsx
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── StatsCards.tsx
│   ├── lead-magnets/
│   │   ├── LeadMagnetCard.tsx
│   │   ├── LeadMagnetForm.tsx
│   │   ├── AIGenerator.tsx
│   │   └── TemplateSelector.tsx
│   ├── landing-pages/
│   │   ├── LandingPageBuilder.tsx
│   │   ├── FormBuilder.tsx
│   │   └── Preview.tsx
│   ├── analytics/
│   │   ├── AnalyticsChart.tsx
│   │   └── MetricsTable.tsx
│   └── shared/
│       ├── ErrorBoundary.tsx
│       ├── LoadingSpinner.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   └── middleware.ts
│   ├── stripe/
│   │   ├── client.ts
│   │   └── webhooks.ts
│   ├── openai/
│   │   └── client.ts
│   ├── pdf/
│   │   └── generator.ts         # Puppeteer PDF generation
│   ├── email-providers/
│   │   ├── mailchimp.ts
│   │   ├── convertkit.ts
│   │   └── hubspot.ts
│   ├── utils/
│   │   ├── validators.ts        # Zod schemas
│   │   ├── errors.ts           # Error handling
│   │   └── rate-limit.ts      # API rate limiting
│   └── hooks/
│       ├── useAuth.ts
│       ├── useSubscription.ts
│       └── useAnalytics.ts
├── types/
│   ├── database.ts             # Generated from Supabase
│   ├── api.ts
│   └── components.ts
├── middleware.ts               # Auth & rate limiting
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 4. n8n Workflow Triggers and Actions

### n8n Workflows

```yaml
workflows:
  lead_magnet_generation:
    trigger:
      type: webhook
      method: POST
      path: /n8n/lead-magnet/generate
    nodes:
      - name: Validate Request
        type: function
        code: |
          // Validate auth token and request data
          const { authorization } = $input.headers;
          const { userId, prompt, type, templateId } = $input.body;
          
          if (!authorization?.startsWith('Bearer ')) {
            throw new Error('Unauthorized');
          }
          
          return { userId, prompt, type, templateId };
      
      - name: Call OpenAI
        type: http-request
        method: POST
        url: https://api.openai.com/v1/chat/completions
        headers:
          Authorization: Bearer {{OPENAI_API_KEY}}
        body:
          model: gpt-4
          messages:
            - role: system
              content: Generate high-quality {{type}} content
            - role: user
              content: {{prompt}}
          max_tokens: 2000
          temperature: 0.7
      
      - name: Process AI Response
        type: function
        code: |
          const content = $input.data.choices[0].message.content;
          const structured = parseAIContent(content);
          return { structured };
      
      - name: Update Database
        type: supabase
        operation: update
        table: lead_magnets
        filter:
          id: {{leadMagnetId}}
        data:
          ai_response: {{structured}}
          status: 'ready_for_pdf'
      
      - name: Trigger PDF Generation
        type: webhook
        method: POST
        url: {{API_URL}}/api/pdf/generate
        body:
          leadMagnetId: {{leadMagnetId}}
          content: {{structured}}

  email_sync:
    trigger:
      type: cron
      expression: "*/30 * * * *" # Every 30 minutes
    nodes:
      - name: Get Pending Leads
        type: supabase
        operation: select
        table: leads
        filter:
          synced_to_provider: false
        
      - name: Group by User
        type: function
        code: |
          // Group leads by user_id for batch processing
          const grouped = {};
          for (const lead of $input.data) {
            const userId = lead.landing_page.user_id;
            if (!grouped[userId]) grouped[userId] = [];
            grouped[userId].push(lead);
          }
          return grouped;
      
      - name: Get User Integrations
        type: supabase
        operation: select
        table: email_integrations
        filter:
          user_id: {{userId}}
          is_active: true
      
      - name: Sync to Provider
        type: switch
        cases:
          - when: provider == 'mailchimp'
            nodes:
              - name: Mailchimp Sync
                type: http-request
                url: https://{{datacenter}}.api.mailchimp.com/3.0/lists/{{listId}}/members
          - when: provider == 'convertkit'
            nodes:
              - name: ConvertKit Sync
                type: http-request
                url: https://api.convertkit.com/v3/forms/{{formId}}/subscribe
          - when: provider == 'hubspot'
            nodes:
              - name: HubSpot Sync
                type: http-request
                url: https://api.hubapi.com/contacts/v1/contact

  analytics_aggregation:
    trigger:
      type: cron
      expression: "0 * * * *" # Every hour
    nodes:
      - name: Aggregate Events
        type: supabase
        operation: rpc
        function: aggregate_analytics_hourly
        
      - name: Calculate Metrics
        type: function
        code: |
          // Calculate conversion rates, trends, etc.
          const metrics = calculateMetrics($input.data);
          return metrics;
      
      - name: Store Aggregated Data
        type: supabase
        operation: insert
        table: analytics_aggregates
        data: {{metrics}}
```

## 5. Authentication & Authorization Matrix

| Resource | Public | Free User | Starter | Pro | Enterprise | Admin |
|----------|--------|-----------|---------|-----|------------|-------|
| **Auth** |
| Register/Login | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Profile | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update Profile | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Lead Magnets** |
| View Templates | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Lead Magnet | ❌ | 3/month | 10/month | Unlimited | Unlimited | Unlimited |
| Use Premium Templates | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| AI Generation | ❌ | Basic | Enhanced | Advanced | Advanced | Advanced |
| **Landing Pages** |
| Create Landing Page | ❌ | 1 | 5 | Unlimited | Unlimited | Unlimited |
| Custom Domain | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Remove Branding | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Leads** |
| Capture Leads | ✅ | 100/month | 1000/month | 10k/month | Unlimited | Unlimited |
| Export Leads | ❌ | CSV | CSV | CSV/API | CSV/API | CSV/API |
| **Integrations** |
| Email Providers | ❌ | 1 | 3 | Unlimited | Unlimited | Unlimited |
| Webhook Support | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| API Access | ❌ | ❌ | ❌ | Rate Limited | Full | Full |
| **Analytics** |
| Basic Analytics | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Advanced Analytics | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Custom Reports | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Support** |
| Email Support | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Dedicated Account Manager | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

### Authorization Implementation

```typescript
// lib/auth/permissions.ts
export const PERMISSIONS = {
  lead_magnets: {
    create: ['free', 'starter', 'pro', 'enterprise'],
    read: ['free', 'starter', 'pro', 'enterprise'],
    update: ['free', 'starter', 'pro', 'enterprise'],
    delete: ['free', 'starter', 'pro', 'enterprise'],
  },
  landing_pages: {
    create: ['free', 'starter', 'pro', 'enterprise'],
    read: ['free', 'starter', 'pro', 'enterprise'],
    update: ['free', 'starter', 'pro', 'enterprise'],
    delete: ['free', 'starter', 'pro', 'enterprise'],
  },
  integrations: {
    create: ['free', 'starter', 'pro', 'enterprise'],
    read: ['free', 'starter', 'pro', 'enterprise'],
    update: ['free', 'starter', 'pro', 'enterprise'],
    delete: ['free', 'starter', 'pro', 'enterprise'],
  },
  api: {
    access: ['pro', 'enterprise'],
  },
};

export const LIMITS = {
  free: {
    lead_magnets_per_month: 3,
    landing_pages: 1,
    leads_per_month: 100,
    integrations: 1,
  },
  starter: {
    lead_magnets_per_month: 10,
    landing_pages: 5,
    leads_per_month: 1000,
    integrations: 3,
  },
  pro: {
    lead_magnets_per_month: Infinity,
    landing_pages: Infinity,
    leads_per_month: 10000,
    integrations: Infinity,
  },
  enterprise: {
    lead_magnets_per_month: Infinity,
    landing_pages: Infinity,
    leads_per_month: Infinity,
    integrations: Infinity,
  },
};
```

## 6. Database Queries with Performance Optimization

### Critical Query Examples

```typescript
// lib/queries/lead-magnets.ts

// Get user's lead magnets with pagination and filtering
export async function getUserLeadMagnets(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }
) {
  const { page = 1, limit = 10, status, search } = options;
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('lead_magnets')
    .select(`
      *,
      template:templates(id, name, type),
      landing_pages(count)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (status) {
    query = query.eq('status', status);
  }
  
  if (search) {
    query = query.or(`title.ilike.%${search}%,type.ilike.%${search}%`);
  }
  
  return query;
}

// Get landing page with lead count (optimized with aggregate)
export async function getLandingPageWithStats(slug: string) {
  // Use RPC function for better performance
  const { data, error } = await supabase.rpc('get_landing_page_stats', {
    page_slug: slug
  });
  
  return { data, error };
}

// RPC function in database
CREATE OR REPLACE FUNCTION get_landing_page_stats(page_slug TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'page', row_to_json(lp.*),
    'lead_magnet', row_to_json(lm.*),
    'stats', json_build_object(
      'total_leads', COUNT(DISTINCT l.id),
      'today_leads', COUNT(DISTINCT l.id) FILTER (WHERE l.created_at >= CURRENT_DATE),
      'conversion_rate', 
        CASE 
          WHEN COUNT(DISTINCT ae.session_id) > 0 
          THEN ROUND((COUNT(DISTINCT l.id)::NUMERIC / COUNT(DISTINCT ae.session_id) * 100), 2)
          ELSE 0 
        END
    )
  ) INTO result
  FROM landing_pages lp
  LEFT JOIN lead_magnets lm ON lm.id = lp.lead_magnet_id
  LEFT JOIN leads l ON l.landing_page_id = lp.id
  LEFT JOIN analytics_events ae ON ae.landing_page_id = lp.id AND ae.event_type = 'page_view'
  WHERE lp.slug = page_slug
  GROUP BY lp.id, lm.id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

// Batch insert leads with deduplication
export async function batchInsertLeads(leads: Lead[]) {
  // Use upsert to handle duplicates
  const { data, error } = await supabase
    .from('leads')
    .upsert(
      leads.map(lead => ({
        ...lead,
        created_at: new Date().toISOString(),
      })),
      { 
        onConflict: 'landing_page_id,email',
        ignoreDuplicates: true 
      }
    )
    .select();
  
  return { data, error };
}

// Analytics aggregation query
export async function getAnalyticsDashboard(userId: string, dateRange: DateRange) {
  const { data, error } = await supabase.rpc('get_analytics_dashboard', {
    p_user_id: userId,
    p_start_date: dateRange.start,
    p_end_date: dateRange.end
  });
  
  return { data, error };
}
```

### Performance Optimization Strategies

1. **Indexes**: Created on frequently queried columns
2. **RPC Functions**: Complex aggregations done in database
3. **Materialized Views**: For heavy analytics queries
4. **Connection Pooling**: Via Supabase's built-in pooler
5. **Query Optimization**: Using proper JOINs and avoiding N+1
6. **Caching Strategy**: Redis for frequently accessed data

## 7. Error Handling & Validation Strategy

### API Error Handler

```typescript
// lib/utils/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation error', details: error.errors },
      { status: 400 }
    );
  }
  
  console.error('Unhandled error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// lib/utils/api-wrapper.ts
export function withErrorHandler(
  handler: (req: Request, context: any) => Promise<Response>
) {
  return async (req: Request, context: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return errorHandler(error);
    }
  };
}
```

### Validation Schemas

```typescript
// lib/utils/validators.ts
import { z } from 'zod';

export const leadMagnetSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['ebook', 'checklist', 'guide', 'cheatsheet']),
  templateId: z.string().uuid().optional(),
  prompt: z.string().min(10).max(1000),
  content: z.object({
    sections: z.array(z.object({
      title: z.string(),
      content: z.string(),
      order: z.number(),
    })),
  }).optional(),
});

export const landingPageSchema = z.object({
  leadMagnetId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(500),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  formConfig: z.object({
    fields: z.array(z.object({
      name: z.string(),
      type: z.enum(['text', 'email', 'tel']),
      required: z.boolean(),
      label: z.string(),
    })),
    buttonText: z.string(),
    successMessage: z.string(),
  }),
});

export const leadCaptureSchema = z.object({
  email: z.string().email(),
  fullName: z.string().optional(),
  gdprConsent: z.boolean(),
  formData: z.record(z.string()).optional(),
});
```

### Rate Limiting

```typescript
// lib/utils/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const rateLimiter = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  }),
  aiGeneration: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 AI generations per minute
  }),
  leadCapture: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 submissions per minute per IP
  }),
};

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
) {
  const { success, limit, reset, remaining } = await limiter.limit(identifier);
  
  if (!success) {
    throw new AppError(
      429,
      'Too many requests',
      'RATE_LIMIT_EXCEEDED'
    );
  }
  
  return { limit, reset, remaining };
}
```

## 8. Deployment Checklist

### Pre-Deployment

- [ ] **Environment Variables**
  ```env
  # .env.production
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  STRIPE_SECRET_KEY=
  STRIPE_WEBHOOK_SECRET=
  OPENAI_API_KEY=
  REDIS_URL=
  N8N_WEBHOOK_URL=
  SMTP_HOST=
  SMTP_PORT=
  SMTP_USER=
  SMTP_PASS=
  ```

- [ ] **Database Setup**
  - [ ] Run all migrations
  - [ ] Apply RLS policies
  - [ ] Create indexes
  - [ ] Seed templates table
  - [ ] Test database connections

- [ ] **Stripe Configuration**
  - [ ] Create products and prices
  - [ ] Set up webhook endpoints
  - [ ] Configure customer portal
  - [ ] Test payment flow

- [ ] **n8n Setup**
  - [ ] Deploy workflows
  - [ ] Configure webhook URLs
  - [ ] Set up credentials
  - [ ] Test workflow triggers

- [ ] **Security**
  - [ ] Enable CORS properly
  - [ ] Set secure headers
  - [ ] Configure CSP
  - [ ] Enable rate limiting
  - [ ] GDPR compliance check

### Deployment Steps

1. **Vercel Deployment**
   ```bash
   vercel --prod
   ```

2. **Supabase Functions**
   ```bash
   supabase functions deploy
   ```

3. **n8n Workflows**
   - Import workflow JSON
   - Activate workflows
   - Test webhook endpoints

4. **DNS Configuration**
   - Point domain to Vercel
   - Configure SSL
   - Set up custom domains for landing pages

### Post-Deployment

- [ ] **Monitoring**
  - [ ] Set up Vercel Analytics
  - [ ] Configure error tracking (Sentry)
  - [ ] Set up uptime monitoring
  - [ ] Configure log aggregation

- [ ] **Performance**
  - [ ] Run Lighthouse tests
  - [ ] Check Core Web Vitals
  - [ ] Load test API endpoints
  - [ ] Optimize images and assets

- [ ] **Testing**
  - [ ] Full user journey test
  - [ ] Payment flow test
  - [ ] Email delivery test
  - [ ] Mobile responsiveness
  - [ ] Cross-browser compatibility

- [ ] **Backup & Recovery**
  - [ ] Database backup schedule
  - [ ] Document recovery procedures
  - [ ] Test restore process