import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/',        label: 'Home',      icon: '🏠' },
  { to: '/learn',   label: 'Nauka',     icon: '📚' },
  { to: '/jam',     label: 'Jam',       icon: '🎛️' },
  { to: '/tools',   label: 'Narzędzia', icon: '🎵' },
  { to: '/profile', label: 'Profil',    icon: '📈' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 dark:bg-slate-950/95 backdrop-blur-sm border-t border-border dark:border-slate-800 flex z-10 pb-safe">
      {NAV.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-brand-500 dark:text-brand-400'
                : 'text-muted hover:text-text dark:hover:text-slate-300'
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
