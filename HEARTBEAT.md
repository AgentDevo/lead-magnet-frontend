# HEARTBEAT.md - Daily Pulse Check

This is your quick maintenance checklist during heartbeat cycles. Keep it simple and sustainable.

## Daily Pulse (Every Heartbeat)

Run through these 5 checks in order. Takes ~5 min. Stop if nothing needs attention.

### 1. 🎯 Check Taskboard Backlog
```bash
bash ~/.openclaw/workspace/scripts/check-backlog.sh
```
- Scan tasks.json for items in "Backlog" assigned to Devo (agent_id: "1")
- Move any found tasks to "In Progress"
- Log which tasks were picked up
- Ready to be spawned as subagent jobs if needed

### 2. 📝 Check Daily Memory Logs
```bash
ls -lt memory/YYYY-MM-DD.md | head -3
```
- Scan today's and yesterday's memory files
- Any unresolved issues or blockers from prior sessions?
- If yes: read them, address blockers, update accordingly
- If no: move on

### 3. ✅ Review Completed Work
- Any pending tasks from MEMORY.md or recent notes?
- What did I actually finish since last heartbeat?
- Update daily log with progress

### 4. 🏥 Spot-Check Device Health (Tuesday/Friday)
- Quick ping check on critical LAN devices (from TOOLS.md)
- Any Rioja, Athena, or NAS showing down?
- If problems: log them, notify if urgent
- Skip on other days unless user asks

### 5. 📚 Update MEMORY.md (Weekly, Fridays)
- Review last 7 days of `memory/*.md` files
- Extract lessons learned, important decisions, patterns
- Merge significant findings into MEMORY.md
- Remove outdated/redundant entries
- Consolidate and keep it current

### 6. 🖥️ Mission Control Servers (Every Heartbeat)
- Port 7200 (static HTML): `curl -s http://localhost:7200/ | grep -o "Mission Control"`
  - If down: `cd ~/.openclaw/workspace/mission-control-website && nohup python3 -m http.server 7200 &>/tmp/mc.log & disown`
- Port 3000 (Next.js app): `curl -s http://localhost:3000/ | grep -o "Mission Control"`
  - If down: `cd ~/.openclaw/workspace/mission-control && nohup npm run dev -- -p 3000 -H 0.0.0.0 &>/tmp/mc-next.log & disown`

### 7-8. 🎨💰 Update Office Animation & Token Tracking (Every Heartbeat)
```bash
bash ~/.openclaw/workspace/scripts/heartbeat-refresh.sh
```
- Refreshes office agent positions/movements based on live status
- Updates token consumption and cost tracking from sessions
- **API Endpoints:**
  - `POST /api/refresh-office` — Updates agent positions (desk vs break-room)
  - `POST /api/refresh-tokens` — Updates token counts and cost state
- Animates agent transitions in real-time
- Displays live LLM cost breakdown on dashboard

## That's It

- No spawning sub-agents for this
- No parallel improvement scanning
- Sequence: backlog → memory → work → health → servers → office animation → token refresh
- If nothing needs action: reply `HEARTBEAT_OK`
- If something urgent: address it, update memory, move on

**Every heartbeat now includes:**
1. Task backlog scan
2. Memory check
3. Completed work review
4. Device health (Tue/Fri)
5. Server health check
6. **Office animation refresh** ← Real-time agent movements
7. **Token/cost update** ← Live model usage tracking

## Auto-Work Flow

When backlog tasks are moved to "In Progress" by the check-backlog script:
1. Next heartbeat will pick them up
2. You can spawn subagents to tackle them (optional)
3. Subagents move tasks to "Review" when done
4. You approve/reject in the Mission Control dashboard
5. Approved tasks go to "Done"; rejected ones get feedback and return to In Progress
