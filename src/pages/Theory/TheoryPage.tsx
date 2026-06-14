const TOPICS = [
  { icon: '🎵', title: 'Interwały', desc: 'Odległości między dźwiękami — sekunda, tercja, kwinta…' },
  { icon: '🎼', title: 'Budowa skal', desc: 'Jak są zbudowane skale durowe, molowe i pentatoniki' },
  { icon: '🎸', title: 'Budowa akordów', desc: 'Trójdźwięki, septymowe, suspendowane' },
  { icon: '🥁', title: 'Rytm i metrum', desc: 'Wartości nut, metrum 4/4, 3/4, synkopa' },
]

export function TheoryPage() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Teoria</h1>
        <p className="text-slate-400 text-sm">Tylko to co praktycznie potrzebne gitarzyście.</p>
      </div>

      <div className="space-y-3">
        {TOPICS.map(({ icon, title, desc }) => (
          <button
            key={title}
            className="flex items-center gap-4 bg-slate-800 rounded-2xl px-4 py-4 text-left hover:bg-slate-700 transition-colors w-full"
          >
            <span className="text-3xl">{icon}</span>
            <div>
              <div className="text-sm font-semibold text-white">{title}</div>
              <div className="text-xs text-slate-500">{desc}</div>
            </div>
            <span className="ml-auto text-slate-600">›</span>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-slate-900 rounded-2xl border border-slate-800">
        <p className="text-xs text-slate-500 text-center">
          Teoria bez akademickiej nadmiarowości — tylko to co przyda się na próbie i na scenie.
        </p>
      </div>
    </div>
  )
}
