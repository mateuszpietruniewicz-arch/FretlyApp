import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Note } from 'tonal'
import { Card, Button, LevelBadge, CategoryBadge } from '@/components/ui'
import { Fretboard } from '@/components/fretboard'
import { LessonExercise } from '@/components/lessons/LessonExercise'
import { LessonResults } from '@/components/lessons/LessonResults'
import { NOTE_COLORS } from '@/lib/tonal'
import { useAppStore } from '@/store'
import level1 from '@/data/lessons/level1.json'
import level2 from '@/data/lessons/level2.json'
import type { Lesson, SessionResult } from '@/types/lesson'
import type { Level } from '@/types'

const ALL_LESSONS: Lesson[] = [...(level1 as unknown as Lesson[]), ...(level2 as unknown as Lesson[])]

type LessonPhase = 'intro' | 'exercise' | 'results'

// ─── Lesson not found ─────────────────────────────────────────────────────────
function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16 gap-4">
      <div className="text-5xl">🎸</div>
      <p className="text-muted">Nie znaleziono lekcji.</p>
      <Button onClick={() => navigate('/learn')}>← Wróć do listy</Button>
    </div>
  )
}

// ─── Lesson intro ─────────────────────────────────────────────────────────────
interface IntroProps {
  lesson: Lesson
  lessonIndex: number
  totalLessons: number
  prevId: string | null
  nextId: string | null
  onStart: () => void
}

function LessonIntro({ lesson, lessonIndex, totalLessons, prevId, nextId, onStart }: IntroProps) {
  const navigate = useNavigate()
  const { instrument } = useAppStore()
  const { content, xp_reward, duration_minutes } = lesson
  const exercise = content.exercise

  const previewPCs = useMemo(
    () => [...new Set(exercise.notes_to_play.map((n) => Note.pitchClass(n) || n.replace(/\d+$/, '')))],
    [exercise.notes_to_play]
  )

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/learn')}
          className="text-muted hover:text-text transition-colors text-lg leading-none"
          aria-label="Wróć do listy"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-subtle">{lessonIndex + 1} / {totalLessons}</span>
            <CategoryBadge category={lesson.category} />
          </div>
          <h1 className="text-lg font-bold text-text dark:text-slate-100 truncate mt-0.5">{lesson.title}</h1>
        </div>
        <LevelBadge level={lesson.level as Level} />
      </div>

      {/* Meta */}
      <div className="flex gap-3 text-xs text-muted">
        <span>+{xp_reward} XP</span>
        <span>·</span>
        <span>~{duration_minutes} min</span>
        <span>·</span>
        <span>{exercise.notes_to_play.length * (exercise.repeat ?? 1)} nut</span>
      </div>

      {/* Theory */}
      <Card padding="md">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Teoria</p>
        <p className="text-sm text-text dark:text-slate-300 leading-relaxed">{content.theory}</p>
      </Card>

      {/* Tips */}
      {content.tips.length > 0 && (
        <Card padding="md">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Wskazówki</p>
          <ul className="space-y-2">
            {content.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted">
                <span className="text-brand-400 shrink-0">›</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Exercise preview */}
      <Card padding="md">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Ćwiczenie</p>
        <p className="text-sm text-muted mb-3">{exercise.description}</p>

        {/* Note pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {exercise.notes_to_play.map((n, i) => {
            const pc = Note.pitchClass(n) || n.replace(/\d+$/, '')
            return (
              <span
                key={i}
                className="text-xs font-bold px-2 py-1 rounded-lg text-white"
                style={{ backgroundColor: NOTE_COLORS[pc] ?? '#64748b' }}
              >
                {pc}
              </span>
            )
          })}
          {exercise.repeat > 1 && (
            <span className="text-xs text-subtle self-center">× {exercise.repeat}</span>
          )}
        </div>

        {/* Fretboard preview */}
        <Fretboard
          instrument={instrument}
          highlightPCs={previewPCs}
          rootPC={previewPCs[0]}
          startFret={0}
          endFret={12}
          showNoteNames
        />
      </Card>

      {/* Start CTA */}
      <Button className="w-full" size="lg" onClick={onStart}>
        Zacznij ćwiczenie →
      </Button>

      {/* Prev / Next lesson navigation */}
      <div className="flex gap-2 pt-1">
        {prevId ? (
          <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate(`/learn/lesson/${prevId}`)}>
            ← Poprzednia
          </Button>
        ) : <div className="flex-1" />}
        {nextId ? (
          <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate(`/learn/lesson/${nextId}`)}>
            Następna →
          </Button>
        ) : <div className="flex-1" />}
      </div>
    </div>
  )
}

// ─── Main route component ─────────────────────────────────────────────────────
export function LessonPage() {
  const { id } = useParams<{ id: string }>()
  const { instrument } = useAppStore()
  const [phase, setPhase] = useState<LessonPhase>('intro')
  const [result, setResult] = useState<SessionResult | null>(null)

  const lessonIndex = ALL_LESSONS.findIndex((l) => l.id === id)
  const lesson = ALL_LESSONS[lessonIndex] ?? null
  const prevLesson = lessonIndex > 0 ? ALL_LESSONS[lessonIndex - 1] : null
  const nextLesson = lessonIndex < ALL_LESSONS.length - 1 ? ALL_LESSONS[lessonIndex + 1] : null

  if (!lesson) return <NotFound />

  function handleExerciseComplete(r: SessionResult) {
    setResult(r)
    setPhase('results')
  }

  function handleRetry() {
    setResult(null)
    setPhase('intro')
  }

  return (
    <div className="min-h-full">
      {phase === 'intro' && (
        <LessonIntro
          lesson={lesson}
          lessonIndex={lessonIndex}
          totalLessons={ALL_LESSONS.length}
          prevId={prevLesson?.id ?? null}
          nextId={nextLesson?.id ?? null}
          onStart={() => setPhase('exercise')}
        />
      )}

      {phase === 'exercise' && (
        <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
          {/* Compact header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPhase('intro')}
              className="text-muted hover:text-text transition-colors text-lg"
              aria-label="Wróć do opisu"
            >
              ←
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted truncate">Lekcja {lessonIndex + 1}</p>
              <p className="text-sm font-semibold text-text dark:text-slate-200 truncate">{lesson.title}</p>
            </div>
          </div>

          <LessonExercise
            lesson={lesson}
            instrument={instrument}
            onComplete={handleExerciseComplete}
          />
        </div>
      )}

      {phase === 'results' && result && (
        <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-text dark:text-slate-100">Wyniki lekcji</h1>
          </div>

          <LessonResults
            result={result}
            nextLessonId={nextLesson?.id ?? null}
            onRetry={handleRetry}
          />
        </div>
      )}
    </div>
  )
}
