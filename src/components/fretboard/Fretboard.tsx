import { useMemo } from 'react'
import { Note } from 'tonal'
import { NOTE_COLORS } from '@/lib/tonal'
import type { Instrument } from '@/types'

// Open string MIDI values (string index 0 = highest pitch)
const GUITAR_OPEN_MIDI = [64, 59, 55, 50, 45, 40] // E4 B3 G3 D3 A2 E2
const BASS_OPEN_MIDI   = [43, 38, 33, 28]          // G2 D2 A1 E1

const GUITAR_STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E']
const BASS_STRING_LABELS   = ['G', 'D', 'A', 'E']

interface FretPosition {
  string: number   // 0 = top (highest pitch)
  fret: number
  note: string     // e.g. "A4"
  pc: string       // e.g. "A"
  color: string
  isRoot: boolean
  isDetected: boolean
  isHighlighted: boolean
}

export interface FretboardProps {
  instrument?: Instrument
  /** Pitch classes to highlight, e.g. ['A', 'C', 'D', 'E', 'G'] */
  highlightPCs?: string[]
  /** Root pitch class — shown with filled ring */
  rootPC?: string
  /** Currently detected pitch class (from tuner) */
  detectedPC?: string
  startFret?: number
  endFret?: number
  showNoteNames?: boolean
  className?: string
}

function buildGrid(
  openMidi: number[],
  startFret: number,
  endFret: number,
  highlightPCs: Set<string>,
  rootPC: string | undefined,
  detectedPC: string | undefined
): FretPosition[][] {
  return openMidi.map((midi, stringIdx) => {
    const row: FretPosition[] = []
    for (let fret = startFret; fret <= endFret; fret++) {
      const m = midi + fret
      const name = Note.fromMidi(m) ?? ''
      const pc = Note.pitchClass(name)
      const isHighlighted = highlightPCs.size === 0 || highlightPCs.has(pc)
      const isRoot = pc === rootPC
      const isDetected = pc === detectedPC

      row.push({
        string: stringIdx,
        fret,
        note: name,
        pc,
        color: NOTE_COLORS[pc] ?? '#64748b',
        isRoot,
        isDetected,
        isHighlighted,
      })
    }
    return row
  })
}

const DOT_FRETS = new Set([3, 5, 7, 9, 12, 15, 17, 19, 21, 24])
const DOUBLE_DOT_FRETS = new Set([12, 24])

export function Fretboard({
  instrument = 'guitar',
  highlightPCs = [],
  rootPC,
  detectedPC,
  startFret = 0,
  endFret = 12,
  showNoteNames = false,
  className = '',
}: FretboardProps) {
  const openMidi = instrument === 'bass' ? BASS_OPEN_MIDI : GUITAR_OPEN_MIDI
  const stringLabels = instrument === 'bass' ? BASS_STRING_LABELS : GUITAR_STRING_LABELS
  const highlightSet = useMemo(() => new Set(highlightPCs), [highlightPCs])

  const grid = useMemo(
    () => buildGrid(openMidi, startFret, endFret, highlightSet, rootPC, detectedPC),
    [openMidi, startFret, endFret, highlightSet, rootPC, detectedPC]
  )

  const fretCount = endFret - startFret + 1
  const stringCount = openMidi.length

  // Layout constants (in arbitrary units, scaled by SVG viewBox)
  const CELL_W = 52
  const CELL_H = 32
  const LABEL_W = 20
  const FRET_LABEL_H = 18
  const DOT_R = 10
  const STRING_W = 1.5

  const totalW = LABEL_W + fretCount * CELL_W
  const totalH = FRET_LABEL_H + stringCount * CELL_H + 12

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="w-full"
        style={{ minWidth: `${Math.max(280, fretCount * 28)}px`, maxWidth: '600px' }}
        aria-label={`Gryf ${instrument === 'bass' ? 'basu' : 'gitary'}`}
      >
        {/* Nut (thick bar at fret 0) */}
        {startFret === 0 && (
          <rect
            x={LABEL_W - 1}
            y={FRET_LABEL_H}
            width={4}
            height={stringCount * CELL_H}
            fill="#94a3b8"
            rx={2}
          />
        )}

        {/* Fret lines */}
        {Array.from({ length: fretCount }, (_, i) => i).map((i) => {
          const fret = startFret + i
          const x = LABEL_W + i * CELL_W
          return (
            <line
              key={fret}
              x1={x + CELL_W}
              y1={FRET_LABEL_H}
              x2={x + CELL_W}
              y2={FRET_LABEL_H + stringCount * CELL_H}
              stroke="#334155"
              strokeWidth={1}
            />
          )
        })}

        {/* String lines */}
        {Array.from({ length: stringCount }, (_, s) => s).map((s) => {
          const y = FRET_LABEL_H + s * CELL_H + CELL_H / 2
          const thickness = STRING_W + (stringCount - 1 - s) * 0.4
          return (
            <line
              key={s}
              x1={LABEL_W}
              y1={y}
              x2={totalW}
              y2={y}
              stroke="#475569"
              strokeWidth={thickness}
            />
          )
        })}

        {/* Position dots (fretboard markers) */}
        {Array.from({ length: fretCount }, (_, i) => {
          const fret = startFret + i
          if (!DOT_FRETS.has(fret)) return null
          const x = LABEL_W + i * CELL_W + CELL_W / 2
          const midY = FRET_LABEL_H + (stringCount / 2) * CELL_H
          if (DOUBLE_DOT_FRETS.has(fret)) {
            return (
              <g key={fret}>
                <circle cx={x} cy={midY - CELL_H * 0.8} r={3} fill="#1e293b" />
                <circle cx={x} cy={midY + CELL_H * 0.8} r={3} fill="#1e293b" />
              </g>
            )
          }
          return <circle key={fret} cx={x} cy={midY} r={3} fill="#1e293b" />
        })}

        {/* Fret number labels */}
        {Array.from({ length: fretCount }, (_, i) => {
          const fret = startFret + i
          if (fret === 0) return null
          const x = LABEL_W + i * CELL_W + CELL_W / 2
          return (
            <text
              key={fret}
              x={x}
              y={FRET_LABEL_H - 4}
              textAnchor="middle"
              fontSize={9}
              fill="#475569"
              fontFamily="system-ui, sans-serif"
            >
              {fret}
            </text>
          )
        })}

        {/* String labels */}
        {stringLabels.map((label, s) => {
          const y = FRET_LABEL_H + s * CELL_H + CELL_H / 2
          return (
            <text
              key={s}
              x={LABEL_W - 5}
              y={y + 4}
              textAnchor="end"
              fontSize={9}
              fill="#64748b"
              fontFamily="system-ui, sans-serif"
            >
              {label}
            </text>
          )
        })}

        {/* Note dots */}
        {grid.map((row, s) =>
          row.map((pos, i) => {
            const { isHighlighted, isRoot, isDetected, color, pc } = pos
            const x = LABEL_W + i * CELL_W + CELL_W / 2
            const y = FRET_LABEL_H + s * CELL_H + CELL_H / 2
            const show = isHighlighted || isDetected

            if (!show) return null

            return (
              <g key={`${s}-${i}`}>
                {/* Outer ring for root note */}
                {isRoot && (
                  <circle cx={x} cy={y} r={DOT_R + 3} fill="none" stroke={color} strokeWidth={2} opacity={0.6} />
                )}
                {/* Glow for detected note */}
                {isDetected && (
                  <circle cx={x} cy={y} r={DOT_R + 5} fill={color} opacity={0.15} />
                )}
                {/* Main dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={DOT_R}
                  fill={isDetected || isHighlighted ? color : '#1e293b'}
                  opacity={isHighlighted || isDetected ? 1 : 0.3}
                />
                {/* Note name */}
                {showNoteNames && (isHighlighted || isDetected) && (
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fontSize={8}
                    fill={isRoot ? '#0f172a' : '#fff'}
                    fontWeight="bold"
                    fontFamily="system-ui, sans-serif"
                  >
                    {pc}
                  </text>
                )}
              </g>
            )
          })
        )}
      </svg>
    </div>
  )
}
