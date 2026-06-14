import type { AudioDevice } from '@/hooks/useAudio'

interface Props {
  devices: AudioDevice[]
  selectedDeviceId: string
  onSelect: (deviceId: string) => void
  disabled?: boolean
}

export function AudioSourceSelector({ devices, selectedDeviceId, onSelect, disabled }: Props) {
  return (
    <div className="w-full">
      <label className="block text-xs text-slate-500 mb-1.5">Źródło audio</label>
      <select
        value={selectedDeviceId}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled || devices.length === 0}
        className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
      >
        <option value="default">Domyślny mikrofon</option>
        {devices.map((d) => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-slate-600 mt-1">
        Interface audio (np. Focusrite) lub VB-Cable dla najlepszych wyników
      </p>
    </div>
  )
}
