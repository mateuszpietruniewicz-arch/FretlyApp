import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Instrument, UserProfile, UserStats } from '@/types'

interface AppState {
  theme: 'dark' | 'light'
  instrument: Instrument
  user: UserProfile | null
  stats: UserStats | null
  setTheme: (theme: 'dark' | 'light') => void
  toggleTheme: () => void
  setInstrument: (instrument: Instrument) => void
  setUser: (user: UserProfile | null) => void
  setStats: (stats: UserStats | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      instrument: 'guitar',
      user: null,
      stats: null,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setInstrument: (instrument) => set({ instrument }),
      setUser: (user) => set({ user }),
      setStats: (stats) => set({ stats }),
    }),
    { name: 'fretly-app' }
  )
)
