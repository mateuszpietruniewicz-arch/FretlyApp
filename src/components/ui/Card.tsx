import type { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg' | 'none'
  interactive?: boolean
}

const PADDING = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-5' }

export function Card({ children, padding = 'md', interactive = false, className, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        'bg-surface dark:bg-slate-800 border border-border dark:border-slate-700 rounded-2xl',
        PADDING[padding],
        interactive && 'cursor-pointer hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-colors active:scale-[0.99]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-3', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-sm font-semibold text-text dark:text-slate-200', className)}>
      {children}
    </h3>
  )
}
