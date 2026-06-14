import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui'
import type { Instrument } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string, instrument: Instrument) => Promise<void>
  signInWithGoogle: () => Promise<void>
  isLoading: boolean
  error: string | null
  onClearError: () => void
}

type Mode = 'login' | 'register'

const inputCls =
  'w-full h-10 px-3 rounded-xl text-sm border border-border dark:border-slate-700 bg-surface dark:bg-slate-800 text-text dark:text-slate-200 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all'

const INSTRUMENTS: { value: Instrument; label: string }[] = [
  { value: 'guitar', label: 'Gitara elektryczna' },
  { value: 'bass',   label: 'Gitara basowa' },
]

export function AuthModal({
  open, onClose, signIn, signUp, signInWithGoogle, isLoading, error, onClearError,
}: Props) {
  const [mode,       setMode]       = useState<Mode>('login')
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [username,   setUsername]   = useState('')
  const [instrument, setInstrument] = useState<Instrument>('guitar')

  // Reset form when modal closes or mode changes
  useEffect(() => {
    if (!open) {
      setEmail(''); setPassword(''); setUsername(''); setMode('login')
    }
  }, [open])

  useEffect(() => { onClearError() }, [mode, onClearError])

  const switchMode = (m: Mode) => { setMode(m); onClearError() }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'login') {
      await signIn(email, password)
    } else {
      await signUp(email, password, username, instrument)
    }
  }

  const Spinner = () => (
    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  )

  return (
    <Modal open={open} onClose={onClose} title="Konto Fretly" size="sm">
      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 bg-surface-2 dark:bg-slate-800 rounded-xl">
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              mode === m
                ? 'bg-white dark:bg-slate-700 text-text dark:text-slate-200 shadow-sm'
                : 'text-muted hover:text-text'
            }`}
          >
            {m === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Register-only fields */}
        {mode === 'register' && (
          <>
            <input
              type="text"
              placeholder="Nazwa użytkownika"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className={inputCls}
            />
            <select
              value={instrument}
              onChange={(e) => setInstrument(e.target.value as Instrument)}
              className={inputCls}
            >
              {INSTRUMENTS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </>
        )}

        {/* Shared fields */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className={inputCls}
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          className={inputCls}
        />

        {/* Error */}
        {error && (
          <p className="text-sm text-rose-400 text-center">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? <Spinner /> : null}
          {mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
        </button>
      </form>

      {/* Google OAuth */}
      {mode === 'login' && (
        <>
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-border dark:bg-slate-700" />
            <span className="text-[11px] text-muted">lub</span>
            <div className="flex-1 h-px bg-border dark:bg-slate-700" />
          </div>
          <button
            onClick={signInWithGoogle}
            disabled={isLoading}
            className="w-full h-10 rounded-xl text-sm font-semibold border border-border dark:border-slate-700 bg-surface-2 dark:bg-slate-800 text-text dark:text-slate-200 hover:bg-surface dark:hover:bg-slate-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Zaloguj przez Google
          </button>
        </>
      )}

      {/* Mode switch link */}
      <p className="mt-4 text-center text-xs text-muted">
        {mode === 'login' ? (
          <>Nie masz konta?{' '}
            <button onClick={() => switchMode('register')} className="text-indigo-400 hover:text-indigo-300 font-semibold underline-offset-2 hover:underline">
              Zarejestruj się
            </button>
          </>
        ) : (
          <>Masz już konto?{' '}
            <button onClick={() => switchMode('login')} className="text-indigo-400 hover:text-indigo-300 font-semibold underline-offset-2 hover:underline">
              Zaloguj się
            </button>
          </>
        )}
      </p>
    </Modal>
  )
}
