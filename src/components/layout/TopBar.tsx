import { useAppStore } from '@/store'

export function TopBar() {
  const { theme, toggleTheme, instrument } = useAppStore()

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-brand-400">Fretly</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 capitalize">
          {instrument === 'guitar' ? 'Gitara' : 'Bas'}
        </span>
      </div>
      <button
        onClick={toggleTheme}
        className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        aria-label="Przełącz motyw"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </header>
  )
}
