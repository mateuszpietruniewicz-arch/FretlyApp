import type { JamLoop } from '@/hooks/useJamSession'

interface Props {
  selectedLoop: JamLoop | null
  isPlaying: boolean
  isLoading: boolean
  bpm: number
  volume: number
  error: string | null
  onPlay: () => void
  onStop: () => void
  onBpmChange: (bpm: number) => void
  onVolumeChange: (vol: number) => void
}

export function JamControls({
  selectedLoop,
  isPlaying,
  isLoading,
  bpm,
  volume,
  error,
  onPlay,
  onStop,
  onBpmChange,
  onVolumeChange,
}: Props) {
  return (
    <div className="space-y-5">
      {/* Loop info */}
      {selectedLoop ? (
        <div className="bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedLoop.style === 'breeze' ? '🌊' : '🔀'}</span>
            <div>
              <div className="text-sm font-semibold text-text dark:text-slate-200">{selectedLoop.label}</div>
              <div className="text-xs text-muted">
                {selectedLoop.bpm} BPM oryginalnie · aktualnie {bpm} BPM
              </div>
            </div>
            {isPlaying && (
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400 font-semibold">PLAY</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-surface-2 dark:bg-slate-900/50 border border-dashed border-border dark:border-slate-700 rounded-2xl px-4 py-3 text-center text-sm text-muted">
          Wybierz loop z listy po lewej
        </div>
      )}

      {/* Play / Stop */}
      <div className="flex gap-3 justify-center">
        {isPlaying ? (
          <button
            onClick={onStop}
            className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white flex items-center justify-center text-3xl shadow-lg shadow-red-900/40 transition-all active:scale-95"
            aria-label="Stop"
          >
            ■
          </button>
        ) : (
          <button
            onClick={onPlay}
            disabled={!selectedLoop || isLoading}
            className="w-20 h-20 rounded-full bg-brand-600 hover:bg-brand-500 active:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center text-3xl shadow-lg shadow-brand-900/40 transition-all active:scale-95"
            aria-label="Play"
          >
            {isLoading ? (
              <span className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              '▶'
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}

      {/* BPM slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-baseline">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">Tempo</label>
          <span className="text-lg font-bold text-text dark:text-slate-100">{bpm} <span className="text-xs text-muted font-normal">BPM</span></span>
        </div>
        <input
          type="range"
          min={40}
          max={200}
          step={1}
          value={bpm}
          onChange={(e) => onBpmChange(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
        <div className="flex justify-between text-[10px] text-subtle">
          <span>40</span>
          <span>Oryginalny: {selectedLoop?.bpm ?? '—'}</span>
          <span>200</span>
        </div>
      </div>

      {/* Volume slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-baseline">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">Głośność</label>
          <span className="text-sm font-semibold text-text dark:text-slate-200">{volume}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
      </div>
    </div>
  )
}
