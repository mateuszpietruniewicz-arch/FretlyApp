import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/Home/HomePage'
import { LearnPage } from '@/pages/Learn/LearnPage'
import { ToolsPage } from '@/pages/Tools/ToolsPage'
import { ProgressPage } from '@/pages/Progress/ProgressPage'
import { TheoryPage } from '@/pages/Theory/TheoryPage'
import { useAppStore } from '@/store/appStore'
import { useEffect } from 'react'

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
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/theory" element={<TheoryPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
