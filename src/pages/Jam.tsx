export function JamPage() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Jam</h1>
        <p className="text-slate-400 text-sm">Graj z loopem perkusyjnym.</p>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 flex flex-col items-center gap-4 border border-slate-800">
        <span className="text-5xl">🎛️</span>
        <h2 className="text-lg font-semibold text-slate-300">Tryb Jam — wkrótce</h2>
        <p className="text-sm text-slate-500 text-center">
          Loopy perkusyjne MIDI + wizualizacja skali + weryfikacja nut w czasie rzeczywistym.
          Dostępne w Fazie 5.
        </p>
      </div>
    </div>
  )
}
