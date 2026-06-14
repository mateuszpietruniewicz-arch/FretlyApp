import { Link } from 'react-router-dom'
import { useAppStore } from '@/store'
import { Card } from '@/components/ui'
import { Fretboard } from '@/components/fretboard'
import type { Instrument } from '@/types'

/* Abstract string-dot visualisation for instrument picker */
function StringDots({ count, active }: { count: number; active: boolean }) {
  const strings = Array.from({ length: count }, (_, i) => i)
  const colors = ['#ef4444','#ec4899','#a855f7','#3b82f6','#22c55e','#f97316']
  return (
    <div className="flex flex-col gap-1.5 items-center">
      {strings.map((i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-200"
          style={{
            width: `${28 + (count - 1 - i) * 4}px`,
            height: '3px',
            backgroundColor: active ? colors[i % colors.length] : '#334155',
            opacity: active ? 1 : 0.5,
          }}
        />
      ))}
    </div>
  )
}

const INSTRUMENT_OPTIONS: { id: Instrument; label: string; sub: string; strings: number }[] = [
  { id: 'guitar', label: 'Gitara elektryczna', sub: '6 strun', strings: 6 },
  { id: 'bass',   label: 'Gitara basowa',     sub: '4 struny',  strings: 4 },
]

export function HomePage() {
  const { instrument, setInstrument, stats } = useAppStore()

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text dark:text-slate-100">Cześć!</h1>
        <p className="text-sm text-muted mt-0.5">Wybierz instrument i zacznij grać.</p>
      </div>

      {/* Instrument selector */}
      <div className="grid grid-cols-2 gap-3">
        {INSTRUMENT_OPTIONS.map(({ id, label, sub, strings }) => {
          const active = instrument === id
          return (
            <button
              key={id}
              onClick={() => setInstrument(id)}
              className={`rounded-2xl p-4 flex flex-col items-center gap-3 transition-all border-2 ${
                active
                  ? 'border-brand-500 bg-brand-900/20 dark:bg-brand-900/30'
                  : 'border-border dark:border-slate-700 bg-surface dark:bg-slate-800 hover:border-brand-500/40'
              }`}
            >
              <StringDots count={strings} active={active} />
              <div className="text-center">
                <div className={`text-sm font-semibold ${active ? 'text-brand-400' : 'text-text dark:text-slate-300'}`}>
                  {label}
                </div>
                <div className="text-xs text-muted mt-0.5">{sub}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Mini fretboard preview */}
      <Card padding="md">
        <p className="text-xs text-muted mb-3">Podgląd gryfu</p>
        <Fretboard
          instrument={instrument}
          startFret={0}
          endFret={5}
          showNoteNames={false}
        />
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <Card padding="md" className="text-center">
          <div className="text-2xl font-bold text-brand-400">{stats?.total_xp ?? 0}</div>
          <div className="text-xs text-muted mt-1">XP zdobyte</div>
        </Card>
        <Card padding="md" className="text-center">
          <div className="text-2xl font-bold text-orange-400">{stats?.streak_days ?? 0} 🔥</div>
          <div className="text-xs text-muted mt-1">Dni z rzędu</div>
        </Card>
      </div>

      {/* Quick access */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider">Szybki start</p>
        <QuickLink to="/tools/tuner"    icon="🎵" label="Tuner"   desc="Nastroić gitarę" />
        <QuickLink to="/tools/metronome" icon="🥁" label="Metronom" desc="Ćwicz rytm" />
        <QuickLink to="/learn"           icon="📚" label="Lekcje"  desc="Kontynuuj naukę" />
        <QuickLink to="/jam"             icon="🎛️" label="Jam"     desc="Graj z loopem" />
      </div>
    </div>
  )
}

function QuickLink({ to, icon, label, desc }: { to: string; icon: string; label: string; desc: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-2xl px-4 py-3 hover:border-brand-500/50 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <div>
        <div className="text-sm font-semibold text-text dark:text-slate-200">{label}</div>
        <div className="text-xs text-muted">{desc}</div>
      </div>
      <span className="ml-auto text-subtle">›</span>
    </Link>
  )
}
