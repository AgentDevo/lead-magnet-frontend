# Quick Start - 2 Minute Setup

## Run This

```bash
cd lead-magnet-frontend
npm install
npm run dev
```

Open: http://localhost:3000

## Test Login

- Go to `/auth/signup`
- Create an account
- You'll be on the dashboard

## Explore

- **Dashboard:** Overview, metrics, activity feed
- **Create:** Click "Create Lead Magnet" button → 8-step wizard
- **Analytics:** View performance charts
- **Settings:** Account, billing, integrations

## File Structure

```
src/
├── app/               # Pages (auth, dashboard)
├── components/        # UI + Feature components
├── hooks/            # useAuth, useToast
└── lib/              # Utilities, API client
```

## Key Files to Know

- `.env.local` - API configuration
- `src/app/globals.css` - Colors and theme
- `src/lib/api-client.ts` - Backend API calls
- `package.json` - All dependencies

## Next Step

Update `.env.local` with your backend URL, then the frontend will connect to it automatically.

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

**That's it!** Everything else is already set up and ready to use.
