# Lead Magnet SaaS - Critical Code Examples

## 1. Authentication Implementation

### Supabase Client Configuration

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle error in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle error in Server Components
          }
        },
      },
    }
  );
}
```

### Auth Middleware

```typescript
// middleware.ts
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|l/|api/landing-pages/.*/submit|api/analytics/event).*)',
  ],
};
```

```typescript
// lib/supabase/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if accessing protected routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}
```

### Auth Hook

```typescript
// lib/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return { user, loading };
}
```

## 2. Lead Magnet AI Generation

### API Route for AI Generation

```typescript
// app/api/lead-magnets/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { withErrorHandler } from '@/lib/utils/api-wrapper';
import { checkRateLimit, rateLimiter } from '@/lib/utils/rate-limit';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const requestSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['ebook', 'checklist', 'guide', 'cheatsheet']),
  prompt: z.string().min(10).max(1000),
  templateId: z.string().uuid().optional(),
  targetAudience: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'friendly', 'authoritative']).optional(),
});

async function generateLeadMagnet(req: NextRequest) {
  const supabase = createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check rate limit
  await checkRateLimit(rateLimiter.aiGeneration, user.id);

  // Validate request
  const body = await req.json();
  const validatedData = requestSchema.parse(body);

  // Check user's plan limits
  const { data: profile } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  const { count } = await supabase
    .from('lead_magnets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', new Date(new Date().setDate(1)).toISOString());

  // Check limits based on plan
  const limits = {
    free: 3,
    starter: 10,
    pro: Infinity,
    enterprise: Infinity,
  };

  if (count! >= limits[profile?.subscription_tier as keyof typeof limits || 'free']) {
    return NextResponse.json(
      { error: 'Monthly limit reached' },
      { status: 403 }
    );
  }

  // Create lead magnet record
  const { data: leadMagnet, error: createError } = await supabase
    .from('lead_magnets')
    .insert({
      user_id: user.id,
      title: validatedData.title,
      type: validatedData.type,
      ai_prompt: validatedData.prompt,
      template_id: validatedData.templateId,
      status: 'generating',
    })
    .select()
    .single();

  if (createError) {
    throw createError;
  }

  // Generate content with OpenAI
  try {
    const systemPrompt = generateSystemPrompt(validatedData.type);
    const userPrompt = enhanceUserPrompt(validatedData);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const generatedContent = JSON.parse(completion.choices[0].message.content!);

    // Update lead magnet with generated content
    const { error: updateError } = await supabase
      .from('lead_magnets')
      .update({
        content: generatedContent,
        ai_response: {
          model: 'gpt-4',
          usage: completion.usage,
          timestamp: new Date().toISOString(),
        },
        status: 'ready_for_pdf',
        generation_time_ms: Date.now() - new Date(leadMagnet.created_at).getTime(),
      })
      .eq('id', leadMagnet.id);

    if (updateError) {
      throw updateError;
    }

    // Trigger PDF generation via n8n
    await fetch(`${process.env.N8N_WEBHOOK_URL}/lead-magnet/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY}`,
      },
      body: JSON.stringify({
        leadMagnetId: leadMagnet.id,
        content: generatedContent,
      }),
    });

    return NextResponse.json({
      id: leadMagnet.id,
      title: leadMagnet.title,
      type: leadMagnet.type,
      status: 'ready_for_pdf',
      content: generatedContent,
    });

  } catch (error) {
    // Update status on error
    await supabase
      .from('lead_magnets')
      .update({ status: 'failed' })
      .eq('id', leadMagnet.id);

    throw error;
  }
}

function generateSystemPrompt(type: string): string {
  const prompts = {
    ebook: `You are an expert content creator specializing in creating engaging, valuable ebooks for lead generation. Create structured content with clear sections, actionable insights, and professional tone. Format the response as JSON with the following structure:
    {
      "title": "string",
      "subtitle": "string",
      "introduction": "string",
      "chapters": [
        {
          "title": "string",
          "content": "string",
          "keyTakeaways": ["string"]
        }
      ],
      "conclusion": "string",
      "callToAction": "string"
    }`,
    
    checklist: `You are an expert at creating practical, actionable checklists that provide immediate value. Create a comprehensive checklist that is easy to follow and implement. Format the response as JSON with the following structure:
    {
      "title": "string",
      "description": "string",
      "categories": [
        {
          "name": "string",
          "items": [
            {
              "task": "string",
              "description": "string",
              "priority": "high|medium|low"
            }
          ]
        }
      ],
      "tips": ["string"]
    }`,
    
    guide: `You are an expert at creating comprehensive, step-by-step guides that educate and inform. Create a detailed guide with clear instructions and helpful tips. Format the response as JSON with the following structure:
    {
      "title": "string",
      "overview": "string",
      "prerequisites": ["string"],
      "steps": [
        {
          "number": number,
          "title": "string",
          "description": "string",
          "tips": ["string"],
          "warnings": ["string"]
        }
      ],
      "conclusion": "string",
      "resources": ["string"]
    }`,
    
    cheatsheet: `You are an expert at distilling complex information into concise, easy-to-reference cheatsheets. Create a valuable reference document with key information. Format the response as JSON with the following structure:
    {
      "title": "string",
      "description": "string",
      "sections": [
        {
          "title": "string",
          "items": [
            {
              "term": "string",
              "definition": "string",
              "example": "string"
            }
          ]
        }
      ],
      "quickTips": ["string"],
      "commonMistakes": ["string"]
    }`
  };

  return prompts[type as keyof typeof prompts];
}

function enhanceUserPrompt(data: z.infer<typeof requestSchema>): string {
  let enhanced = `Create a ${data.type} about: ${data.prompt}`;
  
  if (data.targetAudience) {
    enhanced += `\n\nTarget Audience: ${data.targetAudience}`;
  }
  
  if (data.tone) {
    enhanced += `\n\nTone: ${data.tone}`;
  }
  
  enhanced += '\n\nMake it valuable, actionable, and engaging. Include specific examples and practical advice.';
  
  return enhanced;
}

export const POST = withErrorHandler(generateLeadMagnet);
```

## 3. PDF Generation

### PDF Generator Service

```typescript
// lib/pdf/generator.ts
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import { readFileSync } from 'fs';
import path from 'path';
import { createClient } from '@/lib/supabase/server';

interface PDFOptions {
  leadMagnetId: string;
  content: any;
  templateId?: string;
}

export class PDFGenerator {
  private browser: puppeteer.Browser | null = null;

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async generate(options: PDFOptions): Promise<string> {
    if (!this.browser) {
      await this.initialize();
    }

    const supabase = createClient();
    
    try {
      // Get lead magnet details
      const { data: leadMagnet } = await supabase
        .from('lead_magnets')
        .select('*, template:templates(*)')
        .eq('id', options.leadMagnetId)
        .single();

      if (!leadMagnet) {
        throw new Error('Lead magnet not found');
      }

      // Load template
      const template = await this.loadTemplate(leadMagnet.type, options.templateId);
      
      // Compile template with content
      const html = this.compileTemplate(template, {
        ...leadMagnet,
        content: options.content,
      });

      // Generate PDF
      const page = await this.browser!.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Set viewport for consistency
      await page.setViewport({ width: 1200, height: 1600 });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      await page.close();

      // Upload to Supabase Storage
      const fileName = `${options.leadMagnetId}-${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('lead-magnets')
        .upload(fileName, pdfBuffer, {
          contentType: 'application/pdf',
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('lead-magnets')
        .getPublicUrl(fileName);

      // Update lead magnet with PDF URL
      await supabase
        .from('lead_magnets')
        .update({
          pdf_url: publicUrl,
          status: 'published',
        })
        .eq('id', options.leadMagnetId);

      return publicUrl;
      
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  }

  private async loadTemplate(type: string, templateId?: string): Promise<string> {
    // Load custom template if specified
    if (templateId) {
      const supabase = createClient();
      const { data: template } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (template?.content) {
        return template.content;
      }
    }

    // Load default template
    const templatePath = path.join(
      process.cwd(),
      'templates',
      'pdf',
      `${type}.hbs`
    );
    
    return readFileSync(templatePath, 'utf-8');
  }

  private compileTemplate(template: string, data: any): string {
    // Register Handlebars helpers
    handlebars.registerHelper('formatDate', (date: string) => {
      return new Date(date).toLocaleDateString();
    });

    handlebars.registerHelper('truncate', (str: string, len: number) => {
      if (str.length > len) {
        return str.substring(0, len) + '...';
      }
      return str;
    });

    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate(data);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
```

### PDF Template Example (eBook)

```handlebars
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{content.title}}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      page-break-after: always;
    }
    
    .cover-page h1 {
      font-size: 48px;
      margin-bottom: 20px;
      max-width: 80%;
    }
    
    .cover-page p {
      font-size: 24px;
      opacity: 0.9;
    }
    
    .content {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    .chapter {
      page-break-before: always;
      margin-bottom: 60px;
    }
    
    .chapter h2 {
      font-size: 32px;
      color: #667eea;
      margin-bottom: 30px;
      padding-bottom: 10px;
      border-bottom: 3px solid #e5e7eb;
    }
    
    .chapter p {
      margin-bottom: 20px;
      font-size: 16px;
      text-align: justify;
    }
    
    .key-takeaways {
      background-color: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      margin: 30px 0;
    }
    
    .key-takeaways h3 {
      color: #4b5563;
      margin-bottom: 15px;
    }
    
    .key-takeaways ul {
      list-style-position: inside;
      color: #6b7280;
    }
    
    .key-takeaways li {
      margin-bottom: 10px;
    }
    
    .footer {
      text-align: center;
      padding: 40px 20px;
      color: #9ca3af;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover-page">
    <h1>{{content.title}}</h1>
    {{#if content.subtitle}}
      <p>{{content.subtitle}}</p>
    {{/if}}
    <div style="margin-top: auto; padding: 40px;">
      <p style="font-size: 16px; opacity: 0.8;">Created on {{formatDate created_at}}</p>
    </div>
  </div>

  <!-- Table of Contents -->
  <div class="content">
    <h2 style="color: #667eea; margin-bottom: 30px;">Table of Contents</h2>
    <ol style="font-size: 18px; line-height: 2;">
      {{#each content.chapters}}
        <li>{{this.title}}</li>
      {{/each}}
    </ol>
  </div>

  <!-- Introduction -->
  {{#if content.introduction}}
    <div class="content">
      <h2 style="color: #667eea; margin-bottom: 30px;">Introduction</h2>
      <p>{{content.introduction}}</p>
    </div>
  {{/if}}

  <!-- Chapters -->
  {{#each content.chapters}}
    <div class="chapter">
      <div class="content">
        <h2>{{this.title}}</h2>
        <p>{{this.content}}</p>
        
        {{#if this.keyTakeaways}}
          <div class="key-takeaways">
            <h3>Key Takeaways</h3>
            <ul>
              {{#each this.keyTakeaways}}
                <li>{{this}}</li>
              {{/each}}
            </ul>
          </div>
        {{/if}}
      </div>
    </div>
  {{/each}}

  <!-- Conclusion -->
  {{#if content.conclusion}}
    <div class="content">
      <h2 style="color: #667eea; margin-bottom: 30px;">Conclusion</h2>
      <p>{{content.conclusion}}</p>
      
      {{#if content.callToAction}}
        <div style="background-color: #667eea; color: white; padding: 30px; border-radius: 8px; text-align: center; margin-top: 40px;">
          <p style="font-size: 18px;">{{content.callToAction}}</p>
        </div>
      {{/if}}
    </div>
  {{/if}}

  <!-- Footer -->
  <div class="footer">
    <p>© {{formatDate created_at}} - Created with Lead Magnet Generator</p>
  </div>
</body>
</html>
```

## 4. Stripe Integration

### Stripe Webhook Handler

```typescript
// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createClient();

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(supabase, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(supabase, invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionUpdate(
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  
  // Get user by Stripe customer ID
  const { data: user } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Map Stripe price IDs to plan names
  const priceIdToPlan: Record<string, string> = {
    [process.env.STRIPE_PRICE_STARTER!]: 'starter',
    [process.env.STRIPE_PRICE_PRO!]: 'pro',
    [process.env.STRIPE_PRICE_ENTERPRISE!]: 'enterprise',
  };

  const planId = priceIdToPlan[subscription.items.data[0].price.id] || 'free';

  // Update subscription record
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: user.user_id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      plan_id: planId,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    });

  // Update user's subscription tier
  await supabase
    .from('users')
    .update({
      subscription_tier: planId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.user_id);
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription
) {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!sub) return;

  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  // Downgrade user to free tier
  await supabase
    .from('users')
    .update({
      subscription_tier: 'free',
      updated_at: new Date().toISOString(),
    })
    .eq('id', sub.user_id);
}

async function handlePaymentSucceeded(
  supabase: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice
) {
  // Log successful payment
  console.log('Payment succeeded for invoice:', invoice.id);
  
  // You could add payment history tracking here
}

async function handlePaymentFailed(
  supabase: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice
) {
  const subscription = invoice.subscription as string;
  
  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription);

  // Send notification email (via n8n webhook)
  await fetch(`${process.env.N8N_WEBHOOK_URL}/payment-failed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.N8N_API_KEY}`,
    },
    body: JSON.stringify({
      customerId: invoice.customer,
      invoiceId: invoice.id,
      amountDue: invoice.amount_due,
    }),
  });
}
```

### Checkout Session Creation

```typescript
// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { withErrorHandler } from '@/lib/utils/api-wrapper';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const checkoutSchema = z.object({
  priceId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

async function createCheckoutSession(req: NextRequest) {
  const supabase = createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { priceId, successUrl, cancelUrl } = checkoutSchema.parse(body);

  // Get or create Stripe customer
  let customerId: string;
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  if (subscription?.stripe_customer_id) {
    customerId = subscription.stripe_customer_id;
  } else {
    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: {
        supabase_user_id: user.id,
      },
    });
    customerId = customer.id;

    // Create subscription record
    await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        stripe_customer_id: customerId,
        status: 'inactive',
        plan_id: 'free',
      });
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    customer_update: {
      address: 'auto',
    },
  });

  return NextResponse.json({ sessionId: session.id, url: session.url });
}

export const POST = withErrorHandler(createCheckoutSession);
```

### Customer Portal

```typescript
// app/api/stripe/portal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { withErrorHandler } from '@/lib/utils/api-wrapper';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

async function createPortalSession(req: NextRequest) {
  const supabase = createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get Stripe customer ID
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No active subscription found' },
      { status: 404 }
    );
  }

  // Create portal session
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
  });

  return NextResponse.json({ url: session.url });
}

export const POST = withErrorHandler(createPortalSession);
```

This completes the critical code examples for authentication, AI generation, PDF creation, and Stripe integration. The architecture is designed to be scalable, maintainable, and performant while meeting all the requirements specified in the PRD.