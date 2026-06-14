import * as Tone from 'tone'
import { getNoteAtFret, BEATS_PER_BAR } from './tabUtils'
import type { TabDocument, Duration } from '@/types/tab'
import type { TabInstrument } from './audioSources'
import { CDN_BASE, SAMPLER_URLS } from './audioSources'

const DURATION_MAP: Record<Duration, string> = {
  '1': '1n', '2': '2n', '4': '4n', '8': '8n', '16': '16n',
  '1.': '1n.', '2.': '2n.', '4.': '4n.', '8.': '8n.',
}

const DYNAMIC_VEL: Record<string, number> = {
  'ppp': 0.15, 'pp': 0.3, 'p': 0.45, 'mf': 0.65, 'f': 0.8, 'ff': 1.0,
}

export class TabPlayer {
  private sampler: Tone.Sampler | null = null
  private loadedInstrument: TabInstrument | null = null
  private _isLoaded = false
  private _isLoading = false

  get isLoaded(): boolean { return this._isLoaded }
  get isLoading(): boolean { return this._isLoading }

  async load(instrument: TabInstrument): Promise<void> {
    if (this._isLoaded && this.loadedInstrument === instrument) return
    if (this._isLoading) return

    this._isLoading = true
    this._isLoaded = false
    this.sampler?.dispose()
    this.sampler = null
    this.loadedInstrument = instrument

    return new Promise<void>((resolve, reject) => {
      try {
        this.sampler = new Tone.Sampler({
          urls: SAMPLER_URLS[instrument],
          baseUrl: `${CDN_BASE}/${instrument}/`,
          onload: () => {
            this._isLoaded = true
            this._isLoading = false
            resolve()
          },
          onerror: (err) => {
            this._isLoading = false
            reject(new Error(`Nie można załadować próbek: ${String(err)}`))
          },
        }).toDestination()
      } catch (err) {
        this._isLoading = false
        reject(err)
      }
    })
  }

  scheduleDoc(doc: TabDocument): void {
    const transport = Tone.getTransport()
    transport.stop()
    transport.cancel(0)

    const bpb = BEATS_PER_BAR[doc.timeSignature]
    const secsPerBeat = 60 / doc.tempo

    for (let bIdx = 0; bIdx < doc.bars.length; bIdx++) {
      const bar = doc.bars[bIdx]
      for (const note of bar.notes) {
        if (note.fret === null) continue

        const noteName = getNoteAtFret(note.string, note.fret, doc.instrument)
        const startSecs = (bIdx * bpb + note.beatPosition) * secsPerBeat
        const toneDuration = DURATION_MAP[note.duration] ?? '4n'
        const velocity = DYNAMIC_VEL[note.dynamic] ?? 0.65

        transport.schedule((time) => {
          if (!this.sampler || !this._isLoaded) return
          try {
            this.sampler.triggerAttackRelease(noteName, toneDuration, time, velocity)
          } catch { /* ignore out-of-range notes */ }
        }, `${startSecs}s`)
      }
    }
  }

  start(): void {
    // "+0.05" = slight delay so all scheduled callbacks are already registered
    Tone.getTransport().start('+0.05', 0)
  }

  stop(): void {
    Tone.getTransport().stop()
    Tone.getTransport().cancel(0)
  }

  dispose(): void {
    this.stop()
    this.sampler?.dispose()
    this.sampler = null
    this._isLoaded = false
    this._isLoading = false
    this.loadedInstrument = null
  }
}
