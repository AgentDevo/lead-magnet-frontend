# Lead Magnet Generator - Frontend

A modern, user-friendly frontend for the AI-powered Lead Magnet Generator platform. Built with Next.js 14, React 18, Shadcn UI, and Tailwind CSS.

## 🚀 Features

### Authentication
- ✅ Sign-up page with validation
- ✅ Login page
- ✅ Password reset flow
- ✅ Session management
- ✅ Protected routes

### Dashboard
- ✅ Key metrics overview (magnets created, leads captured, etc.)
- ✅ Quick action buttons
- ✅ Recent activity feed
- ✅ Subscription tier display
- ✅ AI credits remaining

### Lead Magnet Creation Wizard
- ✅ 8-step creation process
- ✅ Type selection (eBook, Checklist, Guide, Cheat Sheet)
- ✅ Niche and audience input
- ✅ Topic/title entry
- ✅ AI content generation with loading states
- ✅ Content editing with rich text support
- ✅ PDF template selection
- ✅ Landing page customization
- ✅ Download & deployment

### Analytics
- ✅ Line charts for leads over time
- ✅ Top performing magnets list
- ✅ Conversion rate tracking
- ✅ Activity logs
- ✅ Export data functionality

### Settings
- ✅ Account information management
- ✅ Password change
- ✅ Email integrations (Mailchimp, ConvertKit, HubSpot)
- ✅ Branding/logo upload
- ✅ Billing and subscription info
- ✅ Account deletion

### UI Components
- ✅ Reusable button, input, card components
- ✅ Dropdown menus
- ✅ Dialogs/modals
- ✅ Toast notifications
- ✅ Loading states
- ✅ Form components

## 📋 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI + Radix UI
- **State Management:** Zustand (ready to implement)
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Icons:** Lucide React

## 🏗️ Project Structure

```
lead-magnet-frontend/
├── src/
│   ├── app/                           # Next.js app directory
│   │   ├── auth/                      # Authentication pages
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── forgot-password/
│   │   ├── dashboard/                 # Dashboard pages
│   │   │   ├── create/               # Lead magnet creation
│   │   │   ├── analytics/            # Analytics dashboard
│   │   │   └── settings/             # User settings
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles
│   │   └── page.tsx                  # Home redirect
│   │
│   ├── components/
│   │   ├── ui/                       # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   └── textarea.tsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── header.tsx
│   │   │   └── sidebar.tsx
│   │   ├── dashboard/                # Dashboard components
│   │   │   ├── stats-card.tsx
│   │   │   └── activity-feed.tsx
│   │   ├── analytics/                # Analytics components
│   │   │   └── analytics-chart.tsx
│   │   ├── wizard/                   # Lead magnet wizard
│   │   │   ├── creation-wizard.tsx
│   │   │   └── steps/
│   │   │       ├── step-type-selection.tsx
│   │   │       ├── step-niche-audience.tsx
│   │   │       ├── step-topic.tsx
│   │   │       ├── step-generate-content.tsx
│   │   │       ├── step-edit-content.tsx
│   │   │       ├── step-template-selection.tsx
│   │   │       ├── step-landing-page.tsx
│   │   │       └── step-final.tsx
│   │   └── providers/                # Context providers
│   │       └── toast-provider.tsx
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-auth.tsx
│   │   └── use-toast.tsx
│   │
│   ├── lib/                          # Utility functions
│   │   ├── utils.ts                  # Common utilities
│   │   └── api-client.ts             # API client
│   │
│   └── types/                        # TypeScript types (ready for expansion)
│
├── public/                           # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── postcss.config.js
├── .env.local.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
```bash
cd lead-magnet-frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```

Update `.env.local` with your backend API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENV=development
```

4. **Run development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📝 Development

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 🔄 API Integration

The frontend includes a pre-configured API client that connects to your backend. Update endpoints in `src/lib/api-client.ts`:

```typescript
// Example: Create a lead magnet
const { data } = await apiClient.createLeadMagnet({
  type: "ebook",
  niche: "Digital Marketing",
  topic: "Email Marketing Guide",
  content: "..."
});
```

### Required Backend Endpoints

**Authentication:**
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

**Lead Magnets:**
- `POST /lead-magnets` - Create lead magnet
- `GET /lead-magnets` - List user's magnets
- `GET /lead-magnets/:id` - Get specific magnet
- `PUT /lead-magnets/:id` - Update magnet
- `DELETE /lead-magnets/:id` - Delete magnet

**AI:**
- `POST /ai/generate-content` - Generate AI content
- `POST /ai/generate-pdf` - Generate PDF

**Analytics:**
- `GET /analytics` - Get dashboard analytics
- `GET /analytics/leads/:magnetId` - Get leads for magnet

**User:**
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile

## 🎨 Customization

### Colors & Theme

Edit `src/app/globals.css` to customize the color scheme:

```css
:root {
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  /* ... other colors ... */
}
```

### Components

All UI components are built with Shadcn UI and Radix UI. Customize them in `src/components/ui/`.

## 📦 Production Deployment

### Vercel (Recommended)

```bash
npx vercel deploy
```

### Docker

```bash
docker build -t lead-magnet-frontend .
docker run -p 3000:3000 lead-magnet-frontend
```

### Environment Variables for Production

```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_ENV=production
```

## 🔒 Security Notes

- Auth tokens are stored in localStorage (consider upgrading to secure cookies)
- All API calls include Authorization headers
- 401 responses trigger automatic redirect to login
- Input validation on all forms

## 📚 Key Features Implementation

### Protected Routes
Use middleware to protect routes (implement in `src/middleware.ts`):

```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken');
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}
```

### Loading States
All async actions include loading states and proper error handling.

### Form Validation
Forms use React Hook Form + Zod for type-safe validation.

## 🐛 Known Limitations (Phase 1)

- Dark mode support is optional (can be added in Phase 2)
- Email integrations UI is placeholder (connect in Phase 2)
- Logo upload is placeholder (implement with S3 in Phase 2)
- Rich text editor is basic textarea (upgrade in Phase 2)

## 🚦 Next Steps / Phase 2

- [ ] Dark mode support
- [ ] Email integration functionality
- [ ] Advanced rich text editor
- [ ] File upload to S3
- [ ] Payment integration
- [ ] Advanced analytics
- [ ] User collaboration features
- [ ] Mobile app version

## 📞 Support

For issues or questions, check the backend API logs and frontend console for errors.

## 📄 License

This project is part of the Lead Magnet Generator MVP.
