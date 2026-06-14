import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full bg-bg text-text">
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
