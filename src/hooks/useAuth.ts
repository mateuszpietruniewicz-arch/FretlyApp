import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAppStore, useAuthStore } from '@/store'
import type { Instrument, UserProfile } from '@/types'

function isConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL as string
  return Boolean(url) && !url.includes('placeholder') && !url.includes('your-project')
}

export interface UseAuth {
  user: User | null
  isLoading: boolean
  error: string | null
  signUp: (email: string, password: string, username: string, instrument: Instrument) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  clearError: () => void
}

export function useAuth(): UseAuth {
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const { supabaseUser, setSupabaseUser } = useAuthStore()
  const { setUser: setProfile }           = useAppStore()

  // ── Profile helpers ────────────────────────────────────────────────────────

  const fetchProfile = useCallback(async (userId: string) => {
    if (!isConfigured()) return
    const { data } = await supabase.from('users').select('*').eq('id', userId).single()
    if (data) setProfile(data as UserProfile)
  }, [setProfile])

  const ensureProfile = useCallback(async (u: User) => {
    if (!isConfigured()) return
    const { data } = await supabase.from('users').select('id').eq('id', u.id).single()
    if (!data) {
      // First-time OAuth user — create profile from provider metadata
      const profile: UserProfile = {
        id:         u.id,
        email:      u.email ?? '',
        username:   (u.user_metadata?.['full_name'] as string | undefined)
                    ?? u.email?.split('@')[0]
                    ?? 'Użytkownik',
        instrument: 'guitar',
        created_at: new Date().toISOString(),
      }
      await supabase.from('users').insert(profile).select().single()
      setProfile(profile)
    } else {
      fetchProfile(u.id)
    }
  }, [setProfile, fetchProfile])

  // ── Auth state subscription ────────────────────────────────────────────────

  useEffect(() => {
    // Restore existing session
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setSupabaseUser(u)
      if (u) fetchProfile(u.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null
      setSupabaseUser(u)
      if (u) {
        ensureProfile(u)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [setSupabaseUser, setProfile, fetchProfile, ensureProfile])

  // ── Actions ────────────────────────────────────────────────────────────────

  const signUp = useCallback(async (
    email: string,
    password: string,
    username: string,
    instrument: Instrument
  ) => {
    if (!isConfigured()) { setError('Supabase nie jest skonfigurowane'); return }
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: authErr } = await supabase.auth.signUp({ email, password })
      if (authErr) throw authErr

      if (data.user) {
        const profile: UserProfile = {
          id:         data.user.id,
          email,
          username:   username.trim(),
          instrument,
          created_at: new Date().toISOString(),
        }
        const { error: insertErr } = await supabase.from('users').insert(profile)
        if (insertErr) throw insertErr
        setProfile(profile)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd rejestracji')
    } finally {
      setIsLoading(false)
    }
  }, [setProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isConfigured()) { setError('Supabase nie jest skonfigurowane'); return }
    setIsLoading(true)
    setError(null)
    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
      if (authErr) throw authErr
      // Profile fetched via onAuthStateChange → ensureProfile
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd logowania')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await supabase.auth.signOut()
      // setSupabaseUser(null) + setProfile(null) fired via onAuthStateChange
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd wylogowania')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!isConfigured()) { setError('Supabase nie jest skonfigurowane'); return }
    setError(null)
    try {
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options:  { redirectTo: window.location.origin },
      })
      if (oauthErr) throw oauthErr
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd logowania przez Google')
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    user: supabaseUser,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    clearError,
  }
}
