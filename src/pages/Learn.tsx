import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store'
import { Card } from '@/components/ui'
import { LevelBadge, CategoryBadge } from '@/components/ui'
import level1 from '@/data/lessons/level1.json'
import level2 from '@/data/lessons/level2.json'
import type { Level } from '@/types'

const ALL_LESSONS = [...level1, ...level2]

type CategoryFilter = 'all' | 'notes' | 'scales' | 'chords' | 'theory' | 'technique'

const FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: 'all',       label: 'Wszystkie' },
  { id: 'notes',     label: '🎵 Nuty' },
  { id: 'scales',    label: '🎼 Skale' },
  { id: 'chords',    label: '🎸 Akordy' },
  { id: 'theory',    label: '📖 Teoria' },
  { id: 'technique', label: '🤙 Technika' },
]

export function LearnPage() {
  const navigate = useNavigate()
  const { stats, instrument } = useAppStore()
  const currentLevel: Level = ((stats?.current_level ?? 1) as Level)
  const [filter, setFilter] = useState<CategoryFilter>('all')

  const lessons = ALL_LESSONS.filter((l) => {
    const matchInstrument = l.instrument === instrument || l.instrument === 'both'
    const matchCategory = filter === 'all' || l.category === filter
    return matchInstrument && matchCategory
  })

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-slate-100">Nauka</h1>
        <LevelBadge level={currentLevel} />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
              filter === id
                ? 'bg-brand-600 text-white'
                : 'bg-surface dark:bg-slate-800 text-muted border border-border dark:border-slate-700 hover:border-brand-500/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Lesson list */}
      <div className="space-y-2.5">
        {lessons.map((lesson) => (
          <Card key={lesson.id} interactive padding="md" className="flex items-start gap-4" onClick={() => navigate(`/learn/lesson/${lesson.id}`)}>
            <div className="w-10 h-10 rounded-xl bg-brand-900/30 dark:bg-brand-900/40 flex items-center justify-center shrink-0 text-lg">
              {{ notes: '🎵', scales: '🎼', chords: '🎸', theory: '📖', technique: '🤙' }[lesson.category] ?? '📚'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-semibold text-text dark:text-slate-200 truncate">{lesson.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <CategoryBadge category={lesson.category} />
                <span className="text-[11px] text-muted">+{lesson.xp_reward} XP</span>
                <span className="text-[11px] text-subtle">~{lesson.duration_minutes} min</span>
              </div>
            </div>
            <span className="text-subtle shrink-0">›</span>
          </Card>
        ))}

        {lessons.length === 0 && (
          <div className="text-center py-12 text-muted text-sm">
            Brak lekcji dla wybranego filtra.
          </div>
        )}
      </div>

      <p className="text-xs text-subtle text-center">
        Możesz swobodnie skakać między lekcjami — poziom to sugestia, nie blokada.
      </p>
    </div>
  )
}
