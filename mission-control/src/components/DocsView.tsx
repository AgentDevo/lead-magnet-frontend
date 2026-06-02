'use client'

import { useState, useMemo } from 'react'
import { Search, BookOpen, FileText, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Document {
  id: string
  title: string
  category: string
  description: string
  content: string
  path: string
  createdAt?: string
  updatedAt?: string
}

interface DocsViewProps {
  documents: Document[]
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Configuration': '⚙️',
  'Operations': '🔧',
  'Guides': '📖',
  'Reference': '📚',
  'Tutorials': '🎓',
  'API': '🔌',
}

const CATEGORY_COLORS: Record<string, string> = {
  'Configuration': 'border-blue-500/30 bg-blue-500/10',
  'Operations': 'border-yellow-500/30 bg-yellow-500/10',
  'Guides': 'border-green-500/30 bg-green-500/10',
  'Reference': 'border-purple-500/30 bg-purple-500/10',
  'Tutorials': 'border-cyan-500/30 bg-cyan-500/10',
  'API': 'border-pink-500/30 bg-pink-500/10',
}

export default function DocsView({ documents }: DocsViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Group documents by category
  const categories = useMemo(() => {
    const grouped: Record<string, Document[]> = {}
    documents.forEach(doc => {
      if (!grouped[doc.category]) {
        grouped[doc.category] = []
      }
      grouped[doc.category].push(doc)
    })
    return grouped
  }, [documents])

  // Filter documents based on search and category
  const filteredDocs = useMemo(() => {
    let filtered = documents

    if (selectedCategory) {
      filtered = filtered.filter(doc => doc.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        doc =>
          doc.title.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query) ||
          doc.content.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => a.title.localeCompare(b.title))
  }, [documents, searchQuery, selectedCategory])

  const parseMarkdown = (content: string) => {
    return content.split('\n').map((line, idx) => {
      if (line.startsWith('# ')) {
        return (
          <h2 key={idx} className="text-2xl font-bold text-white mt-6 mb-4">
            {line.substring(2)}
          </h2>
        )
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-xl font-semibold text-[#a1a1aa] mt-4 mb-2">
            {line.substring(3)}
          </h3>
        )
      }
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-lg font-medium text-[#c1c1c4] mt-3 mb-1">
            {line.substring(4)}
          </h4>
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
      if (line.startsWith('| ')) {
        return null // Skip table rows for now
      }
      if (line.startsWith('```')) {
        return null // Skip code blocks
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
    <div className="flex h-full bg-[#0f0f0f] rounded-lg border border-[#27272a] overflow-hidden">
      {/* Left Panel - Document List */}
      <div className="w-80 flex flex-col border-r border-[#27272a] bg-[#0f0f0f]">
        {/* Header */}
        <div className="border-b border-[#27272a] bg-[#111111] px-4 py-4 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Documentation
          </h2>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#52525b]" />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#161616] border border-[#27272a] text-xs text-[#e4e4e7] placeholder-[#52525b] focus:border-indigo-500/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Categories Filter */}
        <div className="px-4 py-3 border-b border-[#27272a] bg-[#111111]">
          <div className="text-xs font-semibold text-[#a1a1aa] mb-2 uppercase tracking-wider">
            Categories
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'w-full text-left px-3 py-1.5 rounded text-xs transition-colors',
                selectedCategory === null
                  ? 'bg-indigo-600 text-white'
                  : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#1a1a1a]'
              )}
            >
              All Docs ({documents.length})
            </button>
            {Object.entries(categories).map(([category, docs]) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'w-full text-left px-3 py-1.5 rounded text-xs transition-colors',
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#1a1a1a]'
                )}
              >
                {CATEGORY_ICONS[category] || '📄'} {category} ({docs.length})
              </button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto">
          {filteredDocs.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-[#52525b] text-xs text-center px-4">
              {searchQuery ? 'No documents match your search' : 'No documents found'}
            </div>
          ) : (
            <div className="space-y-1 p-3">
              {filteredDocs.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg transition-all group',
                    selectedDoc?.id === doc.id
                      ? 'bg-indigo-600/20 border border-indigo-500/50'
                      : 'border border-[#27272a] hover:border-[#3f3f46] hover:bg-[#161616]'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-white truncate group-hover:text-indigo-300 transition-colors">
                        {doc.title}
                      </h4>
                      <p className="text-[10px] text-[#52525b] mt-0.5 line-clamp-2">
                        {doc.description}
                      </p>
                    </div>
                    <ChevronRight className={cn(
                      'w-3.5 h-3.5 flex-shrink-0 transition-transform',
                      selectedDoc?.id === doc.id ? 'text-indigo-400' : 'text-[#52525b] group-hover:text-[#71717a]'
                    )} />
                  </div>
                  <div className="text-[9px] text-[#3f3f46] mt-1.5">
                    <span className={cn(
                      'inline-block px-1.5 py-0.5 rounded',
                      CATEGORY_COLORS[doc.category] || CATEGORY_COLORS['Reference']
                    )}>
                      {doc.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Document Preview */}
      {selectedDoc ? (
        <div className="flex-1 flex flex-col bg-[#0f0f0f]">
          {/* Preview Header */}
          <div className="border-b border-[#27272a] bg-[#111111] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{selectedDoc.title}</h2>
              <p className="text-xs text-[#71717a] mt-1">{selectedDoc.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn(
                  'inline-block px-2.5 py-1 rounded text-xs font-medium',
                  CATEGORY_COLORS[selectedDoc.category] || CATEGORY_COLORS['Reference']
                )}>
                  {CATEGORY_ICONS[selectedDoc.category] || '📄'} {selectedDoc.category}
                </span>
                <span className="text-[10px] text-[#52525b]">
                  {selectedDoc.path}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedDoc(null)}
              className="p-2 rounded hover:bg-[#1a1a1a] text-[#71717a] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose prose-invert max-w-none">
              {parseMarkdown(selectedDoc.content)}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#0f0f0f]">
          <div className="text-center">
            <FileText className="w-16 h-16 text-[#3f3f46] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#a1a1aa] mb-2">
              Select a document to preview
            </h3>
            <p className="text-sm text-[#52525b]">
              Choose from the list on the left to view documentation
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
