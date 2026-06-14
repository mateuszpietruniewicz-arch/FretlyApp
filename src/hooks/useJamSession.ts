import { useState, useEffect, useRef, useCallback } from 'react'
import * as Tone from 'tone'
import { parseMidiFile, type DrumVoice, type ParsedMidi } from '@/lib/midiParser'
import { DrumPlayer } from '@/lib/drumPlayer'
import manifestJson from '@/data/loops-manifest.json'

export type LoopStyle = 'breeze' | 'shuffle'
export type LoopRole = 'main' | 'fill' | 'intro' | 'outro'

export interface JamLoop {
  id: string
  filename: string
  bpm: number
  style: LoopStyle
  part: string
  role: LoopRole
  label: string
}

const LOOPS: JamLoop[] = manifestJson as unknown as JamLoop[]

type DrumPartValue = { voice: DrumVoice; velocity: number }

export interface JamState {
  loops: JamLoop[]
  selectedLoop: JamLoop | null
  isPlaying: boolean
  bpm: number
  volume: number
  selectedScale: string
  selectedKey: string
  isLoading: boolean
  error: string | null
}

export interface JamActions {
  selectLoop: (loop: JamLoop) => void
  play: () => Promise<void>
  stop: () => void
  setBpm: (bpm: number) => void
  setVolume: (vol: number) => void
  selectScale: (scale: string, key: string) => void
}

function volToDb(vol: number): number {
  if (vol <= 0) return -60
  return 20 * Math.log10(vol / 100) * 1.5  // gentle curve
}

export function useJamSession(): JamState & JamActions {
  const [state, setState] = useState<JamState>({
    loops: LOOPS,
    selectedLoop: null,
    isPlaying: false,
    bpm: 96,
    volume: 80,
    selectedScale: 'minor pentatonic',
    selectedKey: 'A',
    isLoading: false,
    error: null,
  })

  const playerRef = useRef<DrumPlayer | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const partRef = useRef<Tone.Part<any> | null>(null)
  const parsedMidiRef = useRef<ParsedMidi | null>(null)
  const isPlayingRef = useRef(false)
  const bpmRef = useRef(96)
  const bpmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { isPlayingRef.current = state.isPlaying }, [state.isPlaying])
  useEffect(() => { bpmRef.current = state.bpm }, [state.bpm])

  // Init synth drum player once
  useEffect(() => {
    playerRef.current = new DrumPlayer()
    return () => {
      playerRef.current?.dispose()
      playerRef.current = null
    }
  }, [])

  // Cleanup Transport on unmount
  useEffect(() => {
    return () => {
      partRef.current?.dispose()
      Tone.getTransport().stop()
      Tone.getTransport().cancel()
    }
  }, [])

  const scheduleLoop = useCallback((parsed: ParsedMidi, targetBpm: number) => {
    const player = playerRef.current
    if (!player) return

    partRef.current?.dispose()
    partRef.current = null
    Tone.getTransport().stop()
    Tone.getTransport().cancel()

    // Scale event times: same musical content but at different tempo
    const ratio = parsed.bpm / targetBpm
    const scaledEvents = parsed.events.map((e) => ({
      time: e.time * ratio,
      voice: e.voice,
      velocity: e.velocity,
    }))
    const loopDuration = parsed.duration * ratio

    const part = new Tone.Part(
      (time: number, event: DrumPartValue) => {
        player.play(event.voice, time, event.velocity)
      },
      scaledEvents as Array<DrumPartValue & { time: number }>
    )
    part.loop = true
    part.loopEnd = loopDuration
    part.start(0)

    partRef.current = part
    Tone.getTransport().start()
  }, [])

  const selectLoop = useCallback(
    (loop: JamLoop) => {
      if (isPlayingRef.current) {
        partRef.current?.dispose()
        partRef.current = null
        Tone.getTransport().stop()
        Tone.getTransport().cancel()
      }
      parsedMidiRef.current = null
      setState((prev) => ({
        ...prev,
        selectedLoop: loop,
        bpm: loop.bpm,
        isPlaying: false,
        error: null,
      }))
      bpmRef.current = loop.bpm
    },
    []
  )

  const play = useCallback(
    async () => {
      if (!state.selectedLoop) return
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        await Tone.start()

        // Load WAV samples if not already loaded
        if (playerRef.current && !playerRef.current.isLoaded) {
          await playerRef.current.load()
        }

        if (!parsedMidiRef.current) {
          const url = `/loops/${state.selectedLoop.filename}`
          parsedMidiRef.current = await parseMidiFile(url)
        }

        playerRef.current?.setVolume(volToDb(state.volume))
        scheduleLoop(parsedMidiRef.current, bpmRef.current)

        setState((prev) => ({ ...prev, isPlaying: true, isLoading: false }))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Błąd odtwarzania loopa'
        setState((prev) => ({ ...prev, isLoading: false, error: msg }))
      }
    },
    [state.selectedLoop, state.volume, scheduleLoop]
  )

  const stop = useCallback(() => {
    partRef.current?.dispose()
    partRef.current = null
    Tone.getTransport().stop()
    Tone.getTransport().cancel()
    setState((prev) => ({ ...prev, isPlaying: false }))
  }, [])

  const setBpm = useCallback(
    (bpm: number) => {
      bpmRef.current = bpm
      setState((prev) => ({ ...prev, bpm }))

      // Debounce loop restart to avoid rapid restarts while dragging slider
      if (bpmTimerRef.current) clearTimeout(bpmTimerRef.current)
      bpmTimerRef.current = setTimeout(() => {
        if (isPlayingRef.current && parsedMidiRef.current) {
          scheduleLoop(parsedMidiRef.current, bpm)
        }
      }, 300)
    },
    [scheduleLoop]
  )

  const setVolume = useCallback((vol: number) => {
    setState((prev) => ({ ...prev, volume: vol }))
    playerRef.current?.setVolume(volToDb(vol))
  }, [])

  const selectScale = useCallback((scale: string, key: string) => {
    setState((prev) => ({ ...prev, selectedScale: scale, selectedKey: key }))
  }, [])

  return { ...state, selectLoop, play, stop, setBpm, setVolume, selectScale }
}
