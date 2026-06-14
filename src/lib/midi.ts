import * as Tone from 'tone'

export type ClickSoundType = 'click' | 'beep' | 'wood'

let highSynth: Tone.MetalSynth | null = null
let lowSynth: Tone.MetalSynth | null = null

function ensureSynths() {
  if (!highSynth) {
    highSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.08, release: 0.05 },
      harmonicity: 5.1,
      modulationIndex: 16,
      resonance: 3200,
      octaves: 1.5,
    }).toDestination()
    highSynth.frequency.value = 1200
    highSynth.volume.value = -6
  }
  if (!lowSynth) {
    lowSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.06, release: 0.04 },
      harmonicity: 3.1,
      modulationIndex: 8,
      resonance: 2000,
      octaves: 1.5,
    }).toDestination()
    lowSynth.frequency.value = 700
    lowSynth.volume.value = -10
  }
}

/** Trigger accent (beat 1) or regular click. Must be called in audio-safe context. */
export function triggerClick(isAccent: boolean, time: number) {
  ensureSynths()
  const synth = isAccent ? highSynth! : lowSynth!
  synth.triggerAttackRelease(synth.frequency.value, '32n', time)
}

export function setTransportBpm(bpm: number) {
  Tone.getTransport().bpm.value = bpm
}

export function startTransport() {
  return Tone.start().then(() => Tone.getTransport().start())
}

export function stopTransport() {
  Tone.getTransport().stop()
  Tone.getTransport().cancel()
}

export function getTransportState(): string {
  return Tone.getTransport().state
}

export { Tone }
