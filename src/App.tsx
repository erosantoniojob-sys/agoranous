import React, { lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AgoraProvider, useAgoraStore } from './store/useAgoraStore'
import { Header } from './components/Header'
import { TabBar } from './components/TabBar'
import { SearchModal } from './components/SearchModal'
import { MediaDetailModal } from './components/MediaDetailModal'
import { LeftDrawer } from './components/LeftDrawer'
import { RightChatDrawer } from './components/RightChatDrawer'
import { LoginView } from './views/LoginView'
import { Onboarding } from './components/Onboarding'

const DashboardView = lazy(() => import('./views/DashboardView').then((module) => ({ default: module.DashboardView })))
const ExploreView = lazy(() => import('./views/ExploreView').then((module) => ({ default: module.ExploreView })))
const TimelineView = lazy(() => import('./views/TimelineView').then((module) => ({ default: module.TimelineView })))
const ProfileView = lazy(() => import('./views/ProfileView').then((module) => ({ default: module.ProfileView })))
const Trilhas = lazy(() => import('./components/Trilhas').then((module) => ({ default: module.Trilhas })))
const ScholeView = lazy(() => import('./views/ScholeView').then((module) => ({ default: module.ScholeView })))
const RoutineView = lazy(() => import('./views/RoutineView').then((module) => ({ default: module.RoutineView })))
const PoiesisView = lazy(() => import('./views/PoiesisView').then((module) => ({ default: module.PoiesisView })))

const ViewLoading: React.FC = () => (
  <div className="flex min-h-[45vh] items-center justify-center" role="status" aria-live="polite">
    <div className="flex items-center gap-3 text-sm text-text-secondary"><span className="h-5 w-5 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />Abrindo espaço…</div>
  </div>
)

const MainContent: React.FC = () => {
  const { user, isLoading } = useAuth()
  const { activeTab, hasCompletedOnboarding, isVisitor, isDataReady } = useAgoraStore()

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

  if (!isDataReady) {
    return (
      <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center p-4 font-sans">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-accent-gold border-t-transparent animate-spin" />
          <span className="font-serif font-bold text-lg text-text-primary">Carregando seu acervo...</span>
        </div>
      </div>
    )
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
      case 'poiesis':
        return <PoiesisView />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans flex flex-col selection:bg-accent-gold/30 selection:text-text-primary">
      {/* Top Header */}
      <Header />

      {/* Main Page Shell Content */}
      <main className="app-page-shell flex-1 pt-4 pb-32 sm:pt-6 sm:pb-28 lg:pb-12">
        <Suspense fallback={<ViewLoading />}>{renderActiveView()}</Suspense>
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
