import { useMemo } from 'react'
import { Scale, Note } from 'tonal'
import { Fretboard } from '@/components/fretboard'
import { NOTE_COLORS } from '@/lib/tonal'
import type { Instrument } from '@/types'

interface Props {
  selectedKey: string
  selectedScale: string
  onSelectKey: (key: string) => void
  onSelectScale: (scale: string) => void
  instrument: Instrument
  detectedPitchClass?: string | null
}

const CHROMATIC_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const SCALES: { id: string; label: string }[] = [
  { id: 'minor pentatonic', label: 'Pentatonika molowa' },
  { id: 'major pentatonic', label: 'Pentatonika durowa' },
  { id: 'blues',            label: 'Blues' },
  { id: 'minor',            label: 'Mol naturalny' },
  { id: 'major',            label: 'Dur' },
  { id: 'dorian',           label: 'Dorian' },
  { id: 'mixolydian',       label: 'Mixolydian' },
]

export function ScaleOverlay({
  selectedKey,
  selectedScale,
  onSelectKey,
  onSelectScale,
  instrument,
  detectedPitchClass,
}: Props) {
  const scaleNotes = useMemo(() => {
    const result = Scale.get(`${selectedKey} ${selectedScale}`)
    return result.notes
  }, [selectedKey, selectedScale])

  const scalePCs = useMemo(
    () => scaleNotes.map((n) => Note.pitchClass(n) || n),
    [scaleNotes]
  )

  const detectedInScale = detectedPitchClass
    ? scalePCs.includes(detectedPitchClass)
    : null

  return (
    <div className="space-y-4">
      {/* Key selector */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Tonacja</p>
        <div className="flex gap-1 flex-wrap">
          {CHROMATIC_KEYS.map((key) => {
            const isSelected = key === selectedKey
            const color = NOTE_COLORS[key] ?? '#64748b'
            return (
              <button
                key={key}
                onClick={() => onSelectKey(key)}
                className="w-9 h-9 rounded-xl text-xs font-bold transition-all active:scale-95"
                style={{
                  backgroundColor: isSelected ? color : undefined,
                  color: isSelected ? '#fff' : color,
                  border: `1.5px solid ${isSelected ? 'transparent' : color + '66'}`,
                }}
              >
                {key}
              </button>
            )
          })}
        </div>
      </div>

      {/* Scale selector */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Skala</p>
        <div className="flex gap-1.5 flex-wrap">
          {SCALES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onSelectScale(id)}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-colors ${
                id === selectedScale
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface dark:bg-slate-800 text-muted border border-border dark:border-slate-700 hover:border-brand-500/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Scale notes as colored pills */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Nuty skali</p>
        <div className="flex gap-2 flex-wrap">
          {scalePCs.map((pc, i) => {
            const isDetected = detectedPitchClass === pc
            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white transition-all duration-150"
                  style={{
                    backgroundColor: NOTE_COLORS[pc] ?? '#64748b',
                    boxShadow: isDetected ? `0 0 12px ${NOTE_COLORS[pc] ?? '#64748b'}` : undefined,
                    transform: isDetected ? 'scale(1.15)' : undefined,
                  }}
                >
                  {pc}
                </span>
                {i === 0 && (
                  <span className="text-[9px] text-muted">root</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Detected note feedback */}
      {detectedPitchClass && (
        <div
          className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl ${
            detectedInScale
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          <span
            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: NOTE_COLORS[detectedPitchClass] ?? '#64748b' }}
          >
            {detectedPitchClass}
          </span>
          {detectedInScale
            ? '✓ Nuta jest w skali'
            : '✗ Nuta poza skalą'}
        </div>
      )}

      {/* Fretboard */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Gryf</p>
        <Fretboard
          instrument={instrument}
          highlightPCs={scalePCs}
          rootPC={selectedKey}
          detectedPC={detectedPitchClass ?? undefined}
          startFret={0}
          endFret={12}
          showNoteNames
        />
      </div>
    </div>
  )
}
