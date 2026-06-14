import { supabase } from './supabase'
import type { TabDocument } from '@/types/tab'

export interface RiffMeta {
  id: string
  title: string
  instrument: string
  bpm: number
  key: string
  created_at: string
}

function isConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL as string
  return Boolean(url) && !url.includes('placeholder') && !url.includes('your-project')
}

export async function saveRiff(doc: TabDocument, userId: string): Promise<string | null> {
  if (!isConfigured()) return null

  const { data, error } = await supabase
    .from('riffs')
    .upsert(
      {
        id:          doc.id,
        user_id:     userId,
        title:       doc.title,
        instrument:  doc.instrument,
        tab_content: JSON.stringify(doc.bars),
        bpm:         doc.tempo,
        key:         doc.key,
      },
      { onConflict: 'id' }
    )
    .select('id')
    .single()

  if (error) {
    console.error('saveRiff error:', error.message)
    return null
  }

  return (data as { id: string } | null)?.id ?? null
}

export async function getUserRiffs(userId: string): Promise<RiffMeta[]> {
  if (!isConfigured()) return []

  const { data, error } = await supabase
    .from('riffs')
    .select('id, title, instrument, bpm, key, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getUserRiffs error:', error.message)
    return []
  }

  return (data ?? []) as RiffMeta[]
}

export async function loadRiff(riffId: string): Promise<TabDocument | null> {
  if (!isConfigured()) return null

  const { data, error } = await supabase
    .from('riffs')
    .select('*')
    .eq('id', riffId)
    .single()

  if (error || !data) {
    console.error('loadRiff error:', error?.message)
    return null
  }

  try {
    // tab_content stores the bars array; timeSignature comes from individual bars
    const bars = JSON.parse(data['tab_content'] as string) as TabDocument['bars']
    const instrument = data['instrument'] as 'guitar' | 'bass'

    return {
      id:            data['id'] as string,
      title:         data['title'] as string,
      instrument,
      tuning:        'standard',
      tempo:         data['bpm'] as number,
      timeSignature: bars[0]?.timeSignature ?? '4/4',
      key:           data['key'] as string,
      bars,
      createdAt:     data['created_at'] as string,
      updatedAt:     data['created_at'] as string,
    }
  } catch {
    return null
  }
}

export async function deleteRiff(riffId: string): Promise<boolean> {
  if (!isConfigured()) return false

  const { error } = await supabase
    .from('riffs')
    .delete()
    .eq('id', riffId)

  if (error) {
    console.error('deleteRiff error:', error.message)
    return false
  }

  return true
}
