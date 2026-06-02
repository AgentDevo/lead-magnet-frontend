# LLM Usage Plan Monitor - Integration Notes

## Overview
The LLM Usage Plan Monitor is a dashboard widget that displays real-time usage metrics for Claude API plans. It shows session and weekly token/request limits with color-coded progress bars, warnings, and human-readable reset countdowns.

## Components Built

### 1. Backend API: `/api/usage/current`
**Location:** `src/app/api/usage/current/route.ts`

**Response:**
```json
{
  "plan": {
    "name": "Claude Pro",
    "tier": "Pro",
    "models": ["Claude 3.5 Haiku", "Claude 3.5 Sonnet", "Claude 3 Opus"]
  },
  "session": {
    "tokens": 45000,
    "requests": 30,
    "limit": 100000,
    "resetTime": "2026-03-12T10:08:29.868Z"
  },
  "sessionUsagePercent": {
    "tokens": 45,
    "requests": 60
  },
  "weekly": {
    "tokens": 620000,
    "requests": 375,
    "limit": 1000000,
    "resetTime": "2026-03-16T20:53:29.868Z"
  },
  "weeklyUsagePercent": {
    "tokens": 62,
    "requests": 75
  },
  "timestamp": "2026-03-12T07:53:29.868Z"
}
```

**Testing:**
```bash
curl http://localhost:3000/api/usage/current | jq .
```

---

### 2. Frontend Component: `LLMUsagePlanMonitor.tsx`
**Location:** `src/components/LLMUsagePlanMonitor.tsx`

**Features:**
- **Plan Overview Card:** Displays plan name, tier, and available models
- **Session Usage Card:** Shows token and request usage with:
  - Progress bars with color coding
  - Reset countdown (e.g., "2h 15m")
  - Usage percentages and warnings
- **Weekly Usage Card:** Same as session but for weekly limits
- **Quick Summary:** Grid view of all usage percentages
- **Auto-refresh:** Polls `/api/usage/current` every 5 seconds
- **Warning System:**
  - Yellow badge at 75% usage
  - Red badge at 85% usage
  - Critical badge at 90% usage
- **Color Coding:**
  - Green: 0-60% usage
  - Yellow: 60-85% usage
  - Red: 85-100% usage

**Example Usage:**
```tsx
import LLMUsagePlanMonitor from '@/components/LLMUsagePlanMonitor'

export default function Page() {
  return <LLMUsagePlanMonitor />
}
```

---

### 3. TypeScript Types: `usage-types.ts`
**Location:** `src/lib/usage-types.ts`

**Exported Types:**
```typescript
- PlanTier: 'Free' | 'Pro' | 'Enterprise'
- PlanDetails: { name, tier, models[] }
- UsageMetrics: { tokens, requests, limit, resetTime }
- UsagePercentage: { tokens, requests }
- UsagePlanResponse: Complete API response type
```

---

## Integration in Sidebar & Page

### Sidebar Navigation
**File:** `src/components/Sidebar.tsx`

Added new navigation item:
```tsx
{ id: 'usage', label: 'LLM Usage', icon: BarChart3 }
```

The sidebar now shows "LLM Usage" between "Tokens" and "Docs" in the left navigation.

### Page Router
**File:** `src/app/page.tsx`

Added conditional rendering:
```tsx
{activeSection === 'usage' && (
  <div className="flex-1 min-h-0 overflow-hidden">
    <LLMUsagePlanMonitor />
  </div>
)}
```

---

## How It Works

1. **User clicks "LLM Usage" in sidebar**
   - Sets `activeSection` to 'usage'
   
2. **Component mounts**
   - Initializes polling interval (5 seconds)
   - Fetches from `/api/usage/current`
   
3. **Data displayed**
   - Plan details shown in overview card
   - Session and weekly metrics in side-by-side cards
   - Progress bars update based on usage percentage
   - Color-coded progress bars and warning badges appear
   - Countdown timers update every second
   
4. **Auto-refresh**
   - Every 5 seconds, new data is fetched
   - Percentages and countdowns update in real-time
   
5. **Component unmounts**
   - Polling interval is cleared

---

## Styling & Theme

All components use the existing shadcn/dark theme:
- **Background:** `bg-[#0f0f0f]` (main), `bg-[#161616]` (cards)
- **Borders:** `border-[#27272a]`
- **Text:** `text-[#ededed]` (primary), `text-[#71717a]` (secondary)
- **Accents:** Indigo, blue, yellow, red, purple for different states

Cards use the existing `Card` component from `src/components/ui/card.tsx`.

---

## Mock Data Strategy

The API endpoint returns hardcoded mock data:
- **Pro plan:** 100k session tokens, 1M weekly tokens
- **Session usage:** ~45% of limits
- **Weekly usage:** ~62% of limits
- **Reset times:** Calculated relative to current time

To integrate real data, replace the mock values in `route.ts` with actual API calls to Claude or your usage tracking system.

---

## Future Enhancements

MVP excludes these features (can be added later):

1. **WebSocket Support:** Replace polling with real-time updates
2. **Historical Trends:** Graph showing usage over time
3. **Model-Specific Breakdown:** Per-model usage and costs
4. **Export/Download:** Export usage reports as CSV
5. **Alerts:** Desktop notifications when usage crosses thresholds
6. **Multiple Plans:** Support for multiple plans/accounts

---

## Testing Checklist

- [x] Backend API returns correct data structure
- [x] Frontend component renders without errors
- [x] Auto-refresh works (every 5 seconds)
- [x] Progress bars display correctly
- [x] Color coding matches usage levels
- [x] Warnings appear at correct thresholds
- [x] Countdowns format correctly (e.g., "2h 15m")
- [x] Sidebar navigation includes "LLM Usage"
- [x] Page routing works correctly
- [x] Dark theme styling matches TokenUsageScreen

---

## Files Modified/Created

**Created:**
- `src/app/api/usage/current/route.ts` - Backend API
- `src/components/LLMUsagePlanMonitor.tsx` - Frontend component
- `src/lib/usage-types.ts` - TypeScript types
- `INTEGRATION_NOTES.md` - This file

**Modified:**
- `src/components/Sidebar.tsx` - Added LLM Usage nav item
- `src/app/page.tsx` - Added component import and routing

---

## How to Use

1. **Navigate to LLM Usage section** from the left sidebar
2. **View current usage** across session and weekly budgets
3. **Monitor warnings** for high usage (75%+)
4. **Check reset times** to know when limits refresh
5. **Auto-refresh** provides real-time updates every 5 seconds

---

## Support

To test the API directly:
```bash
curl http://localhost:3000/api/usage/current | jq .
```

To manually refresh the data in the component, just navigate away and back to the "LLM Usage" section.

For debugging, check:
- Browser console for errors
- Network tab for API calls
- Component state via React DevTools
