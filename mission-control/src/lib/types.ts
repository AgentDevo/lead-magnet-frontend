export type TaskStatus = 'Backlog' | 'In Progress' | 'Active' | 'Review' | 'Done'
export type AgentStatus = 'active' | 'idle' | 'break'
export type UserRole = 'Admin' | 'User' | 'Agent'

export interface Project {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  name: string
  status: AgentStatus
  model: string
  assigned_tools: string[]
  last_heartbeat: string | null
  created_at: string
  updated_at: string
  // Sub-agent hierarchy fields
  reports_to?: string | null
  team_leader?: string | boolean | null
  team_location?: string | null
  agent_location?: string | null
  primary_host?: string | null
  sub_agent?: boolean
  remote_host?: boolean
  // Team leadership fields
  manages_agents?: string[]
  team_size?: number
  co_residents?: string[]
  // Specialist fields
  specialty?: string
  description?: string
}

export interface ReviewFeedback {
  feedback: string
  created_at: string
  reviewed_by: string
}

export interface Task {
  id: string
  project_id: string | null
  agent_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: 'low' | 'medium' | 'high'
  result?: string | null
  review_feedback?: ReviewFeedback | null
  created_at: string
  updated_at: string
  project?: Project
  agent?: Agent
}

export interface Tool {
  id: string
  agent_id: string | null
  name: string
  type: string
  description: string | null
  url: string | null
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  agent_id: string | null
  task_id: string | null
  action: string
  timestamp: string
  details: string | null
  agent?: Agent
  task?: Task
}

export interface ModelUsage {
  id: string
  agent_id: string
  model_name: string
  tokens_input: number
  tokens_output: number
  estimated_cost: number
  last_reset: string
  agent?: Agent
}

export interface Doc {
  id: string
  title: string
  content: string
  linked_agents: string[]
  created_at: string
}

export interface Memory {
  id: string
  title: string
  content: string
  linked_agents: string[]
  created_at: string
}
