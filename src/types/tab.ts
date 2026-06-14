export type Technique = 'h' | 'p' | 'b' | 'b1/2' | 'r' | '~' | 's' | 'S' | '/' | '\\' | 'x' | 't' | 'PM'
export type Duration = '1' | '2' | '4' | '8' | '16' | '1.' | '2.' | '4.' | '8.'
export type Dynamic = 'ppp' | 'pp' | 'p' | 'mf' | 'f' | 'ff'
export type TimeSignature = '4/4' | '3/4' | '6/8'

export interface TabNote {
  id: string
  string: number           // 1 = najwyższa (e), 6 = najniższa (E) dla gitary
  fret: number | null      // 0-24, null = pauza
  duration: Duration
  techniques: Technique[]
  dynamic: Dynamic
  beatPosition: number     // ćwierćnuty od początku taktu (0.0 - 3.99 dla 4/4)
}

export interface TabBar {
  id: string
  barNumber: number
  notes: TabNote[]
  timeSignature: TimeSignature
}

export interface TabCursor {
  barIndex: number         // 0-indexed
  string: number           // 1-6 (gitara) / 1-4 (bas)
  beatPosition: number     // ćwierćnuty
}

export interface TabDocument {
  id: string
  title: string
  instrument: 'guitar' | 'bass'
  tuning: 'standard' | 'drop-d' | 'open-g'
  tempo: number
  timeSignature: TimeSignature
  key: string              // np. "Am", "C", "G"
  bars: TabBar[]
  createdAt: string
  updatedAt: string
}
