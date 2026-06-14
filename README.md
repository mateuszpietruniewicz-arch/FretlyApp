# Fretly

Interaktywna aplikacja webowa + mobilna (PWA) do nauki gry na gitarze elektrycznej i basowej.

## Stack

- **React + TypeScript** — frontend
- **Tailwind CSS v4** — styling, dark/light mode
- **Vite** — bundler, dev server
- **PWA** — działa na iOS/Android bez App Store
- **Supabase** — auth, baza danych, storage *(Faza 1)*
- **Web Audio API** — pitch detection, tuner, metronom *(Faza 2)*
- **Zustand** — state management

## Uruchomienie

```bash
npm install
npm run dev
```

## Fazy rozwoju

| Faza | Status | Opis |
|------|--------|------|
| 1 — Setup | ✅ | React + TypeScript + Tailwind + PWA |
| 2 — Audio | ⏳ | Pitch detection, tuner, metronom |
| 3 — UI | ⏳ | Design system, dark/light mode, nawigacja |
| 4 — Nauka | ⏳ | Lekcje, RPG, weryfikacja audio |
| 5 — Jammowanie | ⏳ | Loopy MIDI/MP3, time stretching |
| 6 — Narzędzia | ⏳ | Tabulatura, Tonex, Reaper |
| 7 — Polish | ⏳ | Testy, optymalizacja, VPS |

## Struktura folderów

```
src/
  components/
    ui/          # Design system (Button, Card...)
    audio/       # Komponenty audio (Tuner, Metronome...)
    guitar/      # Wizualizacja gryfu
    layout/      # Layout, TopBar, BottomNav
  pages/
    Home/        # Ekran startowy
    Learn/       # Moduł nauki
    Tools/       # Narzędzia (tuner, metronom, jam)
    Progress/    # Postępy i statystyki
    Theory/      # Teoria muzyki
  hooks/         # Custom React hooks
  lib/
    audio/       # Pitch detection, Web Audio API
    supabase/    # Klient Supabase
  types/         # TypeScript types
  store/         # Zustand store
```
