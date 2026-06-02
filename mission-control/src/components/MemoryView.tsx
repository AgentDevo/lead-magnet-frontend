'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Calendar, Brain, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MemoryEntry {
  date: string
  content: string
  type: 'daily' | 'longterm'
}

interface MemoryViewProps {
  dailyMemories: MemoryEntry[]
  longtermMemory: string
}

export default function MemoryView({ dailyMemories, longtermMemory }: MemoryViewProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())
  const [showLongterm, setShowLongterm] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const toggleDate = (date: string) => {
    const newSet = new Set(expandedDates)
    if (newSet.has(date)) {
      newSet.delete(date)
    } else {
      newSet.add(date)
    }
    setExpandedDates(newSet)
  }

  // Filter memories by search query
  const filteredDailyMemories = useMemo(() => {
    if (!searchQuery) return dailyMemories
    return dailyMemories.filter(m =>
      m.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [dailyMemories, searchQuery])

  // Group daily memories by date and sort newest first
  const groupedMemories = useMemo(() => {
    const grouped: Record<string, string[]> = {}
    filteredDailyMemories.forEach(memory => {
      if (!grouped[memory.date]) {
        grouped[memory.date] = []
      }
      grouped[memory.date].push(memory.content)
    })

    // Sort dates newest first
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
  }, [filteredDailyMemories])

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const parseMarkdown = (content: string) => {
    // Split by lines and handle markdown
    return content.split('\n').map((line, idx) => {
      if (line.startsWith('# ')) {
        return (
          <h2 key={idx} className="text-lg font-bold text-white mt-4 mb-2">
            {line.substring(2)}
          </h2>
        )
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-base font-semibold text-[#a1a1aa] mt-3 mb-1">
            {line.substring(3)}
          </h3>
        )
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="text-sm text-[#e4e4e7] ml-4 my-1">
            {line.substring(2)}
          </li>
        )
      }
      if (line.startsWith('  - ')) {
        return (
          <li key={idx} className="text-sm text-[#e4e4e7] ml-8 my-0.5">
            {line.substring(4)}
          </li>
        )
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />
      }
      return (
        <p key={idx} className="text-sm text-[#e4e4e7] my-1 leading-relaxed">
          {line}
        </p>
      )
    })
  }

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] rounded-lg border border-[#27272a] overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#27272a] bg-[#111111] px-6 py-4 sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-white mb-4">Memory System</h2>

        {/* Search Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-[#161616] border border-[#27272a] text-sm text-[#e4e4e7] placeholder-[#52525b] focus:border-indigo-500/50 focus:outline-none"
          />
          <button
            onClick={() => setExpandedDates(new Set(groupedMemories.map(([date]) => date)))}
            className="px-3 py-2 rounded-lg bg-[#1f1f1f] border border-[#27272a] text-xs font-medium text-[#a1a1aa] hover:bg-[#161616] transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={() => setExpandedDates(new Set())}
            className="px-3 py-2 rounded-lg bg-[#1f1f1f] border border-[#27272a] text-xs font-medium text-[#a1a1aa] hover:bg-[#161616] transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Long-term Memory Section */}
        <div className="border-b border-[#27272a]">
          <button
            onClick={() => setShowLongterm(!showLongterm)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#161616] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <h3 className="font-semibold text-white">Long-Term Memory</h3>
                <p className="text-xs text-[#52525b]">MEMORY.md - Curated knowledge & insights</p>
              </div>
            </div>
            {showLongterm ? (
              <ChevronUp className="w-4 h-4 text-[#71717a]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#71717a]" />
            )}
          </button>

          {showLongterm && (
            <div className="px-6 py-4 bg-[#161616] border-t border-[#27272a]">
              <div className="prose prose-invert max-w-none text-sm">
                {longtermMemory ? (
                  <div className="space-y-2 text-[#e4e4e7]">
                    {parseMarkdown(longtermMemory)}
                  </div>
                ) : (
                  <div className="text-[#52525b] italic">No long-term memory recorded yet</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Daily Memories Section */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Daily Memories</h3>
            <span className="text-xs text-[#52525b] ml-auto">
              {groupedMemories.length} day{groupedMemories.length !== 1 ? 's' : ''}
            </span>
          </div>

          {groupedMemories.length === 0 ? (
            <div className="text-center py-8 text-[#52525b]">
              {searchQuery ? 'No memories match your search' : 'No daily memories recorded yet'}
            </div>
          ) : (
            <div className="space-y-2">
              {groupedMemories.map(([date, memories]) => {
                const isExpanded = expandedDates.has(date)
                const dateObj = new Date(date)
                const isToday = dateObj.toDateString() === new Date().toDateString()
                const isYesterday =
                  dateObj.toDateString() ===
                  new Date(Date.now() - 86400000).toDateString()

                return (
                  <div
                    key={date}
                    className="rounded-lg border border-[#27272a] bg-[#161616] overflow-hidden hover:border-[#3f3f46] transition-colors"
                  >
                    <button
                      onClick={() => toggleDate(date)}
                      className={cn(
                        'w-full px-4 py-3 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors',
                        isExpanded && 'bg-[#1a1a1a]'
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1 text-left">
                        {isToday && (
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                            Today
                          </span>
                        )}
                        {isYesterday && (
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-[#1f1f1f] border border-[#27272a] text-[#71717a]">
                            Yesterday
                          </span>
                        )}
                        <div>
                          <h4 className="font-medium text-white">{formatDate(date)}</h4>
                          <p className="text-xs text-[#52525b] mt-0.5">
                            {memories.length} entry{memories.length !== 1 ? 'ies' : ''}
                          </p>
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#71717a]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#71717a]" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-[#27272a] px-4 py-3 bg-[#0f0f0f] space-y-3">
                        {memories.map((memory, idx) => (
                          <div key={idx} className="text-sm text-[#e4e4e7] leading-relaxed space-y-2">
                            {parseMarkdown(memory)}
                            {idx < memories.length - 1 && (
                              <div className="border-b border-[#27272a] my-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
