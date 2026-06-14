# FretlyApp — Plik Kontekstowy dla Claude Code

## Czym jest ten projekt

Aplikacja webowa + mobilna (PWA) do nauki gry na gitarze elektrycznej i basowej.
Nazwa: **FretlyApp** | Repo: `fretlyapp` na GitHubie
Skierowana na start do użytku własnego i znajomych, z możliwością późniejszego upublicznienia.
Aplikacja łączy interaktywną naukę, wykrywanie dźwięku w czasie rzeczywistym, teorię muzyki i narzędzia dla muzyków.

---

## Stack technologiczny

| Warstwa | Technologia | Powód wyboru |
|---|---|---|
| Frontend | **React + TypeScript** | Web + PWA z jednej bazy kodu |
| Styling | **Tailwind CSS** | Szybki development, dark/light mode out of the box |
| Mobile | **PWA (Progressive Web App)** | Działa na iOS i Android bez App Store, jeden codebase |
| Router | **React Router v6** | Nawigacja między widokami |
| State | **Zustand** | Prosty globalny state (audio, user, settings) |
| Backend | **Supabase** | Auth, baza danych PostgreSQL, storage — darmowy tier na start |
| Hosting (dev) | **Vercel** | CI/CD z GitHub automatycznie, darmowe |
| Hosting (prod) | **Własny serwer VPS** | Docelowo przeniesienie na własną domenę |
| Audio core | **Web Audio API** | Wbudowane w przeglądarkę, darmowe, zero zależności |
| Teoria muzyki | **tonal.js** | Kompletna biblioteka teorii muzyki (skale, akordy, interwały, tryby) — MIT license |
| MIDI playback | **Tone.js** | Odtwarzanie MIDI, time stretching, metronom, synteza dźwięku |
| Audio routing | **VB-Cable** (opcjonalnie) | Routing z Reapera/DAW do przeglądarki na Windows/Mac |

---

## Baza danych muzycznych — skąd pochodzi

### tonal.js — silnik teorii muzyki
Instalacja: `npm install tonal`

Dostarcza gotowe dane i funkcje dla:
- Wszystkich skal (durowe, molowe, modalne, egzotyczne)
- Pentatonik (major, minor, blues)
- Akordów i ich budowy
- Interwałów
- Trybów (Dorian, Phrygian, Lydian itp.)

```typescript
import { Scale, Chord, Note, Interval } from 'tonal';

Scale.get("A minor pentatonic").notes // ["A", "C", "D", "E", "G"]
Chord.get("Am7").notes               // ["A", "C", "E", "G"]
Note.freq("A4")                      // 440
```

### Pozycje na gryfie — własne pliki JSON
tonal.js daje nuty, ale NIE pozycje na gryfie. Claude Code wygeneruje:
- `fretboard-guitar.json` — mapa wszystkich nut na gryfie 6-strunowej gitary (24 progi, standard tuning EADGBE)
- `fretboard-bass.json` — mapa wszystkich nut na gryfie 4-strunowego basu (24 progi, standard tuning EADG)
- `scales-positions.json` — pozycje box patterns dla najpopularniejszych skal i pentatonik
- `chords-fingering.json` — pozycje palców dla akordów otwartych i barré

### Lekcje i content — generowane przez Claude Code
Struktura lekcji w JSON, przykład:
```json
{
  "id": "lesson_001",
  "title": "Otwarte struny gitary",
  "level": 1,
  "category": "notes",
  "instrument": "guitar",
  "content": {
    "theory": "Tekst wyjaśnienia...",
    "exercise": {
      "type": "pitch_detection",
      "notes_to_play": ["E2", "A2", "D3", "G3", "B3", "E4"],
      "order": "sequential",
      "tempo": null
    }
  }
}
```

---

## Audio — setup i architektura

### Jak działa wykrywanie dźwięku

```
Gitara → Interface audio (np. Focusrite Scarlett)
           ↓
    Sygnał się rozdziela:
    ├── DAW (Reaper) → efekty/amp → słuchawki (ładne brzmienie)
    └── Przeglądarka → czysty sygnał DI → wykrywanie nut (pitch detection)
```

- Użytkownik wybiera źródło audio w aplikacji (mikrofon / interface / wirtualny kabel)
- Web Audio API + `AnalyserNode` → analiza częstotliwości w czasie rzeczywistym
- Algorytm **YIN** do pitch detection (dokładniejszy niż ACF dla gitary)
- Margines błędu: **±25 centów** — wybaczający dla żywego grania, eliminuje fałszywe błędy
- Detekcja ciszy: próg amplitudy żeby nie wykrywać szumów gdy nikt nie gra

### Obsługiwane źródła audio (w kolejności jakości)

1. Interface audio podłączony do komputera ✅ najlepiej
2. VB-Cable / Voicemeeter — routing z DAW do przeglądarki ✅ dobrze
3. Mikrofon komputera ⚠️ ujdzie
4. Mikrofon telefonu ❌ odradzane

### Routing z Reaperem (opcjonalny)

```
Gitara → Interface → Reaper (efekty/amp dla brzmienia)
                          ↓ wysyłka na VB-Cable (wirtualny kabel)
                     Przeglądarka wybiera VB-Cable jako źródło mikrofonu
                     → czysty DI sygnał → pitch detection
```

---

## Funkcje aplikacji — lista i priorytety

### ETAP 1 — Fundament (MVP)

- [ ] Auth użytkownika (Supabase — email/hasło + Google OAuth)
- [ ] Profil użytkownika z zapisem postępów
- [ ] Wybór instrumentu na ekranie startowym: **Gitara elektryczna / Gitara basowa**
- [ ] Wykrywanie dźwięku z mikrofonu/interfejsu (pitch detection — algorytm YIN)
- [ ] Tuner chromatyczny (pierwszy działający feature audio)
- [ ] Metronom (standalone + zsynchronizowany z ćwiczeniami)

### ETAP 2 — Nauka (core feature)

- [ ] System poziomów: **5 stopni** (Początkujący / Podstawowy / Średni / Zaawansowany / Mistrz)
- [ ] System RPG: XP za ćwiczenia, odblokowane levele, odznaki
- [ ] Możliwość swobodnego skakania między lekcjami (poziom = sugestia, nie blokada)
- [ ] Nauka dźwięków — pojedyncze nuty, weryfikacja przez mikrofon
- [ ] Nauka skal (durowe, molowe, pentatoniki, tryby — tylko praktycznie potrzebne)
- [ ] Nauka pentatonik z wizualizacją pozycji na gryfie
- [ ] Weryfikacja grania w czasie rzeczywistym:
  - Aplikacja wyświetla nutę/nutę do zagrania
  - Słucha co grasz (pitch detection)
  - Pokazuje: ✅ dobrze / ❌ błąd (zagrałeś X zamiast Y)
  - Procent poprawności sesji (np. 8/12 nut = 66%)
  - Historia błędów w sesji
- [ ] Akordy i ich budowa (tonal.js + własne pozycje palców)
- [ ] Progresje akordowe (I-IV-V, ii-V-I, 12-bar blues, popularne rockowe)
- [ ] ABC grania od zera: pozycja rąk, kostka, techniki (hammer-on, pull-off, bend, vibrato, mute)

### ETAP 3 — Jammowanie z loopami

- [ ] Player perkusyjny — własne pliki MIDI (~100 plików) + MP3 fallback
- [ ] Time stretching — zmiana tempa bez zmiany tonacji (suwak BPM) przez Tone.js
- [ ] Tryb jamowania: loop gra w tle + na ekranie wyświetlona skala/pentatonika + weryfikacja nut
- [ ] Style loopów: rock, blues, jazz, metal, funk
- [ ] Filtrowanie loopów po stylu, BPM, metrum

### ETAP 4 — Teoria muzyki

- [ ] Interwały — co to jest i jak brzmią (z odsłuchem)
- [ ] Budowa skal i akordów — wizualnie i audio
- [ ] Rytm — nuty, pauzy, metrum (tylko podstawy)
- [ ] Tryby gitarowe (Dorian, Mixolydian — te które faktycznie używasz w rocku/bluzie)
- [ ] Interaktywne przykłady: kliknij → usłysz

### ETAP 5 — Narzędzia zaawansowane

- [ ] Edytor tabulatury (TAB) z zapisem do bazy + eksport do MP3
- [ ] Narzędzia na próbę: wspólny metronom online, lista setlisty
- [ ] Integracja z Reaperem: routing audio (VB-Cable) + opcjonalnie OSC start/stop nagrywania
- [ ] Integracja z Tonex: wyświetlanie aktywnego presetu + zmiana presetu przez MIDI Program Change
- [ ] Biblioteka własnych riffów z odsłuchem

---

## UX i design

- **Nazwa aplikacji:** FretlyApp
- **Styl:** nowoczesny, minimalistyczny, kolorowy — NIE generyczny z grafiką gitary
- **Motywy:** dark mode / light mode (przełącznik, domyślnie dark)
- **Mobile-first:** aplikacja musi działać świetnie na telefonie (PWA)
- **Zasada prostoty:** bardzo prosto w odbiorze — intuicyjne dla osoby bez wiedzy muzycznej
- **Wizualizacja gryfu:** abstrakcyjna (kółka, kolory, siatka) — NIE realistyczna grafika gitary
- **System kolorów nut:** każda z 12 nut ma swój kolor, spójny przez całą aplikację
  ```
  C=czerwony, C#=czerwono-pomarańczowy, D=pomarańczowy, D#=żółty,
  E=zielony, F=turkusowy, F#=niebieski, G=granatowy,
  G#=fioletowy, A=różowy, A#=różowo-czerwony, B=bordowy
  ```
- **Typografia:** nowoczesna bezszeryfowa (np. Inter lub Geist)
- **Animacje:** minimalne, tylko tam gdzie pomagają zrozumieć (np. podświetlenie wykrytej nuty)

---

## System nauki — szczegóły

### Poziomy zaawansowania

```
1. Początkujący  — otwarte struny, pierwsze nuty, pozycja rąk, kostka
2. Podstawowy    — pentatonika, pierwsze akordy, rytm, pierwsze rify
3. Średni        — skale durowe/molowe, progresje, techniki (HO/PO/bend)
4. Zaawansowany  — tryby, improwizacja, własne kompozycje
5. Mistrz        — własna droga, narzędzia zaawansowane, komponowanie
```

### System RPG

- XP za każde zaliczone ćwiczenie (więcej XP za wyższy % poprawności)
- Streak — seria kolejnych dni z ćwiczeniami
- Odznaki za osiągnięcia: "Pierwsza pentatonika", "7 dni z rzędu", "Tuner Pro", itp.
- Swobodne skakanie między lekcjami — poziom to sugestia, nie blokada
- Dashboard postępów z wykresem aktywności (jak GitHub contributions)

### Weryfikacja dźwięku — ekran ćwiczenia

```
┌─────────────────────────────────────┐
│  🥁 Blues Loop  [90 BPM ──●──────] │
│                                     │
│  Zagraj: A minor pentatonika        │
│  Pozycja: Box 1                     │
│                                     │
│  ┌─┬─┬─┬─┬─┐  ← wizualizacja gryfu │
│  │●│ │ │●│ │     (abstrakcyjna)     │
│  │ │ │●│ │●│                        │
│  └─┴─┴─┴─┴─┘                        │
│                                     │
│  Słyszę: [E] ✅  (wykryto: E3)      │
│  Poprawność: 5/7 (71%) ████░░░      │
└─────────────────────────────────────┘
```

---

## Integracje zewnętrzne

### Reaper / DAW
- **Poziom 1 (podstawowy):** routing audio przez VB-Cable — czysty DI do przeglądarki
- **Poziom 2 (opcjonalny):** sterowanie przez protokół OSC lub ReaScript — start/stop nagrywania z aplikacji

### Tonex (Software + Pedał)
- Wyświetlanie aktywnego presetu w aplikacji
- Zmiana presetu z poziomu aplikacji
- Integracja przez **Web MIDI API** → MIDI Program Change do Tonexa
- Działa zarówno z Tonex Software jak i Tonex Pedal (oba obsługują MIDI)

### Pliki MIDI — loopy perkusyjne
- ~100 własnych plików MIDI
- Odtwarzanie przez **Tone.js** (obsługuje MIDI natywnie w przeglądarce)
- Time stretching: Tone.js `Transport.bpm` — zmiana tempa bez zmiany tonacji
- MP3 fallback: jeśli MIDI nie działa na danym urządzeniu, konwersja offline
- Filtrowanie: styl (rock/blues/jazz/metal/funk) + BPM + metrum

---

## Baza danych — struktura (Supabase PostgreSQL)

```sql
-- Użytkownicy
users
  id uuid PRIMARY KEY
  email text UNIQUE
  username text
  instrument text CHECK (instrument IN ('guitar', 'bass'))
  created_at timestamptz

-- Postępy lekcji
user_progress
  id uuid PRIMARY KEY
  user_id uuid REFERENCES users(id)
  lesson_id text
  completed_at timestamptz
  accuracy_percent int
  xp_earned int

-- Statystyki i RPG
user_stats
  user_id uuid PRIMARY KEY REFERENCES users(id)
  total_xp int DEFAULT 0
  current_level int DEFAULT 1
  streak_days int DEFAULT 0
  last_practice_date date
  badges jsonb DEFAULT '[]'

-- Zapisane rify użytkownika
riffs
  id uuid PRIMARY KEY
  user_id uuid REFERENCES users(id)
  title text
  instrument text
  tab_content text
  audio_url text
  bpm int
  key text
  created_at timestamptz

-- Ustawienia użytkownika
user_settings
  user_id uuid PRIMARY KEY REFERENCES users(id)
  theme text DEFAULT 'dark'
  audio_source text DEFAULT 'microphone'
  pitch_detection_sensitivity int DEFAULT 25
  metronome_bpm int DEFAULT 80
  preferred_tuning text DEFAULT 'standard'
```

---

## Struktura plików projektu

```
fretlyapp/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker (offline)
│   └── icons/                 # App icons (PWA)
├── src/
│   ├── components/
│   │   ├── ui/                # Podstawowe komponenty (Button, Card, Modal)
│   │   ├── audio/             # AudioProvider, PitchDetector, Tuner, Metronome
│   │   ├── fretboard/         # Wizualizacja gryfu
│   │   ├── lessons/           # Komponenty lekcji
│   │   └── player/            # MIDI/MP3 player
│   ├── data/
│   │   ├── fretboard-guitar.json   # Pozycje nut na gryfie gitary
│   │   ├── fretboard-bass.json     # Pozycje nut na gryfie basu
│   │   ├── scales-positions.json   # Box patterns skal i pentatonik
│   │   ├── chords-fingering.json   # Pozycje akordów
│   │   └── lessons/               # Pliki JSON z lekcjami (po kategoriach)
│   ├── hooks/
│   │   ├── useAudio.ts        # Hook do Web Audio API
│   │   ├── usePitchDetection.ts
│   │   ├── useMetronome.ts
│   │   └── useSupabase.ts
│   ├── lib/
│   │   ├── tonal.ts           # Wrapper na tonal.js
│   │   ├── yin.ts             # Algorytm YIN do pitch detection
│   │   ├── supabase.ts        # Klient Supabase
│   │   └── midi.ts            # Obsługa MIDI (Tone.js + Web MIDI API)
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Learn.tsx
│   │   ├── Jam.tsx
│   │   ├── Tools.tsx          # Tuner, Metronom
│   │   ├── Theory.tsx
│   │   └── Profile.tsx
│   ├── store/
│   │   └── index.ts           # Zustand store
│   └── styles/
│       └── globals.css
├── CONTEXT.md                 # Ten plik
├── package.json
└── README.md
```

---

## Biblioteki do zainstalowania

```bash
npm install tonal              # Teoria muzyki (skale, akordy, nuty)
npm install tone               # MIDI playback, time stretching, metronom
npm install @supabase/supabase-js  # Backend
npm install zustand            # State management
npm install react-router-dom   # Routing
```

---

## Kolejność działań w Claude Code

### Faza 1 — Setup projektu
1. Inicjalizacja: `create-react-app fretlyapp --template typescript` lub Vite
2. Instalacja zależności (Tailwind, tonal, tone, supabase, zustand, react-router)
3. Konfiguracja PWA (manifest.json, service worker)
4. Setup Supabase (projekt, tabele z powyższego schematu SQL)
5. GitHub repo `fretlyapp` + CI/CD na Vercel
6. Struktura folderów jak powyżej

### Faza 2 — Audio core
7. Implementacja algorytmu YIN (`src/lib/yin.ts`)
8. Hook `usePitchDetection` — Web Audio API + YIN
9. Tuner chromatyczny (pierwszy widoczny dowód działania audio)
10. Metronom z Tone.js (audio click + wizualny beat)
11. Wybór źródła audio (mikrofon / interface / VB-Cable)

### Faza 3 — Dane muzyczne
12. Generowanie `fretboard-guitar.json` i `fretboard-bass.json`
13. Generowanie `scales-positions.json` (box patterns przez tonal.js)
14. Generowanie `chords-fingering.json`
15. Generowanie pierwszych 20 lekcji w JSON (Etap 1 i 2 programu nauki)

### Faza 4 — UI i nawigacja
16. Design system (kolory nut, typografia, komponenty bazowe)
17. Dark/light mode
18. Ekran startowy z wyborem instrumentu (gitara / bas)
19. Nawigacja główna (Nauka / Jam / Narzędzia / Teoria / Profil)
20. Komponenty wizualizacji gryfu (abstrakcyjne, kolorowe)

### Faza 5 — Moduł nauki
21. System poziomów i RPG (XP, odznaki, postępy w Supabase)
22. Widok listy lekcji z filtrowaniem
23. Moduł nauki nut z weryfikacją audio
24. Moduł skal i pentatonik (wizualizacja + weryfikacja w czasie rzeczywistym)
25. Moduł akordów i progresji
26. Moduł teorii muzyki (podstawy)
27. Ekran wyników sesji (% poprawności, XP, błędy)

### Faza 6 — Jammowanie
28. Player MIDI z Tone.js + time stretching
29. Biblioteka loopów z filtrowaniem
30. Tryb jamowania (loop + skala na ekranie + weryfikacja nut równolegle)

### Faza 7 — Narzędzia zaawansowane
31. Edytor tabulatury + zapis do Supabase + eksport MP3
32. Integracja Tonex (Web MIDI API → Program Change)
33. Integracja Reaper (VB-Cable routing + opcjonalnie OSC)
34. Narzędzia na próbę (metronom grupowy, setlista)

### Faza 8 — Polish i deployment
35. Testy PWA na iOS i Android
36. Optymalizacja offline (service worker cache dla lekcji i danych)
37. Przeniesienie na własny VPS
38. System zaproszeń dla znajomych

---

## Ważne decyzje i notatki

- **Gitara vs bas:** osobne tryby — gryfy, ćwiczenia i pozycje dostosowane do każdego instrumentu. Przełącznik na ekranie startowym + możliwość zmiany w ustawieniach.
- **tonal.js jako jedyne źródło prawdy** dla teorii muzyki — nie kodujemy ręcznie interwałów ani skal.
- **Tabulatura priorytet nad nutami** — bardziej naturalna dla gitarzystów elektrycznych.
- **Offline first:** PWA cache — lekcje, dane muzyczne i narzędzia działają bez internetu po pierwszym załadowaniu. Tylko synchronizacja postępów wymaga internetu.
- **Konta osobiste:** każdy użytkownik ma własne konto z osobnymi postępami (Supabase Auth).
- **Margines pitch detection:** ±25 centów — wybaczający dla żywego grania.
- **Loop tempo:** time stretching przez Tone.js — zmiana BPM suwakiem bez zmiany tonacji.
- **System kolorów nut** jest spójny przez całą aplikację (gryf, lekcje, tuner, teoria).
- **Vite zamiast CRA** — szybszy development build, lepsze wsparcie dla PWA.
