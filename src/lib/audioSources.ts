export type TabInstrument = 'guitar-electric' | 'guitar-nylon' | 'guitar-acoustic' | 'bass-electric'

export const INSTRUMENT_LABELS: Record<TabInstrument, string> = {
  'guitar-electric': 'Gitara elektryczna',
  'guitar-nylon':    'Gitara nylonowa',
  'guitar-acoustic': 'Gitara akustyczna',
  'bass-electric':   'Bas elektryczny',
}

export const CDN_BASE = 'https://nbrosowsky.github.io/tonejs-instruments/samples'

// Notes available on CDN per instrument; Sampler pitch-shifts between these
export const SAMPLER_URLS: Record<TabInstrument, Record<string, string>> = {
  'guitar-electric': {
    'E2': 'E2.mp3', 'A2': 'A2.mp3', 'D3': 'D3.mp3', 'G3': 'G3.mp3',
    'B3': 'B3.mp3', 'E4': 'E4.mp3', 'A4': 'A4.mp3', 'D5': 'D5.mp3',
    'G5': 'G5.mp3', 'B5': 'B5.mp3',
  },
  'guitar-nylon': {
    'E2': 'E2.mp3', 'A2': 'A2.mp3', 'D3': 'D3.mp3', 'G3': 'G3.mp3',
    'B3': 'B3.mp3', 'E4': 'E4.mp3', 'A4': 'A4.mp3', 'D5': 'D5.mp3',
    'G5': 'G5.mp3', 'B5': 'B5.mp3',
  },
  'guitar-acoustic': {
    'E2': 'E2.mp3', 'A2': 'A2.mp3', 'D3': 'D3.mp3', 'G3': 'G3.mp3',
    'B3': 'B3.mp3', 'E4': 'E4.mp3', 'A4': 'A4.mp3', 'D5': 'D5.mp3',
    'G5': 'G5.mp3', 'B5': 'B5.mp3',
  },
  'bass-electric': {
    'E1': 'E1.mp3', 'A1': 'A1.mp3', 'D2': 'D2.mp3', 'G2': 'G2.mp3',
    'E2': 'E2.mp3', 'A2': 'A2.mp3', 'D3': 'D3.mp3', 'G3': 'G3.mp3',
  },
}
