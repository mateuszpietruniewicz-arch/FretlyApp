import { Note, Scale, Chord, Interval, Mode } from 'tonal'

// ────────────────────────────────────────────────
// 12-note color system (CONTEXT_2.md)
// ────────────────────────────────────────────────
export const NOTE_COLORS: Record<string, string> = {
  C:  '#ef4444',
  'C#': '#fb923c',
  Db: '#fb923c',
  D:  '#f97316',
  'D#': '#eab308',
  Eb: '#eab308',
  E:  '#22c55e',
  F:  '#14b8a6',
  'F#': '#3b82f6',
  Gb: '#3b82f6',
  G:  '#1e40af',
  'G#': '#a855f7',
  Ab: '#a855f7',
  A:  '#ec4899',
  'A#': '#f43f5e',
  Bb: '#f43f5e',
  B:  '#9f1239',
}

export function noteColor(noteName: string): string {
  const pc = Note.pitchClass(noteName)
  return NOTE_COLORS[pc] ?? '#64748b'
}

// ────────────────────────────────────────────────
// Note utilities
// ────────────────────────────────────────────────
export function freqToNote(freq: number): {
  name: string
  pitchClass: string
  octave: number
  midi: number
  cents: number
} {
  const midi = 12 * (Math.log2(freq / 440)) + 69
  const midiRounded = Math.round(midi)
  const cents = Math.round((midi - midiRounded) * 100)
  const name = Note.fromMidi(midiRounded) ?? ''
  const pc = Note.pitchClass(name)
  const octave = Note.octave(name) ?? 0
  return { name, pitchClass: pc, octave, midi: midiRounded, cents }
}

export function noteFreq(note: string): number {
  return Note.freq(note) ?? 0
}

export function midiToNote(midi: number): string {
  return Note.fromMidi(midi) ?? ''
}

// ────────────────────────────────────────────────
// Scale utilities (tonal.js as single source of truth)
// ────────────────────────────────────────────────
export function getScaleNotes(root: string, scaleName: string): string[] {
  return Scale.get(`${root} ${scaleName}`).notes
}

export function getScaleNames(): string[] {
  return Scale.names()
}

export const COMMON_SCALES = [
  'major',
  'minor',
  'pentatonic major',
  'minor pentatonic',
  'blues',
  'dorian',
  'phrygian',
  'lydian',
  'mixolydian',
  'locrian',
] as const

// ────────────────────────────────────────────────
// Chord utilities
// ────────────────────────────────────────────────
export function getChordNotes(chord: string): string[] {
  return Chord.get(chord).notes
}

export function getChordNames(): string[] {
  // tonal v6 re-exports ChordType.names()
  return []
}

// ────────────────────────────────────────────────
// Interval utilities
// ────────────────────────────────────────────────
export function intervalName(semitones: number): string {
  return Interval.fromSemitones(semitones)
}

// ────────────────────────────────────────────────
// Mode utilities
// ────────────────────────────────────────────────
export function getModeNotes(root: string, modeName: string): string[] {
  return Mode.notes(modeName, root)
}

export { Note, Scale, Chord, Interval, Mode }
