import { useState, useRef, useEffect } from 'react'
import type { UserProfile } from '@/types'
import { noteColor } from '@/lib/tonal'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

function userColor(username: string): string {
  let h = 0
  for (const c of username) h = (h * 31 + c.charCodeAt(0)) % 12
  return noteColor(NOTE_NAMES[Math.abs(h)])
}

interface Props {
  profile: UserProfile | null
  onSignOut: () => void
  isLoading?: boolean
}

export function UserMenu({ profile, onSignOut, isLoading }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on click-outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [open])

  const initials = profile?.username
    ? profile.username.slice(0, 2).toUpperCase()
    : '?'

  const color = profile?.username ? userColor(profile.username) : '#94a3b8'

  const instrumentLabel = profile?.instrument === 'guitar' ? '🎸 Gitara' : '🎸 Bas'

  return (
    <div ref={ref} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu użytkownika"
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm hover:brightness-110 active:scale-95 transition-all border-2 border-white/20"
        style={{ backgroundColor: color }}
      >
        {initials}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-border dark:border-slate-700 bg-surface dark:bg-slate-900 shadow-2xl shadow-black/30 overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-border dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ backgroundColor: color }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text dark:text-slate-200 truncate">
                  {profile?.username ?? 'Użytkownik'}
                </p>
                <p className="text-[11px] text-muted truncate">
                  {profile?.email ?? ''}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-[11px] text-muted bg-surface-2 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-border dark:border-slate-700">
                {instrumentLabel}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <button
              onClick={() => { setOpen(false); onSignOut() }}
              disabled={isLoading}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 disabled:opacity-50 transition-colors text-left"
            >
              <span className="text-base">→</span>
              Wyloguj się
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
