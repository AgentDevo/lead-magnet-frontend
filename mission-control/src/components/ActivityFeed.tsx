'use client'

import { useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Zap, Bot } from 'lucide-react'
import type { ActivityLog, Agent } from '@/lib/types'

function formatRelative(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 10) return 'just now'
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

interface ActivityFeedProps {
  logs: ActivityLog[]
  agents: Agent[]
}

export default function ActivityFeed({ logs, agents }: ActivityFeedProps) {
  const [, setTick] = useState(0)

  // Tick every 30s to refresh relative timestamps
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 30000)
    return () => clearInterval(t)
  }, [])

  const getAgent = (agentId: string | null) =>
    agents.find(a => a.id === agentId)

  const isDevo = (agentId: string | null) => {
    const a = getAgent(agentId)
    return a?.name === 'Devo'
  }

  return (
    <aside className="flex flex-col w-72 border-l border-[#1f1f1f] bg-[#111111]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
        <h3 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">Live Activity</h3>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
          <span className="text-[10px] text-[#52525b]">Live</span>
        </div>
      </div>

      {/* Agent status strip */}
      <div className="flex gap-2 px-3 py-2 border-b border-[#1f1f1f]">
        {agents.map(agent => (
          <div key={agent.id} className="flex items-center gap-1.5 text-[10px]">
            <span className={cn(
              'w-1.5 h-1.5 rounded-full',
              agent.status === 'active' ? 'bg-green-400' :
              agent.status === 'break' ? 'bg-yellow-400' : 'bg-[#3f3f46]'
            )} />
            <span className="text-[#71717a]">{agent.name}</span>
          </div>
        ))}
      </div>

      {/* Feed */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col p-2 gap-1">
          {logs.map((log, i) => {
            const agent = getAgent(log.agent_id)
            const isMe = isDevo(log.agent_id)
            return (
              <div
                key={log.id}
                className={cn(
                  'flex gap-2.5 p-2.5 rounded-md border transition-colors slide-in',
                  'border-[#1f1f1f] hover:bg-[#161616] hover:border-[#27272a]',
                  i === 0 && 'border-indigo-500/20 bg-indigo-500/5'
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5',
                  isMe ? 'bg-indigo-500/20' : 'bg-[#1f1f1f]'
                )}>
                  {isMe
                    ? <Zap className="w-3 h-3 text-indigo-400" />
                    : <Bot className="w-3 h-3 text-[#71717a]" />
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={cn(
                      'text-xs font-medium',
                      isMe ? 'text-indigo-400' : 'text-[#a1a1aa]'
                    )}>
                      {agent?.name ?? 'Unknown'}
                    </span>
                    {!isMe && (
                      <span className="text-[9px] text-[#52525b] bg-[#1f1f1f] px-1 py-0.5 rounded">
                        subagent
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#71717a] leading-relaxed">{log.action}</p>
                  <span suppressHydrationWarning className="text-[10px] text-[#3f3f46] mt-0.5 block">
                    {formatRelative(log.timestamp)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </aside>
  )
}
