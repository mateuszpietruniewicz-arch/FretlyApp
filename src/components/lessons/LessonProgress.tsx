import { NOTE_COLORS } from '@/lib/tonal'
import type { NoteAttempt } from '@/types/lesson'

interface LessonProgressProps {
  attempts: NoteAttempt[]
  currentIndex: number
}

export function LessonProgress({ attempts, currentIndex }: LessonProgressProps) {
  const total = attempts.length
  const doneCount = attempts.filter((a) => a.status !== 'pending').length

  return (
    <div className="space-y-1.5">
      {/* Dots strip */}
      <div className="flex gap-1 flex-wrap justify-center">
        {attempts.map((a, i) => {
          const isActive = i === currentIndex
          const color = NOTE_COLORS[a.expectedPC] ?? '#64748b'

          let bg = '#334155'         // pending
          let ring = 'none'
          let scale = 'scale-100'

          if (a.status === 'correct') {
            bg = '#22c55e'
          } else if (a.status === 'wrong') {
            bg = '#ef4444'
          } else if (a.status === 'skipped') {
            bg = '#f59e0b'
          } else if (isActive) {
            bg = color
            ring = `0 0 0 2px ${color}`
            scale = 'scale-125'
          }

          return (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${scale}`}
              style={{ backgroundColor: bg, boxShadow: ring }}
              title={`${a.expectedPC} — ${a.status}`}
            />
          )
        })}
      </div>

      {/* Text counter */}
      <div className="text-center text-xs text-muted">
        {doneCount} / {total} nut
      </div>
    </div>
  )
}
