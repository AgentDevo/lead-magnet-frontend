'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  CheckSquare, FolderKanban, Bot, Wrench,
  ScrollText, FileText, Brain, ChevronLeft, ChevronRight, Zap, Calendar, Home, DollarSign, BarChart3
} from 'lucide-react'

const navItems = [
  { id: 'office',    label: 'Office',    icon: Home },
  { id: 'tasks',     label: 'Tasks',     icon: CheckSquare },
  { id: 'projects',  label: 'Projects',  icon: FolderKanban },
  { id: 'agents',    label: 'Agents',    icon: Bot },
  { id: 'tools',     label: 'Tools',     icon: Wrench },
  { id: 'logs',      label: 'Logs',      icon: ScrollText },
  { id: 'calendar',  label: 'Calendar',  icon: Calendar },
  { id: 'tokens',    label: 'Tokens',    icon: DollarSign },
  { id: 'usage',     label: 'LLM Usage',  icon: BarChart3 },
  { id: 'docs',      label: 'Docs',      icon: FileText },
  { id: 'memories',  label: 'Memories',  icon: Brain },
]

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn(
      'flex flex-col h-full bg-[#111111] border-r border-[#1f1f1f] transition-all duration-200',
      collapsed ? 'w-14' : 'w-52'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-[#1f1f1f]">
        <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm tracking-wide text-white">DEVO</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSectionChange(id)}
            className={cn(
              'flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors w-full text-left',
              activeSection === id
                ? 'bg-[#1f1f1f] text-white'
                : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#1a1a1a]'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-[#1f1f1f]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full p-1.5 rounded-md text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#1a1a1a] transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  )
}
