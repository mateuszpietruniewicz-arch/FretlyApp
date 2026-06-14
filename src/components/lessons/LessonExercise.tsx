import { useEffect, useRef, useState, useMemo } from 'react'
import { Note } from 'tonal'
import { useAudio } from '@/hooks/useAudio'
import { usePitchDetection } from '@/hooks/usePitchDetection'
import { useLessonSession } from '@/hooks/useLessonSession'
import { Fretboard } from '@/components/fretboard'
import { Button } from '@/components/ui'
import { NOTE_COLORS } from '@/lib/tonal'
import { NoteTarget } from './NoteTarget'
import { LessonProgress } from './LessonProgress'
import type { Lesson, SessionResult } from '@/types/lesson'
import type { Instrument } from '@/types'

interface Props {
  lesson: Lesson
  instrument: Instrument
  onComplete: (result: SessionResult) => void
}

function buildSequence(lesson: Lesson): string[] {
  const { notes_to_play, order, repeat } = lesson.content.exercise
  const seq: string[] = []
  for (let i = 0; i < (repeat || 1); i++) {
    if (order === 'random') {
      seq.push(...[...notes_to_play].sort(() => Math.random() - 0.5))
    } else {
      seq.push(...notes_to_play)
    }
  }
  return seq
}

// ─── Passive exercise (listening / simultaneous) ─────────────────────────────
function PassiveExercise({ lesson, instrument, onComplete }: Props) {
  const exercise = lesson.content.exercise
  const allPCs = [...new Set(exercise.notes_to_play.map((n) => Note.pitchClass(n) || n.replace(/\d+$/, '')))]

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted leading-relaxed">{exercise.description}</p>

      {/* Note pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        {exercise.notes_to_play.map((n, i) => {
          const pc = Note.pitchClass(n) || n.replace(/\d+$/, '')
          return (
            <span
              key={i}
              className="px-3 py-1.5 rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: NOTE_COLORS[pc] ?? '#64748b' }}
            >
              {pc}
              <span className="ml-1 opacity-60 text-xs">{n}</span>
            </span>
          )
        })}
      </div>

      <Fretboard
        instrument={instrument}
        highlightPCs={allPCs}
        rootPC={allPCs[0]}
        startFret={0}
        endFret={12}
        showNoteNames
      />

      <Button className="w-full" onClick={() => onComplete({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        xpReward: lesson.xp_reward,
        attempts: [],
        accuracyPercent: 100,
        correctCount: exercise.notes_to_play.length,
        totalCount: exercise.notes_to_play.length,
        durationMs: 0,
      })}>
        Rozumiem, gotowe →
      </Button>
    </div>
  )
}

// ─── Free jam exercise ────────────────────────────────────────────────────────
function FreeJamExercise({ lesson, instrument, onComplete }: Props) {
  const exercise = lesson.content.exercise
  const totalSeconds = Math.min((lesson.duration_minutes ?? 2) * 60, 120)
  const [timeLeft, setTimeLeft] = useState(totalSeconds)
  const [started, setStarted] = useState(false)

  const allPCs = [...new Set(exercise.notes_to_play.map((n) => Note.pitchClass(n) || n.replace(/\d+$/, '')))]

  useEffect(() => {
    if (!started) return
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer)
          onComplete({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            xpReward: lesson.xp_reward,
            attempts: [],
            accuracyPercent: 100,
            correctCount: 1,
            totalCount: 1,
            durationMs: totalSeconds * 1000,
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [started, lesson, totalSeconds, onComplete])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const pct = ((totalSeconds - timeLeft) / totalSeconds) * 100

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted leading-relaxed">{exercise.description}</p>

      <Fretboard
        instrument={instrument}
        highlightPCs={allPCs}
        rootPC={allPCs[0]}
        startFret={0}
        endFret={12}
        showNoteNames
      />

      {started ? (
        <>
          {/* Timer */}
          <div className="text-center">
            <div className="text-4xl font-mono font-bold text-text dark:text-slate-100">
              {minutes}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="mt-2 h-2 bg-surface-2 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all duration-1000 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <Button variant="ghost" className="w-full" onClick={() => onComplete({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            xpReward: lesson.xp_reward,
            attempts: [],
            accuracyPercent: 100,
            correctCount: 1,
            totalCount: 1,
            durationMs: (totalSeconds - timeLeft) * 1000,
          })}>
            Zakończ wcześniej
          </Button>
        </>
      ) : (
        <Button className="w-full" onClick={() => setStarted(true)}>
          Zacznij improwizować →
        </Button>
      )}
    </div>
  )
}

// ─── Pitch detection exercise ─────────────────────────────────────────────────
export function LessonExercise({ lesson, instrument, onComplete }: Props) {
  const exercise = lesson.content.exercise

  // Passive exercises — no audio needed
  if (exercise.type === 'listening' || (exercise.type === 'simultaneous' && exercise.order === 'simultaneous')) {
    return <PassiveExercise lesson={lesson} instrument={instrument} onComplete={onComplete} />
  }
  if (exercise.type === 'free_jam') {
    return <FreeJamExercise lesson={lesson} instrument={instrument} onComplete={onComplete} />
  }

  return <PitchExercise lesson={lesson} instrument={instrument} onComplete={onComplete} />
}

function PitchExercise({ lesson, instrument, onComplete }: Props) {
  const exercise = lesson.content.exercise
  const startTimeRef = useRef(Date.now())

  const noteSequence = useMemo(() => buildSequence(lesson), [lesson])

  const { audioContext, analyser, isReady, isStarting, error, startAudio, stopAudio } = useAudio()
  const { pitch, silence, startDetection, stopDetection } = usePitchDetection()

  useEffect(() => {
    if (isReady && audioContext && analyser) {
      startDetection(analyser, audioContext.sampleRate)
    }
    return () => stopDetection()
  }, [isReady, audioContext, analyser, startDetection, stopDetection])

  const { phase, currentIndex, attempts, lastFeedback, lastDetectedPC, skip, reset } =
    useLessonSession(noteSequence, pitch?.pitchClass ?? null, silence)

  // Session complete
  useEffect(() => {
    if (phase !== 'complete') return
    stopAudio()
    stopDetection()

    const correctCount = attempts.filter((a) => a.status === 'correct').length
    const totalCount = attempts.length
    const accuracyPercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100

    // XP: full if ≥80%, half if ≥50%, else base 10
    const baseXp = lesson.xp_reward
    const xpEarned =
      accuracyPercent >= 80 ? baseXp :
      accuracyPercent >= 50 ? Math.round(baseXp / 2) :
      Math.max(10, Math.round(baseXp / 4))

    onComplete({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      xpReward: xpEarned,
      attempts,
      accuracyPercent,
      correctCount,
      totalCount,
      durationMs: Date.now() - startTimeRef.current,
    })
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentNote = noteSequence[currentIndex] ?? ''
  const currentPC = Note.pitchClass(currentNote) || currentNote.replace(/\d+$/, '')
  const allPCs = useMemo(
    () => [...new Set(noteSequence.map((n) => Note.pitchClass(n) || n.replace(/\d+$/, '')))],
    [noteSequence]
  )

  return (
    <div className="space-y-4">
      {/* Progress dots */}
      <LessonProgress attempts={attempts} currentIndex={currentIndex} />

      {/* Current note target */}
      <NoteTarget
        notePC={currentPC}
        noteFull={currentNote}
        feedback={lastFeedback}
        detectedPC={lastDetectedPC}
        isListening={isReady}
      />

      {/* Detected note indicator */}
      {isReady && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-muted">Słyszę:</span>
          {pitch && !silence ? (
            <span
              className="font-bold px-2 py-0.5 rounded-lg text-white"
              style={{ backgroundColor: NOTE_COLORS[pitch.pitchClass] ?? '#64748b' }}
            >
              {pitch.pitchClass}
            </span>
          ) : (
            <span className="text-subtle">—</span>
          )}
        </div>
      )}

      {/* Fretboard */}
      <Fretboard
        instrument={instrument}
        highlightPCs={allPCs}
        rootPC={currentPC}
        detectedPC={pitch?.pitchClass}
        startFret={0}
        endFret={12}
        showNoteNames
      />

      {/* Exercise info pill */}
      {exercise.tempo && (
        <div className="text-center">
          <span className="text-xs text-subtle bg-surface-2 dark:bg-slate-800 px-2.5 py-1 rounded-full">
            {exercise.tempo} BPM
          </span>
        </div>
      )}

      {/* Audio controls */}
      <div className="space-y-2 pt-1">
        {!isReady ? (
          <Button className="w-full" onClick={() => startAudio()} loading={isStarting}>
            {isStarting ? 'Łączę...' : 'Włącz mikrofon'}
          </Button>
        ) : (
          <div className="flex items-center justify-between bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-green-400">Mikrofon aktywny</span>
            </div>
            <button
              onClick={() => { stopAudio(); stopDetection() }}
              className="text-xs text-muted hover:text-red-400 transition-colors"
            >
              Wyłącz
            </button>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-400 text-center">{error}</p>
        )}

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1" onClick={skip}>
            Pomiń nutę
          </Button>
          <Button variant="ghost" size="sm" className="flex-1" onClick={reset}>
            Od nowa
          </Button>
        </div>
      </div>
    </div>
  )
}
