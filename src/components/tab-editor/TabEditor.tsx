import { useRef, useEffect } from 'react'
import { useTabEditor } from '@/hooks/useTabEditor'
import type { Duration, Dynamic, Technique } from '@/types/tab'
import { TabBar } from './TabBar'
import { renderTabASCII } from '@/lib/tabUtils'

// ─── Duration toolbar ─────────────────────────────────────────────────────────

const DURATIONS: { value: Duration; label: string; title: string }[] = [
  { value: '1',   label: '𝅝',   title: 'Cała nuta (Alt+1)' },
  { value: '2',   label: '𝅗𝅥',  title: 'Półnuta (Alt+2)' },
  { value: '4',   label: '♩',   title: 'Ćwierćnuta (Alt+3)' },
  { value: '8',   label: '♪',   title: 'Ósemka (Alt+4)' },
  { value: '16',  label: '♬',   title: 'Szesnastka (Alt+5)' },
  { value: '4.',  label: '♩.',  title: 'Ćwierćnuta z kropką' },
  { value: '8.',  label: '♪.',  title: 'Ósemka z kropką' },
]

const DYNAMICS: Dynamic[] = ['ppp', 'pp', 'p', 'mf', 'f', 'ff']

const TECHNIQUES: { value: Technique; label: string; title: string }[] = [
  { value: 'h',   label: 'h',   title: 'Hammer-on' },
  { value: 'p',   label: 'p',   title: 'Pull-off' },
  { value: 'b',   label: 'b',   title: 'Bend' },
  { value: '~',   label: '~',   title: 'Vibrato' },
  { value: '/',   label: '/',   title: 'Slide up' },
  { value: '\\',  label: '\\',  title: 'Slide down' },
  { value: 's',   label: 's',   title: 'Legato slide' },
  { value: 'x',   label: 'x',   title: 'Muted/dead' },
  { value: 'PM',  label: 'PM',  title: 'Palm mute' },
  { value: 't',   label: 't',   title: 'Tap' },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function TabEditor() {
  const editor = useTabEditor()
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-focus editor on mount so keyboard works immediately
  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  function copyASCII() {
    const ascii = renderTabASCII(editor.doc)
    navigator.clipboard.writeText(ascii).catch(() => {})
  }

  return (
    <>
      {/* Mobile notice */}
      <div className="md:hidden py-12 text-center">
        <div className="text-4xl mb-3">💻</div>
        <p className="font-semibold text-text dark:text-slate-200">Edytor TAB wymaga klawiatury</p>
        <p className="text-sm text-muted mt-1">Użyj komputera do edycji.</p>
      </div>

      {/* Desktop editor */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={editor.onKeyDown}
        className="hidden md:flex flex-col gap-4 outline-none focus:ring-2 focus:ring-indigo-500/30 rounded-2xl"
      >
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={editor.doc.title}
            onChange={(e) => editor.updateTitle(e.target.value)}
            className="text-lg font-bold bg-transparent border-b border-transparent hover:border-border dark:hover:border-slate-600 focus:border-indigo-500 focus:outline-none text-text dark:text-slate-100 w-52 transition-colors"
            placeholder="Tytuł TAB..."
          />

          <div className="flex items-center gap-1.5 ml-auto">
            {/* Instrument */}
            <select
              value={editor.doc.instrument}
              onChange={(e) => editor.updateInstrument(e.target.value as 'guitar' | 'bass')}
              className="text-xs bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-lg px-2 py-1.5 text-text dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="guitar">Gitara</option>
              <option value="bass">Bas</option>
            </select>

            {/* Tempo */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted">♩=</span>
              <input
                type="number"
                min={20}
                max={300}
                value={editor.doc.tempo}
                onChange={(e) => editor.updateTempo(Number(e.target.value))}
                className="w-14 text-xs bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-lg px-2 py-1.5 text-text dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Key */}
            <input
              type="text"
              value={editor.doc.key}
              onChange={(e) => editor.updateKey(e.target.value)}
              className="w-12 text-xs bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-lg px-2 py-1.5 text-text dark:text-slate-200 focus:outline-none focus:border-indigo-500 text-center"
              placeholder="Am"
            />
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-surface dark:bg-slate-800/50 rounded-xl border border-border dark:border-slate-700">
          {/* Duration */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider mr-1">Wartość</span>
            {DURATIONS.map(({ value, label, title }) => (
              <button
                key={value}
                title={title}
                onClick={() => editor.setSelectedDuration(value)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                  editor.selectedDuration === value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-surface-2 dark:bg-slate-700 text-muted hover:bg-indigo-500/10 hover:text-indigo-400 border border-border dark:border-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-border dark:bg-slate-600" />

          {/* Dynamic */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider mr-1">Siła</span>
            {DYNAMICS.map((d) => (
              <button
                key={d}
                onClick={() => editor.setSelectedDynamic(d)}
                className={`px-2 h-7 flex items-center justify-center rounded-lg text-[11px] font-mono font-semibold transition-all ${
                  editor.selectedDynamic === d
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-surface-2 dark:bg-slate-700 text-muted hover:bg-indigo-500/10 hover:text-indigo-400 border border-border dark:border-slate-600'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-border dark:bg-slate-600" />

          {/* Techniques */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider mr-1">Technika</span>
            {TECHNIQUES.map(({ value, label, title }) => (
              <button
                key={value}
                title={title}
                onClick={() => editor.toggleTechnique(value)}
                className={`px-2 h-7 flex items-center justify-center rounded-lg text-[11px] font-mono font-semibold transition-all ${
                  editor.selectedTechniques.includes(value)
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-surface-2 dark:bg-slate-700 text-muted hover:bg-indigo-500/10 hover:text-indigo-400 border border-border dark:border-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Undo */}
            <button
              title="Cofnij (Ctrl+Z)"
              onClick={editor.undo}
              disabled={!editor.canUndo}
              className="h-7 px-2.5 flex items-center gap-1 rounded-lg text-xs font-semibold disabled:opacity-30 bg-surface-2 dark:bg-slate-700 text-muted hover:bg-indigo-500/10 hover:text-indigo-400 border border-border dark:border-slate-600 transition-all disabled:cursor-not-allowed"
            >
              ↩ Cofnij
            </button>

            {/* Delete */}
            <button
              title="Usuń nutę (Delete)"
              onClick={editor.deleteAtCursor}
              className="h-7 px-2.5 flex items-center gap-1 rounded-lg text-xs font-semibold bg-surface-2 dark:bg-slate-700 text-muted hover:bg-red-500/10 hover:text-red-400 border border-border dark:border-slate-600 transition-all"
            >
              ✕ Usuń
            </button>

            {/* Copy ASCII — placeholder action for this phase */}
            <button
              title="Skopiuj jako ASCII TAB"
              onClick={copyASCII}
              className="h-7 px-2.5 flex items-center gap-1 rounded-lg text-xs font-semibold bg-surface-2 dark:bg-slate-700 text-muted hover:bg-indigo-500/10 hover:text-indigo-400 border border-border dark:border-slate-600 transition-all"
            >
              📋 ASCII
            </button>

            {/* Play — placeholder (audio in 7B) */}
            <button
              title="Odtwarzanie (wkrótce)"
              disabled
              className="h-7 px-3 flex items-center gap-1 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-400/50 border border-indigo-500/20 cursor-not-allowed"
            >
              ▶ Graj
            </button>
          </div>
        </div>

        {/* ── Info bar ── */}
        <div className="flex items-center gap-4 text-[11px] text-muted font-mono px-1">
          <span>Takt <strong className="text-text dark:text-slate-300">{editor.cursor.barIndex + 1}</strong> z {editor.doc.bars.length}</span>
          <span>Struny <strong className="text-text dark:text-slate-300">{editor.cursor.string}</strong></span>
          <span>Poz. <strong className="text-text dark:text-slate-300">{editor.cursor.beatPosition.toFixed(2)}</strong></span>
          <span className="ml-auto">
            {editor.doc.instrument === 'guitar' ? '6-strun' : '4-strun bas'} · {editor.doc.timeSignature} · {editor.doc.key}
          </span>
        </div>

        {/* ── Score area ── */}
        <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-border dark:border-slate-700 bg-slate-950/30 dark:bg-slate-900/50 p-4">
          <div className="flex gap-0 min-w-max">
            {editor.doc.bars.map((bar, i) => (
              <TabBar
                key={bar.id}
                bar={bar}
                barIndex={i}
                cursor={editor.cursor}
                instrument={editor.doc.instrument}
                onCursorChange={editor.setCursor}
              />
            ))}
          </div>
        </div>

        {/* ── Controls below score ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={editor.addBarAction}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 text-muted hover:border-indigo-500/50 hover:text-indigo-400 transition-all"
          >
            + Dodaj takt
          </button>

          <p className="text-[11px] text-subtle">
            Wpisz numer progu (0–24) · Spacja = pauza · ↑↓ = struna · ←→ = pozycja · Ctrl+Z = cofnij
          </p>
        </div>
      </div>
    </>
  )
}
