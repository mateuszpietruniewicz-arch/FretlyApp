import { useMetronome } from '@/hooks/useMetronome'
import { useAppStore } from '@/store'

export function Metronome() {
  const storedBpm = useAppStore((s) => s.metronomeBpm)
  const setStoredBpm = useAppStore((s) => s.setMetronomeBpm)

  const { isPlaying, bpm, beat, beatsPerMeasure, setBpm, setBeatsPerMeasure, toggle, tapTempo } =
    useMetronome(storedBpm)

  const handleBpmChange = (v: number) => {
    setBpm(v)
    setStoredBpm(v)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Beat dots */}
      <div className="bg-slate-900 rounded-3xl py-6 px-4">
        <div className="flex justify-center gap-3 mb-6">
          {Array.from({ length: beatsPerMeasure }, (_, i) => (
            <div
              key={i}
              className="flex-1 max-w-[56px] aspect-square rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-75"
              style={{
                backgroundColor:
                  isPlaying && beat === i
                    ? i === 0
                      ? '#7c3aed'
                      : '#1e40af'
                    : '#1e293b',
                color: isPlaying && beat === i ? '#fff' : '#475569',
                boxShadow: isPlaying && beat === i ? '0 0 16px rgba(124,58,237,0.5)' : 'none',
                transform: isPlaying && beat === i ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* BPM display */}
        <div className="text-center">
          <div className="text-5xl font-bold text-white">{bpm}</div>
          <div className="text-xs text-slate-500 mt-1">BPM</div>
        </div>
      </div>

      {/* BPM slider */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>20</span>
          <span className="text-slate-400">Tempo</span>
          <span>300</span>
        </div>
        <input
          type="range"
          min={20}
          max={300}
          value={bpm}
          onChange={(e) => handleBpmChange(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
      </div>

      {/* BPM quick-select */}
      <div className="flex gap-2 flex-wrap">
        {[60, 80, 100, 120, 140, 160].map((v) => (
          <button
            key={v}
            onClick={() => handleBpmChange(v)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              bpm === v
                ? 'bg-brand-700 text-brand-100'
                : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Metrum */}
      <div>
        <label className="block text-xs text-slate-500 mb-1.5">Metrum</label>
        <div className="flex gap-2">
          {[2, 3, 4, 6].map((n) => (
            <button
              key={n}
              onClick={() => setBeatsPerMeasure(n)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                beatsPerMeasure === n
                  ? 'bg-brand-700 text-white'
                  : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
              }`}
            >
              {n}/4
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={tapTempo}
          className="flex-1 py-3.5 rounded-2xl text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition-all"
        >
          TAP
        </button>
        <button
          onClick={toggle}
          className={`flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
            isPlaying
              ? 'bg-red-900/60 text-red-300 hover:bg-red-900/80'
              : 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-900/50'
          }`}
        >
          {isPlaying ? '⏹ Stop' : '▶ Start'}
        </button>
      </div>
    </div>
  )
}
