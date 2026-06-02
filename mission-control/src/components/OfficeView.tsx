'use client'

import React, { useState, useEffect } from 'react'
import { Zap, Activity, Coffee } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Agent {
  id: string
  name: string
  status: 'active' | 'idle' | 'break'
}

interface ActiveTask {
  agentId: string
  taskName: string
}

interface OfficeViewProps {
  agents: Agent[]
  activeTasks: ActiveTask[]
}

export default function OfficeView({ agents, activeTasks }: OfficeViewProps) {
  const [chatMessage, setChatMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<Array<{ sender: string; message: string; timestamp?: string }>>([
    { sender: 'System', message: '👾 Welcome to Devo\'s Office! Send instructions to agents to execute tasks.' }
  ])
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return
    if (!selectedAgent) {
      setChatHistory([
        ...chatHistory,
        { sender: 'System', message: '⚠️ Please select an agent first (click an agent badge on the left)' }
      ])
      return
    }

    // Add user message to chat
    setChatHistory(prev => [
      ...prev,
      { sender: 'You', message: chatMessage, timestamp: new Date().toLocaleTimeString() }
    ])

    setLoading(true)
    const userMessage = chatMessage
    setChatMessage('')

    try {
      const targetAgent = agents.find(a => a.id === selectedAgent)
      if (!targetAgent) {
        setChatHistory(prev => [
          ...prev,
          { sender: 'System', message: '❌ Error: Agent not found' }
        ])
        return
      }

      // Call the API endpoint to send instruction
      const response = await fetch('/api/agents/send-instruction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          agentName: targetAgent.name,
          instruction: userMessage,
          timestamp: new Date().toISOString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setChatHistory(prev => [
          ...prev,
          { 
            sender: 'System', 
            message: `❌ Error: ${data.error || 'Failed to send instruction'}`
          }
        ])
        return
      }

      // Add agent response to chat
      if (data.response) {
        setChatHistory(prev => [
          ...prev,
          { 
            sender: targetAgent.name, 
            message: data.response,
            timestamp: new Date().toLocaleTimeString()
          }
        ])
      }

      // Show success message
      setChatHistory(prev => [
        ...prev,
        { 
          sender: 'System', 
          message: `✅ Instruction executed by ${targetAgent.name}`
        }
      ])
    } catch (error) {
      console.error('Error sending instruction:', error)
      setChatHistory(prev => [
        ...prev,
        { 
          sender: 'System', 
          message: `❌ Connection error: ${error instanceof Error ? error.message : 'Failed to send instruction'}`
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Get agent position based on status
  const getAgentPosition = (agent: Agent, idx: number) => {
    if (agent.status === 'active') {
      // Agents at desks when working
      const deskPositions = [
        'top-20 left-20',      // Desk 1 (Devo)
        'top-20 left-80',      // Desk 2 (Memory Curator)
        'top-20 right-20',     // Desk 3 (Network Monitor)
        'bottom-40 right-20',  // Desk 4 (Bobby) - bottom right
        'top-48 right-20',     // Desk 5 (Agent Zero) - top right elevated
        'top-64 left-20',      // Desk 6 (Tony) - bottom left elevated
        'top-32 left-48'       // Desk 7 (Keanu) - center elevated
      ]
      return deskPositions[idx] || 'top-20 left-20'
    } else {
      // Agents in break room when idle or on break
      const breakPositions = [
        'bottom-24 left-16',
        'bottom-24 left-32',
        'bottom-24 left-48',
        'bottom-24 left-64',
        'bottom-24 left-80',
        'bottom-24 left-96'
      ]
      return breakPositions[idx] || 'bottom-24 left-16'
    }
  }

  // Get agent icon based on status
  const getAgentIcon = (agent: Agent, task?: ActiveTask) => {
    if (task) return '🔄' // Working/spinning
    if (agent.status === 'idle') return '💤' // Idle/resting
    if (agent.status === 'break') return '☕' // Coffee break
    return '👤'
  }

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] rounded-lg border border-[#27272a] overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#27272a] bg-[#111111] px-6 py-4">
        <h2 className="text-lg font-semibold text-white mb-2">🏢 Mission Control Office</h2>
        <p className="text-xs text-[#71717a]">
          6 agents • Translation 🌍 • Remote 🖥️ • Security 🔓 • Desks (working) • Break room (idle/break)
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Office Canvas */}
        <div className="flex-1 overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] relative p-4">
          <div className="w-full h-full border border-[#27272a] rounded-lg bg-[#111111] overflow-hidden relative" style={{ imageRendering: 'pixelated' }}>
            
            {/* Pixel Art Background - Floor Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-30" style={{ imageRendering: 'pixelated' }}>
              <defs>
                <pattern id="floorGrid" x="24" y="24" width="48" height="48" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="24" height="24" fill="#1f1f1f" stroke="#27272a" strokeWidth="0.5" />
                  <rect x="24" y="0" width="24" height="24" fill="#1a1a1a" stroke="#27272a" strokeWidth="0.5" />
                  <rect x="0" y="24" width="24" height="24" fill="#1a1a1a" stroke="#27272a" strokeWidth="0.5" />
                  <rect x="24" y="24" width="24" height="24" fill="#1f1f1f" stroke="#27272a" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="1200" height="700" fill="url(#floorGrid)" />
            </svg>

            {/* Desks (U-shaped layout) */}
            <div className="absolute top-12 left-8 w-48 h-24 bg-[#6b5344] border-2 border-[#4a3a2a] rounded shadow-lg" title="Desk 1">
              <div className="text-[10px] text-[#71717a] p-2 font-bold">📍 Desk 1</div>
              <div className="text-[9px] text-[#52525b] px-2">{agents[0]?.name}</div>
            </div>
            <div className="absolute top-12 left-64 w-48 h-24 bg-[#6b5344] border-2 border-[#4a3a2a] rounded shadow-lg" title="Desk 2">
              <div className="text-[10px] text-[#71717a] p-2 font-bold">📍 Desk 2</div>
              <div className="text-[9px] text-[#52525b] px-2">{agents[1]?.name}</div>
            </div>
            <div className="absolute top-12 right-8 w-48 h-24 bg-[#6b5344] border-2 border-[#4a3a2a] rounded shadow-lg" title="Desk 3">
              <div className="text-[10px] text-[#71717a] p-2 font-bold">📍 Desk 3</div>
              <div className="text-[9px] text-[#52525b] px-2">{agents[2]?.name}</div>
            </div>

            {/* Desk 4 - Bobby (Translator) */}
            <div className="absolute bottom-32 right-8 w-48 h-24 bg-[#4a5a6b] border-2 border-[#3a4a5a] rounded shadow-lg" title="Desk 4 - Translation Station">
              <div className="text-[10px] text-[#71717a] p-2 font-bold">🌍 Desk 4 (Translation)</div>
              <div className="text-[9px] text-[#52525b] px-2">{agents[3]?.name}</div>
            </div>

            {/* Desk 5 - Agent Zero (Remote) */}
            <div className="absolute top-48 right-8 w-56 h-28 bg-[#2a3a5a] border-2 border-purple-600/60 rounded-lg shadow-lg" title="Desk 5 - Remote Command Center">
              <div className="text-[10px] text-purple-400 p-2 font-bold flex items-center gap-1">
                <span>🖥️</span>
                <span>Desk 5 (Remote)</span>
                <span className="text-[8px] text-purple-500 ml-auto">192.168.1.174</span>
              </div>
              <div className="text-[9px] text-purple-300 px-2">{agents[4]?.name}</div>
              <div className="text-[8px] text-purple-400/60 px-2 mt-1">Remote VM Host</div>
            </div>

            {/* Desk 6 - Tony (Remote from 192.168.1.174) */}
            <div className="absolute bottom-32 left-8 w-56 h-28 bg-[#3a1a2a] border-2 border-red-600/60 rounded-lg shadow-lg" title="Desk 6 - Remote Security Command">
              <div className="text-[10px] text-red-400 p-2 font-bold flex items-center gap-1">
                <span>🔓</span>
                <span>Desk 6 (Remote)</span>
                <span className="text-[8px] text-red-500 ml-auto">192.168.1.174</span>
              </div>
              <div className="text-[9px] text-red-300 px-2">{agents[5]?.name}</div>
              <div className="text-[8px] text-red-400/60 px-2 mt-1">Co-located with Agent Zero</div>
            </div>

            {/* Meeting Room (center) */}
            <div className="absolute top-48 left-1/2 -translate-x-1/2 w-64 h-48 bg-[#1f3a52] border-4 border-cyan-500/50 rounded-lg flex flex-col items-center justify-center shadow-lg" title="Meeting Room">
              <div className="text-cyan-400 text-sm font-bold">💡 BRAINSTORM</div>
              <div className="text-cyan-400/60 text-[10px] mt-1">Collaboration Zone</div>
            </div>

            {/* Coffee Corner / Break Room */}
            <div className="absolute bottom-8 left-8 w-56 h-20 bg-[#3d2817] border-2 border-amber-600 rounded-lg shadow-lg flex flex-col items-center justify-center" title="Coffee Corner">
              <div className="text-amber-400 text-sm font-bold">☕ BREAK ROOM</div>
              <div className="text-amber-600 text-[9px] mt-1">Relax & Recharge</div>
            </div>

            {/* Agent Indicators - Dynamic positioning */}
            {agents.map((agent, idx) => {
              const task = activeTasks.find(t => t.agentId === agent.id)
              const colors: Record<string, string> = {
                'active': 'bg-green-400 border-green-500',
                'idle': 'bg-blue-400 border-blue-500',
                'break': 'bg-yellow-400 border-yellow-500'
              }
              
              const position = getAgentPosition(agent, idx)
              const icon = getAgentIcon(agent, task)
              
              return (
                <div
                  key={agent.id}
                  className={cn(
                    'absolute transition-all duration-500 ease-in-out',
                    position
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-base font-bold border-2 shadow-md hover:scale-110 transition-transform',
                      colors[agent.status]
                    )}
                    title={`${agent.name} - ${agent.status}${task ? ` (${task.taskName})` : ''}`}
                  >
                    {icon}
                  </div>
                  <div className="text-[9px] text-center mt-1 text-[#a1a1aa] font-semibold max-w-16 truncate">
                    {agent.name}
                  </div>
                </div>
              )
            })}

            {/* Status Legend */}
            <div className="absolute bottom-4 right-4 bg-[#161616]/90 border border-[#27272a] rounded-lg p-3 text-[10px] space-y-2 shadow-lg">
              <div className="font-semibold text-[#a1a1aa] uppercase">Status:</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-[#71717a]">Working (Desk)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-[#71717a]">Idle (Break Room)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span className="text-[#71717a]">Break (Break Room)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Chat Panel */}
        <div className="w-80 flex flex-col border-l border-[#27272a] bg-[#0f0f0f]">
          {/* Chat Header */}
          <div className="border-b border-[#27272a] bg-[#111111] px-4 py-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              💬 Agent Instructions
            </h3>
            <p className="text-xs text-[#52525b] mt-1">Give tasks to the team</p>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className="text-xs space-y-0.5">
                <div className={cn(
                  'font-semibold flex items-center gap-2',
                  msg.sender === 'You' ? 'text-indigo-400' : 
                  msg.sender === 'System' ? 'text-[#52525b]' :
                  'text-green-400'
                )}>
                  {msg.sender === 'System' && '⚙️'}
                  {msg.sender === 'You' && '👤'}
                  {!['System', 'You'].includes(msg.sender) && '🤖'}
                  <span>{msg.sender}</span>
                  {msg.timestamp && <span className="text-[#3f3f46] ml-auto text-[10px]">{msg.timestamp}</span>}
                </div>
                <div className={cn(
                  'rounded p-2 leading-relaxed',
                  msg.sender === 'You' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/30' :
                  msg.sender === 'System' ? 'bg-[#1a1a1a] text-[#71717a] italic' :
                  'bg-green-600/20 text-green-300 border border-green-600/30'
                )}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-[#27272a] bg-[#111111] p-3 space-y-2">
            {selectedAgent && (
              <div className="text-[10px] text-indigo-400 font-semibold px-1">
                📋 Selected: {agents.find(a => a.id === selectedAgent)?.name}
              </div>
            )}
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading) handleSendMessage()
              }}
              disabled={loading || !selectedAgent}
              placeholder={selectedAgent ? "Type instruction..." : "Select an agent first"}
              className="w-full px-3 py-2 rounded-lg bg-[#161616] border border-[#27272a] text-xs text-[#e4e4e7] placeholder-[#52525b] focus:border-indigo-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !selectedAgent || !chatMessage.trim()}
              className="w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Executing...' : '📤 Send Instruction'}
            </button>
          </div>

          {/* Agent Status Panel */}
          <div className="border-t border-[#27272a] bg-[#111111] px-3 py-2 text-[10px] text-[#71717a] space-y-2">
            <div className="font-semibold text-[#a1a1aa] uppercase tracking-wider">
              Agents (click to select)
            </div>
            <div className="space-y-2">
              {agents.map(agent => {
                const task = activeTasks.find(t => t.agentId === agent.id)
                const statusColor = agent.status === 'active' ? 'text-green-400' :
                                   agent.status === 'break' ? 'text-yellow-400' :
                                   'text-blue-400'
                const isSelected = selectedAgent === agent.id
                
                return (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(isSelected ? null : agent.id)}
                    className={cn(
                      'w-full flex items-center justify-between p-2 rounded transition-all text-left',
                      isSelected 
                        ? 'bg-indigo-600/30 border border-indigo-500/50' 
                        : 'bg-[#161616] border border-transparent hover:border-[#27272a]'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${statusColor}`}>
                        {agent.status === 'active' ? '🔄' : agent.status === 'break' ? '☕' : '💤'}
                      </span>
                      <span className="font-semibold text-[#e4e4e7]">{agent.name}</span>
                    </div>
                    <span className={cn('text-[9px] px-1.5 py-0.5 rounded', statusColor)}>
                      {task ? task.taskName : agent.status}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
