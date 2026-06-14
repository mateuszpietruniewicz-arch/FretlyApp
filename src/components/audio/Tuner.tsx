import { useEffect } from 'react'
import { useAudio } from '@/hooks/useAudio'
import { usePitchDetection } from '@/hooks/usePitchDetection'
import { AudioSourceSelector } from './AudioSourceSelector'
import { noteColor } from '@/lib/tonal'

const CENTS_RANGE = 50

function TunerNeedle({ cents }: { cents: number }) {
  // Map -50..+50 to 0..100% position
  const pct = ((cents + CENTS_RANGE) / (CENTS_RANGE * 2)) * 100
  const inTune = Math.abs(cents) <= 10

  return (
    <div className="relative w-full h-14 bg-slate-900 rounded-xl overflow-hidden">
      {/* Center line */}
      <div className="absolute inset-y-0 left-1/2 w-px bg-slate-700" />

      {/* ±10 cent zone */}
      <div className="absolute inset-y-0 left-[45%] w-[10%] bg-green-900/40 rounded" />

      {/* Tick marks */}
      {[-50, -25, 0, 25, 50].map((v) => (
        <div
          key={v}
          className="absolute bottom-2 w-px h-3 bg-slate-600"
          style={{ left: `${((v + 50) / 100) * 100}%` }}
        />
      ))}
      <div className="absolute bottom-0 left-[8%] text-[10px] text-slate-600">-50</div>
      <div className="absolute bottom-0 right-[5%] text-[10px] text-slate-600">+50</div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">0</div>

      {/* Needle */}
      <div
        className="absolute top-2 w-0.5 h-8 rounded-full transition-all duration-75"
        style={{
          left: `${pct}%`,
          transform: 'translateX(-50%)',
          backgroundColor: inTune ? '#22c55e' : '#f97316',
          boxShadow: inTune ? '0 0 8px #22c55e' : '0 0 8px #f97316',
        }}
      />
    </div>
  )
}

export function Tuner() {
  const audio = useAudio()
  const { pitch, silence, isDetecting, startDetection, stopDetection } = usePitchDetection()

  useEffect(() => {
    if (audio.isReady && audio.analyser && audio.audioContext) {
      startDetection(audio.analyser, audio.audioContext.sampleRate)
    } else {
      stopDetection()
    }
    return stopDetection
  }, [audio.isReady, audio.analyser, audio.audioContext, startDetection, stopDetection])

  const color = pitch ? noteColor(pitch.pitchClass) : '#475569'
  const inTune = pitch ? pitch.inTune : false

  return (
    <div className="flex flex-col gap-5">
      {/* Note display */}
      <div className="flex flex-col items-center justify-center bg-slate-900 rounded-3xl py-8 gap-2">
        <div
          className="text-8xl font-bold transition-colors duration-150 leading-none"
          style={{ color }}
        >
          {pitch ? pitch.pitchClass : '—'}
        </div>
        <div className="text-2xl text-slate-500">
          {pitch ? pitch.octave : ''}
        </div>
        <div className="mt-1 flex items-center gap-2">
          {pitch && (
            <>
              <span className="text-sm text-slate-400">{pitch.frequency} Hz</span>
              <span
                className="text-sm font-semibold"
                style={{ color: inTune ? '#22c55e' : '#f97316' }}
              >
                {pitch.cents > 0 ? `+${pitch.cents}` : pitch.cents} ¢
              </span>
            </>
          )}
          {silence && isDetecting && (
            <span className="text-sm text-slate-600">Graj nutę…</span>
          )}
          {!isDetecting && (
            <span className="text-sm text-slate-600">Wciśnij Start</span>
          )}
        </div>
        {pitch && (
          <div
            className="mt-1 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: inTune ? '#15803d22' : '#9a340022',
              color: inTune ? '#22c55e' : '#f97316',
            }}
          >
            {inTune ? '✓ W stroju' : pitch.cents > 0 ? '▲ Za wysoko' : '▼ Za nisko'}
          </div>
        )}
      </div>

      {/* Needle */}
      {pitch && <TunerNeedle cents={pitch.cents} />}

      {/* Controls */}
      <button
        onClick={() => {
          if (audio.isReady) audio.stopAudio()
          else audio.startAudio()
        }}
        disabled={audio.isStarting}
        className={`w-full py-3.5 rounded-2xl text-sm font-semibold transition-all ${
          audio.isReady
            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            : 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-900/50'
        } disabled:opacity-50`}
      >
        {audio.isStarting ? 'Uruchamianie…' : audio.isReady ? 'Zatrzymaj' : 'Start'}
      </button>

      {audio.error && (
        <div className="text-sm text-red-400 bg-red-900/20 rounded-xl p-3 text-center">
          {audio.error}
        </div>
      )}

      <AudioSourceSelector
        devices={audio.devices}
        selectedDeviceId={audio.selectedDeviceId}
        onSelect={audio.selectDevice}
        disabled={audio.isStarting}
      />
    </div>
  )
}
