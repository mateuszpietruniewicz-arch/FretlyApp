import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
import { saveProgress, updateStats } from '@/lib/progressService'
import { useAppStore } from '@/store'
import type { SessionResult } from '@/types/lesson'
import type { Level, UserStats } from '@/types'

interface Props {
  result: SessionResult
  nextLessonId: string | null
  onRetry: () => void
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '—'
  const s = Math.round(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}s`
}

const XP_THRESHOLDS = [0, 100, 300, 700, 1500, 3000]

export function LessonResults({ result, nextLessonId, onRetry }: Props) {
  const navigate = useNavigate()
  const { user, stats, setStats } = useAppStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newBadges, setNewBadges] = useState<string[]>([])

  const { accuracyPercent, correctCount, totalCount, xpReward, durationMs } = result

  const accuracyColor =
    accuracyPercent >= 80 ? 'text-green-400' :
    accuracyPercent >= 50 ? 'text-yellow-400' :
    'text-red-400'

  // Save progress to Supabase once
  useEffect(() => {
    if (!user || saved) return
    setSaving(true)

    const run = async () => {
      try {
        await saveProgress(user.id, result.lessonId, accuracyPercent, xpReward)
        const updated = await updateStats(user.id, xpReward, result.lessonId, accuracyPercent)
        if (updated) {
          // Find new badges
          const prevBadges = stats?.badges ?? []
          const gotNew = (updated.badges ?? []).filter((b: string) => !prevBadges.includes(b))
          setNewBadges(gotNew)
          setStats(updated as UserStats)
        }
      } catch (err) {
        console.error('Error saving progress:', err)
      } finally {
        setSaving(false)
        setSaved(true)
      }
    }
    run()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Local XP display (even without Supabase)
  const displayXp = xpReward
  const currentXp = (stats?.total_xp ?? 0)
  const currentLevel: Level = (stats?.current_level ?? 1) as Level
  const nextLevelXp = XP_THRESHOLDS[currentLevel] ?? 9999
  const prevLevelXp = XP_THRESHOLDS[currentLevel - 1] ?? 0
  const levelPct = currentLevel >= 5
    ? 100
    : Math.min(100, Math.round(((currentXp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100))

  return (
    <div className="space-y-4">
      {/* Accuracy circle */}
      <Card padding="lg" className="text-center">
        <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-4">Wynik sesji</p>

        <div className="inline-flex flex-col items-center justify-center w-28 h-28 rounded-full border-4 border-current mx-auto mb-4"
          style={{
            borderColor: accuracyPercent >= 80 ? '#22c55e' : accuracyPercent >= 50 ? '#f59e0b' : '#ef4444',
          }}
        >
          <span className={`text-3xl font-black ${accuracyColor}`}>{accuracyPercent}%</span>
          <span className="text-xs text-muted mt-0.5">celność</span>
        </div>

        {totalCount > 0 && (
          <p className="text-sm text-muted">
            {correctCount} z {totalCount} nut poprawnie
          </p>
        )}
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <Card padding="sm" className="text-center">
          <div className="text-xl font-bold text-green-400">✓ {correctCount}</div>
          <div className="text-[11px] text-muted mt-0.5">poprawne</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-xl font-bold text-red-400">
            ✗ {result.attempts.filter((a) => a.status === 'wrong').length}
          </div>
          <div className="text-[11px] text-muted mt-0.5">błędy</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-xl font-bold text-muted">{formatDuration(durationMs)}</div>
          <div className="text-[11px] text-muted mt-0.5">czas</div>
        </Card>
      </div>

      {/* XP earned */}
      <Card padding="md" className="flex items-center gap-4">
        <div className="text-2xl">🏆</div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-text dark:text-slate-200">
            +{displayXp} XP {saving && <span className="text-muted text-xs">(zapisuję...)</span>}
          </div>
          <div className="text-xs text-muted mt-0.5">Poziom {currentLevel} — {currentXp} XP</div>
          <div className="mt-1.5 h-1.5 bg-surface-2 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-700"
              style={{ width: `${levelPct}%` }}
            />
          </div>
        </div>
      </Card>

      {/* New badges */}
      {newBadges.length > 0 && (
        <Card padding="md" className="border-yellow-500/40">
          <p className="text-xs text-yellow-400 font-semibold mb-2">Nowe odznaki!</p>
          <div className="flex flex-wrap gap-2">
            {newBadges.map((b) => (
              <span key={b} className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                {b}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-2 pt-1">
        {nextLessonId && (
          <Button className="w-full" onClick={() => navigate(`/learn/lesson/${nextLessonId}`)}>
            Następna lekcja →
          </Button>
        )}
        <Button variant="secondary" className="w-full" onClick={onRetry}>
          Powtórz lekcję
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => navigate('/learn')}>
          ← Wróć do listy
        </Button>
      </div>
    </div>
  )
}
