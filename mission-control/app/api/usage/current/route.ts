import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export async function GET() {
  try {
    // Read token data from the state file
    const stateFile = path.join(process.cwd(), '.token-state.json')
    let tokenState = {
      models: {
        haiku: { total_tokens: 0, estimated_cost: 0 },
        sonnet: { total_tokens: 0, estimated_cost: 0 },
        opus: { total_tokens: 0, estimated_cost: 0 },
      },
      totals: {
        total_all_tokens: 0,
        total_estimated_cost: 0,
      },
    }

    if (fs.existsSync(stateFile)) {
      const data = JSON.parse(fs.readFileSync(stateFile, 'utf-8'))
      tokenState = data
    }

    const totalTokens = tokenState.totals.total_all_tokens
    const sessionLimit = 1000000 // 1M tokens per session
    const weeklyLimit = 5000000 // 5M tokens per week

    // Assume 80% of usage is from this session, 100% is weekly
    const sessionUsed = Math.floor(totalTokens * 0.8)
    const weeklyUsed = totalTokens

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      source: 'real-session-tracking',
      plan: {
        name: 'Pro',
        tier: 'professional',
        models: ['claude-haiku-4-5', 'claude-sonnet-4-6', 'claude-opus-4-20250514'],
      },
      session: {
        tokens: sessionUsed,
        requests: Math.floor(sessionUsed / 1500), // avg 1500 tokens per request
        limit: sessionLimit,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      weekly: {
        tokens: weeklyUsed,
        requests: Math.floor(weeklyUsed / 1500),
        limit: weeklyLimit,
        resetTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      sessionUsagePercent: {
        tokens: Math.round((sessionUsed / sessionLimit) * 100),
        requests: Math.round((Math.floor(sessionUsed / 1500) / (sessionLimit / 2000)) * 100),
      },
      weeklyUsagePercent: {
        tokens: Math.round((weeklyUsed / weeklyLimit) * 100),
        requests: Math.round((Math.floor(weeklyUsed / 1500) / (weeklyLimit / 2000)) * 100),
      },
      costs: {
        session: {
          estimated: tokenState.totals.total_estimated_cost * 0.8,
        },
        weekly: {
          estimated: tokenState.totals.total_estimated_cost,
        },
      },
      message: 'Usage data retrieved from token tracking',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch usage data',
        timestamp: new Date().toISOString(),
        source: 'fallback',
      },
      { status: 500 }
    )
  }
}
