# FretlyApp — kontekst dla Claude Code

PWA do nauki gitary elektrycznej i basu. React + audio + wizualizacja.

---

## Stack

| Warstwa | Technologia |
|---|---|
| UI | React 19, TypeScript ~6.0, Tailwind CSS v4 |
| Routing | React Router v7 (BrowserRouter, v6-style `<Routes>`) |
| Stan | Zustand v5 + persist → localStorage `fretly-app` |
| Teoria muzyki | tonal.js v6 — jedyne źródło prawdy (nuty, skale, interwały) |
| Audio/MIDI | Tone.js v15 (`tone`), `@tonejs/midi` v2 |
| Pitch detection | YIN — `src/lib/yin.ts` (własna implementacja) |
| Backend | Supabase v2 — może nie być skonfigurowane (patrz niżej) |
| Build | Vite 8, `vite-plugin-pwa` v1 |

---

## Struktura `src/`

```
src/
├── App.tsx                        # BrowserRouter + wszystkie Route
├── main.tsx
├── styles/globals.css             # @import "tailwindcss" + tokeny CSS
│
├── types/
│   ├── index.ts                   # Instrument, Level, UserProfile, UserProgress…
│   ├── lesson.ts                  # ExerciseType, Lesson, SessionResult…
│   └── tab.ts                     # Technique, Duration, TabNote, TabBar, TabDocument…
│
├── store/index.ts                 # Zustand: instrument, theme, user…
│
├── lib/
│   ├── tonal.ts                   # noteColor(), NOTE_COLORS, getScaleNotes()…
│   ├── yin.ts                     # Algorytm YIN do pitch detection
│   ├── supabase.ts                # Klient Supabase (z placeholderami jeśli brak .env)
│   ├── progressService.ts         # saveProgress(), isConfigured() guard
│   ├── tabUtils.ts                # DURATION_BEATS, setNote(), moveCursor(), renderTabASCII()
│   ├── drumPlayer.ts              # Tone.Players z WAV z public/samples/
│   ├── midiParser.ts              # parseMidiFile(), DrumVoice, DrumEvent
│   ├── midi.ts                    # Tone.js helpers
│   └── cn.ts                      # clsx helper
│
├── hooks/
│   ├── useAudio.ts                # Web Audio API: AudioContext, analyser
│   ├── usePitchDetection.ts       # YIN loop → { pitch, pitchClass }
│   ├── useMetronome.ts            # Tone.js metronom
│   ├── useLessonSession.ts        # Maszyna stanów lekcji (waiting/cooldown/complete)
│   ├── useJamSession.ts           # MIDI loop player, BPM time-stretch
│   ├── useTabEditor.ts            # Stan edytora TAB, historia, onKeyDown
│   └── useSupabase.ts             # Auth + queries
│
├── components/
│   ├── ui/                        # Button, Card, Modal, Badge
│   ├── layout/                    # Layout, TopBar, BottomNav
│   ├── audio/                     # Tuner, Metronome, AudioSourceSelector
│   ├── fretboard/                 # Fretboard.tsx (SVG, kolory nut)
│   ├── lessons/                   # NoteTarget, LessonProgress, LessonExercise, LessonResults
│   ├── jam/                       # LoopBrowser, JamControls, ScaleOverlay
│   └── tab-editor/                # TabEditor, TabBar, TabNote, TabCursor
│
├── pages/                         # Płasko, bez nested folderów
│   ├── Home.tsx, Learn.tsx, Jam.tsx, Theory.tsx, Profile.tsx
│   ├── LessonPage.tsx             # /learn/lesson/:id
│   ├── Tools.tsx                  # /tools — sub-nav + <Outlet />
│   ├── TunerPage.tsx              # /tools/tuner
│   ├── MetronomePage.tsx          # /tools/metronome
│   └── TabEditorPage.tsx          # /tools/tab
│
└── data/
    ├── lessons/level1.json        # 10 lekcji (lesson_001–010)
    ├── lessons/level2.json        # 10 lekcji (lesson_011–020)
    ├── loops-manifest.json        # 20 loopów MIDI (breeze 96 BPM / shuffle 130 BPM)
    ├── fretboard-guitar.json
    ├── fretboard-bass.json
    ├── scales-positions.json
    └── chords-fingering.json
```

---

## Konwencje

### Tailwind CSS v4
- Konfiguracja w CSS: `@import "tailwindcss"` w `globals.css`, **nie** `tailwind.config.js`
- Dark mode: `@variant dark (&:where(.dark, .dark *))` — klasa `dark` na `<html>`
- Tokeny semantyczne: `bg-bg`, `bg-surface`, `bg-surface-2`, `border-border`, `text-text`, `text-muted`, `text-subtle`
- Brand: `brand-500` / `brand-600` / `brand-700` (oklch, fioletowy)

### System kolorów 12 nut
Używaj `noteColor(noteName)` z `src/lib/tonal.ts`. Nie koduj kolorów ręcznie.

```
C  #ef4444  C# #fb923c  D  #f97316  D# #eab308
E  #22c55e  F  #14b8a6  F# #3b82f6  G  #1e40af
G# #a855f7  A  #ec4899  A# #f43f5e  B  #9f1239
```

### Supabase — graceful degradation
Klient zawsze tworzony (z placeholderami). Przed każdym call do DB sprawdzaj:
```ts
// src/lib/progressService.ts
function isConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  return Boolean(url) && !url.includes('placeholder') && !url.includes('your-project')
}
```

### TypeScript
- Strict mode. Unikaj `any` — jeśli konieczne, dodaj `// eslint-disable-next-line`
- Importy aliasem: `@/` → `src/` (skonfigurowane w `vite.config.ts`)

### Tone.js
- `Tone.Players` API: `players.player(name)` (nie `.get(name)`)
- BPM time-stretch: skaluj czasy eventów `ratio = originalBpm / targetBpm`, nie używaj `Transport.bpm`
- Zawsze `await Tone.start()` przed pierwszym odtwarzaniem (wymagane przez Safari)

### Gryf (tuning standardowy)
```ts
// Gitara: struny 1–6 (1 = najwyższa)
['E4', 'B3', 'G3', 'D3', 'A2', 'E2']
// Bas: struny 1–4
['G2', 'D2', 'A1', 'E1']
```
Obliczanie nuty na progu: `Note.transpose(openNote, Interval.fromSemitones(fret))`

---

## Zasoby audio

### CDN (bez pobierania)
```
Gitara elektryczna:  https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-electric/
Gitara nylonowa:     https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-nylon/
Gitara akustyczna:   https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-acoustic/
Bas elektryczny:     https://nbrosowsky.github.io/tonejs-instruments/samples/bass-electric/
Piano (Salamander):  https://tonejs.github.io/audio/salamander/
```
Plik audio: `{NuTa}{Oktawa}.mp3` np. `A3.mp3`, `Cs4.mp3` (`#` → `s`)

### Lokalne
```
public/samples/*.wav    — 8 plików bębnów (kick/snare/hihat-closed/hihat-open/crash/ride/tom-low/tom-high)
public/loops/*.mid      — 20 loopów MIDI (drums-{BPM}-{styl}-{part}.mid)
```

---

## Stan realizacji

### Gotowe ✅
- **Faza 1–4**: Setup, audio core (YIN pitch detection), dane muzyczne (20 lekcji), UI/design system
- **Faza 5**: Moduł nauki — `/learn/lesson/:id`, `useLessonSession`, LessonExercise (pitch_detection / listening / free_jam), LessonResults, zapis XP do Supabase, nawigacja prev/next
- **Faza 6**: Jam mode — MIDI drum loops, `DrumPlayer` (WAV), `useJamSession`, BPM time-stretch (debounce 300ms), LoopBrowser, ScaleOverlay, live pitch overlay
- **Faza 7A**: Fundament edytora TAB — `src/types/tab.ts`, `src/lib/tabUtils.ts`, `useTabEditor`, TabEditor/TabBar/TabNote/TabCursor, trasa `/tools/tab`

### Do zrobienia ⏳
| Faza | Zakres |
|---|---|
| **7B** | ✅ Toolbar (TabToolbar), zaznaczanie Shift+←→, clipboard Ctrl+C/V/X, zapis localStorage (debounce 1s), TabExportModal, TabShortcuts |
| **7C** | Odtwarzanie TAB przez `Tone.Sampler` z CDN gitarowym, synchronizacja kursora z odtwarzaniem |
| **7D** | Eksport ASCII/TXT/MP3, zapis do Supabase (`riffs` tabela), Tonex MIDI, narzędzia na próbę (live looper) |
| **Faza 8** | PWA: offline cache, ikony, instalacja na telefonie; VPS deployment; konta znajomych; ustawienia prywatności |

---

## Instrukcja dla Claude Code

1. **Nie skanuj całego projektu** na początku sesji — ten plik zastępuje rekonesans
2. **Czytaj tylko pliki które modyfikujesz** lub które są wprost wymienione w zadaniu
3. **Przed każdą zmianą** sprawdź `grep` czy symbol/komponent już istnieje — unikaj duplikatów
4. **Nie instaluj zależności** których nie ma w `package.json` bez potwierdzenia użytkownika
5. **Sprawdzaj build** po każdej fazie: `node_modules/.bin/tsc --noEmit` (node w `/Users/mateusz/.nvm/versions/node/v22.22.3/bin/node`)
6. Jeśli potrzebujesz więcej kontekstu — pytaj o konkretny plik, nie skanuj wszystkiego
