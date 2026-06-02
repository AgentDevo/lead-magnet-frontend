import { NextResponse } from 'next/server'
import { addTokens } from '@/lib/token-utils'

interface TokenUsage {
  haiku: { input: number; output: number }
  sonnet: { input: number; output: number }
  opus: { input: number; output: number }
}

// Default token usage (will be updated on refresh)
let tokenUsage: TokenUsage = {
  haiku: { input: 125480, output: 287340 },
  sonnet: { input: 45920, output: 82650 },
  opus: { input: 8200, output: 15340 }
}

export async function POST() {
  try {
    // Simulate adding new tokens from current session
    const newTokens = {
      haiku: { input: 33, output: 98 },
      sonnet: { input: 33, output: 460 },
      opus: { input: 0, output: 0 }
    }

    // Update token usage
    tokenUsage = {
      haiku: {
        input: tokenUsage.haiku.input + newTokens.haiku.input,
        output: tokenUsage.haiku.output + newTokens.haiku.output
      },
      sonnet: {
        input: tokenUsage.sonnet.input + newTokens.sonnet.input,
        output: tokenUsage.sonnet.output + newTokens.sonnet.output
      },
      opus: {
        input: tokenUsage.opus.input + newTokens.opus.input,
        output: tokenUsage.opus.output + newTokens.opus.output
      }
    }

    return NextResponse.json({
      success: true,
      tokenUsage,
      timestamp: new Date().toISOString(),
      addedTokens: newTokens
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to refresh tokens' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      tokenUsage,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
}
