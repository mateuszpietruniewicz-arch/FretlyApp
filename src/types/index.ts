export type Instrument = 'guitar' | 'bass'

export type Level = 1 | 2 | 3 | 4 | 5

export const LEVEL_NAMES: Record<Level, string> = {
  1: 'Początkujący',
  2: 'Podstawowy',
  3: 'Średni',
  4: 'Zaawansowany',
  5: 'Mistrz',
}

export type NoteName = 'A' | 'A#' | 'B' | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#'

export type ScaleType = 'major' | 'minor' | 'pentatonic_major' | 'pentatonic_minor' | 'blues'

export interface Note {
  name: NoteName
  octave: number
  frequency: number
}

export interface UserProfile {
  id: string
  email: string
  username: string
  instrument: Instrument
  created_at: string
}

export interface UserStats {
  user_id: string
  total_xp: number
  current_level: Level
  streak_days: number
  badges: string[]
}

export interface Lesson {
  id: string
  title: string
  level: Level
  category: 'notes' | 'scales' | 'chords' | 'theory'
  content_json: Record<string, unknown>
}

export interface UserProgress {
  user_id: string
  lesson_id: string
  completed_at: string
  accuracy_percent: number
  xp_earned: number
}

export interface AudioSource {
  deviceId: string
  label: string
  kind: 'audioinput'
}
