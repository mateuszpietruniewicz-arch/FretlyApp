import { useState, useCallback } from 'react'
import { Modal } from '@/components/ui'
import type { TabDocument } from '@/types/tab'
import { renderTabASCII } from '@/lib/tabUtils'

interface Props {
  open: boolean
  doc: TabDocument
  onClose: () => void
}

export function TabExportModal({ open, doc, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const ascii = open ? renderTabASCII(doc) : ''

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(ascii)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }, [ascii])

  return (
    <Modal open={open} onClose={onClose} title="Eksport TAB — ASCII" size="lg">
      <div className="space-y-3">
        <p className="text-xs text-muted">
          Skopiuj tabulaturę do edytora tekstu lub wklej na forum gitarowym.
        </p>

        {/* ASCII preview */}
        <pre
          className="text-[11px] font-mono bg-slate-900 dark:bg-black/40 text-green-400 p-3 rounded-xl overflow-x-auto max-h-72 overflow-y-auto leading-relaxed whitespace-pre border border-slate-700"
          aria-label="Tabulatura ASCII"
        >
          {ascii || '(pusty dokument)'}
        </pre>

        {/* Metadata line */}
        <p className="text-[10px] text-subtle font-mono">
          {doc.title} · ♩={doc.tempo} · {doc.key} · {doc.timeSignature} · {doc.bars.length} taktów
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleCopy}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {copied ? '✓ Skopiowano!' : '📋 Kopiuj do schowka'}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-surface-2 dark:bg-slate-700 text-muted hover:text-text border border-border dark:border-slate-600 transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </Modal>
  )
}
