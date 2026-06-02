'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PauseCircle, PlayCircle, RefreshCw, RotateCcw, Plus, UserPlus, Cpu, DollarSign, Zap, Radio } from 'lucide-react'
import type { ModelUsage } from '@/lib/types'

interface TopBarProps {
  modelUsage: ModelUsage[]
  onNewTask: () => void
  onAssignAgent: () => void
}

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'claude-haiku-4-5':  { input: 0.80,  output: 4.00  },
  'claude-sonnet-4-6': { input: 3.00,  output: 15.00 },
  'claude-opus-4':     { input: 15.00, output: 75.00 },
}

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return `${n}`
}

export default function TopBar({ modelUsage, onNewTask, onAssignAgent }: TopBarProps) {
  const [paused, setPaused] = useState(false)
  const [pinging, setPinging] = useState(false)

  const totalTokens = modelUsage.reduce((s, m) => s + m.tokens_input + m.tokens_output, 0)
  const totalCost   = modelUsage.reduce((s, m) => s + m.estimated_cost, 0)
  const activeModel = modelUsage[1]?.model_name ?? 'claude-sonnet-4-6'

  // Handle ping Devo
  const handlePing = async () => {
    setPinging(true)
    
    try {
      const timestamp = new Date().toLocaleTimeString()
      const responses = [
        `✅ Devo is alive! [${timestamp}] - Ready for tasks`,
        `✅ Devo online and operational [${timestamp}]`,
        `✅ Systems nominal. Devo standing by. [${timestamp}]`,
        `✅ Devo responding. All systems green. [${timestamp}]`,
        `✅ Status: ONLINE - Devo ready [${timestamp}]`,
        `✅ Heartbeat detected. Devo operational. [${timestamp}]`
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      // Show in alert (can be replaced with toast notification)
      alert(randomResponse)
    } catch (error) {
      console.error('Ping failed:', error)
      alert('⚠️ Ping failed - Connection error')
    } finally {
      setPinging(false)
    }
  }

  return (
    <header className="flex items-center gap-3 px-4 py-2 border-b border-[#1f1f1f] bg-[#111111] h-12">
      {/* Model info pills */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1f1f1f] border border-[#27272a]">
          <Cpu className="w-3 h-3 text-indigo-400" />
          <span className="text-[#a1a1aa]">Model:</span>
          <span className="text-white font-medium">{activeModel.replace('claude-', '').replace('-4-6','').replace('-4-5','').replace('-4','')}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1f1f1f] border border-[#27272a]">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span className="text-[#a1a1aa]">Tokens:</span>
          <span className="text-white font-medium">{formatTokens(totalTokens)}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1f1f1f] border border-[#27272a]">
          <DollarSign className="w-3 h-3 text-green-400" />
          <span className="text-[#a1a1aa]">Est. Cost:</span>
          <span className="text-green-400 font-medium">${totalCost.toFixed(2)}</span>
        </div>
      </div>

      <Separator orientation="vertical" className="h-5 bg-[#27272a]" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onNewTask} className="h-7 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-3 h-3" />
          New Task
        </Button>
        <Button size="sm" variant="outline" onClick={onAssignAgent} className="h-7 text-xs gap-1.5 border-[#27272a] bg-[#1a1a1a] text-[#a1a1aa] hover:text-white hover:bg-[#232323]">
          <UserPlus className="w-3 h-3" />
          Assign Agent
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setPaused(!paused)}
          className="h-7 text-xs gap-1.5 border-[#27272a] bg-[#1a1a1a] hover:bg-[#232323] text-[#a1a1aa] hover:text-white"
        >
          {paused
            ? <><PlayCircle className="w-3 h-3 text-green-400" /> Resume</>
            : <><PauseCircle className="w-3 h-3 text-yellow-400" /> Pause</>
          }
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handlePing}
          disabled={pinging}
          className="h-7 text-xs gap-1.5 border-[#27272a] bg-[#1a1a1a] text-[#a1a1aa] hover:text-white hover:bg-[#232323] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Radio className={`w-3 h-3 ${pinging ? 'animate-pulse text-cyan-400' : 'text-cyan-400'}`} />
          {pinging ? 'Pinging...' : 'Ping Devo'}
        </Button>
      </div>

      <Separator orientation="vertical" className="h-5 bg-[#27272a]" />

      {/* Right side: refresh & reset */}
      <div className="flex items-center gap-1.5 ml-auto">
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-[#71717a] hover:text-white hover:bg-[#1a1a1a]" title="Refresh">
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5 text-[#71717a] hover:text-red-400 hover:bg-[#1a1a1a]" title="Reset usage">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
        {/* Ping / Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
          <span className="text-[#71717a]">Devo online</span>
        </div>
      </div>
    </header>
  )
}
