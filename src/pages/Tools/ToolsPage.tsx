const TOOLS = [
  { icon: '🎵', title: 'Tuner', desc: 'Chromatyczny tuner z wykrywaniem dźwięku', to: '/tools/tuner' },
  { icon: '🥁', title: 'Metronom', desc: 'Wizualny i dźwiękowy klik', to: '/tools/metronome' },
  { icon: '🎛️', title: 'Jamowanie', desc: 'Loopy perkusyjne + weryfikacja nut', to: '/tools/jam', badge: 'Wkrótce' },
]

export function ToolsPage() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Narzędzia</h1>
        <p className="text-slate-400 text-sm">Narzędzia dla gitarzysty.</p>
      </div>

      <div className="space-y-3">
        {TOOLS.map(({ icon, title, desc, to, badge }) => (
          <a
            key={to}
            href={to}
            className="flex items-center gap-4 bg-slate-800 rounded-2xl px-4 py-4 hover:bg-slate-700 transition-colors"
          >
            <span className="text-3xl">{icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{title}</span>
                {badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400">{badge}</span>
                )}
              </div>
              <div className="text-xs text-slate-500">{desc}</div>
            </div>
            <span className="text-slate-600">›</span>
          </a>
        ))}
      </div>
    </div>
  )
}
