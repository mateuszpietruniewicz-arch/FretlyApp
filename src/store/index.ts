import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Instrument, UserProfile, UserStats } from '@/types'

interface AppState {
  // UI
  theme: 'dark' | 'light'
  // Instrument
  instrument: Instrument
  // User
  user: UserProfile | null
  stats: UserStats | null
  // Audio settings
  audioSourceId: string
  pitchSensitivity: number
  metronomeBpm: number
  // Actions
  setTheme: (theme: 'dark' | 'light') => void
  toggleTheme: () => void
  setInstrument: (instrument: Instrument) => void
  setUser: (user: UserProfile | null) => void
  setStats: (stats: UserStats | null) => void
  setAudioSourceId: (id: string) => void
  setPitchSensitivity: (v: number) => void
  setMetronomeBpm: (bpm: number) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      instrument: 'guitar',
      user: null,
      stats: null,
      audioSourceId: 'default',
      pitchSensitivity: 25,
      metronomeBpm: 80,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setInstrument: (instrument) => set({ instrument }),
      setUser: (user) => set({ user }),
      setStats: (stats) => set({ stats }),
      setAudioSourceId: (audioSourceId) => set({ audioSourceId }),
      setPitchSensitivity: (pitchSensitivity) => set({ pitchSensitivity }),
      setMetronomeBpm: (metronomeBpm) => set({ metronomeBpm }),
    }),
    { name: 'fretly-app' }
  )
)
