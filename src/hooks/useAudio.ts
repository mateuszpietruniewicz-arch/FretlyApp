import { useState, useEffect, useRef, useCallback } from 'react'

export interface AudioDevice {
  deviceId: string
  label: string
}

export interface UseAudioReturn {
  audioContext: AudioContext | null
  analyser: AnalyserNode | null
  isReady: boolean
  isStarting: boolean
  error: string | null
  devices: AudioDevice[]
  selectedDeviceId: string
  startAudio: (deviceId?: string) => Promise<void>
  stopAudio: () => void
  selectDevice: (deviceId: string) => Promise<void>
}

const FFT_SIZE = 4096

export function useAudio(): UseAudioReturn {
  const [isReady, setIsReady] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<AudioDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('default')

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)

  const enumerateDevices = useCallback(async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices()
      const inputs = all
        .filter((d) => d.kind === 'audioinput')
        .map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `Mikrofon ${i + 1}`,
        }))
      setDevices(inputs)
    } catch {
      // permissions not granted yet — enumerate later
    }
  }, [])

  useEffect(() => {
    enumerateDevices()
  }, [enumerateDevices])

  const stopAudio = useCallback(() => {
    sourceRef.current?.disconnect()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    analyserRef.current?.disconnect()
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close()
    }
    audioContextRef.current = null
    analyserRef.current = null
    streamRef.current = null
    sourceRef.current = null
    setIsReady(false)
  }, [])

  const startAudio = useCallback(
    async (deviceId?: string) => {
      stopAudio()
      setIsStarting(true)
      setError(null)

      const id = deviceId ?? selectedDeviceId

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: id !== 'default' ? { exact: id } : undefined,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        })

        const ctx = new AudioContext({ sampleRate: 44100 })
        const analyser = ctx.createAnalyser()
        analyser.fftSize = FFT_SIZE
        analyser.smoothingTimeConstant = 0

        const source = ctx.createMediaStreamSource(stream)
        source.connect(analyser)

        audioContextRef.current = ctx
        analyserRef.current = analyser
        streamRef.current = stream
        sourceRef.current = source

        // Re-enumerate now that we have permission
        await enumerateDevices()
        setSelectedDeviceId(id)
        setIsReady(true)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Błąd dostępu do mikrofonu'
        setError(
          msg.includes('Permission') || msg.includes('NotAllowed')
            ? 'Brak dostępu do mikrofonu. Zezwól na dostęp w ustawieniach przeglądarki.'
            : `Błąd audio: ${msg}`
        )
      } finally {
        setIsStarting(false)
      }
    },
    [selectedDeviceId, stopAudio, enumerateDevices]
  )

  const selectDevice = useCallback(
    async (deviceId: string) => {
      setSelectedDeviceId(deviceId)
      if (isReady) {
        await startAudio(deviceId)
      }
    },
    [isReady, startAudio]
  )

  useEffect(() => () => stopAudio(), [stopAudio])

  return {
    audioContext: audioContextRef.current,
    analyser: analyserRef.current,
    isReady,
    isStarting,
    error,
    devices,
    selectedDeviceId,
    startAudio,
    stopAudio,
    selectDevice,
  }
}
