'use client'

import { useEffect, useState } from 'react'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function format(remaining: number) {
  const totalMinutes = Math.max(0, Math.floor(remaining / 60000))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return `${days}d ${hours}h restantes`
  if (hours > 0) return `${hours}h ${minutes}min restantes`
  return `${minutes}min restantes`
}

export function WeekCountdown({ weekStart, weekFinish }: { weekStart: string; weekFinish: string }) {
  const start = new Date(weekStart).getTime()
  const finish = new Date(weekFinish).getTime()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(id)
  }, [])

  const total = finish - start || WEEK_MS
  const elapsed = Math.min(Math.max(now - start, 0), total)
  const remaining = Math.max(finish - now, 0)
  const percent = Math.round((elapsed / total) * 100)
  const ended = remaining <= 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-violet-200">{ended ? 'Semana encerrada' : format(remaining)}</span>
        <span className="text-slate-400">{percent}% da semana</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-[width] duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
