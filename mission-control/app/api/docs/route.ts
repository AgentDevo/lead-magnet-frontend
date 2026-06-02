import { readFileSync, readdirSync } from 'fs'
import { join, basename } from 'path'

interface Document {
  id: string
  title: string
  category: string
  description: string
  content: string
  path: string
}

const workspaceDir = process.env.WORKSPACE_DIR || '/home/svalbuena/.openclaw/workspace'

// Map file names to categories and descriptions
const documentMap: Record<string, { category: string; description: string }> = {
  'SOUL.md': {
    category: 'Configuration',
    description: 'Personal identity, values, and operating principles'
  },
  'IDENTITY.md': {
    category: 'Configuration',
    description: 'Agent name, vibe, and personality traits'
  },
  'USER.md': {
    category: 'Configuration',
    description: 'User profile and context information'
  },
  'AGENTS.md': {
    category: 'Configuration',
    description: 'Workspace philosophy and guidelines'
  },
  'TOOLS.md': {
    category: 'Reference',
    description: 'Local device IPs, SSH hosts, and environment specifics'
  },
  'HEARTBEAT.md': {
    category: 'Operations',
    description: 'Daily pulse checks and maintenance checklist'
  },
  'MEMORY.md': {
    category: 'Reference',
    description: 'Long-term curated memory and knowledge base'
  },
  'CALENDAR-JOBS.md': {
    category: 'Guides',
    description: 'Cron job creation and scheduling examples'
  },
  'QMD_SETUP_CHECKLIST.md': {
    category: 'Guides',
    description: 'QMD installation and setup steps'
  },
  'QMD_QUICK_REFERENCE.md': {
    category: 'Reference',
    description: 'QMD command reference and usage guide'
  },
  'mission-control-prd.md': {
    category: 'Guides',
    description: 'Mission Control dashboard specifications'
  },
}

export async function GET() {
  try {
    const documents: Document[] = []
    const mainFiles = readdirSync(workspaceDir)
      .filter(file => file.endsWith('.md'))
      .sort()

    // Read main workspace documentation files
    mainFiles.forEach(file => {
      const fullPath = join(workspaceDir, file)
      const content = readFileSync(fullPath, 'utf-8')
      const meta = documentMap[file] || {
        category: 'Reference',
        description: file.replace('.md', '')
      }

      // Extract first paragraph as description if not provided
      const lines = content.split('\n')
      let description = meta.description
      if (!meta.description || meta.description === file.replace('.md', '')) {
        const firstContent = lines.find(line => line.trim() && !line.startsWith('#'))
        if (firstContent) {
          description = firstContent.substring(0, 100).trim()
        }
      }

      documents.push({
        id: file.replace('.md', ''),
        title: file.replace('.md', '').replace(/_/g, ' '),
        category: meta.category,
        description,
        content,
        path: `/${file}`
      })
    })

    // Read daily memory files
    const memoryDir = join(workspaceDir, 'memory')
    try {
      const memoryFiles = readdirSync(memoryDir)
        .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
        .sort()
        .reverse()
        .slice(0, 10) // Get last 10 days

      memoryFiles.forEach(file => {
        const fullPath = join(memoryDir, file)
        const content = readFileSync(fullPath, 'utf-8')
        const date = file.replace('.md', '')

        documents.push({
          id: `memory-${date}`,
          title: `Daily Memory - ${date}`,
          category: 'Reference',
          description: `Session notes and events from ${date}`,
          content,
          path: `/memory/${file}`
        })
      })
    } catch (err) {
      // Memory directory might not exist
    }

    return Response.json({ documents })
  } catch (error) {
    console.error('Error reading documents:', error)
    return Response.json({ documents: [], error: 'Failed to load documents' }, { status: 500 })
  }
}
