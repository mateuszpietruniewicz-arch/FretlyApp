import { supabase } from '@/lib/supabase'
import type { Level, UserStats } from '@/types'

const XP_THRESHOLDS = [0, 100, 300, 700, 1500, 3000]

function calcLevel(xp: number): Level {
  for (let i = XP_THRESHOLDS.length - 1; i >= 1; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i as Level
  }
  return 1
}

function isYesterday(dateStr: string | null): boolean {
  if (!dateStr) return false
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return dateStr === yesterday.toISOString().split('T')[0]
}

function isConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL as string
  return Boolean(url) && !url.includes('placeholder') && !url.includes('your-project')
}

const LESSON_BADGES: Record<string, string> = {
  lesson_001: '🎸 Pierwsze struny',
  lesson_012: '🎼 Pentatonikar',
  lesson_014: '🤘 Pierwszy akord',
  lesson_020: '🎵 Improwizator',
}

export async function saveProgress(
  userId: string,
  lessonId: string,
  accuracyPercent: number,
  xpEarned: number
): Promise<void> {
  if (!isConfigured()) return

  const { error } = await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
      accuracy_percent: accuracyPercent,
      xp_earned: xpEarned,
    },
    { onConflict: 'user_id,lesson_id' }
  )
  if (error) console.error('saveProgress error:', error.message)
}

export async function updateStats(
  userId: string,
  xpToAdd: number,
  lessonId: string,
  accuracy: number
): Promise<UserStats | null> {
  if (!isConfigured()) return null

  const { data: current } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  const today = new Date().toISOString().split('T')[0]
  const prevXp: number = current?.total_xp ?? 0
  const totalXp = prevXp + xpToAdd
  const newLevel = calcLevel(totalXp)

  const lastDate: string | null = current?.last_activity_date ?? null
  const streakDays: number =
    lastDate === today
      ? (current?.streak_days ?? 1)
      : isYesterday(lastDate)
        ? (current?.streak_days ?? 0) + 1
        : 1

  // Build badges
  const existing: string[] = current?.badges ?? []
  const earned = new Set<string>(existing)

  if (existing.length === 0 || (prevXp === 0 && xpToAdd > 0)) {
    earned.add('🎸 Pierwsze struny')
  }
  if (accuracy >= 100) earned.add('⭐ Perfekcja')
  if (streakDays >= 7) earned.add('🔥 7 dni z rzędu')
  if (LESSON_BADGES[lessonId]) earned.add(LESSON_BADGES[lessonId])

  const { data, error } = await supabase
    .from('user_stats')
    .upsert(
      {
        user_id: userId,
        total_xp: totalXp,
        current_level: newLevel,
        streak_days: streakDays,
        last_activity_date: today,
        badges: Array.from(earned),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) {
    console.error('updateStats error:', error.message)
    return null
  }

  return data as UserStats
}
