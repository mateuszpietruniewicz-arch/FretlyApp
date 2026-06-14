import * as Tone from 'tone'
import { renderTabASCII, getNoteAtFret, BEATS_PER_BAR } from './tabUtils'
import { CDN_BASE, SAMPLER_URLS } from './audioSources'
import type { TabDocument, Duration } from '@/types/tab'
import type { TabInstrument } from './audioSources'

const DURATION_MAP: Record<Duration, string> = {
  '1': '1n', '2': '2n', '4': '4n', '8': '8n', '16': '16n',
  '1.': '1n.', '2.': '2n.', '4.': '4n.', '8.': '8n.',
}

const DYNAMIC_VEL: Record<string, number> = {
  'ppp': 0.15, 'pp': 0.3, 'p': 0.45, 'mf': 0.65, 'f': 0.8, 'ff': 1.0,
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToTxt(doc: TabDocument): void {
  const ascii = renderTabASCII(doc)
  const blob = new Blob([ascii], { type: 'text/plain;charset=utf-8' })
  downloadBlob(blob, `${doc.title}.txt`)
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels
  const sampleRate  = buffer.sampleRate
  const numFrames   = buffer.length
  const dataBytes   = numFrames * numChannels * 2  // 16-bit = 2 bytes/sample

  const ab   = new ArrayBuffer(44 + dataBytes)
  const view = new DataView(ab)

  function str(offset: number, s: string) {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i))
  }

  str(0, 'RIFF')
  view.setUint32(4,  36 + dataBytes, true)
  str(8, 'WAVE')
  str(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1,  true)                                  // PCM
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numChannels * 2, true)        // byte rate
  view.setUint16(32, numChannels * 2, true)                     // block align
  view.setUint16(34, 16, true)                                  // bits per sample
  str(36, 'data')
  view.setUint32(40, dataBytes, true)

  let offset = 44
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]))
      view.setInt16(offset, Math.round(s * 32767), true)
      offset += 2
    }
  }

  return new Blob([ab], { type: 'audio/wav' })
}

export async function exportToMp3(
  doc: TabDocument,
  instrument: TabInstrument,
  onProgress: (percent: number) => void
): Promise<void> {
  const bpb          = BEATS_PER_BAR[doc.timeSignature]
  const secsPerBeat  = 60 / doc.tempo
  const totalSeconds = doc.bars.length * bpb * secsPerBeat + 2  // +2s tail

  onProgress(5)

  // Simulate progress — Tone.Offline has no native progress events
  let simProg = 10
  const progTimer = window.setInterval(() => {
    simProg = Math.min(70, simProg + 8)
    onProgress(simProg)
  }, 600)

  try {
    const toneBuffer = await Tone.Offline(async () => {
      const sampler = new Tone.Sampler({
        urls: SAMPLER_URLS[instrument],
        baseUrl: `${CDN_BASE}/${instrument}/`,
      }).toDestination()

      await Tone.loaded()

      const transport = Tone.getTransport()
      transport.cancel(0)

      for (let bIdx = 0; bIdx < doc.bars.length; bIdx++) {
        const bar = doc.bars[bIdx]
        for (const note of bar.notes) {
          if (note.fret === null) continue
          const noteName    = getNoteAtFret(note.string, note.fret, doc.instrument)
          const startSecs   = (bIdx * bpb + note.beatPosition) * secsPerBeat
          const toneDuration = DURATION_MAP[note.duration] ?? '4n'
          const velocity    = DYNAMIC_VEL[note.dynamic] ?? 0.65

          transport.schedule((time) => {
            try {
              sampler.triggerAttackRelease(noteName, toneDuration, time, velocity)
            } catch { /* ignore out-of-range notes */ }
          }, `${startSecs}s`)
        }
      }

      transport.start(0)
    }, totalSeconds)

    clearInterval(progTimer)
    onProgress(82)

    const audioBuffer = toneBuffer.get()
    if (!audioBuffer) throw new Error('Brak danych audio po renderowaniu')

    onProgress(92)
    const wav = audioBufferToWav(audioBuffer)
    downloadBlob(wav, `${doc.title}.wav`)
    onProgress(100)

  } catch (err) {
    clearInterval(progTimer)
    throw err
  }
}
