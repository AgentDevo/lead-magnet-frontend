'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle2, Repeat2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CronJob {
  id: string
  name?: string
  schedule: {
    kind: 'cron' | 'at' | 'every'
    expr?: string
    at?: string
    everyMs?: number
    tz?: string
  }
  payload: {
    kind: string
    [key: string]: any
  }
  enabled: boolean
  created_at?: string
  createdAtMs?: number
}

interface CalendarViewProps {
  jobs: CronJob[]
}

type ViewMode = 'monthly' | 'weekly' | 'daily'

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

function getFirstDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
}

function parseCronExpression(expr: string): string {
  const parts = expr.split(' ')
  if (parts.length < 5) return expr

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
  
  // Handle hour patterns like "*/6"
  if (hour.startsWith('*/')) {
    const interval = parseInt(hour.substring(2))
    return `Every ${interval} hours at minute ${minute}`
  }
  
  const timeStr = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
  
  if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return `Every hour at :${minute.padStart(2, '0')}`
  }
  if (dayOfMonth === '*' && month === '*') {
    return `Every ${dayOfWeek === '*' ? 'day' : dayOfWeek} at ${timeStr}`
  }
  if (dayOfMonth === '*') {
    return `Monthly on day ${dayOfMonth} at ${timeStr}`
  }
  
  return expr
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

function getHourSchedule(hour: number, jobs: CronJob[]): CronJob[] {
  return jobs.filter(job => {
    if (job.schedule.kind === 'cron' && job.schedule.expr) {
      const parts = job.schedule.expr.split(' ')
      if (parts.length >= 2) {
        const jobHourPart = parts[1]
        
        // Handle "*/N" pattern (every N hours)
        if (jobHourPart.startsWith('*/')) {
          const interval = parseInt(jobHourPart.substring(2))
          if (interval > 0 && hour % interval === 0) {
            return true
          }
        }
        // Handle specific hour or wildcard
        else if (jobHourPart === '*' || parseInt(jobHourPart) === hour) {
          return true
        }
      }
    }
    return false
  })
}

export default function CalendarView({ jobs }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('weekly')

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => null)

  const enabledJobs = jobs.filter(j => j.enabled)

  // Group jobs by schedule type for display
  const jobsByType = useMemo(() => {
    const cron = enabledJobs.filter(j => j.schedule.kind === 'cron')
    const interval = enabledJobs.filter(j => j.schedule.kind === 'every')
    const oneShot = enabledJobs.filter(j => j.schedule.kind === 'at')
    return { cron, interval, oneShot }
  }, [enabledJobs])

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const weekStart = getWeekStart(currentDate)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] rounded-lg border border-[#27272a] overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#27272a] bg-[#111111] px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Scheduled Tasks</h2>
          
          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 bg-[#1f1f1f] rounded-lg p-1 border border-[#27272a]">
            {(['monthly', 'weekly', 'daily'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-3 py-1 rounded text-xs font-medium transition-colors capitalize',
                  viewMode === mode
                    ? 'bg-indigo-600 text-white'
                    : 'text-[#71717a] hover:text-[#a1a1aa]'
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (viewMode === 'monthly') goToPreviousMonth()
                else setCurrentDate(new Date(currentDate.getTime() - (viewMode === 'daily' ? 86400000 : 604800000)))
              }}
              className="p-1.5 rounded hover:bg-[#1a1a1a] text-[#71717a] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-[#a1a1aa] min-w-[180px] text-center">
              {viewMode === 'monthly' && `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              {viewMode === 'weekly' && `Week of ${weekStart.toLocaleDateString()}`}
              {viewMode === 'daily' && currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <button
              onClick={() => {
                if (viewMode === 'monthly') goToNextMonth()
                else setCurrentDate(new Date(currentDate.getTime() + (viewMode === 'daily' ? 86400000 : 604800000)))
              }}
              className="p-1.5 rounded hover:bg-[#1a1a1a] text-[#71717a] hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Job count */}
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1f1f1f] border border-[#27272a]">
            <Repeat2 className="w-3 h-3 text-blue-400" />
            <span className="text-[#71717a]">Cron: <span className="text-white font-medium">{jobsByType.cron.length}</span></span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1f1f1f] border border-[#27272a]">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span className="text-[#71717a]">Interval: <span className="text-white font-medium">{jobsByType.interval.length}</span></span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1f1f1f] border border-[#27272a]">
            <AlertCircle className="w-3 h-3 text-yellow-400" />
            <span className="text-[#71717a]">One-Shot: <span className="text-white font-medium">{jobsByType.oneShot.length}</span></span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Main View Area */}
        <div className="flex-1 flex flex-col border-r border-[#27272a] p-6 overflow-y-auto">
          {/* Monthly View */}
          {viewMode === 'monthly' && (
            <>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-[#71717a]">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2 flex-1">
                {/* Empty cells */}
                {emptyDays.map((_, i) => (
                  <div key={`empty-${i}`} className="bg-[#161616] rounded" />
                ))}

                {/* Day cells */}
                {calendarDays.map(day => {
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                  const isToday = date.toDateString() === new Date().toDateString()
                  const isSelected = selectedDate?.toDateString() === date.toDateString()
                  const jobsForDay = jobsByType.cron.length > 0 ? 1 : 0

                  return (
                    <button
                      key={day}
                      onClick={() => {
                        setSelectedDate(date)
                        setViewMode('daily')
                        setCurrentDate(date)
                      }}
                      className={cn(
                        'relative p-2 rounded-lg border transition-all',
                        isToday
                          ? 'border-indigo-500/50 bg-indigo-500/10'
                          : isSelected
                          ? 'border-blue-500/50 bg-blue-500/10'
                          : 'border-[#27272a] bg-[#161616] hover:bg-[#1a1a1a]',
                        'text-sm font-medium text-white'
                      )}
                    >
                      <div>{day}</div>
                      {jobsForDay > 0 && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* Weekly View */}
          {viewMode === 'weekly' && (
            <div className="space-y-3 flex-1">
              <div className="grid grid-cols-7 gap-2 text-xs font-medium text-[#71717a]">
                {weekDays.map(date => (
                  <div key={date.toDateString()} className="text-center">
                    <div>{DAYS_OF_WEEK[date.getDay()]}</div>
                    <div className="text-[#52525b]">{date.getDate()}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 flex-1">
                {weekDays.map(date => {
                  const isToday = date.toDateString() === new Date().toDateString()
                  const daySchedules = Array.from({ length: 24 }, (_, hour) => {
                    return getHourSchedule(hour, enabledJobs).length > 0
                  })
                  const activeHours = daySchedules.filter(Boolean).length
                  
                  return (
                    <button
                      key={date.toDateString()}
                      onClick={() => {
                        setCurrentDate(date)
                        setViewMode('daily')
                      }}
                      className={cn(
                        'p-3 rounded-lg border transition-all hover:scale-105 cursor-pointer',
                        isToday
                          ? 'border-indigo-500/50 bg-indigo-500/10'
                          : 'border-[#27272a] bg-[#161616] hover:bg-[#1a1a1a]'
                      )}
                    >
                      <div className="text-xs space-y-2">
                        {activeHours > 0 ? (
                          <>
                            <div className="flex flex-col gap-1">
                              {enabledJobs.length > 0 && (
                                <div className="space-y-0.5">
                                  {enabledJobs.slice(0, 2).map(job => (
                                    <div
                                      key={job.id}
                                      className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-300 truncate"
                                      title={job.name}
                                    >
                                      {job.name?.split(' ').slice(0, 2).join(' ') || 'Job'}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-[10px] text-blue-400 font-medium">
                              {activeHours} hour{activeHours !== 1 ? 's' : ''} scheduled
                            </div>
                          </>
                        ) : (
                          <div className="text-[#52525b]">No tasks</div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Daily View */}
          {viewMode === 'daily' && (
            <div className="space-y-2 flex-1 max-w-4xl">
              <div className="text-xs text-[#71717a] mb-3">Hourly Schedule</div>
              <div className="space-y-1">
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i
                  const timeStr = `${String(hour).padStart(2, '0')}:00`
                  const hourJobs = getHourSchedule(hour, enabledJobs)
                  
                  return (
                    <div
                      key={hour}
                      className="flex gap-3 p-2 rounded-lg bg-[#161616] border border-[#27272a] hover:border-[#3f3f46] transition-colors"
                    >
                      <div className="min-w-[50px] text-xs font-medium text-[#a1a1aa]">
                        {timeStr}
                      </div>
                      <div className="flex-1">
                        {hourJobs.length > 0 ? (
                          <div className="space-y-1">
                            {hourJobs.map(job => (
                              <div
                                key={job.id}
                                className="text-[10px] px-2 py-1 rounded bg-blue-500/15 border border-blue-500/20 text-blue-300"
                              >
                                {job.name || 'Cron Job'}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[10px] text-[#52525b]">—</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Jobs list / details */}
        <div className="w-80 flex flex-col border-l border-[#27272a]">
          {/* No jobs message */}
          {enabledJobs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <Clock className="w-12 h-12 text-[#3f3f46] mb-3" />
              <p className="text-sm text-[#71717a] mb-1">No scheduled tasks</p>
              <p className="text-xs text-[#52525b]">
                Create cron jobs via the gateway API to see them here
              </p>
            </div>
          ) : (
            <>
              {/* Cron jobs */}
              {jobsByType.cron.length > 0 && (
                <div className="flex-1 overflow-y-auto border-b border-[#27272a]">
                  <div className="p-4">
                    <h3 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Repeat2 className="w-3.5 h-3.5 text-blue-400" />
                      Recurring (Cron)
                    </h3>
                    <div className="space-y-2">
                      {jobsByType.cron.map(job => (
                        <div
                          key={job.id}
                          className="p-2.5 rounded-md bg-[#161616] border border-[#27272a] hover:border-blue-500/30 transition-colors"
                        >
                          <p className="text-xs font-medium text-blue-300 mb-1">
                            {job.name || 'Cron Job'}
                          </p>
                          <p className="text-[10px] text-[#71717a] leading-relaxed">
                            {job.schedule.expr && parseCronExpression(job.schedule.expr)}
                          </p>
                          <p className="text-[10px] text-[#52525b] mt-1.5">
                            {job.payload.kind}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Interval jobs */}
              {jobsByType.interval.length > 0 && (
                <div className="flex-1 overflow-y-auto border-b border-[#27272a]">
                  <div className="p-4">
                    <h3 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      Intervals
                    </h3>
                    <div className="space-y-2">
                      {jobsByType.interval.map(job => {
                        const ms = job.schedule.everyMs || 0
                        const mins = Math.floor(ms / 60000)
                        const secs = Math.floor((ms % 60000) / 1000)
                        return (
                          <div
                            key={job.id}
                            className="p-2.5 rounded-md bg-[#161616] border border-[#27272a] hover:border-cyan-500/30 transition-colors"
                          >
                            <p className="text-xs font-medium text-cyan-300 mb-1">
                              {job.name || 'Interval Job'}
                            </p>
                            <p className="text-[10px] text-[#71717a]">
                              Every {mins > 0 ? `${mins}m ` : ''}{secs}s
                            </p>
                            <p className="text-[10px] text-[#52525b] mt-1.5">
                              {job.payload.kind}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* One-shot jobs */}
              {jobsByType.oneShot.length > 0 && (
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4">
                    <h3 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
                      One-Time
                    </h3>
                    <div className="space-y-2">
                      {jobsByType.oneShot.map(job => (
                        <div
                          key={job.id}
                          className="p-2.5 rounded-md bg-[#161616] border border-[#27272a] hover:border-yellow-500/30 transition-colors"
                        >
                          <p className="text-xs font-medium text-yellow-300 mb-1">
                            {job.name || 'One-Time Job'}
                          </p>
                          <p className="text-[10px] text-[#71717a]">
                            {job.schedule.at && new Date(job.schedule.at).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-[#52525b] mt-1.5">
                            {job.payload.kind}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
