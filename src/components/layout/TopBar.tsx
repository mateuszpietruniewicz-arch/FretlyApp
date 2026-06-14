import { useAppStore } from '@/store'

export function TopBar() {
  const { theme, toggleTheme, instrument } = useAppStore()

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-2.5">
        {/* Logo mark — abstract coloured bars */}
        <div className="flex flex-col gap-[3px] justify-center" aria-hidden>
          {['#a855f7','#3b82f6','#22c55e'].map((c) => (
            <div key={c} className="h-[3px] rounded-full" style={{ width: 18, backgroundColor: c }} />
          ))}
        </div>
        <span className="text-lg font-bold text-brand-500">Fretly</span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-2 dark:bg-slate-800 text-muted border border-border dark:border-slate-700">
          {instrument === 'guitar' ? 'Gitara' : 'Bas'}
        </span>
      </div>

      <button
        onClick={toggleTheme}
        className="w-9 h-9 rounded-full bg-surface-2 dark:bg-slate-800 flex items-center justify-center text-muted hover:text-text transition-colors border border-border dark:border-slate-700"
        aria-label={theme === 'dark' ? 'Włącz tryb jasny' : 'Włącz tryb ciemny'}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </header>
  )
}
