import { useState, useCallback, useEffect } from 'react'
import { Modal } from '@/components/ui'
import type { TabDocument } from '@/types/tab'
import type { TabInstrument } from '@/lib/audioSources'
import { INSTRUMENT_LABELS } from '@/lib/audioSources'
import { renderTabASCII } from '@/lib/tabUtils'
import { exportToTxt, exportToMp3 } from '@/lib/tabExport'
import { getUserRiffs, deleteRiff } from '@/lib/riffService'
import type { RiffMeta } from '@/lib/riffService'

type ActiveTab = 'ascii' | 'audio' | 'cloud'
type AudioStatus = 'idle' | 'rendering' | 'done' | 'error'

interface Props {
  open: boolean
  doc: TabDocument
  onClose: () => void
  userId: string | null
  onSave: () => Promise<void>
  onLoad: (riffId: string) => Promise<void>
  isSaving: boolean
}

function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL as string
  return Boolean(url) && !url.includes('placeholder') && !url.includes('your-project')
}

export function TabExportModal({ open, doc, onClose, userId, onSave, onLoad, isSaving }: Props) {
  const [tab, setTab]           = useState<ActiveTab>('ascii')
  const [copied, setCopied]     = useState(false)

  // Audio tab
  const [audioStatus,     setAudioStatus]     = useState<AudioStatus>('idle')
  const [audioProgress,   setAudioProgress]   = useState(0)
  const [audioError,      setAudioError]      = useState<string | null>(null)
  const [audioInstrument, setAudioInstrument] = useState<TabInstrument>('guitar-electric')

  // Cloud tab
  const [riffs,        setRiffs]        = useState<RiffMeta[]>([])
  const [loadingRiffs, setLoadingRiffs] = useState(false)
  const [saveSuccess,  setSaveSuccess]  = useState(false)

  // Reset transient state when modal closes
  useEffect(() => {
    if (!open) {
      setAudioStatus('idle')
      setAudioProgress(0)
      setAudioError(null)
      setSaveSuccess(false)
    }
  }, [open])

  // Fetch riffs when cloud tab becomes active
  useEffect(() => {
    if (!open || tab !== 'cloud' || !userId || !isSupabaseConfigured()) return
    setLoadingRiffs(true)
    getUserRiffs(userId).then((r) => {
      setRiffs(r)
      setLoadingRiffs(false)
    })
  }, [open, tab, userId])

  const ascii = open && tab === 'ascii' ? renderTabASCII(doc) : ''

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(ascii)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }, [ascii])

  const handleTxtDownload = useCallback(() => exportToTxt(doc), [doc])

  const handleWavExport = useCallback(async () => {
    setAudioStatus('rendering')
    setAudioProgress(0)
    setAudioError(null)
    try {
      await exportToMp3(doc, audioInstrument, (p) => setAudioProgress(p))
      setAudioStatus('done')
    } catch (err) {
      setAudioError(err instanceof Error ? err.message : 'Nieznany błąd')
      setAudioStatus('error')
    }
  }, [doc, audioInstrument])

  const handleSave = useCallback(async () => {
    await onSave()
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
    if (userId && isSupabaseConfigured()) {
      getUserRiffs(userId).then(setRiffs)
    }
  }, [onSave, userId])

  const handleLoad = useCallback(async (riffId: string) => {
    await onLoad(riffId)
    onClose()
  }, [onLoad, onClose])

  const handleDelete = useCallback(async (riffId: string) => {
    if (!window.confirm('Usunąć riff z chmury?')) return
    const ok = await deleteRiff(riffId)
    if (ok) setRiffs((prev) => prev.filter((r) => r.id !== riffId))
  }, [])

  // ─── Shared button styles ────────────────────────────────────────────────────

  const btnClose =
    'px-4 py-2 rounded-xl text-sm font-semibold bg-surface-2 dark:bg-slate-700 text-muted hover:text-text border border-border dark:border-slate-600 transition-colors'

  return (
    <Modal open={open} onClose={onClose} title="Eksport TAB" size="lg">
      {/* Tab nav */}
      <div className="flex gap-1 mb-4 pb-2 border-b border-border dark:border-slate-700">
        {(['ascii', 'audio', 'cloud'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              tab === t
                ? 'bg-indigo-600 text-white'
                : 'text-muted hover:text-text dark:hover:text-slate-200 hover:bg-surface-2 dark:hover:bg-slate-700'
            }`}
          >
            {t === 'ascii' && '📄 ASCII'}
            {t === 'audio' && '🎵 Audio (WAV)'}
            {t === 'cloud' && '☁ Chmura'}
          </button>
        ))}
      </div>

      {/* ── ASCII tab ──────────────────────────────────────────────────────────── */}
      {tab === 'ascii' && (
        <div className="space-y-3">
          <p className="text-xs text-muted">Skopiuj lub pobierz tabulaturę w formacie tekstowym.</p>
          <pre
            className="text-[11px] font-mono bg-slate-900 dark:bg-black/40 text-green-400 p-3 rounded-xl overflow-x-auto max-h-60 overflow-y-auto leading-relaxed whitespace-pre border border-slate-700"
            aria-label="Tabulatura ASCII"
          >
            {ascii || '(pusty dokument)'}
          </pre>
          <p className="text-[10px] text-subtle font-mono">
            {doc.title} · ♩={doc.tempo} · {doc.key} · {doc.timeSignature} · {doc.bars.length} taktów
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCopy}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                copied ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {copied ? '✓ Skopiowano!' : '📋 Kopiuj'}
            </button>
            <button onClick={handleTxtDownload} className={btnClose}>
              ⬇ Pobierz .txt
            </button>
            <button onClick={onClose} className={btnClose}>Zamknij</button>
          </div>
        </div>
      )}

      {/* ── Audio tab ──────────────────────────────────────────────────────────── */}
      {tab === 'audio' && (
        <div className="space-y-4">
          <p className="text-xs text-muted">
            Renderuje offline — gitara zagra bez mikrofonu. Plik zostanie zapisany jako <strong className="text-text dark:text-slate-200">.wav</strong>.
          </p>

          {/* Instrument selector */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted shrink-0">Brzmienie:</label>
            <select
              value={audioInstrument}
              onChange={(e) => setAudioInstrument(e.target.value as TabInstrument)}
              disabled={audioStatus === 'rendering'}
              className="flex-1 h-8 px-2 rounded-lg text-xs border border-border dark:border-slate-600 bg-surface dark:bg-slate-700 text-text dark:text-slate-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              {(Object.keys(INSTRUMENT_LABELS) as TabInstrument[]).map((k) => (
                <option key={k} value={k}>{INSTRUMENT_LABELS[k]}</option>
              ))}
            </select>
          </div>

          {/* Progress bar */}
          {audioStatus === 'rendering' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-muted">
                <span>Renderowanie...</span>
                <span>{audioProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface-2 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            </div>
          )}

          {audioStatus === 'done' && (
            <p className="text-sm text-green-500 font-semibold">✓ Plik zapisany! Sprawdź folder Pobrane.</p>
          )}
          {audioStatus === 'error' && audioError && (
            <p className="text-sm text-rose-400">⚠ Błąd eksportu: {audioError}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleWavExport}
              disabled={audioStatus === 'rendering'}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {audioStatus === 'rendering' ? '⏳ Renderowanie...' : '🎵 Eksportuj WAV'}
            </button>
            <button onClick={onClose} className={btnClose}>Zamknij</button>
          </div>
        </div>
      )}

      {/* ── Cloud tab ──────────────────────────────────────────────────────────── */}
      {tab === 'cloud' && (
        <div className="space-y-4">
          {!isSupabaseConfigured() ? (
            <div className="text-center py-8 space-y-1">
              <p className="text-sm text-muted">Supabase nie jest skonfigurowane.</p>
              <p className="text-[11px] text-subtle">Ustaw VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY w .env.local</p>
            </div>
          ) : !userId ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted">Zaloguj się, aby zapisywać rify w chmurze.</p>
            </div>
          ) : (
            <>
              {/* Save current doc */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 dark:bg-slate-800 border border-border dark:border-slate-700">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text dark:text-slate-200 truncate">{doc.title}</p>
                  <p className="text-[10px] text-muted">
                    {doc.instrument} · ♩={doc.tempo} · {doc.key} · {doc.bars.length} taktów
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    saveSuccess
                      ? 'bg-green-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {isSaving ? '⏳...' : saveSuccess ? '✓ Zapisano!' : '☁ Zapisz'}
                </button>
              </div>

              <div className="h-px bg-border dark:bg-slate-700" />

              {/* Riff list */}
              <div>
                <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
                  Twoje riffy
                </p>
                {loadingRiffs ? (
                  <p className="text-xs text-muted text-center py-4">Ładowanie...</p>
                ) : riffs.length === 0 ? (
                  <p className="text-xs text-muted text-center py-4">Brak zapisanych riffów.</p>
                ) : (
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {riffs.map((riff) => (
                      <div
                        key={riff.id}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-2 dark:bg-slate-800 border border-border dark:border-slate-700"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-text dark:text-slate-200 truncate">{riff.title}</p>
                          <p className="text-[10px] text-muted">
                            {riff.instrument} · ♩={riff.bpm} · {new Date(riff.created_at).toLocaleDateString('pl-PL')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleLoad(riff.id)}
                          className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                        >
                          Wczytaj
                        </button>
                        <button
                          onClick={() => handleDelete(riff.id)}
                          title="Usuń riff"
                          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-[11px] text-rose-400 hover:bg-rose-500/10 border border-border dark:border-slate-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end pt-1">
            <button onClick={onClose} className={btnClose}>Zamknij</button>
          </div>
        </div>
      )}
    </Modal>
  )
}
