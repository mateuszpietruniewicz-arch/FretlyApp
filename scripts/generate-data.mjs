/**
 * Generates static music data files using tonal.js.
 * Run: node scripts/generate-data.mjs
 */

import { Note, Scale } from 'tonal'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '../src/data')
mkdirSync(DATA_DIR, { recursive: true })

// ────────────────────────────────────────────────
// Fretboard data
// ────────────────────────────────────────────────

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FRETS = 24

function buildFretboard(openMidiNotes) {
  // openMidiNotes: array from string 1 (highest) to string 6 (lowest)
  // Guitar: [64, 59, 55, 50, 45, 40] = [E4, B3, G3, D3, A2, E2]
  const strings = openMidiNotes.map((openMidi, strIdx) => {
    const fretData = []
    for (let fret = 0; fret <= FRETS; fret++) {
      const midi = openMidi + fret
      const noteName = Note.fromMidi(midi) // e.g. "A4"
      const pc = Note.pitchClass(noteName)  // e.g. "A"
      const octave = Note.octave(noteName)
      const freq = Note.freq(noteName)
      fretData.push({ fret, midi, note: noteName, pc, octave, freq: Math.round(freq * 100) / 100 })
    }
    return { string: strIdx + 1, openNote: Note.fromMidi(openMidi), frets: fretData }
  })

  // Build reverse lookup: note name → list of {string, fret} positions
  const positions = {}
  for (const s of strings) {
    for (const f of s.frets) {
      if (!positions[f.note]) positions[f.note] = []
      positions[f.note].push({ string: s.string, fret: f.fret })
    }
  }

  return { strings, positions }
}

// Guitar: standard EADGBE — string 1 (high E4) to string 6 (low E2)
const guitarOpenMidi = [64, 59, 55, 50, 45, 40]
const guitarFretboard = buildFretboard(guitarOpenMidi)
writeFileSync(
  join(DATA_DIR, 'fretboard-guitar.json'),
  JSON.stringify({ tuning: 'EADGBE', frets: FRETS, ...guitarFretboard }, null, 2)
)
console.log('✓ fretboard-guitar.json')

// Bass: standard EADG — string 1 (high G2) to string 4 (low E1)
const bassOpenMidi = [43, 38, 33, 28]
const bassFretboard = buildFretboard(bassOpenMidi)
writeFileSync(
  join(DATA_DIR, 'fretboard-bass.json'),
  JSON.stringify({ tuning: 'EADG', frets: FRETS, ...bassFretboard }, null, 2)
)
console.log('✓ fretboard-bass.json')

// ────────────────────────────────────────────────
// Scales box patterns
// ────────────────────────────────────────────────

const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const SCALE_TYPES = [
  'major',
  'minor',
  'minor pentatonic',
  'major pentatonic',
  'blues',
  'dorian',
  'mixolydian',
  'phrygian',
]

function getScalePositions(root, scaleName, fretboard) {
  const scaleData = Scale.get(`${root} ${scaleName}`)
  if (!scaleData.notes || scaleData.notes.length === 0) return null

  const scalePCs = new Set(scaleData.notes)

  // Find all positions on fretboard for notes in this scale
  const positions = []
  for (const string of fretboard.strings) {
    for (const f of string.frets) {
      if (f.fret > 17) continue // limit to first 17 frets for patterns
      if (scalePCs.has(f.pc)) {
        const isRoot = f.pc === root
        positions.push({
          string: string.string,
          fret: f.fret,
          note: f.note,
          pc: f.pc,
          isRoot,
        })
      }
    }
  }

  return {
    root,
    scale: scaleName,
    notes: scaleData.notes,
    intervals: scaleData.intervals,
    positions,
  }
}

const scalesPositions = {}
for (const root of ROOTS) {
  scalesPositions[root] = {}
  for (const scaleName of SCALE_TYPES) {
    const data = getScalePositions(root, scaleName, guitarFretboard)
    if (data) scalesPositions[root][scaleName] = data
  }
}

writeFileSync(
  join(DATA_DIR, 'scales-positions.json'),
  JSON.stringify({ guitar: scalesPositions, scales: SCALE_TYPES, roots: ROOTS }, null, 2)
)
console.log('✓ scales-positions.json')

// ────────────────────────────────────────────────
// Basic chord fingerings (open chords)
// ────────────────────────────────────────────────

const OPEN_CHORDS = {
  'E':  { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], barre: null },
  'Em': { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], barre: null },
  'A':  { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], barre: null },
  'Am': { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], barre: null },
  'D':  { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], barre: null },
  'Dm': { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], barre: null },
  'G':  { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], barre: null },
  'C':  { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], barre: null },
  'F':  { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barre: { fret: 1, fromString: 1, toString: 6 } },
  'B7': { frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], barre: null },
}

writeFileSync(
  join(DATA_DIR, 'chords-fingering.json'),
  JSON.stringify({ openChords: OPEN_CHORDS }, null, 2)
)
console.log('✓ chords-fingering.json')

console.log('\nDane muzyczne wygenerowane w src/data/')
