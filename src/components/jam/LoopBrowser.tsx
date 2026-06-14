import { useState } from 'react'
import type { JamLoop, LoopStyle, LoopRole } from '@/hooks/useJamSession'

interface Props {
  loops: JamLoop[]
  selectedLoop: JamLoop | null
  onSelect: (loop: JamLoop) => void
}

type StyleFilter = 'all' | LoopStyle
type RoleFilter = 'all' | LoopRole

const STYLE_FILTERS: { id: StyleFilter; label: string }[] = [
  { id: 'all',     label: 'Wszystkie' },
  { id: 'breeze',  label: '🌊 Breeze' },
  { id: 'shuffle', label: '🔀 Shuffle' },
]

const ROLE_FILTERS: { id: RoleFilter; label: string }[] = [
  { id: 'all',   label: 'Wszystkie' },
  { id: 'main',  label: 'Main' },
  { id: 'fill',  label: 'Fill' },
  { id: 'intro', label: 'Intro' },
  { id: 'outro', label: 'Outro' },
]

const STYLE_BPM: Record<LoopStyle, string> = {
  breeze: '96 BPM',
  shuffle: '130 BPM',
}

export function LoopBrowser({ loops, selectedLoop, onSelect }: Props) {
  const [styleFilter, setStyleFilter] = useState<StyleFilter>('all')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')

  const filtered = loops.filter(
    (l) =>
      (styleFilter === 'all' || l.style === styleFilter) &&
      (roleFilter === 'all' || l.role === roleFilter)
  )

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Styl</p>
        <div className="flex gap-1.5 flex-wrap">
          {STYLE_FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setStyleFilter(id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                styleFilter === id
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface dark:bg-slate-800 text-muted border border-border dark:border-slate-700 hover:border-brand-500/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Rola</p>
        <div className="flex gap-1.5 flex-wrap">
          {ROLE_FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setRoleFilter(id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                roleFilter === id
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface dark:bg-slate-800 text-muted border border-border dark:border-slate-700 hover:border-brand-500/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Loop list */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 scrollbar-hide">
        {filtered.map((loop) => {
          const isSelected = selectedLoop?.id === loop.id
          return (
            <button
              key={loop.id}
              onClick={() => onSelect(loop)}
              className={`w-full text-left rounded-xl px-3 py-2.5 flex items-center gap-3 transition-all ${
                isSelected
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 text-text dark:text-slate-200 hover:border-brand-500/50'
              }`}
            >
              <span className="text-lg shrink-0">
                {loop.style === 'breeze' ? '🌊' : '🔀'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{loop.label}</div>
                <div className={`text-xs ${isSelected ? 'text-brand-200' : 'text-muted'}`}>
                  {STYLE_BPM[loop.style]} · {loop.role}
                </div>
              </div>
              {isSelected && (
                <span className="text-brand-200 text-xs font-semibold shrink-0">✓ Wybrany</span>
              )}
            </button>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-6 text-muted text-sm">
            Brak loopów dla wybranego filtra.
          </div>
        )}
      </div>

      <div className="text-xs text-subtle text-right">{filtered.length} z {loops.length} loopów</div>
    </div>
  )
}
