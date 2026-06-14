import { useState, useEffect } from 'react'
import { useAppStore } from '@/store'
import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from '@/components/auth/AuthModal'
import { UserMenu } from '@/components/auth/UserMenu'

export function TopBar() {
  const { theme, toggleTheme, instrument, user: profile } = useAppStore()
  const { user, isLoading, error, signIn, signUp, signOut, signInWithGoogle, clearError } = useAuth()

  const [showAuth, setShowAuth] = useState(false)

  // Auto-close auth modal when user logs in
  useEffect(() => {
    if (user) setShowAuth(false)
  }, [user])

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
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

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full bg-surface-2 dark:bg-slate-800 flex items-center justify-center text-muted hover:text-text transition-colors border border-border dark:border-slate-700"
          aria-label={theme === 'dark' ? 'Włącz tryb jasny' : 'Włącz tryb ciemny'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Auth */}
        {user ? (
          <UserMenu
            profile={profile}
            onSignOut={signOut}
            isLoading={isLoading}
          />
        ) : (
          <button
            onClick={() => { clearError(); setShowAuth(true) }}
            className="h-9 px-3 rounded-xl text-sm font-semibold border border-border dark:border-slate-700 bg-surface-2 dark:bg-slate-800 text-muted hover:text-text hover:bg-surface dark:hover:bg-slate-700 transition-colors"
          >
            Zaloguj się
          </button>
        )}
      </div>

      {/* Auth modal */}
      <AuthModal
        open={showAuth}
        onClose={() => { setShowAuth(false); clearError() }}
        signIn={signIn}
        signUp={signUp}
        signInWithGoogle={signInWithGoogle}
        isLoading={isLoading}
        error={error}
        onClearError={clearError}
      />
    </header>
  )
}
