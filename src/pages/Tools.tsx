import { NavLink, Outlet, useLocation } from 'react-router-dom'

const TOOLS = [
  { to: '/tools/tuner', label: 'Tuner', icon: '🎵', desc: 'Chromatyczny tuner z wykrywaniem dźwięku' },
  { to: '/tools/metronome', label: 'Metronom', icon: '🥁', desc: 'Wizualny i audio klik' },
]

export function ToolsPage() {
  const location = useLocation()
  const isRoot = location.pathname === '/tools'

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Narzędzia</h1>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-2 mb-6">
        {TOOLS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-brand-700 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`
            }
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Default view — list of tools */}
      {isRoot && (
        <div className="space-y-3">
          {TOOLS.map(({ to, icon, label, desc }) => (
            <NavLink
              key={to}
              to={to}
              className="flex items-center gap-4 bg-slate-800 rounded-2xl px-4 py-4 hover:bg-slate-700 transition-colors"
            >
              <span className="text-3xl">{icon}</span>
              <div>
                <div className="text-sm font-semibold text-white">{label}</div>
                <div className="text-xs text-slate-500">{desc}</div>
              </div>
              <span className="ml-auto text-slate-600">›</span>
            </NavLink>
          ))}
        </div>
      )}

      {/* Sub-route content */}
      <Outlet />
    </div>
  )
}
