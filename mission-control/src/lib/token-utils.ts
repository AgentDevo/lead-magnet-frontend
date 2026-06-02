// Token Usage & Cost Utilities

export const MODEL_PRICING = {
  haiku: { name: 'Claude Haiku', input: 0.80, output: 4.00, icon: '🔹' },
  sonnet: { name: 'Claude Sonnet', input: 3.00, output: 15.00, icon: '🔷' },
  opus: { name: 'Claude Opus', input: 15.00, output: 75.00, icon: '🔶' }
}

export type ModelKey = keyof typeof MODEL_PRICING

export interface TokenUsage {
  haiku: { input: number; output: number }
  sonnet: { input: number; output: number }
  opus: { input: number; output: number }
}

export interface CostBreakdown {
  input: number
  output: number
  total: number
}

/**
 * Calculate cost for a specific model
 */
export function calculateModelCost(modelKey: ModelKey, usage: { input: number; output: number }): CostBreakdown {
  const pricing = MODEL_PRICING[modelKey]
  if (!pricing) return { input: 0, output: 0, total: 0 }
  
  const inputCost = (usage.input / 1_000_000) * pricing.input
  const outputCost = (usage.output / 1_000_000) * pricing.output
  
  return {
    input: inputCost,
    output: outputCost,
    total: inputCost + outputCost
  }
}

/**
 * Calculate total cost across all models
 */
export function calculateTotalCost(tokenUsage: TokenUsage): number {
  let total = 0
  ;(Object.keys(tokenUsage) as ModelKey[]).forEach(key => {
    const cost = calculateModelCost(key, tokenUsage[key])
    total += cost.total
  })
  return total
}

/**
 * Calculate total tokens across all models
 */
export function calculateTotalTokens(tokenUsage: TokenUsage): number {
  return Object.values(tokenUsage).reduce((sum, u) => sum + u.input + u.output, 0)
}

/**
 * Calculate cost percentage for a model
 */
export function calculateCostPercentage(modelKey: ModelKey, tokenUsage: TokenUsage): number {
  const modelCost = calculateModelCost(modelKey, tokenUsage[modelKey]).total
  const totalCost = calculateTotalCost(tokenUsage)
  
  if (totalCost === 0) return 0
  return (modelCost / totalCost) * 100
}

/**
 * Calculate average cost per 1k tokens
 */
export function calculateAvgCostPer1kTokens(tokenUsage: TokenUsage): number {
  const totalTokens = calculateTotalTokens(tokenUsage)
  const totalCost = calculateTotalCost(tokenUsage)
  
  if (totalTokens === 0) return 0
  return (totalCost / totalTokens) * 1000
}

/**
 * Get the most used model
 */
export function getMostUsedModel(tokenUsage: TokenUsage): ModelKey {
  let maxTokens = 0
  let mostUsedKey: ModelKey = 'haiku'
  
  ;(Object.keys(tokenUsage) as ModelKey[]).forEach(key => {
    const tokens = tokenUsage[key].input + tokenUsage[key].output
    if (tokens > maxTokens) {
      maxTokens = tokens
      mostUsedKey = key
    }
  })
  
  return mostUsedKey
}

/**
 * Format token count for display
 */
export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return `${n}`
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`
}

/**
 * Add tokens to a model
 */
export function addTokens(
  tokenUsage: TokenUsage,
  modelKey: ModelKey,
  inputTokens: number,
  outputTokens: number
): TokenUsage {
  return {
    ...tokenUsage,
    [modelKey]: {
      input: tokenUsage[modelKey].input + inputTokens,
      output: tokenUsage[modelKey].output + outputTokens
    }
  }
}

/**
 * Simulate random token addition (for demo purposes)
 */
export function addRandomTokens(tokenUsage: TokenUsage): TokenUsage {
  let updated = { ...tokenUsage }
  const randomTokens = Math.floor(Math.random() * 5000)
  
  if (Math.random() > 0.7) {
    updated = addTokens(updated, 'haiku', randomTokens, randomTokens * 2)
  }
  if (Math.random() > 0.8) {
    updated = addTokens(updated, 'sonnet', Math.floor(randomTokens * 0.6), Math.floor(randomTokens * 0.8))
  }
  
  return updated
}
