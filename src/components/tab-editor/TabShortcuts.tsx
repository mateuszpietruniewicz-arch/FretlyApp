import { Modal } from '@/components/ui'

interface Props {
  open: boolean
  onClose: () => void
}

const SECTIONS: { title: string; rows: [string, string][] }[] = [
  {
    title: 'Wpisywanie nut',
    rows: [
      ['0 – 9',         'Wstaw próg (1 lub 2 cyfry w 500ms)'],
      ['Spacja',        'Pauza / odpoczynek'],
      ['Delete / ⌫',   'Usuń nutę (lub zaznaczenie)'],
    ],
  },
  {
    title: 'Nawigacja',
    rows: [
      ['← →',          'Poprzednia / następna pozycja'],
      ['↑ ↓',          'Wyższa / niższa struna'],
      ['Tab / Shift+Tab', 'Następna / poprzednia struna (cyklicznie)'],
    ],
  },
  {
    title: 'Zaznaczanie',
    rows: [
      ['Shift + ← →',  'Rozszerz zaznaczenie'],
      ['Ctrl + A',      'Zaznacz cały dokument'],
      ['Escape',        'Anuluj zaznaczenie'],
    ],
  },
  {
    title: 'Schowek',
    rows: [
      ['Ctrl + C',      'Kopiuj zaznaczenie'],
      ['Ctrl + V',      'Wklej od kursora'],
      ['Ctrl + X',      'Wytnij zaznaczenie'],
    ],
  },
  {
    title: 'Edycja',
    rows: [
      ['Ctrl + Z',      'Cofnij (50 kroków)'],
      ['Alt + 1 – 5',   'Wartość rytmiczna: cała / pół / ćwierć / ósemka / szesnastka'],
    ],
  },
]

export function TabShortcuts({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Skróty klawiszowe" size="md">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {SECTIONS.map(({ title, rows }) => (
          <div key={title}>
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
              {title}
            </p>
            <div className="space-y-1">
              {rows.map(([key, desc]) => (
                <div key={key} className="flex items-baseline gap-3">
                  <kbd className="shrink-0 text-[10px] font-mono bg-surface-2 dark:bg-slate-700 border border-border dark:border-slate-600 rounded-md px-1.5 py-0.5 text-indigo-400 min-w-[5rem]">
                    {key}
                  </kbd>
                  <span className="text-xs text-muted">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
