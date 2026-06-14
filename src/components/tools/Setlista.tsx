import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import type { Setlist, SetlistSong } from '@/types/setlist'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fretlyapp_setlists'

function createSong(partial: Partial<Omit<SetlistSong, 'id'>> = {}): SetlistSong {
  return {
    id: crypto.randomUUID(),
    title: '',
    artist: '',
    bpm: null,
    key: null,
    notes: '',
    duration: '',
    ...partial,
  }
}

function createSetlist(name = 'Nowa setlista'): Setlist {
  return { id: crypto.randomUUID(), name, songs: [], createdAt: new Date().toISOString() }
}

function parseDurationSecs(d: string): number {
  const parts = d.trim().split(':').map(Number)
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return (parts[0] ?? 0) * 60 + (parts[1] ?? 0)
  }
  return 0
}

function fmtDuration(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60)
  const s = totalSecs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function loadSetlists(): Setlist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Setlist[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return [createSetlist('Moja setlista')]
}

// ─── Empty form ───────────────────────────────────────────────────────────────

type SongForm = { title: string; artist: string; bpm: string; key: string; notes: string; duration: string }

const EMPTY_FORM: SongForm = { title: '', artist: '', bpm: '', key: '', notes: '', duration: '' }

function formToSong(f: SongForm): Omit<SetlistSong, 'id'> {
  return {
    title:    f.title.trim(),
    artist:   f.artist.trim(),
    bpm:      f.bpm.trim() ? Number(f.bpm) : null,
    key:      f.key.trim() || null,
    notes:    f.notes.trim(),
    duration: f.duration.trim(),
  }
}

function songToForm(s: SetlistSong): SongForm {
  return {
    title:    s.title,
    artist:   s.artist,
    bpm:      s.bpm !== null ? String(s.bpm) : '',
    key:      s.key ?? '',
    notes:    s.notes,
    duration: s.duration,
  }
}

// ─── Song form component ──────────────────────────────────────────────────────

interface SongFormProps {
  initial?: SongForm
  onSubmit: (f: SongForm) => void
  onCancel: () => void
  submitLabel: string
}

function SongFormPanel({ initial = EMPTY_FORM, onSubmit, onCancel, submitLabel }: SongFormProps) {
  const [f, setF] = useState<SongForm>(initial)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => { titleRef.current?.focus() }, [])

  const set = (key: keyof SongForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((prev) => ({ ...prev, [key]: e.target.value }))

  const inputCls =
    'w-full h-8 px-2 rounded-lg text-xs border border-border dark:border-slate-600 bg-surface dark:bg-slate-800 text-text dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40'

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (f.title.trim()) onSubmit(f) }}
      className="p-3 rounded-xl bg-surface-2 dark:bg-slate-800 border border-border dark:border-slate-700 space-y-2"
    >
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-muted uppercase tracking-wider">Tytuł *</label>
          <input ref={titleRef} value={f.title} onChange={set('title')} required
            placeholder="np. Smoke on the Water" className={inputCls} />
        </div>
        <div>
          <label className="text-[10px] text-muted uppercase tracking-wider">Wykonawca</label>
          <input value={f.artist} onChange={set('artist')} placeholder="np. Deep Purple" className={inputCls} />
        </div>
        <div>
          <label className="text-[10px] text-muted uppercase tracking-wider">BPM</label>
          <input type="number" min={20} max={300} value={f.bpm} onChange={set('bpm')}
            placeholder="120" className={inputCls} />
        </div>
        <div>
          <label className="text-[10px] text-muted uppercase tracking-wider">Tonacja</label>
          <input value={f.key} onChange={set('key')} placeholder="np. Am, E, Bb" className={inputCls} />
        </div>
        <div>
          <label className="text-[10px] text-muted uppercase tracking-wider">Czas (m:ss)</label>
          <input value={f.duration} onChange={set('duration')} placeholder="3:45" className={inputCls} />
        </div>
      </div>
      <div>
        <label className="text-[10px] text-muted uppercase tracking-wider">Notatki</label>
        <textarea
          value={f.notes}
          onChange={set('notes')}
          rows={2}
          placeholder="intro na czystym, solo od 2:10..."
          className="w-full px-2 py-1.5 rounded-lg text-xs border border-border dark:border-slate-600 bg-surface dark:bg-slate-800 text-text dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted border border-border dark:border-slate-600 hover:text-text transition-colors">
          Anuluj
        </button>
        <button type="submit"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Setlista() {
  const [setlists, setSetlists] = useState<Setlist[]>(loadSetlists)
  const [activeId, setActiveId] = useState<string>(() => loadSetlists()[0].id)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [rehearsal, setRehearsal]   = useState(false)
  const [rehearsalIdx, setRehearsalIdx] = useState(0)

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced localStorage save
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(setlists)) } catch { /* ignore */ }
    }, 500)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [setlists])

  const active = setlists.find((s) => s.id === activeId) ?? setlists[0]

  const totalDuration = useMemo(() => {
    const secs = active.songs.reduce((acc, s) => acc + parseDurationSecs(s.duration), 0)
    return secs > 0 ? fmtDuration(secs) : null
  }, [active.songs])

  // ── Setlist CRUD ────────────────────────────────────────────────────────────

  const updateActive = useCallback((updater: (s: Setlist) => Setlist) => {
    setSetlists((prev) => prev.map((s) => (s.id === activeId ? updater(s) : s)))
  }, [activeId])

  const addSetlist = useCallback(() => {
    const next = createSetlist()
    setSetlists((prev) => [...prev, next])
    setActiveId(next.id)
    setShowAddForm(false)
  }, [])

  const deleteActiveSetlist = useCallback(() => {
    if (setlists.length <= 1) return
    if (!window.confirm(`Usunąć setlistę "${active.name}"?`)) return
    setSetlists((prev) => {
      const filtered = prev.filter((s) => s.id !== activeId)
      setActiveId(filtered[0].id)
      return filtered
    })
  }, [setlists.length, active.name, activeId])

  const renameActive = useCallback((name: string) => {
    updateActive((s) => ({ ...s, name }))
  }, [updateActive])

  // ── Song CRUD ───────────────────────────────────────────────────────────────

  const addSong = useCallback((form: SongForm) => {
    updateActive((s) => ({ ...s, songs: [...s.songs, { id: crypto.randomUUID(), ...formToSong(form) }] }))
    setShowAddForm(false)
  }, [updateActive])

  const removeSong = useCallback((songId: string) => {
    updateActive((s) => ({ ...s, songs: s.songs.filter((x) => x.id !== songId) }))
    setExpandedId(null)
    setEditingId(null)
  }, [updateActive])

  const saveSongEdit = useCallback((songId: string, form: SongForm) => {
    updateActive((s) => ({
      ...s,
      songs: s.songs.map((x) => (x.id === songId ? { id: songId, ...formToSong(form) } : x)),
    }))
    setEditingId(null)
  }, [updateActive])

  const moveSong = useCallback((songId: string, dir: 'up' | 'down') => {
    updateActive((s) => {
      const idx = s.songs.findIndex((x) => x.id === songId)
      if (idx < 0) return s
      if (dir === 'up' && idx === 0) return s
      if (dir === 'down' && idx === s.songs.length - 1) return s
      const songs = [...s.songs]
      const other = dir === 'up' ? idx - 1 : idx + 1
      ;[songs[idx], songs[other]] = [songs[other], songs[idx]]
      return { ...s, songs }
    })
  }, [updateActive])

  // ── Rehearsal keyboard ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!rehearsal) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  setRehearsalIdx((p) => Math.max(0, p - 1))
      if (e.key === 'ArrowRight') setRehearsalIdx((p) => Math.min(active.songs.length - 1, p + 1))
      if (e.key === 'Escape')     setRehearsal(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [rehearsal, active.songs.length])

  const startRehearsal = useCallback(() => {
    if (active.songs.length === 0) return
    setRehearsalIdx(0)
    setRehearsal(true)
  }, [active.songs.length])

  // ── Shared button styles ─────────────────────────────────────────────────────

  const btnSm = 'w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors border'
  const btnGhost = `${btnSm} border-border dark:border-slate-600 text-muted hover:text-text hover:bg-surface-2 dark:hover:bg-slate-700`
  const btnDanger = `${btnSm} border-border dark:border-slate-600 text-rose-400 hover:bg-rose-500/10`

  // ── Render ───────────────────────────────────────────────────────────────────

  const currentRehearsalSong = active.songs[Math.min(rehearsalIdx, active.songs.length - 1)]

  return (
    <>
      {/* ── Rehearsal overlay ──────────────────────────────────────────────── */}
      {rehearsal && currentRehearsalSong && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-8">
          {/* Counter */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-sm text-slate-500">
            {rehearsalIdx + 1} / {active.songs.length}
          </div>

          {/* Close */}
          <button
            onClick={() => setRehearsal(false)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition-colors text-xl"
          >
            ✕
          </button>

          <div className="text-center max-w-xl w-full">
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 leading-tight">
              {currentRehearsalSong.title}
            </h1>
            {currentRehearsalSong.artist && (
              <p className="text-xl text-slate-400 mb-8">{currentRehearsalSong.artist}</p>
            )}

            {/* BPM / Key badges */}
            <div className="flex gap-6 justify-center mb-8">
              {currentRehearsalSong.bpm && (
                <div className="text-center">
                  <div className="text-4xl font-bold text-brand-500">{currentRehearsalSong.bpm}</div>
                  <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">BPM</div>
                </div>
              )}
              {currentRehearsalSong.key && (
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{currentRehearsalSong.key}</div>
                  <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Tonacja</div>
                </div>
              )}
              {currentRehearsalSong.duration && (
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-300">{currentRehearsalSong.duration}</div>
                  <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Czas</div>
                </div>
              )}
            </div>

            {/* Notes */}
            {currentRehearsalSong.notes && (
              <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-md mx-auto">
                {currentRehearsalSong.notes}
              </p>
            )}

            {/* Navigation */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setRehearsalIdx((p) => Math.max(0, p - 1))}
                disabled={rehearsalIdx === 0}
                className="px-6 py-3 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Poprzednia
              </button>
              <button
                onClick={() => setRehearsalIdx((p) => Math.min(active.songs.length - 1, p + 1))}
                disabled={rehearsalIdx >= active.songs.length - 1}
                className="px-6 py-3 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Następna →
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-4">← → klawiatura · Esc = zamknij</p>
          </div>
        </div>
      )}

      {/* ── Main UI ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Header: setlist selector + actions */}
        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={activeId}
            onChange={(e) => { setActiveId(e.target.value); setShowAddForm(false); setEditingId(null) }}
            className="flex-1 min-w-0 h-9 px-2 rounded-xl text-sm font-semibold border border-border dark:border-slate-600 bg-surface dark:bg-slate-800 text-text dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            {setlists.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <button
            onClick={addSetlist}
            title="Nowa setlista"
            className="shrink-0 h-9 px-3 rounded-xl text-xs font-semibold border border-border dark:border-slate-600 bg-surface-2 dark:bg-slate-800 text-muted hover:text-text hover:bg-surface dark:hover:bg-slate-700 transition-colors"
          >
            + Nowa
          </button>
          <button
            onClick={deleteActiveSetlist}
            disabled={setlists.length <= 1}
            title="Usuń setlistę"
            className="shrink-0 h-9 px-3 rounded-xl text-xs font-semibold border border-rose-500/20 bg-surface-2 dark:bg-slate-800 text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Usuń
          </button>
        </div>

        {/* Setlist name (editable) */}
        <div className="flex gap-3 items-center">
          <input
            value={active.name}
            onChange={(e) => renameActive(e.target.value)}
            className="flex-1 h-9 px-3 rounded-xl text-sm font-bold border border-border dark:border-slate-700 bg-transparent text-text dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            placeholder="Nazwa setlisty"
          />
          {active.songs.length > 0 && (
            <button
              onClick={startRehearsal}
              className="shrink-0 h-9 px-4 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors"
            >
              🎤 Tryb próby
            </button>
          )}
        </div>

        {/* Summary */}
        {active.songs.length > 0 && (
          <div className="flex gap-4 text-xs text-muted px-1">
            <span>{active.songs.length} {active.songs.length === 1 ? 'piosenka' : active.songs.length < 5 ? 'piosenki' : 'piosenek'}</span>
            {totalDuration && <span>Łącznie: {totalDuration}</span>}
          </div>
        )}

        {/* Song list */}
        {active.songs.length === 0 && !showAddForm && (
          <div className="text-center py-10 text-muted text-sm">
            Brak piosenek. Dodaj pierwszą poniżej.
          </div>
        )}

        <div className="space-y-1.5">
          {active.songs.map((song, idx) => {
            const isExpanded = expandedId === song.id
            const isEditing  = editingId === song.id

            return (
              <div key={song.id} className="rounded-xl border border-border dark:border-slate-700 bg-surface dark:bg-slate-800/60 overflow-hidden">

                {/* Song row */}
                {!isEditing && (
                  <>
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-surface-2 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : song.id)}
                    >
                      {/* Number */}
                      <span className="shrink-0 w-6 text-center text-[11px] font-mono text-muted">
                        {idx + 1}
                      </span>

                      {/* Title + artist */}
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-sm text-text dark:text-slate-200 truncate block">
                          {song.title || <em className="text-muted">Bez tytułu</em>}
                        </span>
                        {song.artist && (
                          <span className="text-xs text-muted truncate block">{song.artist}</span>
                        )}
                      </div>

                      {/* Meta badges */}
                      <div className="flex gap-1.5 items-center shrink-0">
                        {song.bpm !== null && (
                          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md">
                            ♩{song.bpm}
                          </span>
                        )}
                        {song.key && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                            {song.key}
                          </span>
                        )}
                        {song.duration && (
                          <span className="text-[10px] font-mono text-muted">{song.duration}</span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div
                        className="flex gap-1 ml-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => moveSong(song.id, 'up')}
                          disabled={idx === 0}
                          title="W górę"
                          className={`${btnGhost} disabled:opacity-20`}
                        >↑</button>
                        <button
                          onClick={() => moveSong(song.id, 'down')}
                          disabled={idx === active.songs.length - 1}
                          title="W dół"
                          className={`${btnGhost} disabled:opacity-20`}
                        >↓</button>
                        <button
                          onClick={() => { setEditingId(song.id); setExpandedId(null) }}
                          title="Edytuj"
                          className={btnGhost}
                        >✎</button>
                        <button
                          onClick={() => { if (window.confirm(`Usunąć "${song.title || 'piosenkę'}"?`)) removeSong(song.id) }}
                          title="Usuń"
                          className={btnDanger}
                        >✕</button>
                      </div>
                    </div>

                    {/* Expanded notes */}
                    {isExpanded && (
                      <div className="px-4 pb-3 pt-1 border-t border-border dark:border-slate-700/50">
                        {song.notes
                          ? <p className="text-xs text-muted leading-relaxed">{song.notes}</p>
                          : <p className="text-xs text-subtle italic">Brak notatek</p>
                        }
                      </div>
                    )}
                  </>
                )}

                {/* Inline edit form */}
                {isEditing && (
                  <div className="p-2">
                    <SongFormPanel
                      initial={songToForm(song)}
                      submitLabel="Zapisz"
                      onSubmit={(f) => saveSongEdit(song.id, f)}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Add form */}
        {showAddForm ? (
          <SongFormPanel
            submitLabel="Dodaj"
            onSubmit={addSong}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <button
            onClick={() => { setShowAddForm(true); setEditingId(null) }}
            className="w-full py-2.5 rounded-xl text-sm font-semibold border border-dashed border-border dark:border-slate-700 text-muted hover:text-text hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all"
          >
            + Dodaj piosenkę
          </button>
        )}
      </div>
    </>
  )
}
