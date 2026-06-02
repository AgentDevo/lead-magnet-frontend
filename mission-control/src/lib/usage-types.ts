// LLM Usage Plan types

export type PlanTier = 'Free' | 'Pro' | 'Enterprise'

export interface PlanDetails {
  name: string
  tier: PlanTier
  models: string[]
}

export interface UsageMetrics {
  tokens: number
  requests: number
  limit: number
  resetTime: string // ISO 8601 timestamp
}

export interface UsagePercentage {
  tokens: number
  requests: number
}

export interface UsagePlanResponse {
  plan: PlanDetails
  session: UsageMetrics
  sessionUsagePercent: UsagePercentage
  weekly: UsageMetrics
  weeklyUsagePercent: UsagePercentage
  timestamp: string
  source?: 'real-session-tracking' | 'fallback-mock' // Data source indicator
}
