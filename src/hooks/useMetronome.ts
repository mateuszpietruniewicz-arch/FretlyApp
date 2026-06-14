import { useState, useRef, useCallback, useEffect } from 'react'
import * as Tone from 'tone'
import { triggerClick, setTransportBpm } from '@/lib/midi'

export interface UseMetronomeReturn {
  isPlaying: boolean
  bpm: number
  beat: number
  beatsPerMeasure: number
  setBpm: (bpm: number) => void
  setBeatsPerMeasure: (beats: number) => void
  toggle: () => Promise<void>
  tapTempo: () => void
}

const MIN_BPM = 20
const MAX_BPM = 300

export function useMetronome(initialBpm = 80): UseMetronomeReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpmState] = useState(initialBpm)
  const [beat, setBeat] = useState(0)
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4)

  const sequenceRef = useRef<Tone.Sequence | null>(null)
  const beatRef = useRef(0)
  const beatsPerMeasureRef = useRef(beatsPerMeasure)
  const tapTimesRef = useRef<number[]>([])

  useEffect(() => {
    beatsPerMeasureRef.current = beatsPerMeasure
  }, [beatsPerMeasure])

  const setBpm = useCallback((newBpm: number) => {
    const clamped = Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(newBpm)))
    setBpmState(clamped)
    setTransportBpm(clamped)
  }, [])

  const stop = useCallback(() => {
    sequenceRef.current?.stop()
    sequenceRef.current?.dispose()
    sequenceRef.current = null
    Tone.getTransport().stop()
    Tone.getTransport().cancel()
    setBeat(0)
    beatRef.current = 0
    setIsPlaying(false)
  }, [])

  const start = useCallback(async () => {
    await Tone.start()

    setTransportBpm(bpm)
    beatRef.current = 0

    const steps = Array.from({ length: beatsPerMeasure }, (_, i) => i)

    const seq = new Tone.Sequence(
      (time, step) => {
        const isAccent = step === 0
        triggerClick(isAccent, time)

        // Sync React state with audio clock
        Tone.getDraw().schedule(() => {
          setBeat(step as number)
          beatRef.current = ((step as number) + 1) % beatsPerMeasureRef.current
        }, time)
      },
      steps,
      '4n'
    )

    seq.start(0)
    sequenceRef.current = seq
    Tone.getTransport().start()
    setIsPlaying(true)
  }, [bpm, beatsPerMeasure])

  const toggle = useCallback(async () => {
    if (isPlaying) {
      stop()
    } else {
      await start()
    }
  }, [isPlaying, start, stop])

  const tapTempo = useCallback(() => {
    const now = performance.now()
    tapTimesRef.current.push(now)

    // Keep only the last 4 taps
    if (tapTimesRef.current.length > 4) {
      tapTimesRef.current = tapTimesRef.current.slice(-4)
    }

    if (tapTimesRef.current.length >= 2) {
      const intervals: number[] = []
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1])
      }
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
      const newBpm = Math.round(60000 / avg)
      setBpm(newBpm)
    }
  }, [setBpm])

  // Cleanup on unmount
  useEffect(() => () => stop(), [stop])

  return { isPlaying, bpm, beat, beatsPerMeasure, setBpm, setBeatsPerMeasure, toggle, tapTempo }
}
