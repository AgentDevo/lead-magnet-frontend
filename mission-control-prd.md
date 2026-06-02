# Mission Control Dashboard PRD
_Received: 2026-03-05 22:25 UTC_

## Tech Stack
- Frontend: Next.js + Shadcn UI
- Backend: n8n webhooks
- Database & Auth: Supabase (locally hosted)

## Phases
- Phase 1 (Core): Task/Project Kanban, Agent monitoring, Activity log, Model usage, Real-time feed
- Phase 2: Custom tools, Docs, Memories, Notifications, Scheduled summaries
- Phase 3: Advanced analytics, customizable business rules

## Supabase Schema
- Projects: id, name, description, created_at, updated_at
- Tasks: id, project_id, agent_id, title, description, status (Backlog/In Progress/Active/Done), created_at, updated_at
- Agents: id, name, status (active/inactive), assigned_tools, last_heartbeat, created_at, updated_at
- Tools: id, agent_id, name, type, description, url, created_at, updated_at
- ActivityLogs: id, agent_id, task_id, action, timestamp, details
- ModelUsage: id, agent_id, model_name, tokens_used, estimated_cost, last_reset
- Docs: id, title, content, linked_agents, created_at
- Memories: id, title, content, linked_agents, created_at
- Users: id, role (Admin/User/Agent), credentials, created_at

## API Endpoints
- /api/agents, /api/tasks, /api/projects, /api/tools
- /api/activity, /api/model-usage, /api/docs, /api/memories

## UI Layout
- Left sidebar: Tasks, Projects, Agents, Tools, Logs, Docs, Memories
- Center: Kanban (Backlog | In Progress | Active | My Tasks)
- Right: Live activity feed (real-time, per-agent)
- Top bar: New Task, Assign Agent, Pause Agent, Refresh, Reset, Model/Token/Cost display

## Roles
- Admin: full CRUD
- User: view + create tasks
- Agent (API): update tasks, post activity logs, report model usage

## Style
- Linear-inspired, modern, minimal, clean, dark theme
