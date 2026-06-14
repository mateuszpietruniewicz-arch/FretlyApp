import { useAppStore } from '@/store/appStore'
import { LEVEL_NAMES } from '@/types'
import type { Level } from '@/types'

const XP_PER_LEVEL = [0, 100, 300, 700, 1500, 3000]

export function ProgressPage() {
  const { stats } = useAppStore()

  const level: Level = (stats?.current_level ?? 1) as Level
  const xp = stats?.total_xp ?? 0
  const nextLevelXp = XP_PER_LEVEL[level] ?? 9999
  const currentLevelXp = XP_PER_LEVEL[level - 1] ?? 0
  const progress = Math.min(100, Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100))

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Postępy</h1>
        <p className="text-slate-400 text-sm">Twój progres w nauce gitary.</p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-5 mb-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-xs text-slate-500 mb-1">Poziom</div>
            <div className="text-lg font-bold text-white">{level} — {LEVEL_NAMES[level]}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 mb-1">XP</div>
            <div className="text-lg font-bold text-brand-400">{xp}</div>
          </div>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-slate-600 mt-2 text-right">{xp} / {nextLevelXp} XP</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">{stats?.streak_days ?? 0}</div>
          <div className="text-xs text-slate-500 mt-1">Dni z rzędu 🔥</div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats?.badges?.length ?? 0}</div>
          <div className="text-xs text-slate-500 mt-1">Odznaki 🏆</div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-4">
        <div className="text-sm font-semibold text-slate-300 mb-3">Odznaki</div>
        {(!stats?.badges || stats.badges.length === 0) ? (
          <p className="text-xs text-slate-600 text-center py-4">
            Ukończ pierwszą lekcję żeby odblokować odznakę.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {stats.badges.map((badge) => (
              <span key={badge} className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
