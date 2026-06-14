import { useMemo } from 'react'
import type { TabNote as TabNoteType } from '@/types/tab'
import { getFretColor } from '@/lib/tabUtils'

interface Props {
  note: TabNoteType
  instrument: 'guitar' | 'bass'
  isActive: boolean
  isSelected: boolean
}

const TECHNIQUE_LABELS: Record<string, string> = {
  'h':    'h',
  'p':    'p',
  'b':    'b',
  'b1/2': 'b½',
  'r':    'r',
  '~':    '~',
  's':    's',
  'S':    'S',
  '/':    '/',
  '\\':   '\\',
  't':    't',
  'PM':   'PM',
}

export function TabNote({ note, instrument, isActive, isSelected }: Props) {
  const color = useMemo(() => {
    if (note.fret === null) return '#64748b'
    if (note.techniques.includes('x')) return '#94a3b8'
    const base = getFretColor(note.string, note.fret, instrument)
    return isSelected ? base : base  // color stays consistent; background on cell level handles selection
  }, [note.fret, note.string, note.techniques, instrument, isSelected])

  const label = useMemo(() => {
    if (note.fret === null) return 'p'
    if (note.techniques.includes('x')) return 'x'
    return String(note.fret)
  }, [note.fret, note.techniques])

  const technique = note.techniques.find((t) => t !== 'x') ?? null

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      <span
        className={`text-[11px] font-bold font-mono leading-none select-none transition-all ${isActive ? 'scale-110' : ''} ${isSelected ? 'brightness-125' : ''}`}
        style={{ color, filter: isSelected ? 'brightness(1.3)' : undefined }}
      >
        {label}
      </span>
      {technique && (
        <span
          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] font-mono text-slate-400 leading-none select-none"
          title={technique}
        >
          {TECHNIQUE_LABELS[technique] ?? technique}
        </span>
      )}
    </div>
  )
}
