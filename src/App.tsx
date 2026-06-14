import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/Home'
import { LearnPage } from '@/pages/Learn'
import { LessonPage } from '@/pages/LessonPage'
import { JamPage } from '@/pages/Jam'
import { ToolsPage } from '@/pages/Tools'
import { TunerPage } from '@/pages/TunerPage'
import { MetronomePage } from '@/pages/MetronomePage'
import { TheoryPage } from '@/pages/Theory'
import { ProfilePage } from '@/pages/Profile'
import { useAppStore } from '@/store'

export default function App() {
  const { theme } = useAppStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/learn/lesson/:id" element={<LessonPage />} />
          <Route path="/jam" element={<JamPage />} />
          <Route path="/tools" element={<ToolsPage />}>
            <Route path="tuner" element={<TunerPage />} />
            <Route path="metronome" element={<MetronomePage />} />
          </Route>
          <Route path="/theory" element={<TheoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
