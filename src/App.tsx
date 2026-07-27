import React from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AgoraProvider, useAgoraStore } from './store/useAgoraStore'
import { Header } from './components/Header'
import { TabBar } from './components/TabBar'
import { SearchModal } from './components/SearchModal'
import { MediaDetailModal } from './components/MediaDetailModal'
import { LeftDrawer } from './components/LeftDrawer'
import { RightChatDrawer } from './components/RightChatDrawer'
import { DashboardView } from './views/DashboardView'
import { ExploreView } from './views/ExploreView'
import { TimelineView } from './views/TimelineView'
import { ProfileView } from './views/ProfileView'
import { LoginView } from './views/LoginView'
import { Trilhas } from './components/Trilhas'
import { Onboarding } from './components/Onboarding'
import { ScholeView } from './views/ScholeView'
import { RoutineView } from './views/RoutineView'

const MainContent: React.FC = () => {
  const { user, isLoading } = useAuth()
  const { activeTab, hasCompletedOnboarding, isVisitor } = useAgoraStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center p-4 font-sans">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-accent-gold border-t-transparent animate-spin" />
          <span className="font-serif font-bold text-lg text-text-primary">Carregando Ágora...</span>
          <span className="text-xs text-text-secondary">Sintonizando seu Segundo Cérebro</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginView />
  }

  // Route Guard: force onboarding if user hasn't completed onboarding yet
  if (!hasCompletedOnboarding && !isVisitor) {
    return <Onboarding />
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'inicio':
        return <DashboardView />
      case 'explorar':
        return <ExploreView />
      case 'trilhas':
        return <Trilhas />
      case 'memoria':
        return <TimelineView />
      case 'perfil':
        return <ProfileView />
      case 'schole':
        return <ScholeView />
      case 'rotina':
        return <RoutineView />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans flex flex-col selection:bg-accent-gold/30 selection:text-text-primary">
      {/* Top Header */}
      <Header />

      {/* Main Page Shell Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 pt-6 pb-24">
        {renderActiveView()}
      </main>

      {/* Modals & Drawers */}
      <SearchModal />
      <MediaDetailModal />
      <LeftDrawer />
      <RightChatDrawer />

      {/* Bottom Floating Navigation Tab Bar */}
      <TabBar />
    </div>
  )
}

export function App() {
  return (
    <AuthProvider>
      <AgoraProvider>
        <MainContent />
      </AgoraProvider>
    </AuthProvider>
  )
}

export default App
