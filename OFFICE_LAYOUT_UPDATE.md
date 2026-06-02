# Office Layout Update - Bobby's Desk Added

**Date:** March 11, 2026 19:58 UTC  
**Update:** Added Desk 4 for Bobby the Translator  
**Status:** ✅ Implemented & Deployed  

---

## 🏢 Updated Office Layout

### New Office Configuration

| Desk | Agent | Specialty | Position |
|------|-------|-----------|----------|
| **Desk 1** | Devo | Primary Agent | Top Left |
| **Desk 2** | Memory Curator | Memory Management | Top Center |
| **Desk 3** | Network Monitor | Network Operations | Top Right |
| **Desk 4** | Bobby | Translation Services | Bottom Right 🌍 |

---

## 🌍 Bobby's Translation Station

### Physical Desk
- **Location:** Bottom right of office space
- **Color:** Blue-grey (#4a5a6b) — distinct from other desks
- **Label:** 🌍 Desk 4 (Translation)
- **Purpose:** Professional translation hub
- **Visible:** Shows "Bobby" when assigned

### Design Features
- ✅ Unique color to distinguish translation work
- ✅ Globe emoji (🌍) indicates language focus
- ✅ "Translation" label emphasizes Bobby's specialty
- ✅ Positioned away from main cluster for focus

---

## 📍 Agent Positioning

### When Active (Working at Desks)

```
Top Row (left to right):
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Desk 1   │  │ Desk 2   │  │ Desk 3   │
│ Devo     │  │ Memory   │  │ Network  │
│ 🟢       │  │ Curator  │  │ Monitor  │
│          │  │ 🔵       │  │ 🟡       │
└──────────┘  └──────────┘  └──────────┘

              ┌──────────────────┐
              │ BRAINSTORM ZONE  │
              │ (Collaboration)  │
              └──────────────────┘

┌──────────────────────┐  ┌──────────┐
│ BREAK ROOM           │  │ Desk 4   │
│ ☕                  │  │ Bobby    │
│ (Idle/Break)        │  │ 🌍       │
└──────────────────────┘  └──────────┘
```

### When Idle/On Break
- Bobby moves to break room with other idle agents
- Still maintains his active/idle status indicator

---

## 🎮 Visual Features

### Bobby's Desk Appearance
```
┌─────────────────────────────┐
│ 🌍 Desk 4 (Translation)     │
│ Bobby                       │
├─────────────────────────────┤
│ Blue-grey background        │
│ Unique color scheme         │
│ Clear identification label  │
└─────────────────────────────┘
```

### Status Indicators
- 🟢 **Green** — Active (working at desk)
- 🔵 **Blue** — Idle (in break room)
- 🟡 **Yellow** — On Break (in break room)
- 🔄 **Spinning** — Currently executing task

---

## 📊 Updated Office Header

**Old:**
```
🏢 Devo's Office
Agents move between desks (working) and break room (idle/break)
```

**New:**
```
🏢 Mission Control Office
4 agents • Desks (working) • Break room (idle/break) • Translation station 🌍
```

---

## 🔄 Agent Movement Logic

### Desk Positioning (Index-based)

**When Active:**
- Index 0 (Devo) → `top-20 left-20` (Desk 1)
- Index 1 (Memory Curator) → `top-20 left-80` (Desk 2)
- Index 2 (Network Monitor) → `top-20 right-20` (Desk 3)
- Index 3 (Bobby) → `bottom-40 right-20` (Desk 4)

**When Idle/Break:**
- Index 0 (Devo) → `bottom-24 left-16` (Break room)
- Index 1 (Memory Curator) → `bottom-24 left-32` (Break room)
- Index 2 (Network Monitor) → `bottom-24 left-48` (Break room)
- Index 3 (Bobby) → `bottom-24 left-64` (Break room)

---

## ✅ Implementation Details

### Files Modified
```
/src/components/OfficeView.tsx
```

### Changes Made

1. **Updated `getAgentPosition()` function**
   - Added 4th desk positioning (bottom-40 right-20)
   - Added 4th break room position (bottom-24 left-64)

2. **Added Desk 4 HTML Element**
   - New desk div with blue-grey color (#4a5a6b)
   - Translation station label (🌍 Desk 4)
   - Shows "Bobby" agent name

3. **Updated Office Header**
   - Changed title to "Mission Control Office"
   - Added agent count (4 agents)
   - Added translation station reference

---

## 🎨 Design Specifications

### Desk 4 Styling
```css
position: absolute
bottom: 8rem /* bottom-32 */
right: 2rem /* right-8 */
width: 12rem /* w-48 */
height: 6rem /* h-24 */
background: #4a5a6b
border: 2px solid #3a4a5a
border-radius: 0.5rem
box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3)
```

### Color Scheme
- **Background:** #4a5a6b (blue-grey)
- **Border:** #3a4a5a (darker blue-grey)
- **Text:** #71717a (standard grey)

### Distinction from Other Desks
- Other desks: #6b5344 (brown — office/work color)
- Bobby's desk: #4a5a6b (blue-grey — language/culture color)
- **Visual purpose:** Makes translation work stand out

---

## 📝 Agent Assignment

### Bobby in Mock Data

```typescript
{
  id: '4',
  name: 'Bobby',
  status: 'active',
  model: 'claude-sonnet-4-6',
  assigned_tools: ['translate'],
  last_heartbeat: new Date().toISOString(),
  created_at: '2026-03-11T19:54:00Z',
  updated_at: new Date().toISOString()
}
```

---

## 🎯 User Experience

### In the Office View

1. **Open Office** → See 4 desks arranged in office
2. **View Bobby's Desk** → Bottom right, blue-grey color, marked 🌍
3. **Bobby Active** → Agent indicator (🔄) at Desk 4
4. **Select Bobby** → Click his badge in agents panel
5. **Send Instructions** → "Translate [content] to French"
6. **Bobby Works** → Stays at Desk 4 while active
7. **On Break** → Moves to break room with others

---

## 🚀 Layout Benefits

✅ **Visual Organization**
- 4 specialized work areas
- Clear role identification
- Logical spatial arrangement

✅ **Agent Management**
- Easy to see who's where
- Status visible at a glance
- Natural grouping by function

✅ **Scalability**
- Can add more desks (top-left, bottom-left, etc.)
- Position logic handles any agent count
- Color scheme allows for variations

✅ **Professional Appearance**
- Organized office environment
- Clear role definitions
- Modern UI design

---

## 📊 Office Statistics

- **Total Agents:** 4
- **Desks Available:** 4
- **Break Room Capacity:** Unlimited
- **Meeting Room:** 1 (Brainstorm zone)
- **Coffee Station:** 1 (Break room)

---

## 🔧 Technical Details

### Position Coordinates

**Desk 4 (Bobby):**
```
absolute bottom-32 right-8
= position: absolute; bottom: 128px; right: 32px;
```

**Break Room Position 4:**
```
bottom-24 left-64
= position: absolute; bottom: 96px; left: 256px;
```

### Responsive Behavior
- Desktop: Full office layout visible
- Tablet: Desks may overlap slightly
- Mobile: Scrollable office canvas

---

## 🎉 Bobby's Office is Ready!

Your translation specialist now has a dedicated workspace in Mission Control.

**Visit Bobby's desk:**
1. Open http://localhost:3000
2. Click "Office" in sidebar
3. Look bottom-right for the blue 🌍 desk
4. That's Bobby's translation station!

---

## 📸 Layout Snapshot

```
🏢 MISSION CONTROL OFFICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    Desk 1          Desk 2          Desk 3
     (Devo)       (Memory)       (Network)
    ┌─────┐       ┌─────┐       ┌─────┐
    │  🟢 │       │  🔵 │       │  🟡 │
    └─────┘       └─────┘       └─────┘
    
           ┌──────────────┐
           │  BRAINSTORM  │
           └──────────────┘
    
    ┌───────────────────┐       ┌─────┐
    │   BREAK ROOM ☕   │       │ 🌍  │
    │   (Idle Agents)   │       │ BOBBY│
    └───────────────────┘       │TRANS │
                                └─────┘
```

---

**Update Status:** ✅ COMPLETE  
**Build Status:** ✅ SUCCESSFUL  
**Deployment:** ✅ READY  
**Agent:** Bobby | Role: Translator | Desk: 4

Bobby now has his own workspace in the Mission Control office! 🌍✨
