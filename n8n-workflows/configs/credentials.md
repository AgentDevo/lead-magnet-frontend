# n8n Credentials Setup Guide

Complete step-by-step guide to configure all credentials and integrations in n8n.

## 📋 Credentials Checklist

- [ ] PostgreSQL (Supabase)
- [ ] OpenAI API
- [ ] Gmail SMTP
- [ ] Mailchimp API
- [ ] ConvertKit API
- [ ] HubSpot API
- [ ] HTTP Basic Auth (for backend)
- [ ] HTTP Bearer Token (for backend)

---

## 1. PostgreSQL / Supabase

### Option A: Supabase (Recommended)

**In n8n:**
1. Go to **Credentials** (left sidebar)
2. Click **Create New** → Select **PostgreSQL**
3. Fill in:
   - **Host:** `your-project.supabase.co`
   - **Database:** `postgres`
   - **User:** `postgres`
   - **Password:** Your Supabase password
   - **Port:** `5432`
   - **SSL:** Enable
   - **Name:** "Supabase Production"
4. Click **Save**

**Get credentials from:**
- Supabase Dashboard → Settings → Database
- Connection string: `postgres://user:password@host:5432/postgres`

### Option B: Self-Hosted PostgreSQL

1. Go to **Credentials** → Create New → **PostgreSQL**
2. Fill in your local/remote database details
3. Test connection before saving

---

## 2. OpenAI API

**In n8n:**
1. Go to **Credentials** → Create New → **OpenAI**
2. Fill in:
   - **API Key:** Your OpenAI API key (starts with `sk-`)
   - **Name:** "OpenAI Production"
3. Click **Save**

**Get your API key:**
1. Go to https://platform.openai.com/account/api-keys
2. Click "Create new secret key"
3. Copy and save it (you can only see it once!)
4. Add to `.env.n8n`: `OPENAI_API_KEY=sk-...`

**Important:**
- Keep API key secure (never commit to git)
- Monitor usage at https://platform.openai.com/account/usage
- Set usage limits to avoid surprises

---

## 3. Gmail SMTP

### Get Gmail App Password (Recommended)

1. Enable 2FA on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Google generates a 16-character password
5. Copy this password

### In n8n:

**Option A: Using Gmail Node (Easier)**
1. Go to **Credentials** → Create New → **Gmail**
2. Click **Connect my account**
3. Follow OAuth2 flow (safer, no password needed)
4. Name it "Gmail - Transactional"
5. Save

**Option B: Using SMTP**
1. Go to **Credentials** → Create New → **SMTP**
2. Fill in:
   - **Host:** `smtp.gmail.com`
   - **Port:** `587`
   - **User:** Your Gmail address
   - **Password:** 16-character app password
   - **SSL/TLS:** Enable
   - **Name:** "Gmail SMTP"
3. Test connection
4. Save

**Settings in workflows:**
- From: `noreply@example.com` (or your Gmail)
- Name: "Lead Magnet Team"

---

## 4. Mailchimp API

**Get API Key:**
1. Go to https://mailchimp.com/account/
2. Click **Account** → **Extras** → **API keys**
3. Click "Create Key"
4. Copy the API key
5. Note the **Server Prefix** (e.g., `us1`, `us2`)

**In n8n:**
1. Go to **Credentials** → Create New → **HTTP Basic Auth**
2. Fill in:
   - **User:** `anystring` (can be anything)
   - **Password:** Your Mailchimp API key
   - **Name:** "Mailchimp API"
3. Save

**Alternative: Use HTTP Header Auth**
1. Create New → **HTTP Header Auth**
2. Add header:
   - **Name:** `Authorization`
   - **Value:** `Basic [base64_encoded_key]`
3. Save

**In workflows:**
- Use `us1.api.mailchimp.com/3.0/` (replace `us1` with your server)
- List ID: Get from https://mailchimp.com/account/audience-list/

---

## 5. ConvertKit API

**Get API Keys:**
1. Go to https://app.convertkit.com/account/integrations
2. Find "API" or "Zapier"
3. Copy:
   - **API Key**
   - **API Secret**

**In n8n:**
1. Go to **Credentials** → Create New → **HTTP Header Auth**
2. Fill in:
   - **Name:** "ConvertKit API"
   - Add header:
     - **Name:** `Authorization`
     - **Value:** `Bearer YOUR_API_KEY`
3. Save

**Alternative: Store in Environment Variables**
```
CONVERTKIT_API_KEY=your-key
CONVERTKIT_API_SECRET=your-secret
```

---

## 6. HubSpot API

**Get Private App Token:**
1. Go to https://app.hubspot.com/
2. Settings (bottom left)
3. **Integrations** → **Private apps**
4. Click **Create app**
5. Fill in app name and description
6. Go to **Permissions** tab
   - Enable: `crm.objects.contacts.read`, `crm.objects.contacts.write`
7. Go to **Auth** tab
8. Click **Show** to reveal token
9. Copy token

**In n8n:**
1. Go to **Credentials** → Create New → **HTTP Header Auth**
2. Fill in:
   - **Name:** "HubSpot API"
   - Add header:
     - **Name:** `Authorization`
     - **Value:** `Bearer YOUR_PRIVATE_APP_TOKEN`
3. Save

---

## 7. HTTP Basic Auth (Backend API)

For calling your backend API with basic authentication:

**In n8n:**
1. Go to **Credentials** → Create New → **HTTP Basic Auth**
2. Fill in:
   - **User:** `api`
   - **Password:** Your backend API key
   - **Name:** "Backend API - Basic Auth"
3. Save

---

## 8. HTTP Bearer Token (Backend API)

For JWT/Bearer token authentication:

**In n8n:**
1. Go to **Credentials** → Create New → **HTTP Bearer Token**
2. Fill in:
   - **Token:** Your JWT token or API key
   - **Name:** "Backend API - Bearer"
3. Save

**Note:** For JWT tokens, you'll need to refresh them. Use a Code node to generate new tokens:

```javascript
// Code node to generate JWT
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const payload = {
  sub: 'n8n-workflow',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
};

const token = jwt.sign(payload, process.env.BACKEND_JWT_SECRET);
return { token };
```

---

## Testing Credentials

### Test PostgreSQL Connection

In a PostgreSQL node:
1. Select credential
2. Click **Test** (appears after selecting)
3. Should see "Test successful!"

### Test OpenAI Connection

In an OpenAI node:
1. Select credential
2. Type a test prompt
3. Click **Execute node** (play button)
4. Should see response

### Test Gmail

1. Add Gmail node to workflow
2. Select credential
3. Try sending a test email
4. Check if email arrives

### Test API Credentials

1. Add HTTP Request node
2. Select credential
3. Make a simple GET request
4. Check response status

---

## Security Best Practices

✅ **DO:**
- Store secrets in environment variables
- Use OAuth2 when available (Gmail, etc.)
- Regularly rotate API keys
- Use different credentials for dev/staging/production
- Monitor API usage and set rate limits

❌ **DON'T:**
- Hardcode API keys in workflows
- Share credentials across teams without audit trail
- Use test keys in production
- Expose credentials in logs

---

## Troubleshooting

### "Connection failed" in PostgreSQL

1. Check host/port are correct
2. Ensure SSL setting matches your database
3. Verify credentials are correct
4. Check if database is accessible from n8n server
5. Test with: `psql -h host -U user -d database`

### "Invalid API key" for OpenAI

1. Check if API key starts with `sk-`
2. Verify it hasn't been revoked
3. Check at https://platform.openai.com/account/api-keys
4. Generate a new one if needed
5. Verify organization has credits

### "Authentication failed" for Gmail

1. Check if 2FA is enabled
2. Use app password, not regular password
3. Verify Gmail address is correct
4. Try OAuth2 method instead
5. Check Less secure app access is allowed

### "401 Unauthorized" for Mailchimp/ConvertKit/HubSpot

1. Verify API key is correct
2. Check API key hasn't expired
3. Verify server prefix is correct (Mailchimp)
4. Check scopes/permissions are correct
5. Generate a new API key

---

## Environment Variables in Workflows

Reference credentials and environment variables:

```
// Access environment variable
{{$env.OPENAI_API_KEY}}

// Access credential (in HTTP nodes)
Select credential from dropdown

// In Code nodes
process.env.OPENAI_API_KEY
```

---

## Credential Expiration & Rotation

| Service | Expiration | Rotation Frequency |
|---------|------------|--------------------|
| OpenAI API Key | Never | Yearly or on compromise |
| Gmail App Password | Never | Yearly |
| Mailchimp API Key | Never | Yearly |
| ConvertKit API Key | Never | Yearly |
| HubSpot Private App Token | Never | Yearly |
| JWT Tokens | 24 hours | Automatic |

---

## Next Steps

1. Create all credentials following this guide
2. Test each one individually
3. Use credentials in workflows
4. Monitor API usage
5. Document any custom credentials in your team wiki

