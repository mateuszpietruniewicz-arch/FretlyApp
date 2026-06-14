# GuitarLearn App — Plik Kontekstowy dla Claude Code

## Czym jest ten projekt

Aplikacja webowa + mobilna (PWA) do nauki gry na gitarze elektrycznej i basowej.
Skierowana na start do użytku własnego i znajomych, z możliwością późniejszego upublicznienia.
Aplikacja łączy interaktywną naukę, wykrywanie dźwięku w czasie rzeczywistym, teorię muzyki i narzędzia dla muzyków.

---

## Stack technologiczny (rekomendowany)

| Warstwa | Technologia | Powód wyboru |
|---|---|---|
| Frontend | **React + TypeScript** | Web + PWA (mobile) z jednej bazy kodu |
| Styling | **Tailwind CSS** | Szybki development, dark/light mode out of the box |
| Mobile | **PWA (Progressive Web App)** | Działa na iOS i Android bez App Store, jeden codebase |
| Backend | **Supabase** | Auth, baza danych, storage — darmowy tier wystarcza na start |
| Hosting (dev) | **GitHub Pages / Vercel** | Darmowe, CI/CD z GitHub automatycznie |
| Hosting (prod) | **Własny serwer VPS** | Docelowo przeniesienie na własną domenę |
| Audio API | **Web Audio API** | Wbudowane w przeglądarkę, darmowe, zero zewnętrznych zależności |
| Audio routing | **VB-Cable (opcjonalnie)** | Routing z Reapera/DAW do przeglądarki |

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
- Algorytm YIN lub ACF (Autocorrelation Function) do pitch detection
- Margines błędu: ±25 centów (ćwierć tonu) — wystarczająco precyzyjny, wybaczający dla początkujących

### Obsługiwane źródła audio

1. Interface audio podłączony do komputera (najlepsza jakość) ✅
2. VB-Cable / Voicemeeter — routing z DAW do przeglądarki ✅
3. Mikrofon komputera — ujdzie ⚠️
4. Mikrofon telefonu — odradzane ❌

---

## Funkcje aplikacji — lista i priorytety

### ETAP 1 — Fundament (MVP)

- [ ] Auth użytkownika (Supabase — email/hasło + opcja Google)
- [ ] Profil użytkownika z zapisem postępów
- [ ] Wybór instrumentu na ekranie startowym: **Gitara elektryczna / Gitara basowa**
- [ ] Wykrywanie dźwięku z mikrofonu/interfejsu (pitch detection)
- [ ] Tuner chromatyczny
- [ ] Metronom (standalone + zsynchronizowany z ćwiczeniami)

### ETAP 2 — Nauka (core feature)

- [ ] System poziomów: **5 stopni** (Początkujący / Podstawowy / Średni / Zaawansowany / Mistrz)
- [ ] System RPG: XP za ćwiczenia, odblokowane levele, odznaki
- [ ] Możliwość skakania między lekcjami (nie jesteś zablokowany)
- [ ] Nauka dźwięków — pojedyncze nuty, weryfikacja przez mikrofon
- [ ] Nauka skal (durowe, molowe, pentatoniki, tryby — tylko to co praktycznie potrzebne)
- [ ] Nauka pentatonik z wizualizacją na gryfie
- [ ] Weryfikacja grania skal w czasie rzeczywistym:
  - Aplikacja wyświetla nutę do zagrania
  - Słucha co grasz
  - Pokazuje: ✅ dobrze / ❌ błąd (zagrałeś X zamiast Y)
  - Procent poprawności sesji (np. 8/12 nut = 66%)
- [ ] Akordy i ich budowa
- [ ] Progresje akordowe (popularne: I-IV-V, ii-V-I, 12-bar blues itp.)
- [ ] ABC grania od zera: pozycja rąk, kostka, techniki (hammer-on, pull-off, bend, vibrato)

### ETAP 3 — Jammowanie z loopami

- [ ] Player perkusyjny z własnymi plikami MIDI/MP3
- [ ] Time stretching — zmiana tempa bez zmiany tonacji (suwak BPM)
- [ ] Tryb jamowania: loop gra w tle + na ekranie wyświetlona skala/pentatonika + weryfikacja nut
- [ ] Style loopów: rock, blues, jazz, metal, funk (do uzupełnienia własnymi plikami ~100 plików)
- [ ] Format: MIDI (natywny) + MP3 jako fallback

### ETAP 4 — Teoria muzyki

- [ ] Sekcja teorii: interwały, budowa skal, akordy, rytm
- [ ] Tylko to co praktycznie potrzebne gitarzyście — bez akademickiej nadmiarowości
- [ ] Interaktywne przykłady (kliknij dźwięk → usłysz)

### ETAP 5 — Narzędzia zaawansowane

- [ ] Zapis riffów: tabulatura (TAB) + eksport do MP3
- [ ] Narzędzia na próbę: wspólny metronom, lista setlisty
- [ ] Integracja z Reaperem: routing audio (VB-Cable) + opcjonalnie OSC/ReaScript do start/stop nagrywania
- [ ] Integracja z Tonex (software + pedał): wyświetlanie aktywnego presetu, możliwość zmiany presetu z aplikacji

---

## UX i design

- **Styl:** nowoczesny, minimalistyczny, kolorowy — NIE generyczny z grafiką gitary
- **Motywy:** dark mode / light mode (przełącznik)
- **Mobile-first:** aplikacja musi działać świetnie na telefonie
- **Zasada:** bardzo prosto w odbiorze — dziecko powinno zrozumieć co ma zrobić
- **Wizualizacja gryfu:** abstrakcyjna, nie realistyczna grafika gitary (unikamy generycznego wyglądu)
- **Kolory nut/skal:** każda nuta ma swój kolor (system kolorystyczny spójny przez całą aplikację)

---

## System nauki — szczegóły

### Poziomy zaawansowania

```
1. Początkujący  — otwarte struny, pierwsze nuty, pozycja rąk
2. Podstawowy    — pentatonika, pierwsze akordy, rytm
3. Średni        — skale, progresje, techniki
4. Zaawansowany  — tryby, improwizacja, kompozycja
5. Mistrz        — własna droga, narzędzia zaawansowane
```

### System RPG

- XP za każde zaliczone ćwiczenie
- Streak (seria dni z ćwiczeniami)
- Odznaki za osiągnięcia (np. "Pierwsza pentatonika", "7 dni z rzędu")
- Możliwość swobodnego skakania po lekcjach — poziom to sugestia, nie blokada

### Weryfikacja dźwięku — jak działa

```
Ekran ćwiczenia:
┌─────────────────────────────────┐
│  Loop perkusyjny: BLUES 90 BPM  │
│  [========●====] suwak tempa    │
│                                 │
│  Zagraj: A minor pentatonika    │
│                                 │
│  ● A  ○ C  ● D  ○ E  ● G       │  ← podświetlone nuty do zagrania
│                                 │
│  Słyszę: [E] ✅                 │
│  Poprawność: 5/7 (71%)          │
└─────────────────────────────────┘
```

---

## Integracje zewnętrzne

### Reaper / DAW
- Poziom 1 (obowiązkowy): routing audio przez VB-Cable — czysty DI do przeglądarki
- Poziom 2 (opcjonalny): sterowanie przez OSC lub ReaScript — start/stop nagrywania z aplikacji

### Tonex (Software + Pedał)
- Wyświetlanie aktywnego presetu w aplikacji
- Możliwość zmiany presetu z poziomu aplikacji
- Integracja przez MIDI (Tonex obsługuje MIDI Program Change)

### Pliki MIDI (loopy perkusyjne)
- ~100 plików MIDI własnych
- Odtwarzanie przez Web MIDI API lub konwersja do MP3
- Time stretching: biblioteka **Tone.js** lub **Web Audio API + OfflineAudioContext**
- Tempa: dowolne BPM ustawiane suwakiem przez użytkownika

---

## Baza danych — struktura (Supabase)

```
users
  id, email, username, created_at, instrument (guitar/bass)

user_progress
  user_id, lesson_id, completed_at, accuracy_percent, xp_earned

lessons
  id, title, level (1-5), category (notes/scales/chords/theory), content_json

user_stats
  user_id, total_xp, current_level, streak_days, badges[]

riffs
  id, user_id, title, tab_content, audio_url, created_at
```

---

## Kolejność działań w Claude Code

### Faza 1 — Setup projektu
1. Inicjalizacja projektu React + TypeScript + Tailwind
2. Konfiguracja PWA (manifest, service worker)
3. Setup Supabase (auth, tabele z powyższego schematu)
4. GitHub repo + CI/CD na Vercel

### Faza 2 — Audio core
5. Implementacja pitch detection (Web Audio API + algorytm YIN)
6. Tuner chromatyczny (pierwszy widoczny efekt działania audio)
7. Metronom z wizualnym i audio click
8. Wybór źródła audio (mikrofon / interface / VB-Cable)

### Faza 3 — UI i nawigacja
9. Design system (kolory, typografia, komponenty)
10. Dark/light mode
11. Ekran startowy z wyborem instrumentu
12. Nawigacja główna (Nauka / Narzędzia / Postępy / Teoria)

### Faza 4 — Nauka
13. System poziomów i RPG (XP, odznaki, postępy)
14. Moduł nauki nut z weryfikacją audio
15. Moduł skal i pentatonik z wizualizacją + weryfikacja
16. Moduł akordów i progresji
17. Moduł teorii muzyki (podstawy)

### Faza 5 — Jammowanie
18. Player MIDI/MP3 z time stretching
19. Tryb jamowania (loop + skala na ekranie + weryfikacja)
20. Biblioteka loopów z filtrowaniem po stylu i BPM

### Faza 6 — Narzędzia zaawansowane
21. Edytor tabulatury + eksport MP3
22. Integracja Tonex (MIDI)
23. Integracja Reaper (VB-Cable routing + opcjonalnie OSC)
24. Narzędzia na próbę (metronom grupowy, setlista)

### Faza 7 — Polish i deployment
25. Testy na telefonie (iOS + Android)
26. Optymalizacja offline (PWA cache)
27. Przeniesienie na własny VPS
28. System kont dla znajomych

---

## Ważne decyzje i notatki

- **Gitara vs bas:** osobne tryby z przełącznikiem na ekranie startowym — gryfy i ćwiczenia dostosowane do każdego instrumentu
- **Teoria muzyki:** tylko praktyczna — interwały, budowa skal i akordów, rytm. Bez harmonii akademickiej.
- **Tabulatura:** priorytet nad nutami — bardziej naturalna dla gitarzystów
- **Offline:** PWA z cache — lekcje i narzędzia działają bez internetu po pierwszym załadowaniu
- **Konta:** każdy użytkownik ma własne konto z osobnymi postępami
- **Margines pitch detection:** ±25 centów (wybaczający dla żywego grania, eliminuje fałszywe błędy)
- **Loop tempo:** time stretching bez zmiany tonacji — użytkownik ustawia BPM suwakiem niezależnie od tempa nagrania
