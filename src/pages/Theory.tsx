import { useState } from 'react'
import { Card } from '@/components/ui'
import { Fretboard } from '@/components/fretboard'
import { getScaleNotes, NOTE_COLORS } from '@/lib/tonal'
import { useAppStore } from '@/store'

const TOPICS = [
  {
    id: 'intervals',
    icon: '🎵',
    title: 'Interwały',
    desc: 'Odległości między dźwiękami',
    content: 'Interwał to odległość między dwoma dźwiękami mierzona w półtonach. Prima (0 półtonów), sekunda wielka (2), tercja wielka (4), kwarta (5), kwinta (7), seksta (9), septyma (11), oktawa (12).'
  },
  {
    id: 'scales',
    icon: '🎼',
    title: 'Budowa skal',
    desc: 'Durowe, molowe, pentatoniki',
    content: 'Skala durowa: 2-2-1-2-2-2-1 (gdzie liczba = półtony). Skala molowa: 2-1-2-2-1-2-2. Pentatonika molowa: 3-2-2-3-2 (5 nut zamiast 7 — mniej błędów, więcej muzyki).'
  },
  {
    id: 'chords',
    icon: '🎸',
    title: 'Budowa akordów',
    desc: 'Trójdźwięki i septymowe',
    content: 'Trójdźwięk durowy: pryma + tercja wielka (4 półtony) + kwinta (7). Molowy: pryma + tercja mała (3 półtony) + kwinta (7). Septymowy dominantowy (7): durowy + septyma mała (10).'
  },
  {
    id: 'modes',
    icon: '🎛️',
    title: 'Tryby gitarowe',
    desc: 'Dorian, Mixolydian — te które grasz',
    content: 'Dorian = skala molowa z podwyższoną sekstą (6). Brzmienie: bluesowe, jazzowe. Mixolydian = skala durowa z obniżoną septymą (7). Brzmienie: rockowe, folk. Oba tryby są kluczowe dla improwizacji.'
  },
  {
    id: 'rhythm',
    icon: '🥁',
    title: 'Rytm i metrum',
    desc: 'Nuty, pauzy, synkopa',
    content: 'Metrum 4/4: 4 ćwierćnuty na takt. Ćwierćnuta = 1 uderzenie. Ósemka = 1/2 uderzenia. Szesnastka = 1/4 uderzenia. Synkopa = akcent na słabą część taktu — fundament groove\'u.'
  },
]

const SCALE_ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const SCALE_TYPES = ['minor pentatonic', 'major pentatonic', 'minor', 'major', 'blues', 'dorian', 'mixolydian']

export function TheoryPage() {
  const { instrument } = useAppStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [scaleRoot, setScaleRoot] = useState('A')
  const [scaleType, setScaleType] = useState('minor pentatonic')

  const scaleNotes = getScaleNotes(scaleRoot, scaleType)
  const scalePCs = scaleNotes.map((n) => n.replace(/[0-9]/g, ''))

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-text dark:text-slate-100">Teoria</h1>
        <p className="text-sm text-muted mt-0.5">Tylko to co praktycznie potrzebne gitarzyście.</p>
      </div>

      {/* Interactive scale viewer */}
      <Card padding="md" className="space-y-3">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider">Przeglądarka skal</p>

        <div className="flex gap-2">
          <div className="flex gap-1.5 flex-wrap">
            {SCALE_ROOTS.map((r) => (
              <button
                key={r}
                onClick={() => setScaleRoot(r)}
                className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                style={{
                  backgroundColor: scaleRoot === r ? (NOTE_COLORS[r] ?? '#a855f7') : undefined,
                  color: scaleRoot === r ? '#fff' : undefined,
                  border: `1px solid ${scaleRoot === r ? 'transparent' : '#334155'}`,
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <select
          value={scaleType}
          onChange={(e) => setScaleType(e.target.value)}
          className="w-full bg-surface-2 dark:bg-slate-900 border border-border dark:border-slate-700 text-text dark:text-slate-200 text-sm rounded-xl px-3 py-2"
        >
          {SCALE_TYPES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Note pills */}
        <div className="flex gap-2 flex-wrap">
          {scaleNotes.map((note) => {
            const pc = note.replace(/[0-9]/g, '')
            return (
              <span
                key={note}
                className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: NOTE_COLORS[pc] ?? '#64748b' }}
              >
                {pc}
              </span>
            )
          })}
        </div>

        {/* Fretboard */}
        <Fretboard
          instrument={instrument}
          highlightPCs={scalePCs}
          rootPC={scaleRoot}
          startFret={0}
          endFret={12}
          showNoteNames
        />
      </Card>

      {/* Theory topics */}
      <div className="space-y-2.5">
        {TOPICS.map(({ id, icon, title, desc, content }) => (
          <div key={id}>
            <button
              onClick={() => setActiveId(activeId === id ? null : id)}
              className="w-full flex items-center gap-4 bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-2xl px-4 py-3.5 text-left hover:border-brand-500/50 transition-colors"
            >
              <span className="text-2xl">{icon}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-text dark:text-slate-200">{title}</div>
                <div className="text-xs text-muted">{desc}</div>
              </div>
              <span className={`text-subtle transition-transform ${activeId === id ? 'rotate-90' : ''}`}>›</span>
            </button>
            {activeId === id && (
              <Card padding="md" className="rounded-t-none border-t-0 -mt-1 bg-surface-2 dark:bg-slate-900/50">
                <p className="text-sm text-muted leading-relaxed">{content}</p>
              </Card>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
