import type { Task, Agent, Project, ActivityLog, ModelUsage, Tool } from './types'

export const mockAgents: Agent[] = [
  { id: '1', name: 'Devo', status: 'active', model: 'claude-sonnet-4-6', assigned_tools: ['web_search', 'exec', 'browser'], last_heartbeat: new Date().toISOString(), created_at: '2026-02-20T00:00:00Z', updated_at: new Date().toISOString() },
  { id: '2', name: 'Memory Curator', status: 'idle', model: 'claude-haiku-4-5', assigned_tools: ['read', 'write'], last_heartbeat: new Date(Date.now() - 3600000).toISOString(), created_at: '2026-03-04T00:00:00Z', updated_at: new Date().toISOString() },
  { id: '3', name: 'Network Monitor', status: 'break', model: 'claude-haiku-4-5', assigned_tools: ['exec'], last_heartbeat: new Date(Date.now() - 7200000).toISOString(), created_at: '2026-03-01T00:00:00Z', updated_at: new Date().toISOString() },
  { id: '4', name: 'Bobby', status: 'active', model: 'claude-sonnet-4-6', assigned_tools: ['translate'], last_heartbeat: new Date().toISOString(), created_at: '2026-03-11T19:54:00Z', updated_at: new Date().toISOString() },
  { id: '5', name: 'Agent Zero', status: 'active', model: 'gpt-oss-20b', assigned_tools: ['remote-exec', 'remote-control', 'analysis'], last_heartbeat: new Date().toISOString(), created_at: '2026-03-11T20:06:00Z', updated_at: new Date().toISOString(), team_leader: true, primary_host: '192.168.1.174', manages_agents: ['6'], team_size: 1, co_residents: ['Tony'] },
  { id: '6', name: 'Tony', status: 'active', model: 'gpt-oss-20b', assigned_tools: ['security-audit', 'code-analysis', 'penetration-test', 'exploit-analysis', 'vulnerability-scan'], last_heartbeat: new Date().toISOString(), created_at: '2026-03-11T20:18:00Z', updated_at: new Date().toISOString(), reports_to: '5', team_leader: 'Agent Zero', team_location: '192.168.1.174', agent_location: '192.168.1.174', primary_host: '192.168.1.174', sub_agent: true, remote_host: true },
  { id: '7', name: 'Keanu', status: 'active', model: 'claude-opus-4-20250514', assigned_tools: ['code-generation', 'architecture-design', 'debugging', 'optimization'], last_heartbeat: new Date().toISOString(), created_at: '2026-03-15T22:53:00Z', updated_at: new Date().toISOString(), specialty: 'OpenClaw Engineer', description: 'Expert Developer — Game Engine, Full-Stack Web, Architecture Design' },
]

export const mockProjects: Project[] = [
  { id: '1', name: 'Mission Control Dashboard', description: 'Next.js dashboard with task management, calendar, and activity feeds. Real-time monitoring and control center for OpenClaw operations.', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-03-09T20:45:00Z' },
  { id: '2', name: 'Infrastructure & Network', description: 'LAN device mapping, network monitoring, device health checks, and automated scanning. Manages 43+ network devices across the ecosystem.', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-09T20:45:00Z' },
  { id: '3', name: 'QMD Integration', description: 'Document indexing, vector embeddings, and retrieval system. Integrates AI-powered semantic search with OpenClaw agents via MCP.', created_at: '2026-02-23T00:00:00Z', updated_at: '2026-03-09T20:45:00Z' },
  { id: '4', name: 'Memory & Knowledge Base', description: 'MEMORY.md curation, daily logs, memory synchronization. Maintains continuity and knowledge persistence across agent sessions.', created_at: '2026-03-04T00:00:00Z', updated_at: '2026-03-09T20:45:00Z' },
  { id: '5', name: 'Automation & Scheduling', description: 'Cron jobs, scheduled tasks, heartbeat system, auto-backlog work assignment. Keeps OpenClaw running autonomously with task delegation and health monitoring.', created_at: '2026-03-05T00:00:00Z', updated_at: '2026-03-09T20:45:00Z' },
]

export const mockTasks: Task[] = [
  // Project 1: Mission Control Dashboard
  { id: '1', project_id: '1', agent_id: '1', title: 'Mission Control Dashboard', description: 'Build Next.js dashboard with Shadcn UI, Kanban boards, and task management', status: 'Active', priority: 'high', created_at: '2026-03-05T22:25:00Z', updated_at: new Date().toISOString() },
  { id: '8', project_id: '1', agent_id: '1', title: 'Port 7200 Stability Fix', description: 'Fix Python HTTP server crashing issue and implement proper server startup', status: 'Review', priority: 'high', result: 'Fixed by adding proper flag handling. Server now stable with socket activation. All tests pass.', created_at: '2026-03-09T10:15:00Z', updated_at: new Date().toISOString() },
  { id: '10', project_id: '1', agent_id: '1', title: 'Calendar & Task Scheduling UI', description: 'Add calendar view for cron jobs with daily/weekly/monthly views', status: 'Active', priority: 'high', created_at: '2026-03-09T20:00:00Z', updated_at: new Date().toISOString() },
  
  // Project 2: Infrastructure & Network
  { id: '2', project_id: '2', agent_id: '1', title: 'Gateway Health Check', description: 'Monitor port 18789 and RPC endpoints for OpenClaw gateway health', status: 'Active', priority: 'high', created_at: '2026-03-05T19:00:00Z', updated_at: new Date().toISOString() },
  { id: '7', project_id: '2', agent_id: '1', title: 'Network Scan', description: 'LAN scan for device availability and health using ping/ARP', status: 'In Progress', priority: 'medium', created_at: '2026-03-05T19:00:00Z', updated_at: new Date().toISOString() },
  { id: '9', project_id: '2', agent_id: '1', title: 'LAN Device Mapping', description: 'Document all 43 LAN devices with IPs, names, and types', status: 'Done', priority: 'medium', result: 'Complete mapping created in TOOLS.md. Added all devices with descriptions. Updated lan-scan.sh with known devices.', created_at: '2026-03-08T18:00:00Z', updated_at: '2026-03-09T08:30:00Z' },
  { id: '11', project_id: '2', agent_id: '1', title: 'Device Health Monitoring', description: 'Continuous monitoring and alerting for critical devices (Athena, NAS, Rioja)', status: 'In Progress', priority: 'high', created_at: '2026-03-06T00:00:00Z', updated_at: new Date().toISOString() },
  
  // Project 3: QMD Integration
  { id: '4', project_id: '3', agent_id: '1', title: 'QMD Collections Index', description: 'Add and index first document collection with semantic search', status: 'In Progress', priority: 'medium', created_at: '2026-03-04T00:00:00Z', updated_at: new Date().toISOString() },
  { id: '5', project_id: '3', agent_id: '1', title: 'MCP Server Integration', description: 'Connect QMD with agent systems via MCP protocol for RAG', status: 'Backlog', priority: 'medium', created_at: '2026-03-04T00:00:00Z', updated_at: '2026-03-04T00:00:00Z' },
  { id: '3', project_id: '3', agent_id: '1', title: 'GPU Acceleration Setup', description: 'Install CUDA toolkit for QMD vector embedding performance', status: 'In Progress', priority: 'medium', created_at: '2026-03-04T00:00:00Z', updated_at: new Date().toISOString() },
  
  // Project 4: Memory & Knowledge Base
  { id: '6', project_id: '4', agent_id: '1', title: 'Memory Sync System', description: 'Synchronize MEMORY.md and daily logs for knowledge continuity', status: 'In Progress', priority: 'high', created_at: '2026-03-05T20:00:00Z', updated_at: new Date().toISOString() },
  { id: '12', project_id: '4', agent_id: '2', title: 'Daily Memory Curation', description: 'Review and curate daily logs into long-term MEMORY.md', status: 'Active', priority: 'medium', created_at: '2026-03-04T00:00:00Z', updated_at: new Date().toISOString() },
  
  // Project 5: Automation & Scheduling
  { id: '13', project_id: '5', agent_id: '1', title: 'LAN Scan Automation', description: 'Setup cron job for automatic LAN device scanning every 6 hours', status: 'Active', priority: 'medium', created_at: '2026-03-09T19:00:00Z', updated_at: new Date().toISOString() },
  { id: '14', project_id: '5', agent_id: '1', title: 'Backlog Auto-Assignment', description: 'Implement heartbeat check to auto-move backlog tasks to In Progress', status: 'Active', priority: 'medium', created_at: '2026-03-09T20:00:00Z', updated_at: new Date().toISOString() },
  { id: '15', project_id: '5', agent_id: '3', title: 'Heartbeat Health System', description: 'Periodic heartbeat checks for gateway, servers, and network health', status: 'Active', priority: 'high', created_at: '2026-03-05T00:00:00Z', updated_at: new Date().toISOString() },
]

export const mockActivity: ActivityLog[] = [
  { id: '1', agent_id: '1', task_id: '1', action: 'Started building Mission Control Dashboard (Next.js)', timestamp: new Date().toISOString(), details: 'Scaffolding Next.js app with Shadcn UI' },
  { id: '2', agent_id: '7', task_id: null, action: 'Keanu agent created and onboarded', timestamp: new Date(Date.now() - 180000).toISOString(), details: '🟢 OpenClaw Expert Developer — Engine & Full-Stack Web' },
  { id: '3', agent_id: '1', task_id: null, action: 'Switched model to Sonnet for complex task', timestamp: new Date(Date.now() - 240000).toISOString(), details: 'anthropic/claude-sonnet-4-6' },
  { id: '4', agent_id: '2', task_id: null, action: 'MEMORY.md updated with gap analysis', timestamp: new Date(Date.now() - 3600000).toISOString(), details: '9-day gap reviewed and documented' },
  { id: '5', agent_id: '1', task_id: null, action: 'Responded to ping — Status: Alive ✅', timestamp: new Date(Date.now() - 5400000).toISOString(), details: null },
  { id: '6', agent_id: '3', task_id: null, action: 'LAN scan completed — all 43 devices online', timestamp: new Date(Date.now() - 7200000).toISOString(), details: '0 devices unreachable' },
  { id: '7', agent_id: '1', task_id: null, action: 'Mission Control dashboard restarted on port 7200', timestamp: new Date(Date.now() - 9000000).toISOString(), details: 'nohup + disown for persistence' },
  { id: '8', agent_id: '1', task_id: null, action: 'Session started — HEARTBEAT_OK', timestamp: new Date(Date.now() - 18000000).toISOString(), details: null },
]

export const mockModelUsage: ModelUsage[] = [
  { id: '1', agent_id: '1', model_name: 'claude-haiku-4-5', tokens_input: 125480, tokens_output: 287340, estimated_cost: 1.25, last_reset: '2026-03-01T00:00:00Z' },
  { id: '2', agent_id: '1', model_name: 'claude-sonnet-4-6', tokens_input: 45920, tokens_output: 82650, estimated_cost: 1.38, last_reset: '2026-03-01T00:00:00Z' },
  { id: '3', agent_id: '1', model_name: 'claude-opus-4', tokens_input: 8200, tokens_output: 15340, estimated_cost: 0.27, last_reset: '2026-03-01T00:00:00Z' },
]

export const mockTools: Tool[] = [
  { id: '1', agent_id: '1', name: 'web_search', type: 'search', description: 'Search the web via Brave API', url: null, created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
  { id: '2', agent_id: '1', name: 'exec', type: 'system', description: 'Execute shell commands', url: null, created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
  { id: '3', agent_id: '1', name: 'browser', type: 'browser', description: 'Control web browser via OpenClaw', url: null, created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
  { id: '4', agent_id: '1', name: 'memory_search', type: 'memory', description: 'Search MEMORY.md and memory files', url: null, created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
]
