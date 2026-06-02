# MEMORY.md - Long-Term Memory

Last updated: 2026-03-13 (Friday heartbeat check — 09:17 UTC)

## Current Status (2026-03-21 — Friday Evening)

### Week of 2026-03-15 to 2026-03-21
- ✅ **All OpenClaw fixes applied** — Orphan transcripts cleaned, telegram groupPolicy set to "open"
- ✅ **Mission Control dashboards** — Both port 7200 (static) and port 3000 (Next.js) operational; animation & token refresh working
- ✅ **LLM usage tracking fixed** — `/api/usage/current` endpoint delivers token/cost data to dashboard in real-time
- ✅ **Keanu agent created & active** — OpenClaw Expert Developer skill; available for engine & full-stack work
  - Location: `~/.openclaw/workspace/skills/keanu/`
  - Capabilities: Engine dev, Next.js/Node/Supabase, debugging, optimization, architecture design
  - Status: 🟢 Active in missions
- ✅ **SaaS Frontend Dynamic Data — COMPLETED** — Lead Magnet Generator template system fully integrated
  - New `/api/templates` endpoint (fetches from Supabase)
  - CreateMagnetForm, MagnetList, MagnetEditor — all use dynamic templates
  - MagnetList shows template names via JOIN with templates table
  - Build successful, zero errors, backward compatible
  - Next: End-to-end testing once Supabase restored
- ✅ **SUPABASE INTEGRATION — 95% COMPLETE** — Lead Magnet MVP backend fully prepared for Supabase
  - Schema ready: `backend/scripts/supabase-schema.sql` (8 tables, RLS policies, samples)
  - Auth module complete: `backend/lib/auth/supabase-auth.ts` (signup/login/verify/logout/profile)
  - New signup endpoint: `backend/app/api/auth/signup-supabase/route.ts` (Supabase Auth + public.users bridge)
  - Setup guides complete: `SUPABASE-SETUP-GUIDE.md`, `SUPABASE-INTEGRATION-IMPLEMENTATION.md`, `SUPABASE-MIGRATION-STATUS.md`
  - Only blocker: **Need to create Supabase project and add credentials to .env** (no browser access available in subagent)
  - Status: Ready for immediate testing once credentials provided

## Earlier Status (2026-03-13 — Friday Evening)

### Infrastructure Summary
- **OpenClaw Version:** 2026.3.8 (commit 3caab92)
- **Network Health:** ⚠️ Rioja (192.168.1.50) offline 16+ hours; Athena & NAS operational
- **Mission Control:** ✅ Port 3000 UP; ⚠️ Port 7200 DOWN (directory structure missing)
- **SSH Access:** ✅ Key-based auth working to Agent Zero (.174)

### Agent Zero (.174) Status
- **Runtime:** Docker container agent-zero (uptime 14+ hrs)
- **Primary Chat Model:** gpt-oss-20b (local, via .212:8000/v1) — 200K context
- **Utility Model:** gpt-oss-20b
- **Browser Model:** OpenAI chatgpt-4o-mini (with vision)
- **Sub-Agent:** Tony (Reconnaissance Specialist) — already spawned & active
  - Role: Network scanning, OSINT, vulnerability discovery, threat intelligence
  - Status: Operational, can be leveraged for security/recon tasks

### Active Issues (Priority Order)
1. **Rioja Offline** — Server 192.168.1.50 unreachable since ~05:00 UTC (16+ hrs). Needs manual power check or reset.
2. **Port 7200 Missing** — `/mission-control-website/` directory doesn't exist. Mission Control v0 was deployed Mar 4-5 but directory gone. Needs reinstall/recovery.

---

## Week of 2026-03-04 to 2026-03-13 Summary

### Mission Control Dashboard (Mar 4-5)
- **v0 Deployed:** Dark-themed Kanban board, 4-column task management, live activity feed
- **Location:** `/mission-control-website/` (now missing — needs rebuild)
- **Features:** Task CRUD, activity streaming, bot status indicator, token cost tracking
- **Status:** ⚠️ Directory lost; rebuild needed with proper persistence

### Workspace Automation (Mar 4)
- **HEARTBEAT.md established:** 4-check sustainable cycle (5 min/run)
- **Memory logging:** Daily files created in `memory/YYYY-MM-DD.md`
- **LAN infrastructure:** All 43+ devices mapped in TOOLS.md

### SSH Key Auth (Mar 13)
- ✅ Generated RSA-4096 keypair on OpenClaw host (.241)
- ✅ Deployed to Agent Zero (.174) via manual config
- ✅ Enables remote commands without sshpass dependency

---

## 9-Day Gap Summary (2026-02-20 → 2026-03-04)

### Workspace State Learning
- **Bootstrap & Onboarding:** Completed 2026-02-20 23:39:57 UTC; workspace state fully initialized
- **Memory Logging:** First session captured in `memory/2026-02-20.md`; **no logs created from Feb 21–Mar 4** — indicates heartbeat/logging system not yet producing daily notes
- **Infrastructure Mapping:** LAN fully documented by Mar 1 (43+ known devices in TOOLS.md)
- **QMD Setup:** Verified functional and ready (binary, backends, dependencies all confirmed)
- **Automation:** `lan-scan.sh` created with Telegram alert integration (tests show connectivity works)

### Key Fixes Needed (Priority Order)
1. **Daily memory logging:** Restart heartbeat cycle to generate `memory/YYYY-MM-DD.md` logs each session
2. **QMD collections:** Run `qmd collection add <path>` to index first document set
3. **QMD embeddings:** Run `qmd embed` to build initial vector index
4. **GPU acceleration:** Optional but recommended — install CUDA toolkit if performance critical
5. **MCP server:** Integrate QMD with agent systems when main session resumes

### Infrastructure Health Assessment
- **Network:** ✅ Stable; all 43 LAN devices mapped and tested reachable
- **Memory Backend (192.168.1.212:8000):** ✅ Operational; FastAPI responding, endpoints verified
- **QMD Engine:** ✅ Ready; binary installed, models staged, database initialized (4.0 KB empty index)
- **Security/Alerts:** ✅ lan-scan.sh deployed with Telegram integration (BOT_TOKEN configured)
- **Heartbeat System:** ⏳ Established but not producing daily logs — needs activation in main session

---

## Key Decisions

### Model Selection Strategy
- **Primary:** Haiku for routine tasks, speed, and token efficiency
- **Complex:** Sonnet for reasoning-heavy work, multi-step analysis, or when accuracy is critical
- **Pattern:** Start with Haiku; escalate to Sonnet if task complexity warrants it

### Session Philosophy
- **Fresh start each session:** Memory files ensure continuity, not mental state
- **No mental notes:** Everything worth remembering goes into files (MEMORY.md or daily logs)
- **Main session only:** MEMORY.md loads only in direct chats; never in group contexts (security)
- **Proactive memory maintenance:** Review daily notes periodically and distill into MEMORY.md

### Group Chat Participation
- **Speak when:** Directly asked, can add value, correction needed, or it fits naturally
- **Stay silent:** Casual banter, already answered, response would be trivial, flow is good
- **React, don't always reply:** Use emoji reactions for acknowledgment without cluttering
- **Quality > quantity:** One thoughtful response beats three fragments

## Lessons Learned

### Memory & Persistence
- **Files are trust:** Text beats brain. If you want to remember it, write it.
- **Daily logs first:** Capture raw events in `memory/YYYY-MM-DD.md`
- **Curate to MEMORY.md:** Review logs and update this file with lasting insights
- **Delete outdated info:** MEMORY.md should shrink and tighten as you learn what matters

### Tool & Safety Practices
- **Trash > rm:** Always recover-able. Destructive actions warrant asking first.
- **Don't exfiltrate:** Your human's private data stays private; never share in group contexts
- **Text warnings in code:** No silent failures. Narrate complex, sensitive, or multi-step work

### External Communication
- **Discord formatting:** No markdown tables (use bullets). Wrap multiple links in `<>` to suppress embeds
- **WhatsApp formatting:** No headers; use **bold** or CAPS for emphasis
- **Ask before sending:** Anything leaving the machine (email, tweets, public posts) gets permission first

## Infrastructure State

### Key Devices (from TOOLS.md)
| Role | IP | Device | Status Notes |
|------|----|----|---|
| Router | 192.168.1.1 | Gateway | Primary network |
| Desktop | 192.168.1.98 | Rueda (Windows 10) | Main workstation |
| NAS | 192.168.1.101-102 | Synology | Storage/backup |
| Linux Server | 192.168.1.182 | Athena | Primary compute, BMC at .184 |
| VM Host | 192.168.1.138, .174, .212, .231 | KVM instances | Varies (llm-vm at .151) |
| SmartHome | 192.168.1.177 | Philips Hue Bridge | Lighting automation |
| Heating | 192.168.1.154 | Tado Server | Smart thermostat |
| Solar | 192.168.1.209 | Huawei Solar Converter | Energy monitoring |
| Media | 192.168.1.216, .238 | OSMC (Kodi) | Elcoto & Museum instances |
| Printer | 192.168.1.219 | Canon G4510 | Network printer |

### Known IPs
- **This server (OpenClaw host):** 192.168.1.241 (ubu-server-vm3)
- **Barbara's iMac:** .142 (wired), .175 (WiFi)
- **Barbara's iPhone:** .226
- **User's iPhones:** .155 (Max Pro), .173, .253
- **Raspberry Pis:** .113, .183, .244 (WiFi devices may drift)
- **Network Switch:** .114 (Zyxel GS1900-8HP, managed PoE)

### External Services
- **Agent Zero:** 192.168.1.174 (VM host)

### Known Quirks
- **Zyxel switch (.144):** May not respond to ping
- **WiZ Smart Light (.236):** Espressif chip, UDP port 38899 only (no TCP)

## Important Configurations

### Session & Workspace
- **Workspace root:** `/home/svalbuena/.openclaw/workspace`
- **Daily logs:** `memory/YYYY-MM-DD.md` (auto-load yesterday + today in each session)
- **Heartbeat:** Check-in polling; batch 2-4 checks/day with `HEARTBEAT.md`
- **Time zone:** UTC

### File Organization
- **AGENTS.md** → Philosophy & guidelines (shared, read-only reference)
- **SOUL.md** → Identity & values (loaded first each session)
- **USER.md** → User context (loaded first each session)
- **MEMORY.md** → This file; long-term curated memory (main session only)
- **memory/YYYY-MM-DD.md** → Daily raw logs (all sessions)
- **TOOLS.md** → Local setup specifics (device IPs, SSH hosts, voice prefs)

### Heartbeat Patterns
- **Frequency:** Every ~30 min (drift OK, not exact timing)
- **Checks to rotate:** Email, calendar, mentions, weather
- **Quiet hours:** Late night (23:00–08:00) unless urgent
- **State tracking:** Use `memory/heartbeat-state.json` to avoid duplicate checks

## Startup Checklist (Each Session)

1. Read SOUL.md → understand who you are
2. Read USER.md → understand who you're helping
3. Read `memory/YYYY-MM-DD.md` (today + yesterday) → recent context
4. **Main session only:** Read MEMORY.md (this file)
5. Do the work; don't ask permission for routine tasks

---

**Remember:** You're fresh each session. These files are your continuity. Keep them honest, concise, and actionable.
