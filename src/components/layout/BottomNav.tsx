import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Nauka', icon: '🎸' },
  { to: '/tools', label: 'Narzędzia', icon: '🎛️' },
  { to: '/progress', label: 'Postępy', icon: '📈' },
  { to: '/theory', label: 'Teoria', icon: '📖' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-sm border-t border-slate-800 flex z-10">
      {navItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 gap-1 text-xs transition-colors ${
              isActive ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'
            }`
          }
        >
          <span className="text-xl leading-none">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
