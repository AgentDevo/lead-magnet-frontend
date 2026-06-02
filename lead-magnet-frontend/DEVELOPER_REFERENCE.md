# Developer Reference Card

## ⚡ Command Cheatsheet

```bash
# Setup
npm install
npm run dev

# Building
npm run build
npm start

# Quality
npm run type-check
npm run lint

# Cleanup
rm -rf node_modules package-lock.json && npm install
```

---

## 📁 File Locations

| Component | Location |
|-----------|----------|
| Home page redirect | `src/app/page.tsx` |
| Auth pages | `src/app/auth/{login,signup,forgot-password}/page.tsx` |
| Dashboard | `src/app/dashboard/page.tsx` |
| Lead Magnet Wizard | `src/app/dashboard/create/page.tsx` |
| Analytics | `src/app/dashboard/analytics/page.tsx` |
| Settings | `src/app/dashboard/settings/page.tsx` |
| Buttons | `src/components/ui/button.tsx` |
| Inputs | `src/components/ui/input.tsx` |
| Cards | `src/components/ui/card.tsx` |
| Header | `src/components/layout/header.tsx` |
| Sidebar | `src/components/layout/sidebar.tsx` |
| API Client | `src/lib/api-client.ts` |
| Theme | `src/app/globals.css` |
| Auth hook | `src/hooks/use-auth.tsx` |
| Toast hook | `src/hooks/use-toast.tsx` |

---

## 🎨 Common Tailwind Patterns

```tsx
// Container with padding
<div className="p-6">

// Flex with gap
<div className="flex gap-4">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Card
<div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">

// Button
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">

// Text sizes
className="text-xs text-sm text-base text-lg text-xl text-2xl text-3xl"

// Colors (slate, blue, green, red, amber, purple)
className="bg-slate-50 text-slate-900 border-slate-200"

// Responsive
className="hidden md:block lg:flex"

// Spacing
className="mb-4 mt-2 px-4 py-2"
```

---

## 📦 Import Patterns

```typescript
// Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/layout/header";

// Hooks
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// Utils
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

// Icons
import { FileText, Plus, Loader2 } from "lucide-react";

// Next
import Link from "next/link";
import { useRouter } from "next/navigation";
```

---

## 🔄 Common Patterns

### Form with Validation
```tsx
const [isLoading, setIsLoading] = useState(false);
const [errors, setErrors] = useState<Record<string, string>>({});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate
  if (!email) {
    setErrors({ email: "Email required" });
    return;
  }
  
  // Submit
  setIsLoading(true);
  try {
    const result = await apiClient.login(email, password);
    // Handle success
  } catch (error) {
    // Handle error
  } finally {
    setIsLoading(false);
  }
};
```

### Using useToast
```tsx
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

toast({
  title: "Success",
  description: "Created successfully!",
  type: "success",
});
```

### Using useAuth
```tsx
const { user, login, signup, logout } = useAuth();

const handleLogin = async () => {
  const result = await login(email, password);
  if (result.success) {
    router.push("/dashboard");
  }
};
```

### Loading State
```tsx
const [isLoading, setIsLoading] = useState(false);

return (
  <Button disabled={isLoading}>
    {isLoading ? (
      <>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </>
    ) : (
      "Submit"
    )}
  </Button>
);
```

### API Call
```tsx
try {
  const response = await apiClient.createLeadMagnet({
    type: "ebook",
    niche: "Marketing",
    topic: "Email Marketing Guide",
  });
  
  console.log(response.data);
} catch (error) {
  console.error(error);
}
```

---

## 🎯 CSS Variables (Theme)

Edit in `src/app/globals.css`:

```css
:root {
  --background: 0 0% 100%;        /* White */
  --foreground: 0 0% 3.6%;        /* Dark gray */
  --card: 0 0% 100%;              /* White */
  --primary: 0 0% 9%;             /* Dark blue-gray */
  --secondary: 0 0% 96.1%;        /* Light gray */
  --accent: 0 84.2% 60.2%;        /* Red */
  --muted: 0 0% 89.1%;            /* Gray */
}
```

---

## 📱 Responsive Breakpoints

```css
sm:   640px
md:   768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

Usage:
```tsx
<div className="hidden md:block lg:flex">
  Shows on md+ screens
</div>
```

---

## 🔧 Component Creation Template

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <Card className="p-6">
      <h2 className="font-bold text-lg mb-4">{title}</h2>
      <Button onClick={onAction}>Click me</Button>
    </Card>
  );
}
```

---

## 🧪 Testing Checklist

- [ ] Form submissions
- [ ] Error messages
- [ ] Loading states
- [ ] Toast notifications
- [ ] Navigation
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Form validation
- [ ] API error handling
- [ ] Auth flow
- [ ] Logout

---

## 🐛 Debugging Tips

### Check TypeScript errors
```bash
npm run type-check
```

### Browser Console
`F12` → Console tab → Look for errors

### Network tab
`F12` → Network tab → Check API calls

### React DevTools
Browser extension for component debugging

### Common Issues

| Issue | Solution |
|-------|----------|
| "Module not found" | `npm install`, restart dev server |
| Port 3000 in use | `kill -9 $(lsof -t -i:3000)` |
| Types missing | Add types to `src/types/` |
| Build fails | Run `npm run type-check` first |

---

## 📖 Documentation Links

| Resource | URL |
|----------|-----|
| Next.js | https://nextjs.org/docs |
| React | https://react.dev |
| TypeScript | https://www.typescriptlang.org/docs |
| Tailwind | https://tailwindcss.com/docs |
| Shadcn UI | https://ui.shadcn.com |
| Radix UI | https://www.radix-ui.com |
| React Hook Form | https://react-hook-form.com |
| Zod | https://zod.dev |
| Axios | https://axios-http.com |
| Recharts | https://recharts.org |

---

## 🚀 Deploy Commands

### Build locally
```bash
npm run build
npm start
```

### Vercel
```bash
npm install -g vercel
vercel deploy
```

### Environment setup
```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

---

## 🎨 Color Reference

| Class | Use |
|-------|-----|
| `bg-blue-*` | Primary (CTA buttons) |
| `bg-green-*` | Success states |
| `bg-red-*` | Errors |
| `bg-amber-*` | Warnings |
| `bg-slate-*` | Neutral |
| `text-slate-600` | Secondary text |
| `text-slate-900` | Primary text |

---

## 📏 Spacing Scale

```
1 = 4px    (p-1)
2 = 8px    (p-2)
3 = 12px   (p-3)
4 = 16px   (p-4)
6 = 24px   (p-6)
8 = 32px   (p-8)
```

Usage: `p-4` `m-2` `gap-3` `mb-4`

---

## ✨ Quick Wins

### Add a new page
1. Create folder: `src/app/new-page/`
2. Create: `src/app/new-page/page.tsx`
3. Export component

### Add a new component
1. Create: `src/components/my-component.tsx`
2. Export function
3. Import in pages

### Fix type error
1. Check `.` for imports
2. Add `?` for optional props
3. Use `interface` for props

### Add loading state
1. Use `useState(false)`
2. Wrap async in `setLoading(true/false)`
3. Disable button: `disabled={isLoading}`

---

## 🔐 Environment Setup

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENV=development
```

For production:
```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_ENV=production
```

---

## 💾 Key Files to Backup

- `.env.local` - API configuration
- `src/app/globals.css` - Theme colors
- `tailwind.config.ts` - Tailwind config
- `src/lib/api-client.ts` - Backend endpoints

---

## 🎓 Learning Path

1. Start with `src/app/dashboard/page.tsx` - See main page
2. Check `src/components/ui/button.tsx` - See component structure
3. Look at `src/hooks/use-auth.tsx` - See hook patterns
4. Study `src/lib/api-client.ts` - See API integration
5. Review `src/app/globals.css` - See styling

---

## 📊 Project Health

- ✅ TypeScript strict mode
- ✅ All dependencies up to date
- ✅ No security vulnerabilities
- ✅ Proper error handling
- ✅ Loading states implemented
- ✅ Form validation present
- ✅ Responsive design included
- ✅ Production ready

---

**Keep this tab open while developing!** 🚀
