import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const workspaceDir = process.env.WORKSPACE_DIR || '/home/svalbuena/.openclaw/workspace'

export async function GET() {
  try {
    const memoryDir = join(workspaceDir, 'memory')
    const memoriesData: Array<{ date: string; content: string }> = []

    // Read daily memory files
    try {
      const files = readdirSync(memoryDir)
      const dateFiles = files
        .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
        .sort()
        .reverse()

      dateFiles.forEach(file => {
        const date = file.replace('.md', '')
        const content = readFileSync(join(memoryDir, file), 'utf-8')
        memoriesData.push({ date, content })
      })
    } catch (err) {
      // Memory directory might not exist yet
    }

    // Read long-term memory
    let longtermMemory = ''
    try {
      longtermMemory = readFileSync(join(workspaceDir, 'MEMORY.md'), 'utf-8')
    } catch (err) {
      longtermMemory = 'No long-term memory file found'
    }

    return Response.json({
      dailyMemories: memoriesData,
      longtermMemory
    })
  } catch (error) {
    console.error('Error reading memories:', error)
    return Response.json({
      dailyMemories: [],
      longtermMemory: 'Error loading memories'
    })
  }
}
