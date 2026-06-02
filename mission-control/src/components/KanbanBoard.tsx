'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MoreHorizontal, Bot, Clock, CheckCircle2, XCircle } from 'lucide-react'
import type { Task, Agent, TaskStatus, ReviewFeedback } from '@/lib/types'

const COLUMNS: { id: TaskStatus | 'My Tasks'; label: string; color: string }[] = [
  { id: 'Backlog',     label: 'Backlog',     color: 'border-t-[#3f3f46]'  },
  { id: 'In Progress', label: 'In Progress', color: 'border-t-yellow-500/60' },
  { id: 'Active',      label: 'Active',      color: 'border-t-indigo-500/60' },
  { id: 'Review',      label: 'Review',      color: 'border-t-blue-500/60' },
  { id: 'Done',        label: 'Done',        color: 'border-t-green-500/60' },
  { id: 'My Tasks',    label: 'My Tasks',    color: 'border-t-cyan-500/60'   },
]

const PRIORITY_COLOR: Record<string, string> = {
  high:   'bg-red-500/15 text-red-400 border-red-500/20',
  medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  low:    'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
}

function formatRelative(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

interface KanbanBoardProps {
  tasks: Task[]
  agents: Agent[]
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void
  onTaskReview?: (taskId: string, approved: boolean, feedback?: string) => void
}

export default function KanbanBoard({ tasks, agents, onTaskMove, onTaskReview }: KanbanBoardProps) {
  const [dragging, setDragging] = useState<string | null>(null)
  const [reviewingTask, setReviewingTask] = useState<Task | null>(null)
  const [reviewFeedback, setReviewFeedback] = useState('')

  const getColumnTasks = (columnId: string) => {
    if (columnId === 'My Tasks') return tasks.filter(t => t.agent_id === null)
    return tasks.filter(t => t.status === columnId)
  }

  const getAgent = (agentId: string | null) =>
    agents.find(a => a.id === agentId)

  const handleDragStart = (taskId: string) => setDragging(taskId)
  const handleDragEnd = () => setDragging(null)

  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault()
    if (dragging && colId !== 'My Tasks') {
      onTaskMove(dragging, colId as TaskStatus)
    }
    setDragging(null)
  }

  const handleReviewApprove = () => {
    if (reviewingTask) {
      onTaskReview?.(reviewingTask.id, true, reviewFeedback)
      setReviewingTask(null)
      setReviewFeedback('')
    }
  }

  const handleReviewReject = () => {
    if (reviewingTask && reviewFeedback.trim()) {
      onTaskReview?.(reviewingTask.id, false, reviewFeedback)
      setReviewingTask(null)
      setReviewFeedback('')
    }
  }

  return (
    <div className="flex gap-3 h-full overflow-x-auto p-4 pb-2">
      {COLUMNS.map(col => {
        const colTasks = getColumnTasks(col.id)
        return (
          <div
            key={col.id}
            className="flex flex-col min-w-[220px] flex-1"
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, col.id)}
          >
            {/* Column header */}
            <div className={cn(
              'flex items-center justify-between px-3 py-2 rounded-t-lg border border-b-0 border-[#27272a] bg-[#161616] border-t-2',
              col.color
            )}>
              <span className="text-xs font-medium text-[#a1a1aa]">{col.label}</span>
              <span className="text-xs text-[#52525b] bg-[#1f1f1f] px-1.5 py-0.5 rounded">
                {colTasks.length}
              </span>
            </div>

            {/* Task cards */}
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto p-2 border border-t-0 border-[#27272a] rounded-b-lg bg-[#111111] min-h-[80px]">
              {colTasks.map(task => {
                const agent = getAgent(task.agent_id)
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'group relative p-3 rounded-md border border-[#27272a] bg-[#161616]',
                      'hover:border-[#3f3f46] hover:bg-[#1a1a1a] transition-all cursor-grab active:cursor-grabbing',
                      dragging === task.id && 'opacity-40'
                    )}
                  >
                    {/* Three-dot menu / Review button */}
                    {task.status === 'Review' ? (
                      <button 
                        onClick={() => setReviewingTask(task)}
                        className="absolute top-2 right-2 p-1.5 rounded text-blue-400 hover:text-blue-300 transition-opacity hover:bg-blue-500/10"
                        title="Review task"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#71717a] hover:text-white transition-opacity">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Title */}
                    <p className="text-sm text-[#e4e4e7] font-medium pr-4 leading-snug mb-2">
                      {task.title}
                    </p>

                    {/* Description */}
                    {task.description && (
                      <p className="text-xs text-[#71717a] mb-2 leading-relaxed line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      <Badge variant="outline" className={cn('text-[10px] h-4 px-1.5 border', PRIORITY_COLOR[task.priority])}>
                        {task.priority}
                      </Badge>
                      {agent && (
                        <div className="flex items-center gap-1 text-[10px] text-[#71717a]">
                          <Bot className="w-2.5 h-2.5" />
                          <span>{agent.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-[#52525b] ml-auto">
                        <Clock className="w-2.5 h-2.5" />
                        <span suppressHydrationWarning>{formatRelative(task.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {colTasks.length === 0 && (
                <div className="flex items-center justify-center h-16 text-xs text-[#3f3f46]">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Review Modal */}
      {reviewingTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161616] border border-[#27272a] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 border-b border-[#27272a] bg-[#111111] px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Review Task</h2>
              <p className="text-sm text-[#71717a] mt-1">{reviewingTask.title}</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Task Details */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-[#a1a1aa]">Task Details</h3>
                <div className="bg-[#0f0f0f] border border-[#27272a] rounded p-3 space-y-2 text-sm">
                  <div>
                    <span className="text-[#71717a]">Description:</span>
                    <p className="text-[#e4e4e7] mt-1">{reviewingTask.description || 'No description'}</p>
                  </div>
                  {reviewingTask.result && (
                    <div className="mt-3 pt-3 border-t border-[#27272a]">
                      <span className="text-[#71717a]">Result:</span>
                      <p className="text-[#e4e4e7] mt-1 whitespace-pre-wrap">{reviewingTask.result}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Feedback */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-[#a1a1aa]">
                  {reviewingTask.review_feedback 
                    ? `Previous Feedback (${new Date(reviewingTask.review_feedback.created_at).toLocaleDateString()})`
                    : 'Feedback/Comments'}
                </h3>
                {reviewingTask.review_feedback && (
                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded p-3 mb-3">
                    <p className="text-sm text-yellow-300">{reviewingTask.review_feedback.feedback}</p>
                    <p className="text-xs text-[#71717a] mt-2">← Send back to agent for corrections</p>
                  </div>
                )}
                <textarea
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Add feedback or comments for the agent..."
                  className="w-full bg-[#0f0f0f] border border-[#27272a] rounded px-3 py-2 text-sm text-[#e4e4e7] placeholder-[#52525b] focus:border-[#3f3f46] focus:outline-none resize-none"
                  rows={4}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 border-t border-[#27272a] bg-[#111111] px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setReviewingTask(null)
                  setReviewFeedback('')
                }}
                className="px-4 py-2 rounded-md text-sm font-medium text-[#a1a1aa] border border-[#27272a] hover:bg-[#1a1a1a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewReject}
                disabled={!reviewFeedback.trim()}
                className="px-4 py-2 rounded-md text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Needs Changes
              </button>
              <button
                onClick={handleReviewApprove}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
