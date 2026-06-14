import { LEVEL_NAMES } from '@/types'
import type { Level } from '@/types'
import { useAppStore } from '@/store/appStore'

const CATEGORIES = [
  { id: 'notes', label: 'Nuty', icon: '🎵', desc: 'Pojedyncze dźwięki i pozycje na gryfie' },
  { id: 'scales', label: 'Skale', icon: '🎼', desc: 'Pentatoniki, durowe, molowe' },
  { id: 'chords', label: 'Akordy', icon: '🎸', desc: 'Budowa i progresje akordowe' },
  { id: 'theory', label: 'Teoria', icon: '📖', desc: 'Interwały, rytm, harmonia' },
] as const

export function LearnPage() {
  const { stats } = useAppStore()
  const currentLevel: Level = (stats?.current_level ?? 1) as Level

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-white">Nauka</h1>
          <span className="text-xs px-2 py-1 rounded-full bg-brand-900/50 text-brand-300 border border-brand-800">
            Poziom {currentLevel}: {LEVEL_NAMES[currentLevel]}
          </span>
        </div>
        <p className="text-slate-400 text-sm">Wybierz kategorię do ćwiczenia.</p>
      </div>

      <div className="grid gap-3">
        {CATEGORIES.map(({ id, label, icon, desc }) => (
          <button
            key={id}
            className="flex items-center gap-4 bg-slate-800 rounded-2xl px-4 py-4 text-left hover:bg-slate-700 transition-colors w-full"
          >
            <span className="text-3xl">{icon}</span>
            <div>
              <div className="text-sm font-semibold text-white">{label}</div>
              <div className="text-xs text-slate-500">{desc}</div>
            </div>
            <span className="ml-auto text-slate-600">›</span>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-slate-900 rounded-2xl border border-slate-800">
        <p className="text-xs text-slate-500 text-center">
          Możesz swobodnie skakać między lekcjami — poziom to sugestia, nie blokada.
        </p>
      </div>
    </div>
  )
}
