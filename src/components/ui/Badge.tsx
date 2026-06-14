import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type BadgeVariant = 'level' | 'category' | 'success' | 'warning' | 'info' | 'new'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const VARIANTS: Record<BadgeVariant, string> = {
  level:    'bg-brand-900/50 text-brand-300 border border-brand-800',
  category: 'bg-slate-700/60 text-slate-300 border border-slate-600/50',
  success:  'bg-green-900/40 text-green-400 border border-green-800/50',
  warning:  'bg-yellow-900/40 text-yellow-400 border border-yellow-800/50',
  info:     'bg-blue-900/40 text-blue-400 border border-blue-800/50',
  new:      'bg-brand-600/20 text-brand-300 border border-brand-600/40',
}

export function Badge({ variant = 'category', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full',
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

/* Level badge — shows level number + name */
const LEVEL_LABELS = ['', 'Początkujący', 'Podstawowy', 'Średni', 'Zaawansowany', 'Mistrz']

export function LevelBadge({ level }: { level: number }) {
  return (
    <Badge variant="level">
      Poz. {level} · {LEVEL_LABELS[level] ?? ''}
    </Badge>
  )
}

/* Category badge */
const CATEGORY_LABELS: Record<string, string> = {
  notes: '🎵 Nuty',
  scales: '🎼 Skale',
  chords: '🎸 Akordy',
  theory: '📖 Teoria',
  technique: '🤙 Technika',
}

export function CategoryBadge({ category }: { category: string }) {
  return <Badge variant="category">{CATEGORY_LABELS[category] ?? category}</Badge>
}
