'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, Clock } from 'lucide-react'
import type { UsagePlanResponse } from '@/lib/usage-types'

/**
 * Format time remaining until reset
 * Returns human-readable format: "02h 15m"
 */
function formatTimeRemaining(resetTime: string): string {
  const now = new Date()
  const reset = new Date(resetTime)
  const diffMs = reset.getTime() - now.getTime()

  if (diffMs <= 0) return '0m'

  const totalSeconds = Math.floor(diffMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Get color for usage percentage
 * Green: 0-60%, Yellow: 60-85%, Red: 85-100%
 */
function getUsageColor(percentage: number): string {
  if (percentage <= 60) return '#16a34a' // green-600
  if (percentage <= 85) return '#ea8d04' // yellow-600
  return '#dc2626' // red-600
}

/**
 * Get warning badge for high usage
 */
function getWarningBadge(percentage: number): { show: boolean; text: string; color: string } {
  if (percentage >= 90) return { show: true, text: '⚠️ Critical', color: 'bg-red-500/10 text-red-400 border-red-500/20' }
  if (percentage >= 75) return { show: true, text: '⚠️ High', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' }
  return { show: false, text: '', color: '' }
}

export default function LLMUsagePlanMonitor() {
  const [usage, setUsage] = useState<UsagePlanResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch usage data every 5 seconds
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/usage/current')
        if (!response.ok) throw new Error('Failed to fetch usage')
        const data = await response.json()
        setUsage(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
    const interval = setInterval(fetchUsage, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0f0f0f]">
        <div className="text-[#71717a]">Loading usage data...</div>
      </div>
    )
  }

  if (error || !usage) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0f0f0f]">
        <div className="text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error || 'Failed to load usage data'}
        </div>
      </div>
    )
  }

  const sessionTokenWarning = getWarningBadge(usage.sessionUsagePercent.tokens)
  const sessionRequestWarning = getWarningBadge(usage.sessionUsagePercent.requests)
  const weeklyTokenWarning = getWarningBadge(usage.weeklyUsagePercent.tokens)
  const weeklyRequestWarning = getWarningBadge(usage.weeklyUsagePercent.requests)

  return (
    <div className="w-full h-full overflow-auto bg-[#0f0f0f]">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#ededed] flex items-center gap-3">
            <span>📊</span>
            <span>LLM Usage Plan</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#71717a]">
              {new Date(usage.timestamp).toLocaleTimeString()}
            </span>
            {usage.source && (
              <Badge variant="outline" className={usage.source === 'real-session-tracking' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}>
                {usage.source === 'real-session-tracking' ? '🟢 Live' : '🟡 Fallback'}
              </Badge>
            )}
          </div>
        </div>

        {/* Plan Overview Card */}
        <Card className="p-4 bg-[#161616] border-[#27272a]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1">
                Active Plan
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-[#ededed]">{usage.plan.name}</span>
                <Badge variant="secondary" className="bg-indigo-600/20 text-indigo-400 border-indigo-600/20">
                  {usage.plan.tier}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-[#71717a] mb-1">Available Models</p>
              <div className="flex gap-1 flex-wrap justify-end">
                {usage.plan.models.map(model => (
                  <Badge key={model} variant="outline" className="border-[#3f3f46] text-[#a1a1aa] text-[10px]">
                    {model}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Session & Weekly Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Session Usage */}
          <Card className="p-6 bg-[#161616] border-[#27272a]">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Current Session
                </h3>
                <span className="text-[11px] px-2 py-1 rounded bg-blue-600/20 text-blue-400">
                  Resets in {formatTimeRemaining(usage.session.resetTime)}
                </span>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#27272a]" />

              {/* Tokens Section */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] text-[#71717a] mb-1">Tokens Used</p>
                    <p className="text-lg font-bold text-[#ededed]">
                      {usage.session.tokens.toLocaleString()} / {usage.session.limit.toLocaleString()}
                    </p>
                  </div>
                  {sessionTokenWarning.show && (
                    <Badge className={`${sessionTokenWarning.color} border text-xs`}>
                      {sessionTokenWarning.text}
                    </Badge>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="h-3 bg-[#0f0f0f] rounded-full overflow-hidden border border-[#27272a]">
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{ 
                      width: `${usage.sessionUsagePercent.tokens}%`,
                      backgroundColor: getUsageColor(usage.sessionUsagePercent.tokens)
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#71717a]">
                  <span>{usage.sessionUsagePercent.tokens}% used</span>
                  <span>{100 - usage.sessionUsagePercent.tokens}% remaining</span>
                </div>
              </div>

              {/* Requests Section */}
              <div className="space-y-2 pt-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] text-[#71717a] mb-1">Requests Made</p>
                    <p className="text-lg font-bold text-[#ededed]">
                      {usage.session.requests} / {usage.session.limit / 2000}
                    </p>
                  </div>
                  {sessionRequestWarning.show && (
                    <Badge className={`${sessionRequestWarning.color} border text-xs`}>
                      {sessionRequestWarning.text}
                    </Badge>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="h-3 bg-[#0f0f0f] rounded-full overflow-hidden border border-[#27272a]">
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{ 
                      width: `${usage.sessionUsagePercent.requests}%`,
                      backgroundColor: getUsageColor(usage.sessionUsagePercent.requests)
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#71717a]">
                  <span>{usage.sessionUsagePercent.requests}% used</span>
                  <span>{100 - usage.sessionUsagePercent.requests}% remaining</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Weekly Usage */}
          <Card className="p-6 bg-[#161616] border-[#27272a]">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Weekly Budget
                </h3>
                <span className="text-[11px] px-2 py-1 rounded bg-purple-600/20 text-purple-400">
                  Resets in {formatTimeRemaining(usage.weekly.resetTime)}
                </span>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#27272a]" />

              {/* Tokens Section */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] text-[#71717a] mb-1">Tokens Used</p>
                    <p className="text-lg font-bold text-[#ededed]">
                      {usage.weekly.tokens.toLocaleString()} / {usage.weekly.limit.toLocaleString()}
                    </p>
                  </div>
                  {weeklyTokenWarning.show && (
                    <Badge className={`${weeklyTokenWarning.color} border text-xs`}>
                      {weeklyTokenWarning.text}
                    </Badge>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="h-3 bg-[#0f0f0f] rounded-full overflow-hidden border border-[#27272a]">
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{ 
                      width: `${usage.weeklyUsagePercent.tokens}%`,
                      backgroundColor: getUsageColor(usage.weeklyUsagePercent.tokens)
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#71717a]">
                  <span>{usage.weeklyUsagePercent.tokens}% used</span>
                  <span>{100 - usage.weeklyUsagePercent.tokens}% remaining</span>
                </div>
              </div>

              {/* Requests Section */}
              <div className="space-y-2 pt-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] text-[#71717a] mb-1">Requests Made</p>
                    <p className="text-lg font-bold text-[#ededed]">
                      {usage.weekly.requests} / {usage.weekly.limit / 2000}
                    </p>
                  </div>
                  {weeklyRequestWarning.show && (
                    <Badge className={`${weeklyRequestWarning.color} border text-xs`}>
                      {weeklyRequestWarning.text}
                    </Badge>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="h-3 bg-[#0f0f0f] rounded-full overflow-hidden border border-[#27272a]">
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{ 
                      width: `${usage.weeklyUsagePercent.requests}%`,
                      backgroundColor: getUsageColor(usage.weeklyUsagePercent.requests)
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#71717a]">
                  <span>{usage.weeklyUsagePercent.requests}% used</span>
                  <span>{100 - usage.weeklyUsagePercent.requests}% remaining</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Usage Summary */}
        <Card className="p-4 bg-[#161616] border-[#27272a]">
          <h3 className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-wider mb-3">
            Quick Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[12px]">
            <div className="p-3 rounded bg-[#0f0f0f] border border-[#27272a]">
              <p className="text-[#71717a] mb-1">Session Tokens</p>
              <p className="text-lg font-semibold text-blue-400">
                {usage.sessionUsagePercent.tokens}%
              </p>
            </div>
            <div className="p-3 rounded bg-[#0f0f0f] border border-[#27272a]">
              <p className="text-[#71717a] mb-1">Session Requests</p>
              <p className="text-lg font-semibold text-blue-400">
                {usage.sessionUsagePercent.requests}%
              </p>
            </div>
            <div className="p-3 rounded bg-[#0f0f0f] border border-[#27272a]">
              <p className="text-[#71717a] mb-1">Weekly Tokens</p>
              <p className="text-lg font-semibold text-purple-400">
                {usage.weeklyUsagePercent.tokens}%
              </p>
            </div>
            <div className="p-3 rounded bg-[#0f0f0f] border border-[#27272a]">
              <p className="text-[#71717a] mb-1">Weekly Requests</p>
              <p className="text-lg font-semibold text-purple-400">
                {usage.weeklyUsagePercent.requests}%
              </p>
            </div>
          </div>
        </Card>

        {/* Info Footer */}
        <Card className="p-4 bg-[#161616] border-[#27272a]">
          <p className="text-[12px] text-[#71717a]">
            <span className="font-semibold text-[#a1a1aa]">Auto-refresh:</span> Updates every 5 seconds. 
            <span className="font-semibold text-[#a1a1aa] ml-3">Warning thresholds:</span> Yellow at 75%, Red at 85%, Critical at 90%.
          </p>
        </Card>
      </div>
    </div>
  )
}
