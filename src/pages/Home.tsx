import { Link } from 'react-router-dom'
import { useAppStore } from '@/store'
import type { Instrument } from '@/types'

export function HomePage() {
  const { instrument, setInstrument, stats } = useAppStore()

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Cześć!</h1>
        <p className="text-slate-400 text-sm">Wybierz instrument i zacznij grać.</p>
      </div>

      <div className="flex gap-3 mb-8">
        {(['guitar', 'bass'] as Instrument[]).map((i) => (
          <button
            key={i}
            onClick={() => setInstrument(i)}
            className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all ${
              instrument === i
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {i === 'guitar' ? '🎸 Gitara' : '🎵 Gitara basowa'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-brand-400">{stats?.total_xp ?? 0}</div>
          <div className="text-xs text-slate-500 mt-1">XP</div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">{stats?.streak_days ?? 0} 🔥</div>
          <div className="text-xs text-slate-500 mt-1">Dni z rzędu</div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-300">Szybki start</h2>
        <QuickCard to="/tools/tuner" icon="🎵" title="Tuner" desc="Nastroić gitarę" />
        <QuickCard to="/tools/metronome" icon="🥁" title="Metronom" desc="Ćwicz rytm" />
        <QuickCard to="/learn" icon="📚" title="Lekcje" desc="Kontynuuj naukę" />
        <QuickCard to="/jam" icon="🎛️" title="Jam" desc="Graj z loopem" />
      </div>
    </div>
  )
}

function QuickCard({ to, icon, title, desc }: { to: string; icon: string; title: string; desc: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 bg-slate-800 rounded-2xl px-4 py-3 hover:bg-slate-700 transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-slate-500">{desc}</div>
      </div>
      <span className="ml-auto text-slate-600">›</span>
    </Link>
  )
}
