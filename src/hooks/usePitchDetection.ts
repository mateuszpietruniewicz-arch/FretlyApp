import { useState, useEffect, useRef, useCallback } from 'react'
import { yin, rms } from '@/lib/yin'
import { freqToNote } from '@/lib/tonal'

export interface PitchData {
  note: string       // e.g. "A4"
  pitchClass: string // e.g. "A"
  octave: number
  frequency: number  // Hz
  cents: number      // -50..+50
  inTune: boolean    // within ±10 cents
}

export interface UsePitchDetectionReturn {
  pitch: PitchData | null
  silence: boolean
  isDetecting: boolean
  startDetection: (analyser: AnalyserNode, sampleRate: number) => void
  stopDetection: () => void
}

const SILENCE_THRESHOLD = 0.008
const IN_TUNE_CENTS = 10
const MIN_FREQ = 30   // Hz — below lowest bass string
const MAX_FREQ = 1200 // Hz — above highest guitar harmonic

export function usePitchDetection(): UsePitchDetectionReturn {
  const [pitch, setPitch] = useState<PitchData | null>(null)
  const [silence, setSilence] = useState(true)
  const [isDetecting, setIsDetecting] = useState(false)

  const rafRef = useRef<number>(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sampleRateRef = useRef<number>(44100)
  const bufferRef = useRef<Float32Array<ArrayBuffer> | null>(null)

  const detect = useCallback(() => {
    const analyser = analyserRef.current
    if (!analyser) return

    if (!bufferRef.current || bufferRef.current.length !== analyser.fftSize) {
      bufferRef.current = new Float32Array(analyser.fftSize)
    }

    analyser.getFloatTimeDomainData(bufferRef.current)
    const amplitude = rms(bufferRef.current)

    if (amplitude < SILENCE_THRESHOLD) {
      setSilence(true)
      setPitch(null)
      rafRef.current = requestAnimationFrame(detect)
      return
    }

    setSilence(false)
    const freq = yin(bufferRef.current, sampleRateRef.current)

    if (freq > 0 && freq >= MIN_FREQ && freq <= MAX_FREQ) {
      const data = freqToNote(freq)
      setPitch({
        note: data.name,
        pitchClass: data.pitchClass,
        octave: data.octave,
        frequency: Math.round(freq * 10) / 10,
        cents: data.cents,
        inTune: Math.abs(data.cents) <= IN_TUNE_CENTS,
      })
    }

    rafRef.current = requestAnimationFrame(detect)
  }, [])

  const startDetection = useCallback(
    (analyser: AnalyserNode, sampleRate: number) => {
      analyserRef.current = analyser
      sampleRateRef.current = sampleRate
      setIsDetecting(true)
      rafRef.current = requestAnimationFrame(detect)
    },
    [detect]
  )

  const stopDetection = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    analyserRef.current = null
    setIsDetecting(false)
    setPitch(null)
    setSilence(true)
  }, [])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  return { pitch, silence, isDetecting, startDetection, stopDetection }
}
