import { NOTE_COLORS } from '@/lib/tonal'
import type { SessionFeedback } from '@/hooks/useLessonSession'

interface NoteTargetProps {
  notePC: string
  noteFull: string
  feedback: SessionFeedback
  detectedPC: string | null
  isListening: boolean
}

export function NoteTarget({ notePC, noteFull, feedback, detectedPC, isListening }: NoteTargetProps) {
  const color = NOTE_COLORS[notePC] ?? '#64748b'

  let borderColor = color
  let bgColor = `${color}22`
  let statusEl: React.ReactNode = null

  if (feedback === 'correct') {
    borderColor = '#22c55e'
    bgColor = '#22c55e22'
    statusEl = <span className="text-green-400 text-2xl font-bold animate-bounce">✓</span>
  } else if (feedback === 'wrong') {
    borderColor = '#ef4444'
    bgColor = '#ef444422'
    statusEl = (
      <div className="text-center">
        <span className="text-red-400 text-xl font-bold block">✗</span>
        {detectedPC && (
          <span className="text-xs text-red-400 mt-1 block">
            Grasz: {detectedPC} zamiast {notePC}
          </span>
        )}
      </div>
    )
  } else if (isListening) {
    statusEl = (
      <div className="flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-current opacity-60"
            style={{
              color,
              animation: `pulse 1s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <p className="text-xs text-muted uppercase tracking-widest font-semibold">Zagraj nutę</p>

      <div
        className="w-28 h-28 rounded-3xl flex items-center justify-center text-5xl font-black transition-all duration-200 select-none"
        style={{
          backgroundColor: bgColor,
          border: `3px solid ${borderColor}`,
          color: borderColor,
          boxShadow: feedback ? `0 0 24px ${borderColor}44` : undefined,
        }}
      >
        {notePC}
      </div>

      <div className="text-sm text-muted">{noteFull}</div>

      <div className="h-10 flex items-center justify-center">
        {statusEl}
      </div>
    </div>
  )
}
