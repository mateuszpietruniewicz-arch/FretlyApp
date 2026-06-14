import * as Tone from 'tone'
import type { DrumVoice } from './midiParser'

export class DrumPlayer {
  private masterVol: Tone.Volume
  private kick: Tone.MembraneSynth
  private snare: Tone.NoiseSynth
  private hihatClosed: Tone.MetalSynth
  private hihatOpen: Tone.MetalSynth
  private crash: Tone.MetalSynth
  private ride: Tone.MetalSynth
  private tomLow: Tone.MembraneSynth
  private tomHigh: Tone.MembraneSynth

  // Synths are always ready — no async loading needed
  readonly isLoaded = true

  constructor() {
    this.masterVol = new Tone.Volume(-3).toDestination()

    this.kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 6,
      envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.3 },
    }).connect(this.masterVol)

    this.snare = new Tone.NoiseSynth({
      noise: { type: 'white' as const },
      envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.05 },
    }).connect(this.masterVol)

    this.hihatClosed = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.06, release: 0.03 },
      harmonicity: 5.1,
      modulationIndex: 16,
      resonance: 5000,
      octaves: 1.5,
    }).connect(this.masterVol)
    this.hihatClosed.frequency.value = 1000
    this.hihatClosed.volume.value = -10

    this.hihatOpen = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.28, release: 0.18 },
      harmonicity: 5.1,
      modulationIndex: 16,
      resonance: 5000,
      octaves: 1.5,
    }).connect(this.masterVol)
    this.hihatOpen.frequency.value = 1000
    this.hihatOpen.volume.value = -10

    this.crash = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.8, release: 0.4 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 3000,
      octaves: 2,
    }).connect(this.masterVol)
    this.crash.frequency.value = 600
    this.crash.volume.value = -5

    this.ride = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.35, release: 0.15 },
      harmonicity: 5.1,
      modulationIndex: 16,
      resonance: 3000,
      octaves: 1.5,
    }).connect(this.masterVol)
    this.ride.frequency.value = 700
    this.ride.volume.value = -8

    this.tomLow = new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 4,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.2 },
    }).connect(this.masterVol)

    this.tomHigh = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.15 },
    }).connect(this.masterVol)
  }

  play(voice: DrumVoice, time?: number, velocity = 0.8): void {
    try {
      switch (voice) {
        case 'kick':
          this.kick.triggerAttackRelease('C1', '8n', time, velocity)
          break
        case 'snare':
          this.snare.triggerAttackRelease('16n', time, velocity)
          break
        case 'hihat-closed':
          this.hihatClosed.triggerAttackRelease(
            this.hihatClosed.frequency.value, '32n', time
          )
          break
        case 'hihat-open':
          this.hihatOpen.triggerAttackRelease(
            this.hihatOpen.frequency.value, '16n', time
          )
          break
        case 'crash':
          this.crash.triggerAttackRelease(
            this.crash.frequency.value, '2n', time, velocity
          )
          break
        case 'ride':
          this.ride.triggerAttackRelease(
            this.ride.frequency.value, '16n', time, velocity
          )
          break
        case 'tom-low':
          this.tomLow.triggerAttackRelease('G1', '8n', time, velocity)
          break
        case 'tom-high':
          this.tomHigh.triggerAttackRelease('D2', '8n', time, velocity)
          break
      }
    } catch {
      // Ignore if audio context is closed
    }
  }

  setVolume(db: number): void {
    this.masterVol.volume.value = db
  }

  dispose(): void {
    this.kick.dispose()
    this.snare.dispose()
    this.hihatClosed.dispose()
    this.hihatOpen.dispose()
    this.crash.dispose()
    this.ride.dispose()
    this.tomLow.dispose()
    this.tomHigh.dispose()
    this.masterVol.dispose()
  }
}
