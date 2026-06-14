import { useRef, useEffect, useState } from 'react'
import { useTabEditor } from '@/hooks/useTabEditor'
import { TabBar } from './TabBar'
import { TabToolbar } from './TabToolbar'
import { TabExportModal } from './TabExportModal'
import { TabShortcuts } from './TabShortcuts'

export function TabEditor() {
  const editor = useTabEditor()
  const containerRef = useRef<HTMLDivElement>(null)

  const [showExport,    setShowExport]    = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Auto-focus editor on mount so keyboard works immediately
  useEffect(() => { containerRef.current?.focus() }, [])

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
        className="hidden md:flex flex-col gap-3 outline-none focus:ring-2 focus:ring-indigo-500/30 rounded-2xl"
      >
        {/* Toolbar (header + editing bar) */}
        <TabToolbar
          editor={editor}
          onOpenExport={() => setShowExport(true)}
          onOpenShortcuts={() => setShowShortcuts(true)}
        />

        {/* Status bar */}
        <div className="flex items-center gap-4 text-[11px] text-muted font-mono px-1">
          <span>
            Takt <strong className="text-text dark:text-slate-300">{editor.cursor.barIndex + 1}</strong>
            {' '}z {editor.doc.bars.length}
          </span>
          <span>
            Struna <strong className="text-text dark:text-slate-300">{editor.cursor.string}</strong>
          </span>
          <span>
            Poz. <strong className="text-text dark:text-slate-300">{editor.cursor.beatPosition.toFixed(2)}</strong>
          </span>
          {editor.selection && (
            <span className="text-indigo-400">
              Zaznaczono ·{' '}
              {editor.clipboard ? `schowek: ${editor.clipboard.length} nut` : 'Ctrl+C = kopiuj'}
            </span>
          )}
          <span className="ml-auto text-subtle">
            {editor.doc.instrument === 'guitar' ? '6-strun' : '4-strun bas'} · {editor.doc.timeSignature} · {editor.doc.key}
            {editor.savedAt && <span className="ml-2 text-subtle">· ✓ {editor.savedAt}</span>}
          </span>
        </div>

        {/* Score area */}
        <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-border dark:border-slate-700 bg-slate-950/30 dark:bg-slate-900/50 p-4">
          <div className="flex gap-0 min-w-max">
            {editor.doc.bars.map((bar, i) => (
              <TabBar
                key={bar.id}
                bar={bar}
                barIndex={i}
                cursor={editor.cursor}
                instrument={editor.doc.instrument}
                selection={editor.selection}
                onCursorChange={editor.setCursor}
              />
            ))}
          </div>
        </div>

        {/* Bottom hint */}
        <p className="text-[11px] text-subtle px-1">
          0–24 = próg · Spacja = pauza · ↑↓ = struna · ←→ = pozycja · Shift+← → = zaznacz · Ctrl+C/V/X · Ctrl+Z = cofnij · ? = pomoc
        </p>
      </div>

      {/* Modals */}
      <TabExportModal
        open={showExport}
        doc={editor.doc}
        onClose={() => setShowExport(false)}
      />
      <TabShortcuts
        open={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </>
  )
}
