import { useEffect, useState } from 'react'
import { Card } from '@/components/ui'
import { LoopBrowser, JamControls, ScaleOverlay } from '@/components/jam'
import { useJamSession } from '@/hooks/useJamSession'
import { useAudio } from '@/hooks/useAudio'
import { usePitchDetection } from '@/hooks/usePitchDetection'
import { useAppStore } from '@/store'

type JamTab = 'loops' | 'scale'

export function JamPage() {
  const { instrument } = useAppStore()
  const jam = useJamSession()
  const [tab, setTab] = useState<JamTab>('loops')
  const [micActive, setMicActive] = useState(false)

  const { audioContext, analyser, isReady, startAudio, stopAudio } = useAudio()
  const { pitch, startDetection, stopDetection } = usePitchDetection()

  // Start pitch detection when mic is ready
  useEffect(() => {
    if (isReady && audioContext && analyser) {
      startDetection(analyser, audioContext.sampleRate)
    } else {
      stopDetection()
    }
    return () => stopDetection()
  }, [isReady, audioContext, analyser, startDetection, stopDetection])

  function toggleMic() {
    if (micActive) {
      stopAudio()
      stopDetection()
      setMicActive(false)
    } else {
      startAudio().then(() => setMicActive(true)).catch(() => setMicActive(false))
    }
  }

  const detectedPC = isReady ? (pitch?.pitchClass ?? null) : null

  return (
    <div className="px-4 py-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-slate-100">Jam</h1>
          <p className="text-xs text-muted mt-0.5">Graj z loopem perkusyjnym · skale · live pitch</p>
        </div>
        {/* Mic toggle */}
        <button
          onClick={toggleMic}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
            micActive
              ? 'bg-green-500/15 text-green-400 border border-green-500/30'
              : 'bg-surface dark:bg-slate-800 text-muted border border-border dark:border-slate-700 hover:border-brand-500/50'
          }`}
        >
          {micActive ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Mikrofon ON
            </>
          ) : (
            <>🎙 Włącz mikrofon</>
          )}
        </button>
      </div>

      {/* Detected note badge */}
      {micActive && detectedPC && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted">
          <span className="text-xs">Grasz:</span>
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
            style={{
              backgroundColor: `var(--color-note-${detectedPC.replace('#', 's')}, #64748b)`,
            }}
          >
            {detectedPC}
          </span>
        </div>
      )}

      {/* Desktop: two-column / Mobile: tabs */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Left: loop browser + controls */}
        <div className="space-y-4">
          <Card padding="md">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Wybierz loop</p>
            <LoopBrowser
              loops={jam.loops}
              selectedLoop={jam.selectedLoop}
              onSelect={jam.selectLoop}
            />
          </Card>

          <Card padding="md">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Odtwarzanie</p>
            <JamControls
              selectedLoop={jam.selectedLoop}
              isPlaying={jam.isPlaying}
              isLoading={jam.isLoading}
              bpm={jam.bpm}
              volume={jam.volume}
              error={jam.error}
              onPlay={jam.play}
              onStop={jam.stop}
              onBpmChange={jam.setBpm}
              onVolumeChange={jam.setVolume}
            />
          </Card>
        </div>

        {/* Right: scale overlay */}
        <Card padding="md">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Skala do jammowania</p>
          <ScaleOverlay
            selectedKey={jam.selectedKey}
            selectedScale={jam.selectedScale}
            onSelectKey={(key) => jam.selectScale(jam.selectedScale, key)}
            onSelectScale={(scale) => jam.selectScale(scale, jam.selectedKey)}
            instrument={instrument}
            detectedPitchClass={detectedPC}
          />
        </Card>
      </div>

      {/* Mobile: tabs */}
      <div className="lg:hidden space-y-4">
        {/* Tab bar */}
        <div className="flex gap-2">
          {(['loops', 'scale'] as JamTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-sm font-semibold py-2.5 rounded-xl transition-colors ${
                tab === t
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface dark:bg-slate-800 text-muted border border-border dark:border-slate-700'
              }`}
            >
              {t === 'loops' ? '🥁 Looopy' : '🎼 Skala'}
            </button>
          ))}
        </div>

        {tab === 'loops' && (
          <>
            <Card padding="md">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Wybierz loop</p>
              <LoopBrowser
                loops={jam.loops}
                selectedLoop={jam.selectedLoop}
                onSelect={jam.selectLoop}
              />
            </Card>
            <Card padding="md">
              <JamControls
                selectedLoop={jam.selectedLoop}
                isPlaying={jam.isPlaying}
                isLoading={jam.isLoading}
                bpm={jam.bpm}
                volume={jam.volume}
                error={jam.error}
                onPlay={jam.play}
                onStop={jam.stop}
                onBpmChange={jam.setBpm}
                onVolumeChange={jam.setVolume}
              />
            </Card>
          </>
        )}

        {tab === 'scale' && (
          <Card padding="md">
            <ScaleOverlay
              selectedKey={jam.selectedKey}
              selectedScale={jam.selectedScale}
              onSelectKey={(key) => jam.selectScale(jam.selectedScale, key)}
              onSelectScale={(scale) => jam.selectScale(scale, jam.selectedKey)}
              instrument={instrument}
              detectedPitchClass={detectedPC}
            />
          </Card>
        )}
      </div>
    </div>
  )
}
