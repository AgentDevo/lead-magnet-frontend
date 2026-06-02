'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import KanbanBoard from '@/components/KanbanBoard'
import ActivityFeed from '@/components/ActivityFeed'
import NewTaskModal from '@/components/NewTaskModal'
import CalendarView from '@/components/CalendarView'
import MemoryView from '@/components/MemoryView'
import DocsView from '@/components/DocsView'
import OfficeView from '@/components/OfficeView'
import TokenUsageScreen from '@/components/TokenUsageScreen'
import LLMUsagePlanMonitor from '@/components/LLMUsagePlanMonitor'
import {
  mockTasks, mockAgents, mockProjects, mockActivity, mockModelUsage
} from '@/lib/mock-data'
import type { Task, TaskStatus } from '@/lib/types'

interface CronJob {
  id: string
  name?: string
  schedule: {
    kind: 'cron' | 'at' | 'every'
    expr?: string
    at?: string
    everyMs?: number
    tz?: string
  }
  payload: {
    kind: string
    [key: string]: any
  }
  enabled: boolean
  created_at?: string
  createdAtMs?: number
}

export default function Home() {
  const [activeSection, setActiveSection]   = useState('tasks')
  const [tasks, setTasks]                   = useState(mockTasks)
  const [activity, setActivity]             = useState(mockActivity)
  const [showNewTask, setShowNewTask]       = useState(false)
  const [cronJobs, setCronJobs]             = useState<CronJob[]>([])
  const [dailyMemories, setDailyMemories]   = useState<Array<{ date: string; content: string; type: 'daily' | 'longterm' }>>([])
  const [longtermMemory, setLongtermMemory] = useState('')
  const [documents, setDocuments]           = useState<Array<any>>([])

  // Fetch cron jobs and memories on mount
  useEffect(() => {
    const fetchCronJobs = async () => {
      try {
        const sampleJobs: CronJob[] = [
          {
            id: '9b233c21-e692-466e-8ebd-8bac031b1c48',
            name: 'LAN Device Scan',
            schedule: {
              kind: 'cron',
              expr: '0 */6 * * *',
              tz: 'UTC'
            },
            payload: {
              kind: 'systemEvent',
              text: 'bash /home/svalbuena/.openclaw/workspace/scripts/lan-scan.sh'
            },
            enabled: true,
            created_at: new Date().toISOString()
          }
        ]
        
        setCronJobs(sampleJobs)
      } catch (error) {
        console.debug('Cron fetch error:', error)
      }
    }

    const fetchMemories = async () => {
      try {
        const response = await fetch('/api/memories')
        if (response.ok) {
          const data = await response.json()
          setDailyMemories(data.dailyMemories || [])
          setLongtermMemory(data.longtermMemory || '')
        }
      } catch (error) {
        console.debug('Memory fetch error:', error)
      }
    }

    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/docs')
        if (response.ok) {
          const data = await response.json()
          setDocuments(data.documents || [])
        }
      } catch (error) {
        console.debug('Docs fetch error:', error)
      }
    }

    fetchCronJobs()
    fetchMemories()
    fetchDocuments()
  }, [])

  // Move task between columns
  const handleTaskMove = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t
    ))
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setActivity(prev => [{
        id: String(Date.now()),
        agent_id: '1',
        task_id: taskId,
        action: `Moved "${task.title}" → ${newStatus}`,
        timestamp: new Date().toISOString(),
        details: null,
      }, ...prev.slice(0, 19)])
    }
  }

  // Review task (approve or reject with feedback)
  const handleTaskReview = (taskId: string, approved: boolean, feedback?: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    if (approved) {
      // Move to Done
      setTasks(prev => prev.map(t =>
        t.id === taskId 
          ? { ...t, status: 'Done' as TaskStatus, updated_at: new Date().toISOString() } 
          : t
      ))
      setActivity(prev => [{
        id: String(Date.now()),
        agent_id: null,
        task_id: taskId,
        action: `Approved: "${task.title}" ✅`,
        timestamp: new Date().toISOString(),
        details: feedback || null,
      }, ...prev.slice(0, 19)])
    } else {
      // Send back to agent with feedback
      setTasks(prev => prev.map(t =>
        t.id === taskId 
          ? { 
              ...t, 
              status: 'In Progress' as TaskStatus, 
              updated_at: new Date().toISOString(),
              review_feedback: {
                feedback: feedback || '',
                created_at: new Date().toISOString(),
                reviewed_by: 'User'
              }
            } 
          : t
      ))
      setActivity(prev => [{
        id: String(Date.now()),
        agent_id: null,
        task_id: taskId,
        action: `Changes requested: "${task.title}" (feedback sent to agent)`,
        timestamp: new Date().toISOString(),
        details: feedback || null,
      }, ...prev.slice(0, 19)])
    }
  }

  // Create new task
  const handleNewTask = (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const newTask: Task = {
      ...taskData,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setTasks(prev => [newTask, ...prev])
    setActivity(prev => [{
      id: String(Date.now()),
      agent_id: null,
      task_id: newTask.id,
      action: `New task created: "${newTask.title}"`,
      timestamp: new Date().toISOString(),
      details: taskData.description ?? null,
    }, ...prev.slice(0, 19)])
  }

  return (
    <div className="flex h-screen bg-[#0f0f0f] overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <TopBar
          modelUsage={mockModelUsage}
          onNewTask={() => setShowNewTask(true)}
          onAssignAgent={() => {}}
        />

        {/* Content + Activity feed */}
        <div className="flex flex-1 min-h-0">
          {/* Center pane */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

            {/* Section label */}
            <div className="px-4 pt-3 pb-1">
              <h1 className="text-sm font-semibold text-[#a1a1aa] capitalize">{activeSection}</h1>
            </div>

            {/* Office */}
            {activeSection === 'office' && (
              <div className="flex-1 min-h-0 overflow-hidden p-4">
                <OfficeView
                  agents={mockAgents}
                  activeTasks={tasks
                    .filter(t => t.status === 'Active' || t.status === 'In Progress')
                    .map(t => ({
                      agentId: t.agent_id || '1',
                      taskName: t.title
                    }))}
                />
              </div>
            )}

            {/* Tasks / Kanban */}
            {activeSection === 'tasks' && (
              <div className="flex-1 min-h-0 overflow-hidden">
                <KanbanBoard
                  tasks={tasks}
                  agents={mockAgents}
                  onTaskMove={handleTaskMove}
                  onTaskReview={handleTaskReview}
                />
              </div>
            )}

            {/* Projects - Project Pads */}
            {activeSection === 'projects' && (
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-6 max-w-6xl">
                  {mockProjects.map(project => {
                    const projectTasks = tasks.filter(t => t.project_id === project.id)
                    const completed = projectTasks.filter(t => t.status === 'Done').length
                    const inProgress = projectTasks.filter(t => t.status === 'In Progress' || t.status === 'Active').length
                    const inReview = projectTasks.filter(t => t.status === 'Review').length
                    const backlog = projectTasks.filter(t => t.status === 'Backlog').length
                    const total = projectTasks.length
                    const progress = total > 0 ? Math.round((completed / total) * 100) : 0
                    
                    // Assign responsible agents
                    const projectAgents = mockAgents.filter(agent => 
                      projectTasks.some(task => task.agent_id === agent.id)
                    )
                    
                    // Get color based on priority (high = red, medium = yellow, low = blue)
                    const priorityColor = 
                      project.id === '1' || project.id === '2' || project.id === '5' 
                        ? 'from-red-600 to-red-500' 
                        : 'from-yellow-600 to-yellow-500'

                    return (
                      <div
                        key={project.id}
                        className="flex flex-col h-full rounded-xl border border-[#27272a] bg-gradient-to-br from-[#1a1a1a] to-[#161616] hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden group"
                      >
                        {/* Top Color Bar */}
                        <div className={`h-1 bg-gradient-to-r ${priorityColor}`} />
                        
                        {/* Header Section */}
                        <div className="px-6 pt-6 pb-4 border-b border-[#27272a]">
                          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                            {project.name}
                          </h3>
                          <p className="text-xs text-[#71717a] leading-relaxed">
                            {project.description}
                          </p>
                        </div>

                        {/* Progress Section */}
                        <div className="px-6 py-4 space-y-3">
                          {/* Progress Number */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-[#a1a1aa]">Progress</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-indigo-400">{progress}%</span>
                              <span className="text-xs text-[#52525b]">({completed}/{total})</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-2.5 bg-[#0f0f0f] rounded-full overflow-hidden border border-[#27272a]">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          {/* Task Breakdown */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] mt-3">
                            {inProgress > 0 && (
                              <div className="px-2 py-1.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 font-medium text-center">
                                🔄 {inProgress} Active
                              </div>
                            )}
                            {inReview > 0 && (
                              <div className="px-2 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 font-medium text-center">
                                👀 {inReview} Review
                              </div>
                            )}
                            {backlog > 0 && (
                              <div className="px-2 py-1.5 rounded-md bg-[#1f1f1f] border border-[#27272a] text-[#71717a] font-medium text-center">
                                📦 {backlog} Backlog
                              </div>
                            )}
                            {completed > 0 && (
                              <div className="px-2 py-1.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-300 font-medium text-center">
                                ✅ {completed} Done
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Responsible Agents Section */}
                        <div className="px-6 py-4 border-t border-[#27272a] mt-auto">
                          <h4 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-3">
                            Responsible
                          </h4>
                          {projectAgents.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {projectAgents.map(agent => (
                                <div
                                  key={agent.id}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1f1f1f] border border-[#27272a] hover:border-indigo-500/30 transition-colors"
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      agent.status === 'active'
                                        ? 'bg-green-400'
                                        : 'bg-[#3f3f46]'
                                    }`}
                                  />
                                  <span className="text-xs font-medium text-[#e4e4e7]">
                                    {agent.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-[#52525b] italic">
                              No agents assigned yet
                            </div>
                          )}
                        </div>

                        {/* Footer Stats */}
                        <div className="px-6 py-3 bg-[#0f0f0f] border-t border-[#27272a] flex items-center justify-between text-[10px] text-[#52525b]">
                          <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                          <span>Updated: {new Date(project.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Agents placeholder */}
            {activeSection === 'agents' && (
              <div className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
                {mockAgents.map(agent => (
                  <div key={agent.id} className="flex items-center justify-between px-4 py-3 rounded-lg border border-[#27272a] bg-[#161616]">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-400' : 'bg-[#3f3f46]'}`} />
                      <div>
                        <p className="text-sm font-medium text-white">{agent.name}</p>
                        <p className="text-xs text-[#71717a]">{agent.model}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {agent.assigned_tools.map(tool => (
                        <span key={tool} className="text-[10px] px-1.5 py-0.5 rounded bg-[#1f1f1f] text-[#71717a] border border-[#27272a]">
                          {tool}
                        </span>
                      ))}
                    </div>
                    <span suppressHydrationWarning className="text-xs text-[#52525b]">
                      {agent.last_heartbeat
                        ? `Heartbeat: ${Math.floor((Date.now() - new Date(agent.last_heartbeat).getTime()) / 60000)}m ago`
                        : 'No heartbeat'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tools placeholder */}
            {activeSection === 'tools' && (
              <div className="flex-1 flex items-center justify-center text-[#3f3f46] text-sm">
                Tools — coming soon
              </div>
            )}

            {/* Logs */}
            {activeSection === 'logs' && (
              <div className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto font-mono text-xs">
                {activity.map(log => (
                  <div key={log.id} className="flex gap-3 text-[#71717a] hover:text-[#a1a1aa]">
                    <span className="text-[#3f3f46] flex-shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-indigo-400 flex-shrink-0">[Agent:{log.agent_id ?? '?'}]</span>
                    <span>{log.action}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Calendar */}
            {activeSection === 'calendar' && (
              <div className="flex-1 min-h-0 overflow-hidden p-4">
                <CalendarView jobs={cronJobs} />
              </div>
            )}

            {/* Memories */}
            {activeSection === 'memories' && (
              <div className="flex-1 min-h-0 overflow-hidden p-4">
                <MemoryView
                  dailyMemories={dailyMemories}
                  longtermMemory={longtermMemory}
                />
              </div>
            )}

            {/* Docs */}
            {activeSection === 'docs' && (
              <div className="flex-1 min-h-0 overflow-hidden p-4">
                <DocsView documents={documents} />
              </div>
            )}

            {/* Token Usage & Costs */}
            {activeSection === 'tokens' && (
              <div className="flex-1 min-h-0 overflow-hidden">
                <TokenUsageScreen />
              </div>
            )}

            {/* LLM Usage Plan Monitor */}
            {activeSection === 'usage' && (
              <div className="flex-1 min-h-0 overflow-hidden">
                <LLMUsagePlanMonitor />
              </div>
            )}
          </main>

          {/* Right Activity Feed */}
          <ActivityFeed logs={activity} agents={mockAgents} />
        </div>
      </div>

      {/* New Task modal */}
      <NewTaskModal
        open={showNewTask}
        onClose={() => setShowNewTask(false)}
        agents={mockAgents}
        projects={mockProjects}
        onSubmit={handleNewTask}
      />
    </div>
  )
}
