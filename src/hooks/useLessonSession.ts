import { useState, useEffect, useRef, useCallback } from 'react'
import { Note } from 'tonal'
import type { NoteAttempt, NoteStatus } from '@/types/lesson'

export type SessionFeedback = 'correct' | 'wrong' | null
export type SessionPhase = 'waiting' | 'cooldown' | 'complete'

export interface SessionState {
  phase: SessionPhase
  currentIndex: number
  attempts: NoteAttempt[]
  lastFeedback: SessionFeedback
  lastDetectedPC: string | null
}

export interface UseLessonSessionReturn extends SessionState {
  skip: () => void
  reset: () => void
  complete: () => void
}

function extractPC(note: string): string {
  return Note.pitchClass(note) || note.replace(/\d+$/, '')
}

function buildAttempts(notes: string[]): NoteAttempt[] {
  return notes.map((n) => ({
    expected: n,
    expectedPC: extractPC(n),
    status: 'pending' as NoteStatus,
  }))
}

const CORRECT_COOLDOWN_MS = 700
const WRONG_COOLDOWN_MS = 350
const CONSECUTIVE_REQUIRED = 3

export function useLessonSession(
  notes: string[],
  detectedPC: string | null,
  silence: boolean
): UseLessonSessionReturn {
  const [state, setState] = useState<SessionState>(() => ({
    phase: 'waiting',
    currentIndex: 0,
    attempts: buildAttempts(notes),
    lastFeedback: null,
    lastDetectedPC: null,
  }))

  // Refs so effect callbacks never stale-close over state
  const phaseRef = useRef<SessionPhase>('waiting')
  const consecutiveRef = useRef(0)
  const lastPCRef = useRef<string | null>(null)
  const notesRef = useRef(notes)
  notesRef.current = notes

  // Detect and advance
  useEffect(() => {
    if (phaseRef.current !== 'waiting') return

    if (silence || !detectedPC) {
      consecutiveRef.current = 0
      lastPCRef.current = null
      return
    }

    if (detectedPC === lastPCRef.current) {
      consecutiveRef.current++
    } else {
      lastPCRef.current = detectedPC
      consecutiveRef.current = 1
      return
    }

    if (consecutiveRef.current < CONSECUTIVE_REQUIRED) return

    // Enough consecutive frames — accept this detection
    consecutiveRef.current = 0
    lastPCRef.current = null

    setState((prev) => {
      if (prev.phase !== 'waiting') return prev
      const { currentIndex, attempts } = prev
      if (currentIndex >= notesRef.current.length) return prev

      const expectedPC = attempts[currentIndex].expectedPC
      const isCorrect = detectedPC === expectedPC

      const newAttempts = attempts.map((a, i) =>
        i === currentIndex
          ? { ...a, status: (isCorrect ? 'correct' : 'wrong') as NoteStatus, detectedPC: isCorrect ? undefined : detectedPC }
          : a
      )

      phaseRef.current = 'cooldown'
      return {
        ...prev,
        phase: 'cooldown',
        attempts: newAttempts,
        lastFeedback: isCorrect ? 'correct' : 'wrong',
        lastDetectedPC: isCorrect ? null : detectedPC,
      }
    })
  }, [detectedPC, silence])

  // Cooldown timer
  useEffect(() => {
    if (state.phase !== 'cooldown') return

    const delay = state.lastFeedback === 'correct' ? CORRECT_COOLDOWN_MS : WRONG_COOLDOWN_MS

    const timer = setTimeout(() => {
      setState((prev) => {
        if (prev.phase !== 'cooldown') return prev

        if (prev.lastFeedback === 'correct') {
          const nextIndex = prev.currentIndex + 1
          const isComplete = nextIndex >= notesRef.current.length
          const nextPhase: SessionPhase = isComplete ? 'complete' : 'waiting'
          phaseRef.current = nextPhase
          return { ...prev, phase: nextPhase, currentIndex: nextIndex, lastFeedback: null, lastDetectedPC: null }
        }

        // Wrong note: stay on same note
        phaseRef.current = 'waiting'
        return { ...prev, phase: 'waiting', lastFeedback: null, lastDetectedPC: null }
      })
    }, delay)

    return () => clearTimeout(timer)
  }, [state.phase, state.lastFeedback])

  const skip = useCallback(() => {
    setState((prev) => {
      if (prev.phase === 'complete') return prev
      const newAttempts = prev.attempts.map((a, i) =>
        i === prev.currentIndex ? { ...a, status: 'skipped' as NoteStatus } : a
      )
      const nextIndex = prev.currentIndex + 1
      const isComplete = nextIndex >= notesRef.current.length
      const nextPhase: SessionPhase = isComplete ? 'complete' : 'waiting'
      phaseRef.current = nextPhase
      consecutiveRef.current = 0
      lastPCRef.current = null
      return { ...prev, phase: nextPhase, currentIndex: nextIndex, attempts: newAttempts, lastFeedback: null, lastDetectedPC: null }
    })
  }, [])

  const reset = useCallback(() => {
    phaseRef.current = 'waiting'
    consecutiveRef.current = 0
    lastPCRef.current = null
    setState({
      phase: 'waiting',
      currentIndex: 0,
      attempts: buildAttempts(notesRef.current),
      lastFeedback: null,
      lastDetectedPC: null,
    })
  }, [])

  const complete = useCallback(() => {
    phaseRef.current = 'complete'
    setState((prev) => ({ ...prev, phase: 'complete', lastFeedback: null }))
  }, [])

  return { ...state, skip, reset, complete }
}
