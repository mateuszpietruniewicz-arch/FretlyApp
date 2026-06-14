import { Note, Interval } from 'tonal'
import { noteColor } from './tonal'
import type { TabBar, TabCursor, TabDocument, TabNote, Duration, Dynamic, TimeSignature } from '@/types/tab'

// ─── Tunning ─────────────────────────────────────────────────────────────────

const GUITAR_TUNING = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2']  // strings 1-6, standard
const BASS_TUNING   = ['G2', 'D2', 'A1', 'E1']               // strings 1-4, standard

const GUITAR_STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']
const BASS_STRING_NAMES   = ['G', 'D', 'A', 'E']

// ─── Duration maps ───────────────────────────────────────────────────────────

export const DURATION_BEATS: Record<Duration, number> = {
  '1':  4.0,
  '2':  2.0,
  '4':  1.0,
  '8':  0.5,
  '16': 0.25,
  '1.': 6.0,
  '2.': 3.0,
  '4.': 1.5,
  '8.': 0.75,
}

export const BEATS_PER_BAR: Record<TimeSignature, number> = {
  '4/4': 4,
  '3/4': 3,
  '6/8': 3,  // 6 eighths = 3 quarter beats
}

// ─── Note utilities ──────────────────────────────────────────────────────────

export function getNoteAtFret(stringNum: number, fret: number, instrument: 'guitar' | 'bass'): string {
  const tuning = instrument === 'guitar' ? GUITAR_TUNING : BASS_TUNING
  const openNote = tuning[stringNum - 1] ?? 'E2'
  return Note.transpose(openNote, Interval.fromSemitones(fret))
}

export function getFretColor(stringNum: number, fret: number, instrument: 'guitar' | 'bass'): string {
  const noteName = getNoteAtFret(stringNum, fret, instrument)
  return noteColor(noteName)
}

export function getStringNames(instrument: 'guitar' | 'bass'): string[] {
  return instrument === 'guitar' ? GUITAR_STRING_NAMES : BASS_STRING_NAMES
}

export function getStringCount(instrument: 'guitar' | 'bass'): number {
  return instrument === 'guitar' ? 6 : 4
}

// ─── Document factories ──────────────────────────────────────────────────────

export function createNote(
  stringNum: number,
  fret: number | null,
  duration: Duration,
  beatPosition: number,
  dynamic: Dynamic = 'mf'
): TabNote {
  return {
    id: crypto.randomUUID(),
    string: stringNum,
    fret,
    duration,
    techniques: [],
    dynamic,
    beatPosition,
  }
}

export function createEmptyBar(barNumber: number, timeSignature: TimeSignature): TabBar {
  return {
    id: crypto.randomUUID(),
    barNumber,
    notes: [],
    timeSignature,
  }
}

export function createEmptyDocument(instrument: 'guitar' | 'bass' = 'guitar'): TabDocument {
  const now = new Date().toISOString()
  const bars: TabBar[] = []
  for (let i = 0; i < 4; i++) {
    bars.push(createEmptyBar(i + 1, '4/4'))
  }
  return {
    id: crypto.randomUUID(),
    title: 'Nowy TAB',
    instrument,
    tuning: 'standard',
    tempo: 120,
    timeSignature: '4/4',
    key: 'Am',
    bars,
    createdAt: now,
    updatedAt: now,
  }
}

// ─── Document mutations (immutable) ─────────────────────────────────────────

export function addBar(doc: TabDocument): TabDocument {
  const bar = createEmptyBar(doc.bars.length + 1, doc.timeSignature)
  return { ...doc, bars: [...doc.bars, bar], updatedAt: new Date().toISOString() }
}

export function removeBar(doc: TabDocument, barIndex: number): TabDocument {
  if (doc.bars.length <= 1) return doc
  const bars = doc.bars
    .filter((_, i) => i !== barIndex)
    .map((b, i) => ({ ...b, barNumber: i + 1 }))
  return { ...doc, bars, updatedAt: new Date().toISOString() }
}

export function setNote(
  doc: TabDocument,
  cursor: TabCursor,
  fret: number | null,
  duration: Duration,
  dynamic: Dynamic
): TabDocument {
  const bar = doc.bars[cursor.barIndex]
  if (!bar) return doc

  const filtered = bar.notes.filter(
    (n) => !(n.string === cursor.string && Math.abs(n.beatPosition - cursor.beatPosition) < 0.001)
  )
  const note = createNote(cursor.string, fret, duration, cursor.beatPosition, dynamic)
  const newNotes = [...filtered, note].sort(
    (a, b) => a.beatPosition - b.beatPosition || a.string - b.string
  )
  const newBar = { ...bar, notes: newNotes }
  const bars = doc.bars.map((b, i) => (i === cursor.barIndex ? newBar : b))
  return { ...doc, bars, updatedAt: new Date().toISOString() }
}

export function removeNote(doc: TabDocument, cursor: TabCursor): TabDocument {
  const bar = doc.bars[cursor.barIndex]
  if (!bar) return doc

  const notes = bar.notes.filter(
    (n) => !(n.string === cursor.string && Math.abs(n.beatPosition - cursor.beatPosition) < 0.001)
  )
  const newBar = { ...bar, notes }
  const bars = doc.bars.map((b, i) => (i === cursor.barIndex ? newBar : b))
  return { ...doc, bars, updatedAt: new Date().toISOString() }
}

export function updateTitle(doc: TabDocument, title: string): TabDocument {
  return { ...doc, title, updatedAt: new Date().toISOString() }
}

// ─── Cursor navigation ───────────────────────────────────────────────────────

export function moveCursor(
  cursor: TabCursor,
  direction: 'left' | 'right' | 'up' | 'down',
  doc: TabDocument,
  stepBeats: number
): TabCursor {
  const maxStrings = getStringCount(doc.instrument)
  const bpb = BEATS_PER_BAR[doc.timeSignature]

  switch (direction) {
    case 'up':
      return { ...cursor, string: Math.max(1, cursor.string - 1) }
    case 'down':
      return { ...cursor, string: Math.min(maxStrings, cursor.string + 1) }
    case 'left': {
      const prevPos = +(cursor.beatPosition - stepBeats).toFixed(4)
      if (prevPos >= 0) return { ...cursor, beatPosition: prevPos }
      if (cursor.barIndex > 0) {
        const prevBar = cursor.barIndex - 1
        return { ...cursor, barIndex: prevBar, beatPosition: +(bpb - stepBeats).toFixed(4) }
      }
      return { ...cursor, beatPosition: 0 }
    }
    case 'right': {
      const nextPos = +(cursor.beatPosition + stepBeats).toFixed(4)
      if (nextPos < bpb) return { ...cursor, beatPosition: nextPos }
      if (cursor.barIndex < doc.bars.length - 1) {
        return { ...cursor, barIndex: cursor.barIndex + 1, beatPosition: 0 }
      }
      return cursor
    }
  }
}

// ─── ASCII rendering ─────────────────────────────────────────────────────────

const EIGHTH_RES = 0.5  // quarter beats per ASCII column
const CHARS_PER_COL = 3

function renderBarASCII(bar: TabBar, strings: string[]): string[] {
  const bpb = BEATS_PER_BAR[bar.timeSignature]
  const numCols = Math.round(bpb / EIGHTH_RES)

  // Build cells[stringIdx][colIdx] = 3-char string
  const cells: string[][] = strings.map(() => Array(numCols).fill('---') as string[])

  for (const note of bar.notes) {
    const sIdx = note.string - 1
    const col = Math.round(note.beatPosition / EIGHTH_RES)
    if (sIdx < 0 || sIdx >= strings.length) continue
    if (col < 0 || col >= numCols) continue

    let cell: string
    if (note.fret === null) {
      cell = 'p--'
    } else if (note.techniques.includes('x')) {
      cell = 'x--'
    } else {
      cell = String(note.fret).padEnd(CHARS_PER_COL, '-')
    }
    cells[sIdx][col] = cell.slice(0, CHARS_PER_COL)
  }

  return strings.map((name, sIdx) => `${name}|${cells[sIdx].join('')}|`)
}

export function renderTabASCII(doc: TabDocument): string {
  const strings = getStringNames(doc.instrument)
  const barLines = doc.bars.map((bar) => renderBarASCII(bar, strings))

  return strings
    .map((_, sIdx) => barLines.map((bl) => bl[sIdx]).join(''))
    .join('\n')
}
