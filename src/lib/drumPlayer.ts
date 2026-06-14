import * as Tone from 'tone'
import type { DrumVoice } from './midiParser'

const SAMPLE_BASE = '/samples/'

const SAMPLE_URLS: Record<DrumVoice, string> = {
  'kick':         'kick.wav',
  'snare':        'snare.wav',
  'hihat-closed': 'hihat-closed.wav',
  'hihat-open':   'hihat-open.wav',
  'crash':        'crash.wav',
  'ride':         'ride.wav',
  'tom-low':      'tom-low.wav',
  'tom-high':     'tom-high.wav',
}

export class DrumPlayer {
  private masterVol: Tone.Volume
  private players: Tone.Players
  private _isLoaded = false

  get isLoaded(): boolean { return this._isLoaded }

  constructor() {
    this.masterVol = new Tone.Volume(-3).toDestination()

    this.players = new Tone.Players({
      urls: SAMPLE_URLS,
      baseUrl: SAMPLE_BASE,
      onload: () => { this._isLoaded = true },
    }).connect(this.masterVol)
  }

  async load(): Promise<void> {
    // Tone.loaded() resolves when all buffers are loaded
    await Tone.loaded()
    this._isLoaded = true
  }

  play(voice: DrumVoice, time?: number, velocity = 0.8): void {
    if (!this._isLoaded) return
    try {
      const player = this.players.player(voice)
      // Scale volume by velocity (convert to dB)
      player.volume.value = velocity >= 1 ? 0 : 20 * Math.log10(Math.max(velocity, 0.01))
      if (time !== undefined) {
        player.start(time)
      } else {
        player.start()
      }
    } catch {
      // Player not ready or disposed
    }
  }

  setVolume(db: number): void {
    this.masterVol.volume.value = db
  }

  dispose(): void {
    this.players.dispose()
    this.masterVol.dispose()
  }
}
