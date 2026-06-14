import { useState, useRef, useCallback, useMemo, useEffect } from 'react'

const MAX_TAPS     = 8
const RESET_MS     = 3000
const MIN_TAPS_BPM = 2

export function TapTempo() {
  const [taps, setTaps]     = useState<number[]>([])
  const [flash, setFlash]   = useState(false)
  const resetTimerRef        = useRef<ReturnType<typeof setTimeout> | null>(null)

  const bpm = useMemo<number | null>(() => {
    if (taps.length < MIN_TAPS_BPM) return null
    const diffs = taps.slice(1).map((t, i) => t - taps[i])
    const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length
    return Math.round(60000 / avg)
  }, [taps])

  const scheduleReset = useCallback(() => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    resetTimerRef.current = setTimeout(() => setTaps([]), RESET_MS)
  }, [])

  const tap = useCallback(() => {
    const now = Date.now()
    setTaps((prev) => [...prev, now].slice(-MAX_TAPS))
    setFlash(true)
    setTimeout(() => setFlash(false), 80)
    scheduleReset()
  }, [scheduleReset])

  const reset = useCallback(() => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    setTaps([])
  }, [])

  // Spacebar → tap (skip when focus is in form fields)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      e.preventDefault()
      tap()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tap])

  useEffect(() => () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
  }, [])

  const tapCount   = taps.length
  const statusText =
    tapCount === 0 ? 'Stuknij, aby rozpocząć'
    : tapCount === 1 ? '1 tapnięcie'
    : `${tapCount} tapnięcia`

  return (
    <div className="flex flex-col items-center gap-6 py-8 select-none">
      {/* BPM display */}
      <div className="text-center">
        <div
          className={`text-8xl font-black leading-none tabular-nums transition-all duration-75 ${
            flash ? 'text-brand-500 scale-105' : 'text-text dark:text-slate-100'
          }`}
        >
          {bpm !== null ? bpm : '---'}
        </div>
        <div className="text-xl font-semibold text-muted mt-1 tracking-widest uppercase">BPM</div>
      </div>

      {/* Tap count */}
      <p className="text-sm text-muted">{statusText}</p>

      {/* TAP button */}
      <button
        onClick={tap}
        aria-label="Tap tempo"
        className={`
          flex items-center justify-center rounded-full font-black text-3xl tracking-widest
          text-white shadow-2xl transition-all duration-75
          active:scale-95 active:brightness-90
          min-w-[200px] min-h-[200px] w-52 h-52
          ${flash
            ? 'bg-brand-500 shadow-brand-500/40'
            : 'bg-brand-600 hover:bg-brand-500 shadow-brand-600/30'
          }
        `}
      >
        TAP
      </button>

      {/* Reset */}
      <button
        onClick={reset}
        disabled={tapCount === 0}
        className="px-6 py-2 rounded-xl text-sm font-semibold text-muted border border-border dark:border-slate-700 bg-surface-2 dark:bg-slate-800 hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Reset
      </button>

      <p className="text-xs text-subtle">lub naciśnij Spację</p>

      {/* Confidence note */}
      {tapCount >= MIN_TAPS_BPM && tapCount < 4 && (
        <p className="text-[11px] text-subtle">
          Stukaj dalej — dokładność rośnie z liczbą tapnięć
        </p>
      )}
    </div>
  )
}
