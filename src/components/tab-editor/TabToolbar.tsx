import type { Duration, Dynamic, Technique, TimeSignature } from '@/types/tab'
import type { TabEditorState, TabEditorActions } from '@/hooks/useTabEditor'

// ─── Constants ────────────────────────────────────────────────────────────────

const DURATIONS: { value: Duration; label: string; title: string }[] = [
  { value: '1',  label: '𝅝',  title: 'Cała nuta (Alt+1)' },
  { value: '2',  label: '𝅗𝅥', title: 'Półnuta (Alt+2)' },
  { value: '4',  label: '♩',  title: 'Ćwierćnuta (Alt+3)' },
  { value: '8',  label: '♪',  title: 'Ósemka (Alt+4)' },
  { value: '16', label: '♬', title: 'Szesnastka (Alt+5)' },
  { value: '4.', label: '♩.', title: 'Ćwierćnuta z kropką' },
  { value: '8.', label: '♪.', title: 'Ósemka z kropką' },
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

const KEYS = ['C', 'Cm', 'D', 'Dm', 'E', 'Em', 'F', 'Fm', 'G', 'Gm', 'A', 'Am', 'B', 'Bm']

const TIME_SIGS: TimeSignature[] = ['4/4', '3/4', '6/8']

// ─── Shared button styles ─────────────────────────────────────────────────────

const btnBase   = 'h-7 flex items-center justify-center rounded-lg text-[11px] font-semibold transition-all border'
const btnActive = 'bg-indigo-600 text-white shadow-sm border-indigo-600'
const btnIdle   = 'bg-surface-2 dark:bg-slate-700 text-muted hover:bg-indigo-500/10 hover:text-indigo-400 border-border dark:border-slate-600'
const btnDanger = 'bg-surface-2 dark:bg-slate-700 text-muted hover:bg-red-500/10 hover:text-red-400 border-border dark:border-slate-600'

// ─── Separator ────────────────────────────────────────────────────────────────

function Sep() {
  return <div className="w-px h-5 shrink-0 bg-border dark:bg-slate-600" />
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  editor: TabEditorState & TabEditorActions
  onOpenExport: () => void
  onOpenShortcuts: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TabToolbar({ editor, onOpenExport, onOpenShortcuts }: Props) {
  function handleNewDoc() {
    if (window.confirm('Nowy dokument — niezapisane zmiany zostaną utracone?')) {
      editor.clearDraft()
    }
  }

  return (
    <div className="flex flex-col gap-2">

      {/* ── Row 1: Metadata ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Title */}
        <input
          type="text"
          value={editor.doc.title}
          onChange={(e) => editor.updateTitle(e.target.value)}
          className="text-base font-bold bg-transparent border-b border-transparent hover:border-border dark:hover:border-slate-600 focus:border-indigo-500 focus:outline-none text-text dark:text-slate-100 w-44 transition-colors shrink-0"
          placeholder="Tytuł TAB..."
        />

        <Sep />

        {/* Instrument */}
        <select
          value={editor.doc.instrument}
          onChange={(e) => editor.updateInstrument(e.target.value as 'guitar' | 'bass')}
          className="text-xs bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-lg px-2 py-1.5 text-text dark:text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="guitar">🎸 Gitara</option>
          <option value="bass">🎸 Bas</option>
        </select>

        {/* Tempo */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-muted shrink-0">♩=</span>
          <input
            type="number"
            min={40}
            max={240}
            value={editor.doc.tempo}
            onChange={(e) => editor.updateTempo(Number(e.target.value))}
            className="w-14 text-xs bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-lg px-2 py-1.5 text-text dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Key */}
        <select
          value={editor.doc.key}
          onChange={(e) => editor.updateKey(e.target.value)}
          className="text-xs bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-lg px-2 py-1.5 text-text dark:text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>

        {/* Time signature */}
        <select
          value={editor.doc.timeSignature}
          onChange={(e) => editor.updateTimeSignature(e.target.value as TimeSignature)}
          className="text-xs bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-lg px-2 py-1.5 text-text dark:text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          {TIME_SIGS.map((ts) => <option key={ts} value={ts}>{ts}</option>)}
        </select>

        {/* New doc */}
        <button
          onClick={handleNewDoc}
          title="Nowy dokument"
          className={`${btnBase} ${btnIdle} px-2.5 ml-auto`}
        >
          <span className="hidden sm:inline">+ Nowy</span>
          <span className="sm:hidden">+</span>
        </button>

        {/* Saved status */}
        {editor.savedAt && (
          <span className="text-[10px] text-subtle whitespace-nowrap">
            ✓ {editor.savedAt}
          </span>
        )}
      </div>

      {/* ── Row 2: Editing toolbar ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 bg-surface dark:bg-slate-800/60 rounded-xl border border-border dark:border-slate-700">

        {/* Duration */}
        <div className="flex items-center gap-1">
          <span className="hidden sm:block text-[10px] font-semibold text-muted uppercase tracking-wider mr-0.5">
            Wartość
          </span>
          {DURATIONS.map(({ value, label, title }) => (
            <button
              key={value}
              title={title}
              onClick={() => editor.setSelectedDuration(value)}
              className={`w-7 ${btnBase} ${editor.selectedDuration === value ? btnActive : btnIdle}`}
            >
              {label}
            </button>
          ))}
        </div>

        <Sep />

        {/* Dynamic */}
        <div className="flex items-center gap-1">
          <span className="hidden sm:block text-[10px] font-semibold text-muted uppercase tracking-wider mr-0.5">
            Siła
          </span>
          {DYNAMICS.map((d) => (
            <button
              key={d}
              title={`Dynamika: ${d}`}
              onClick={() => editor.setSelectedDynamic(d)}
              className={`px-2 ${btnBase} ${editor.selectedDynamic === d ? btnActive : btnIdle}`}
            >
              {d}
            </button>
          ))}
        </div>

        <Sep />

        {/* Techniques */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="hidden sm:block text-[10px] font-semibold text-muted uppercase tracking-wider mr-0.5">
            Technika
          </span>
          {TECHNIQUES.map(({ value, label, title }) => (
            <button
              key={value}
              title={title}
              onClick={() => editor.toggleTechnique(value)}
              className={`px-1.5 ${btnBase} font-mono ${editor.selectedTechniques.includes(value) ? btnActive : btnIdle}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Actions — right side */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Sep />

          {/* Selection indicator */}
          {editor.selection && (
            <span className="text-[10px] text-indigo-400 font-semibold px-2 py-1 bg-indigo-500/10 rounded-lg border border-indigo-500/20 whitespace-nowrap">
              Zaznaczono
            </span>
          )}

          {/* Undo */}
          <button
            title="Cofnij (Ctrl+Z)"
            onClick={editor.undo}
            disabled={!editor.canUndo}
            className={`px-2.5 ${btnBase} ${btnIdle} disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <span className="hidden sm:inline">↩ Cofnij</span>
            <span className="sm:hidden">↩</span>
          </button>

          {/* Delete */}
          <button
            title={editor.selection ? 'Usuń zaznaczenie (Delete)' : 'Usuń nutę (Delete)'}
            onClick={editor.deleteAtCursor}
            className={`px-2.5 ${btnBase} ${btnDanger}`}
          >
            <span className="hidden sm:inline">✕ Usuń</span>
            <span className="sm:hidden">✕</span>
          </button>

          {/* Add bar */}
          <button
            title="Dodaj takt"
            onClick={editor.addBarAction}
            className={`px-2.5 ${btnBase} ${btnIdle}`}
          >
            <span className="hidden sm:inline">+ Takt</span>
            <span className="sm:hidden">+</span>
          </button>

          {/* ASCII Export */}
          <button
            title="Eksport ASCII TAB"
            onClick={onOpenExport}
            className={`px-2.5 ${btnBase} ${btnIdle}`}
          >
            <span className="hidden sm:inline">📋 ASCII</span>
            <span className="sm:hidden">📋</span>
          </button>

          {/* Play placeholder */}
          <button
            title="Odtwarzanie (dostępne w 7C)"
            disabled
            className={`px-2.5 ${btnBase} bg-indigo-600/20 text-indigo-400/50 border-indigo-500/20 cursor-not-allowed`}
          >
            ▶
          </button>

          {/* Shortcuts help */}
          <button
            title="Skróty klawiszowe"
            onClick={onOpenShortcuts}
            className={`w-7 ${btnBase} ${btnIdle} font-mono`}
          >
            ?
          </button>
        </div>
      </div>
    </div>
  )
}
