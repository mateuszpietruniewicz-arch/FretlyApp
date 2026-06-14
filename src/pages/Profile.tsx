import { useAppStore } from '@/store'
import { LEVEL_NAMES } from '@/types'
import { Card, LevelBadge } from '@/components/ui'
import type { Level } from '@/types'

const XP_PER_LEVEL = [0, 100, 300, 700, 1500, 3000]

export function ProfilePage() {
  const { stats, user } = useAppStore()
  const level: Level = ((stats?.current_level ?? 1) as Level)
  const xp = stats?.total_xp ?? 0
  const nextXp = XP_PER_LEVEL[level] ?? 9999
  const prevXp = XP_PER_LEVEL[level - 1] ?? 0
  const progress = level >= 5 ? 100 : Math.min(100, Math.round(((xp - prevXp) / (nextXp - prevXp)) * 100))

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-slate-100">Profil</h1>
        <LevelBadge level={level} />
      </div>

      {user && (
        <Card padding="md" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
            {user.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <div className="text-sm font-semibold text-text dark:text-slate-200">{user.username}</div>
            <div className="text-xs text-muted">{user.email}</div>
          </div>
        </Card>
      )}

      {/* XP progress */}
      <Card padding="lg">
        <div className="flex justify-between items-end mb-3">
          <div>
            <div className="text-xs text-muted mb-1">Poziom</div>
            <div className="text-lg font-bold text-text dark:text-slate-100">
              {level} — {LEVEL_NAMES[level]}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted mb-1">XP</div>
            <div className="text-2xl font-bold text-brand-400">{xp}</div>
          </div>
        </div>
        <div className="h-2 bg-surface-2 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-subtle mt-1.5 text-right">
          {level < 5 ? `${xp} / ${nextXp} XP do poziomu ${level + 1}` : 'Poziom maksymalny!'}
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card padding="md" className="text-center">
          <div className="text-2xl font-bold text-orange-400">{stats?.streak_days ?? 0} 🔥</div>
          <div className="text-xs text-muted mt-1">Dni z rzędu</div>
        </Card>
        <Card padding="md" className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats?.badges?.length ?? 0} 🏆</div>
          <div className="text-xs text-muted mt-1">Odznaki</div>
        </Card>
      </div>

      {/* Badges */}
      <Card padding="md">
        <div className="text-sm font-semibold text-text dark:text-slate-200 mb-3">Odznaki</div>
        {(!stats?.badges || stats.badges.length === 0) ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🎸</div>
            <p className="text-sm text-muted">Ukończ pierwszą lekcję żeby odblokować odznakę.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {stats.badges.map((badge) => (
              <span key={badge} className="text-xs px-2.5 py-1 rounded-full bg-surface-2 dark:bg-slate-700 text-muted border border-border dark:border-slate-600">
                {badge}
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
