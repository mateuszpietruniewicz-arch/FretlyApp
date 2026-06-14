import { useState, useRef, useCallback, useEffect } from 'react'
import type { TabDocument, TabCursor, Duration, Dynamic, Technique } from '@/types/tab'
import {
  createEmptyDocument,
  addBar,
  setNote,
  removeNote,
  moveCursor,
  DURATION_BEATS,
  BEATS_PER_BAR,
} from '@/lib/tabUtils'

const MAX_HISTORY = 50

export interface TabEditorState {
  doc: TabDocument
  cursor: TabCursor
  selectedDuration: Duration
  selectedDynamic: Dynamic
  selectedTechniques: Technique[]
  historyLength: number
  canUndo: boolean
}

export interface TabEditorActions {
  setCursor: (c: TabCursor) => void
  setSelectedDuration: (d: Duration) => void
  setSelectedDynamic: (d: Dynamic) => void
  toggleTechnique: (t: Technique) => void
  deleteAtCursor: () => void
  undo: () => void
  addBarAction: () => void
  updateTitle: (title: string) => void
  updateTempo: (tempo: number) => void
  updateKey: (key: string) => void
  updateInstrument: (instrument: 'guitar' | 'bass') => void
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void
}

export function useTabEditor(): TabEditorState & TabEditorActions {
  const [doc, setDoc] = useState<TabDocument>(() => createEmptyDocument('guitar'))
  const [cursor, setCursor] = useState<TabCursor>({ barIndex: 0, string: 1, beatPosition: 0 })
  const [selectedDuration, setSelectedDuration] = useState<Duration>('4')
  const [selectedDynamic, setSelectedDynamic] = useState<Dynamic>('mf')
  const [selectedTechniques, setSelectedTechniques] = useState<Technique[]>([])
  const [history, setHistory] = useState<TabDocument[]>([])

  // Always-current refs for use inside timeouts
  const docRef = useRef(doc)
  const cursorRef = useRef(cursor)
  const durationRef = useRef(selectedDuration)
  const dynamicRef = useRef(selectedDynamic)
  const techniquesRef = useRef(selectedTechniques)

  useEffect(() => { docRef.current = doc }, [doc])
  useEffect(() => { cursorRef.current = cursor }, [cursor])
  useEffect(() => { durationRef.current = selectedDuration }, [selectedDuration])
  useEffect(() => { dynamicRef.current = selectedDynamic }, [selectedDynamic])
  useEffect(() => { techniquesRef.current = selectedTechniques }, [selectedTechniques])

  // Two-digit fret input state
  const pendingFretRef = useRef<string>('')
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pushHistory = useCallback((current: TabDocument) => {
    setHistory((prev) => [...prev.slice(-(MAX_HISTORY - 1)), current])
  }, [])

  const commitNote = useCallback(
    (fret: number | null) => {
      const currentDoc = docRef.current
      const currentCursor = cursorRef.current
      const dur = durationRef.current
      const dyn = dynamicRef.current
      const techs = techniquesRef.current

      // Apply selected techniques to the note
      let newDoc = setNote(currentDoc, currentCursor, fret, dur, dyn)

      // Apply techniques if any selected (modify the note just added)
      if (techs.length > 0) {
        const bar = newDoc.bars[currentCursor.barIndex]
        if (bar) {
          const noteIdx = bar.notes.findIndex(
            (n) =>
              n.string === currentCursor.string &&
              Math.abs(n.beatPosition - currentCursor.beatPosition) < 0.001
          )
          if (noteIdx >= 0) {
            const updatedNote = { ...bar.notes[noteIdx], techniques: [...techs] }
            const newNotes = bar.notes.map((n, i) => (i === noteIdx ? updatedNote : n))
            const newBar = { ...bar, notes: newNotes }
            newDoc = {
              ...newDoc,
              bars: newDoc.bars.map((b, i) =>
                i === currentCursor.barIndex ? newBar : b
              ),
            }
          }
        }
      }

      // Advance cursor
      const step = DURATION_BEATS[dur]
      const bpb = BEATS_PER_BAR[newDoc.timeSignature]
      const nextBeat = +(currentCursor.beatPosition + step).toFixed(4)

      let finalDoc = newDoc
      let nextCursor: TabCursor

      if (nextBeat < bpb) {
        nextCursor = { ...currentCursor, beatPosition: nextBeat }
      } else if (currentCursor.barIndex < newDoc.bars.length - 1) {
        nextCursor = { ...currentCursor, barIndex: currentCursor.barIndex + 1, beatPosition: 0 }
      } else {
        finalDoc = addBar(newDoc)
        nextCursor = { ...currentCursor, barIndex: currentCursor.barIndex + 1, beatPosition: 0 }
      }

      pushHistory(currentDoc)
      setDoc(finalDoc)
      setCursor(nextCursor)
    },
    [pushHistory]
  )

  // ─── Two-digit fret input ─────────────────────────────────────────────────

  const clearPending = useCallback(() => {
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current)
      pendingTimerRef.current = null
    }
    pendingFretRef.current = ''
  }, [])

  const handleFretDigit = useCallback(
    (char: string) => {
      const digit = parseInt(char, 10)

      if (pendingFretRef.current) {
        // Second digit — combine with first
        clearTimeout(pendingTimerRef.current!)
        const combined = Math.min(24, parseInt(pendingFretRef.current + char, 10))
        pendingFretRef.current = ''
        pendingTimerRef.current = null
        commitNote(combined)
        return
      }

      if (digit === 0) {
        commitNote(0)
        return
      }

      if (digit >= 3) {
        // 3-9: commit immediately (no valid two-digit extension ≤24)
        commitNote(digit)
        return
      }

      // 1 or 2: wait for optional second digit
      pendingFretRef.current = char
      pendingTimerRef.current = setTimeout(() => {
        const fret = parseInt(pendingFretRef.current, 10)
        pendingFretRef.current = ''
        pendingTimerRef.current = null
        if (!isNaN(fret)) commitNote(fret)
      }, 500)
    },
    [commitNote]
  )

  // ─── Keyboard handler ─────────────────────────────────────────────────────

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const target = e.target as HTMLElement
      // Don't intercept if focused on an input/select/textarea
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) return

      const key = e.key
      const step = DURATION_BEATS[durationRef.current]

      // Digits 0-9: fret input
      if (/^[0-9]$/.test(key)) {
        e.preventDefault()
        handleFretDigit(key)
        return
      }

      // Undo
      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault()
        clearPending()
        setHistory((prev) => {
          if (prev.length === 0) return prev
          const last = prev[prev.length - 1]
          setDoc(last)
          return prev.slice(0, -1)
        })
        return
      }

      // Space: rest/pause
      if (key === ' ') {
        e.preventDefault()
        clearPending()
        commitNote(null)
        return
      }

      // Delete/Backspace: remove note at cursor
      if (key === 'Delete' || key === 'Backspace') {
        e.preventDefault()
        clearPending()
        const currentDoc = docRef.current
        const currentCursor = cursorRef.current
        pushHistory(currentDoc)
        setDoc(removeNote(currentDoc, currentCursor))
        return
      }

      // Arrow navigation
      if (key === 'ArrowLeft') {
        e.preventDefault()
        clearPending()
        setCursor((prev) => moveCursor(prev, 'left', docRef.current, step))
        return
      }
      if (key === 'ArrowRight') {
        e.preventDefault()
        clearPending()
        setCursor((prev) => moveCursor(prev, 'right', docRef.current, step))
        return
      }
      if (key === 'ArrowUp') {
        e.preventDefault()
        clearPending()
        setCursor((prev) => moveCursor(prev, 'up', docRef.current, step))
        return
      }
      if (key === 'ArrowDown') {
        e.preventDefault()
        clearPending()
        setCursor((prev) => moveCursor(prev, 'down', docRef.current, step))
        return
      }

      // Tab: move to next string (wraps)
      if (key === 'Tab') {
        e.preventDefault()
        clearPending()
        const maxStr = docRef.current.instrument === 'guitar' ? 6 : 4
        setCursor((prev) => ({
          ...prev,
          string: e.shiftKey
            ? prev.string <= 1 ? maxStr : prev.string - 1
            : prev.string >= maxStr ? 1 : prev.string + 1,
        }))
        return
      }

      // Duration shortcuts: 1-6 with Alt/Option
      if (e.altKey) {
        const durMap: Record<string, Duration> = {
          '1': '1', '2': '2', '3': '4', '4': '8', '5': '16',
        }
        if (durMap[key]) {
          e.preventDefault()
          setSelectedDuration(durMap[key])
        }
      }
    },
    [handleFretDigit, clearPending, commitNote, pushHistory]
  )

  // Cleanup pending timer on unmount
  useEffect(() => () => clearPending(), [clearPending])

  // ─── Actions ──────────────────────────────────────────────────────────────

  const deleteAtCursor = useCallback(() => {
    clearPending()
    pushHistory(docRef.current)
    setDoc((d) => removeNote(d, cursorRef.current))
  }, [clearPending, pushHistory])

  const undo = useCallback(() => {
    clearPending()
    setHistory((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      setDoc(last)
      return prev.slice(0, -1)
    })
  }, [clearPending])

  const addBarAction = useCallback(() => {
    pushHistory(docRef.current)
    setDoc((d) => addBar(d))
  }, [pushHistory])

  const updateTitle = useCallback((title: string) => {
    setDoc((d) => ({ ...d, title, updatedAt: new Date().toISOString() }))
  }, [])

  const updateTempo = useCallback((tempo: number) => {
    setDoc((d) => ({ ...d, tempo, updatedAt: new Date().toISOString() }))
  }, [])

  const updateKey = useCallback((key: string) => {
    setDoc((d) => ({ ...d, key, updatedAt: new Date().toISOString() }))
  }, [])

  const updateInstrument = useCallback((instrument: 'guitar' | 'bass') => {
    const newDoc = createEmptyDocument(instrument)
    pushHistory(docRef.current)
    setDoc(newDoc)
    setCursor({ barIndex: 0, string: 1, beatPosition: 0 })
    setHistory([])
  }, [pushHistory])

  const toggleTechnique = useCallback((t: Technique) => {
    setSelectedTechniques((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    )
  }, [])

  return {
    doc,
    cursor,
    selectedDuration,
    selectedDynamic,
    selectedTechniques,
    historyLength: history.length,
    canUndo: history.length > 0,
    setCursor,
    setSelectedDuration,
    setSelectedDynamic,
    toggleTechnique,
    deleteAtCursor,
    undo,
    addBarAction,
    updateTitle,
    updateTempo,
    updateKey,
    updateInstrument,
    onKeyDown,
  }
}
