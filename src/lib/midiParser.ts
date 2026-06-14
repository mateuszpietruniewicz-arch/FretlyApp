import { Midi } from '@tonejs/midi'

export type DrumVoice =
  | 'kick'
  | 'snare'
  | 'hihat-closed'
  | 'hihat-open'
  | 'crash'
  | 'ride'
  | 'tom-low'
  | 'tom-high'

// General MIDI drum map — channel 10
export const DRUM_MIDI_MAP: Record<number, DrumVoice> = {
  35: 'kick',          // Acoustic Bass Drum
  36: 'kick',          // Bass Drum 1
  38: 'snare',         // Acoustic Snare
  40: 'snare',         // Electric Snare
  42: 'hihat-closed',  // Closed Hi-Hat
  44: 'hihat-closed',  // Pedal Hi-Hat
  46: 'hihat-open',    // Open Hi-Hat
  49: 'crash',         // Crash Cymbal 1
  57: 'crash',         // Crash Cymbal 2
  51: 'ride',          // Ride Cymbal 1
  59: 'ride',          // Ride Bell
  41: 'tom-low',       // Low Floor Tom
  43: 'tom-low',       // High Floor Tom
  45: 'tom-high',      // Low Tom
  47: 'tom-high',      // Low-Mid Tom
  48: 'tom-high',      // Hi-Mid Tom
  50: 'tom-high',      // High Tom
}

export interface DrumEvent {
  time: number       // seconds at file's native BPM
  voice: DrumVoice
  velocity: number   // 0–1
}

export interface ParsedMidi {
  bpm: number
  duration: number   // seconds at native BPM
  events: DrumEvent[]
}

const cache = new Map<string, ParsedMidi>()

export async function parseMidiFile(url: string): Promise<ParsedMidi> {
  const hit = cache.get(url)
  if (hit) return hit

  const midi = await Midi.fromUrl(url)

  const bpm = midi.header.tempos[0]?.bpm ?? 120
  const ppq = midi.header.ppq

  const events: DrumEvent[] = []

  for (const track of midi.tracks) {
    for (const note of track.notes) {
      const voice = DRUM_MIDI_MAP[note.midi]
      if (!voice) continue
      events.push({ time: note.time, voice, velocity: note.velocity })
    }
  }

  events.sort((a, b) => a.time - b.time)

  // Round duration up to a whole number of 4-beat measures (in seconds)
  const secsPerMeasure = (60 / bpm) * 4
  const rawDuration = midi.duration > 0
    ? midi.duration
    : (events.at(-1)?.time ?? 0) + 60 / bpm

  const duration = Math.ceil(rawDuration / secsPerMeasure) * secsPerMeasure

  // Silence ppq warning — only needed for tick-based scheduling
  void ppq

  const result: ParsedMidi = { bpm, duration, events }
  cache.set(url, result)
  return result
}

/** Scale event times for playback at a different BPM than the original */
export function scaleEvents(
  events: DrumEvent[],
  originalBpm: number,
  targetBpm: number
): Array<{ time: number; voice: DrumVoice; velocity: number }> {
  const ratio = originalBpm / targetBpm
  return events.map((e) => ({ ...e, time: e.time * ratio }))
}
