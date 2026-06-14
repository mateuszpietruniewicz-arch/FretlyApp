import type { UseTabPlayback } from '@/hooks/useTabPlayback'
import { INSTRUMENT_LABELS, type TabInstrument } from '@/lib/audioSources'

interface Props {
  playback: UseTabPlayback
}

export function TabPlayback({ playback }: Props) {
  const { isPlaying, isLoading, error, selectedInstrument, setSelectedInstrument, play, stop, resetPlayback } = playback

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl border border-border dark:border-slate-700 bg-surface-2 dark:bg-slate-800/60">
      {/* Play / Stop */}
      <button
        onClick={isPlaying ? stop : play}
        disabled={isLoading}
        title={isPlaying ? 'Stop (Space)' : 'Odtwórz'}
        className={`
          w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold transition-all shrink-0
          disabled:opacity-40 disabled:cursor-not-allowed
          ${isPlaying
            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
          }
        `}
      >
        {isLoading ? (
          <span className="block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : isPlaying ? (
          '⏹'
        ) : (
          '▶'
        )}
      </button>

      {/* Reset to beginning */}
      <button
        onClick={resetPlayback}
        disabled={isLoading || isPlaying}
        title="Od początku"
        className="h-7 px-2.5 flex items-center justify-center rounded-lg text-[11px] font-semibold border border-border dark:border-slate-600 bg-surface dark:bg-slate-700 text-muted hover:text-text dark:hover:text-slate-200 hover:bg-surface-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ⏮ Od początku
      </button>

      <div className="w-px h-5 bg-border dark:bg-slate-600 shrink-0" />

      {/* Instrument selector */}
      <select
        value={selectedInstrument}
        onChange={(e) => setSelectedInstrument(e.target.value as TabInstrument)}
        disabled={isLoading || isPlaying}
        className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-border dark:border-slate-600 bg-surface dark:bg-slate-700 text-text dark:text-slate-200 disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
      >
        {(Object.keys(INSTRUMENT_LABELS) as TabInstrument[]).map((key) => (
          <option key={key} value={key}>{INSTRUMENT_LABELS[key]}</option>
        ))}
      </select>

      {/* Error */}
      {error && (
        <span className="text-[11px] text-rose-400 ml-1 truncate max-w-xs" title={error}>
          ⚠ {error}
        </span>
      )}

      {/* Playing indicator */}
      {isPlaying && !error && (
        <span className="text-[11px] text-emerald-400 font-semibold ml-auto shrink-0">
          ● Odtwarzanie
        </span>
      )}
    </div>
  )
}
