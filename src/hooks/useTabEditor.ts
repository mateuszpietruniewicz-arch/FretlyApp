import { useState, useRef, useCallback, useEffect } from 'react'
import type { TabDocument, TabCursor, Duration, Dynamic, Technique, TabNote, TimeSignature } from '@/types/tab'
import {
  createEmptyDocument,
  addBar,
  setNote,
  removeNote,
  moveCursor,
  DURATION_BEATS,
  BEATS_PER_BAR,
  GRID_RES,
  type TabSelection,
} from '@/lib/tabUtils'

const MAX_HISTORY = 50
const DRAFT_KEY   = 'fretlyapp_tab_draft'

// ─── Interfaces ───────────────────────────────────────────────────────────────

export type { TabSelection }

export interface TabEditorState {
  doc: TabDocument
  cursor: TabCursor
  selectedDuration: Duration
  selectedDynamic: Dynamic
  selectedTechniques: Technique[]
  historyLength: number
  canUndo: boolean
  selection: TabSelection | null
  clipboard: TabNote[] | null
  savedAt: string | null
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
  updateTimeSignature: (ts: TimeSignature) => void
  updateInstrument: (instrument: 'guitar' | 'bass') => void
  startSelection: () => void
  extendSelection: (direction: 'left' | 'right') => void
  clearSelection: () => void
  copy: () => void
  paste: () => void
  cut: () => void
  clearDraft: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTabEditor(): TabEditorState & TabEditorActions {
  const [doc, setDoc] = useState<TabDocument>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as TabDocument
        if (parsed && Array.isArray(parsed.bars) && parsed.bars.length > 0) return parsed
      }
    } catch { /* ignore */ }
    return createEmptyDocument('guitar')
  })

  const [cursor, setCursor]                     = useState<TabCursor>({ barIndex: 0, string: 1, beatPosition: 0 })
  const [selectedDuration, setSelectedDuration] = useState<Duration>('4')
  const [selectedDynamic, setSelectedDynamic]   = useState<Dynamic>('mf')
  const [selectedTechniques, setSelectedTechniques] = useState<Technique[]>([])
  const [history, setHistory]                   = useState<TabDocument[]>([])
  const [selection, setSelection]               = useState<TabSelection | null>(null)
  const [clipboard, setClipboard]               = useState<TabNote[] | null>(null)
  const [savedAt, setSavedAt]                   = useState<string | null>(null)

  // Always-current refs (safe to read from callbacks / timeouts)
  const docRef        = useRef(doc)
  const cursorRef     = useRef(cursor)
  const durationRef   = useRef(selectedDuration)
  const dynamicRef    = useRef(selectedDynamic)
  const techniquesRef = useRef(selectedTechniques)
  const selectionRef  = useRef(selection)
  const clipboardRef  = useRef(clipboard)

  useEffect(() => { docRef.current = doc },                [doc])
  useEffect(() => { cursorRef.current = cursor },          [cursor])
  useEffect(() => { durationRef.current = selectedDuration }, [selectedDuration])
  useEffect(() => { dynamicRef.current = selectedDynamic },   [selectedDynamic])
  useEffect(() => { techniquesRef.current = selectedTechniques }, [selectedTechniques])
  useEffect(() => { selectionRef.current = selection },    [selection])
  useEffect(() => { clipboardRef.current = clipboard },    [clipboard])

  // Two-digit fret input
  const pendingFretRef  = useRef<string>('')
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced localStorage save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(doc))
        const now = new Date()
        setSavedAt(
          `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        )
      } catch { /* ignore */ }
    }, 1000)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [doc])

  // ─── History ────────────────────────────────────────────────────────────────

  const pushHistory = useCallback((current: TabDocument) => {
    setHistory((prev) => [...prev.slice(-(MAX_HISTORY - 1)), current])
  }, [])

  // ─── Note entry ─────────────────────────────────────────────────────────────

  const commitNote = useCallback((fret: number | null) => {
    const currentDoc    = docRef.current
    const currentCursor = cursorRef.current
    const dur           = durationRef.current
    const dyn           = dynamicRef.current
    const techs         = techniquesRef.current

    let newDoc = setNote(currentDoc, currentCursor, fret, dur, dyn)

    if (techs.length > 0) {
      const bar = newDoc.bars[currentCursor.barIndex]
      if (bar) {
        const noteIdx = bar.notes.findIndex(
          (n) => n.string === currentCursor.string &&
                 Math.abs(n.beatPosition - currentCursor.beatPosition) < 0.001
        )
        if (noteIdx >= 0) {
          const updatedNote = { ...bar.notes[noteIdx], techniques: [...techs] }
          const newNotes = bar.notes.map((n, i) => (i === noteIdx ? updatedNote : n))
          const newBar   = { ...bar, notes: newNotes }
          newDoc = { ...newDoc, bars: newDoc.bars.map((b, i) => i === currentCursor.barIndex ? newBar : b) }
        }
      }
    }

    const step     = DURATION_BEATS[dur]
    const bpb      = BEATS_PER_BAR[newDoc.timeSignature]
    const nextBeat = +(currentCursor.beatPosition + step).toFixed(4)

    let finalDoc  = newDoc
    let nextCursor: TabCursor

    if (nextBeat < bpb) {
      nextCursor = { ...currentCursor, beatPosition: nextBeat }
    } else if (currentCursor.barIndex < newDoc.bars.length - 1) {
      nextCursor = { ...currentCursor, barIndex: currentCursor.barIndex + 1, beatPosition: 0 }
    } else {
      finalDoc   = addBar(newDoc)
      nextCursor = { ...currentCursor, barIndex: currentCursor.barIndex + 1, beatPosition: 0 }
    }

    pushHistory(currentDoc)
    setDoc(finalDoc)
    setCursor(nextCursor)
    setSelection(null)
  }, [pushHistory])

  // ─── Two-digit fret input ────────────────────────────────────────────────────

  const clearPending = useCallback(() => {
    if (pendingTimerRef.current) { clearTimeout(pendingTimerRef.current); pendingTimerRef.current = null }
    pendingFretRef.current = ''
  }, [])

  const handleFretDigit = useCallback((char: string) => {
    const digit = parseInt(char, 10)

    if (pendingFretRef.current) {
      clearTimeout(pendingTimerRef.current!)
      const combined = Math.min(24, parseInt(pendingFretRef.current + char, 10))
      pendingFretRef.current = ''
      pendingTimerRef.current = null
      commitNote(combined)
      return
    }

    if (digit === 0) { commitNote(0); return }
    if (digit >= 3)  { commitNote(digit); return }

    pendingFretRef.current = char
    pendingTimerRef.current = setTimeout(() => {
      const fret = parseInt(pendingFretRef.current, 10)
      pendingFretRef.current = ''
      pendingTimerRef.current = null
      if (!isNaN(fret)) commitNote(fret)
    }, 500)
  }, [commitNote])

  // ─── Selection ───────────────────────────────────────────────────────────────

  const startSelection = useCallback(() => {
    setSelection({ start: cursorRef.current, end: cursorRef.current })
  }, [])

  const extendSelection = useCallback((dir: 'left' | 'right') => {
    const step       = DURATION_BEATS[durationRef.current]
    const cur        = cursorRef.current
    const newCursor  = moveCursor(cur, dir, docRef.current, step)
    setSelection((prev) => ({ start: prev?.start ?? cur, end: newCursor }))
    setCursor(newCursor)
  }, [])

  const clearSelection = useCallback(() => setSelection(null), [])

  // ─── Clipboard ───────────────────────────────────────────────────────────────

  const copy = useCallback(() => {
    const sel = selectionRef.current
    if (!sel) return

    const d            = docRef.current
    const bpb          = BEATS_PER_BAR[d.timeSignature]
    const colsPerBar   = Math.round(bpb / GRID_RES)
    const startC = sel.start.barIndex * colsPerBar + Math.round(sel.start.beatPosition / GRID_RES)
    const endC   = sel.end.barIndex   * colsPerBar + Math.round(sel.end.beatPosition   / GRID_RES)
    const minC   = Math.min(startC, endC)
    const maxC   = Math.max(startC, endC)

    const notes: TabNote[] = []
    for (const bar of d.bars) {
      const barBase = (bar.barNumber - 1) * colsPerBar
      for (const note of bar.notes) {
        const noteC = barBase + Math.round(note.beatPosition / GRID_RES)
        if (noteC >= minC && noteC <= maxC) {
          notes.push({ ...note, id: crypto.randomUUID(), beatPosition: +(( noteC - minC) * GRID_RES).toFixed(4) })
        }
      }
    }
    setClipboard(notes)
  }, [])

  const paste = useCallback(() => {
    const clips = clipboardRef.current
    if (!clips || clips.length === 0) return

    const d          = docRef.current
    const cur        = cursorRef.current
    const bpb        = BEATS_PER_BAR[d.timeSignature]
    const colsPerBar = Math.round(bpb / GRID_RES)
    const curAbsCol  = cur.barIndex * colsPerBar + Math.round(cur.beatPosition / GRID_RES)

    pushHistory(d)
    let newDoc = d

    for (const clip of clips) {
      const clipRelCol    = Math.round(clip.beatPosition / GRID_RES)
      const targetAbsCol  = curAbsCol + clipRelCol
      const targetBarIdx  = Math.floor(targetAbsCol / colsPerBar)
      const targetBeatPos = +((targetAbsCol % colsPerBar) * GRID_RES).toFixed(4)

      while (newDoc.bars.length <= targetBarIdx) newDoc = addBar(newDoc)

      const targetCursor: TabCursor = { barIndex: targetBarIdx, string: clip.string, beatPosition: targetBeatPos }
      newDoc = setNote(newDoc, targetCursor, clip.fret, clip.duration, clip.dynamic)

      if (clip.techniques.length > 0) {
        const bar = newDoc.bars[targetBarIdx]
        if (bar) {
          const idx = bar.notes.findIndex(
            (n) => n.string === clip.string && Math.abs(n.beatPosition - targetBeatPos) < 0.001
          )
          if (idx >= 0) {
            const updated = { ...bar.notes[idx], techniques: [...clip.techniques] }
            const newBar  = { ...bar, notes: bar.notes.map((n, i) => (i === idx ? updated : n)) }
            newDoc = { ...newDoc, bars: newDoc.bars.map((b, i) => (i === targetBarIdx ? newBar : b)) }
          }
        }
      }
    }

    setDoc(newDoc)
  }, [pushHistory])

  const deleteSelection = useCallback(() => {
    const sel = selectionRef.current
    if (!sel) return

    const d          = docRef.current
    const bpb        = BEATS_PER_BAR[d.timeSignature]
    const colsPerBar = Math.round(bpb / GRID_RES)
    const startC = sel.start.barIndex * colsPerBar + Math.round(sel.start.beatPosition / GRID_RES)
    const endC   = sel.end.barIndex   * colsPerBar + Math.round(sel.end.beatPosition   / GRID_RES)
    const minC   = Math.min(startC, endC)
    const maxC   = Math.max(startC, endC)

    pushHistory(d)
    setDoc({
      ...d,
      bars: d.bars.map((bar) => {
        const barBase = (bar.barNumber - 1) * colsPerBar
        const notes   = bar.notes.filter((note) => {
          const noteC = barBase + Math.round(note.beatPosition / GRID_RES)
          return noteC < minC || noteC > maxC
        })
        return { ...bar, notes }
      }),
      updatedAt: new Date().toISOString(),
    })
    setSelection(null)
  }, [pushHistory])

  const cut = useCallback(() => { copy(); deleteSelection() }, [copy, deleteSelection])

  // ─── Keyboard handler ────────────────────────────────────────────────────────

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return

    const key  = e.key
    const step = DURATION_BEATS[durationRef.current]

    // ── Ctrl / Meta combos ──────────────────────────────────────────────────
    if (e.ctrlKey || e.metaKey) {
      switch (key.toLowerCase()) {
        case 'z':
          e.preventDefault(); clearPending()
          setHistory((prev) => {
            if (!prev.length) return prev
            setDoc(prev[prev.length - 1])
            return prev.slice(0, -1)
          })
          return
        case 'a':
          e.preventDefault(); clearPending()
          {
            const d   = docRef.current
            const bpb = BEATS_PER_BAR[d.timeSignature]
            if (d.bars.length > 0) {
              setSelection({
                start: { barIndex: 0, string: 1, beatPosition: 0 },
                end:   { barIndex: d.bars.length - 1, string: d.instrument === 'guitar' ? 6 : 4, beatPosition: +(bpb - GRID_RES).toFixed(4) },
              })
            }
          }
          return
        case 'c': e.preventDefault(); copy();  return
        case 'v': e.preventDefault(); paste(); return
        case 'x': e.preventDefault(); cut();   return
      }
    }

    // ── Escape ──────────────────────────────────────────────────────────────
    if (key === 'Escape') {
      e.preventDefault(); clearPending(); clearSelection(); return
    }

    // ── Digit keys: fret input ───────────────────────────────────────────────
    if (!e.ctrlKey && !e.metaKey && !e.altKey && /^[0-9]$/.test(key)) {
      e.preventDefault(); handleFretDigit(key); return
    }

    // ── Space: rest/pause ───────────────────────────────────────────────────
    if (key === ' ') {
      e.preventDefault(); clearPending(); commitNote(null); return
    }

    // ── Shift+Arrow: extend selection ────────────────────────────────────────
    if (e.shiftKey && key === 'ArrowLeft')  { e.preventDefault(); clearPending(); extendSelection('left');  return }
    if (e.shiftKey && key === 'ArrowRight') { e.preventDefault(); clearPending(); extendSelection('right'); return }

    // ── Delete / Backspace ───────────────────────────────────────────────────
    if (key === 'Delete' || key === 'Backspace') {
      e.preventDefault(); clearPending()
      if (selectionRef.current) {
        deleteSelection()
      } else {
        pushHistory(docRef.current)
        setDoc(removeNote(docRef.current, cursorRef.current))
      }
      return
    }

    // ── Arrow navigation (clears selection) ──────────────────────────────────
    if (key === 'ArrowLeft')  { e.preventDefault(); clearPending(); clearSelection(); setCursor((p) => moveCursor(p, 'left',  docRef.current, step)); return }
    if (key === 'ArrowRight') { e.preventDefault(); clearPending(); clearSelection(); setCursor((p) => moveCursor(p, 'right', docRef.current, step)); return }
    if (key === 'ArrowUp')    { e.preventDefault(); clearPending(); clearSelection(); setCursor((p) => moveCursor(p, 'up',    docRef.current, step)); return }
    if (key === 'ArrowDown')  { e.preventDefault(); clearPending(); clearSelection(); setCursor((p) => moveCursor(p, 'down',  docRef.current, step)); return }

    // ── Tab: cycle strings ───────────────────────────────────────────────────
    if (key === 'Tab') {
      e.preventDefault(); clearPending()
      const maxStr = docRef.current.instrument === 'guitar' ? 6 : 4
      setCursor((p) => ({
        ...p,
        string: e.shiftKey
          ? p.string <= 1 ? maxStr : p.string - 1
          : p.string >= maxStr ? 1 : p.string + 1,
      }))
      return
    }

    // ── Alt+digit: duration shortcuts ────────────────────────────────────────
    if (e.altKey) {
      const durMap: Record<string, Duration> = { '1': '1', '2': '2', '3': '4', '4': '8', '5': '16' }
      if (durMap[key]) { e.preventDefault(); setSelectedDuration(durMap[key]) }
    }
  }, [handleFretDigit, clearPending, commitNote, pushHistory, copy, paste, cut,
      extendSelection, clearSelection, deleteSelection])

  useEffect(() => () => clearPending(), [clearPending])

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const deleteAtCursor = useCallback(() => {
    clearPending()
    if (selectionRef.current) { deleteSelection(); return }
    pushHistory(docRef.current)
    setDoc((d) => removeNote(d, cursorRef.current))
  }, [clearPending, pushHistory, deleteSelection])

  const undo = useCallback(() => {
    clearPending()
    setHistory((prev) => {
      if (!prev.length) return prev
      setDoc(prev[prev.length - 1])
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

  const updateTimeSignature = useCallback((ts: TimeSignature) => {
    setDoc((d) => ({
      ...d,
      timeSignature: ts,
      bars: d.bars.map((b) => ({ ...b, timeSignature: ts })),
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  const updateInstrument = useCallback((instrument: 'guitar' | 'bass') => {
    pushHistory(docRef.current)
    const newDoc = createEmptyDocument(instrument)
    setDoc(newDoc)
    setCursor({ barIndex: 0, string: 1, beatPosition: 0 })
    setHistory([])
    setSelection(null)
  }, [pushHistory])

  const toggleTechnique = useCallback((t: Technique) => {
    setSelectedTechniques((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }, [])

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
    const newDoc = createEmptyDocument('guitar')
    setDoc(newDoc)
    setCursor({ barIndex: 0, string: 1, beatPosition: 0 })
    setHistory([])
    setSelection(null)
    setClipboard(null)
    setSavedAt(null)
  }, [])

  return {
    doc, cursor, selectedDuration, selectedDynamic, selectedTechniques,
    historyLength: history.length, canUndo: history.length > 0,
    selection, clipboard, savedAt,
    setCursor, setSelectedDuration, setSelectedDynamic, toggleTechnique,
    deleteAtCursor, undo, addBarAction,
    updateTitle, updateTempo, updateKey, updateTimeSignature, updateInstrument,
    startSelection, extendSelection, clearSelection,
    copy, paste, cut, clearDraft,
    onKeyDown,
  }
}
