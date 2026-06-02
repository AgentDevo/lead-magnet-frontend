'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Agent, Project, Task } from '@/lib/types'

interface NewTaskModalProps {
  open: boolean
  onClose: () => void
  agents: Agent[]
  projects: Project[]
  onSubmit: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void
}

export default function NewTaskModal({ open, onClose, agents, projects, onSubmit }: NewTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [projectId, setProjectId] = useState<string>('')
  const [agentId, setAgentId] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      status: agentId ? 'Backlog' : 'Backlog',
      priority,
      project_id: projectId || null,
      agent_id: agentId || null,
    })
    setTitle('')
    setDescription('')
    setPriority('medium')
    setProjectId('')
    setAgentId('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#161616] border-[#27272a] text-[#ededed] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white text-base">Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#a1a1aa]">Title *</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Setup GPU Acceleration"
              className="bg-[#1f1f1f] border-[#27272a] text-white placeholder:text-[#52525b] focus-visible:ring-indigo-500"
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#a1a1aa]">Specifications & Details</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe requirements, steps, success criteria..."
              rows={5}
              className="bg-[#1f1f1f] border-[#27272a] text-white placeholder:text-[#52525b] focus-visible:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[#a1a1aa]">Priority</Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger className="bg-[#1f1f1f] border-[#27272a] text-white focus:ring-indigo-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1f1f1f] border-[#27272a]">
                  <SelectItem value="low"    className="text-zinc-400  focus:bg-[#27272a] focus:text-white">Low</SelectItem>
                  <SelectItem value="medium" className="text-yellow-400 focus:bg-[#27272a] focus:text-white">Medium</SelectItem>
                  <SelectItem value="high"   className="text-red-400   focus:bg-[#27272a] focus:text-white">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[#a1a1aa]">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="bg-[#1f1f1f] border-[#27272a] text-white focus:ring-indigo-500">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="bg-[#1f1f1f] border-[#27272a]">
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id} className="text-[#a1a1aa] focus:bg-[#27272a] focus:text-white">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#a1a1aa]">Assign to Agent</Label>
            <Select value={agentId} onValueChange={setAgentId}>
              <SelectTrigger className="bg-[#1f1f1f] border-[#27272a] text-white focus:ring-indigo-500">
                <SelectValue placeholder="Unassigned (My Tasks)" />
              </SelectTrigger>
              <SelectContent className="bg-[#1f1f1f] border-[#27272a]">
                {agents.map(a => (
                  <SelectItem key={a.id} value={a.id} className="text-[#a1a1aa] focus:bg-[#27272a] focus:text-white">
                    {a.name} — {a.model.replace('claude-','').replace('-4-6','').replace('-4-5','')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-[#71717a] hover:text-white hover:bg-[#1f1f1f]">
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
