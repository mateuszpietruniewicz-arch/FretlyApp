import { useState, useRef, useEffect, useCallback } from 'react'
import * as Tone from 'tone'
import { TabPlayer } from '@/lib/tabPlayer'
import { BEATS_PER_BAR } from '@/lib/tabUtils'
import type { TabInstrument } from '@/lib/audioSources'
import type { TabDocument } from '@/types/tab'

export interface PlaybackCursor {
  barIndex: number
  beatPosition: number
}

export interface UseTabPlayback {
  isPlaying: boolean
  isLoading: boolean
  error: string | null
  selectedInstrument: TabInstrument
  playbackCursor: PlaybackCursor | null
  setSelectedInstrument: (i: TabInstrument) => void
  play: () => Promise<void>
  stop: () => void
  resetPlayback: () => void
}

export function useTabPlayback(doc: TabDocument): UseTabPlayback {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedInstrument, setSelectedInstrument] = useState<TabInstrument>('guitar-electric')
  const [playbackCursor, setPlaybackCursor] = useState<PlaybackCursor | null>(null)

  const playerRef = useRef<TabPlayer | null>(null)
  const docRef    = useRef<TabDocument>(doc)
  const isPlayingRef = useRef(false)

  // Keep refs in sync
  useEffect(() => { docRef.current = doc }, [doc])

  // Cleanup on unmount
  useEffect(() => () => { playerRef.current?.dispose() }, [])

  // rAF loop for cursor movement
  useEffect(() => {
    if (!isPlaying) return

    let rafId: number

    function tick() {
      const currentDoc = docRef.current
      const bpb = BEATS_PER_BAR[currentDoc.timeSignature]
      const secsPerBeat = 60 / currentDoc.tempo
      const totalDocSecs = currentDoc.bars.length * bpb * secsPerBeat

      const secs = Tone.getTransport().seconds
      if (secs >= totalDocSecs) {
        // Playback finished
        playerRef.current?.stop()
        setIsPlaying(false)
        isPlayingRef.current = false
        setPlaybackCursor(null)
        return
      }

      const totalBeats = secs / secsPerBeat
      const barIndex   = Math.min(Math.floor(totalBeats / bpb), currentDoc.bars.length - 1)
      const beatPos    = +((totalBeats % bpb).toFixed(4))

      setPlaybackCursor({ barIndex, beatPosition: beatPos })
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isPlaying])

  const play = useCallback(async () => {
    if (isPlayingRef.current) {
      // Toggle stop
      playerRef.current?.stop()
      setIsPlaying(false)
      isPlayingRef.current = false
      setPlaybackCursor(null)
      return
    }

    if (docRef.current.bars.length === 0) return

    setError(null)
    setIsLoading(true)

    try {
      await Tone.start()  // unlock AudioContext (must be inside user gesture)

      if (!playerRef.current) {
        playerRef.current = new TabPlayer()
      }

      await playerRef.current.load(selectedInstrument)

      playerRef.current.scheduleDoc(docRef.current)
      playerRef.current.start()

      setIsPlaying(true)
      isPlayingRef.current = true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd odtwarzania')
    } finally {
      setIsLoading(false)
    }
  }, [selectedInstrument])

  const stop = useCallback(() => {
    playerRef.current?.stop()
    setIsPlaying(false)
    isPlayingRef.current = false
    setPlaybackCursor(null)
  }, [])

  const resetPlayback = useCallback(() => {
    stop()
    setPlaybackCursor(null)
  }, [stop])

  const handleSetInstrument = useCallback((i: TabInstrument) => {
    // Force reload on next play
    if (playerRef.current) {
      playerRef.current.dispose()
      playerRef.current = null
    }
    setSelectedInstrument(i)
    if (isPlayingRef.current) {
      setIsPlaying(false)
      isPlayingRef.current = false
      setPlaybackCursor(null)
    }
  }, [])

  return {
    isPlaying,
    isLoading,
    error,
    selectedInstrument,
    playbackCursor,
    setSelectedInstrument: handleSetInstrument,
    play,
    stop,
    resetPlayback,
  }
}
