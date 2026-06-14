export type ExerciseType = 'pitch_detection' | 'listening' | 'simultaneous' | 'free_jam'
export type NoteOrder = 'sequential' | 'random' | 'free' | 'simultaneous'

export interface LessonExercise {
  type: ExerciseType
  description: string
  notes_to_play: string[]
  order: NoteOrder
  tempo: number | null
  repeat: number
}

export interface LessonContent {
  theory: string
  tips: string[]
  exercise: LessonExercise
}

export interface Lesson {
  id: string
  title: string
  level: number
  category: string
  instrument: string
  xp_reward: number
  duration_minutes: number
  content: LessonContent
}

/** State of a single note attempt in a session */
export type NoteStatus = 'pending' | 'correct' | 'wrong' | 'skipped'

export interface NoteAttempt {
  expected: string     // e.g. "A2"
  expectedPC: string   // e.g. "A"
  status: NoteStatus
  detectedPC?: string  // what was played on wrong attempt
}

/** Full session result passed to results screen */
export interface SessionResult {
  lessonId: string
  lessonTitle: string
  xpReward: number
  attempts: NoteAttempt[]
  accuracyPercent: number
  correctCount: number
  totalCount: number
  durationMs: number
}
