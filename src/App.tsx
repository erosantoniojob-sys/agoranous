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
import { AmbientSoundControl } from './components/AmbientSoundControl'
import { AmbientDepth } from './components/AmbientDepth'
import { SurfaceDepth } from './components/SurfaceDepth'
import { AgoraLoader } from './components/AgoraLoader'
import { CommandPalette } from './components/CommandPalette'

const DashboardView = lazy(() => import('./views/DashboardView').then((module) => ({ default: module.DashboardView })))
const ExploreView = lazy(() => import('./views/ExploreView').then((module) => ({ default: module.ExploreView })))
const TimelineView = lazy(() => import('./views/TimelineView').then((module) => ({ default: module.TimelineView })))
const ProfileView = lazy(() => import('./views/ProfileView').then((module) => ({ default: module.ProfileView })))
const Trilhas = lazy(() => import('./components/Trilhas').then((module) => ({ default: module.Trilhas })))
const ScholeView = lazy(() => import('./views/ScholeView').then((module) => ({ default: module.ScholeView })))
const RoutineView = lazy(() => import('./views/RoutineView').then((module) => ({ default: module.RoutineView })))
const PoiesisView = lazy(() => import('./views/PoiesisView').then((module) => ({ default: module.PoiesisView })))
const StudiumView = lazy(() => import('./views/StudiumView').then((module) => ({ default: module.StudiumView })))

const ViewLoading: React.FC = () => (
  <div className="flex min-h-[45vh] items-center justify-center"><AgoraLoader compact message="Abrindo este espaço" /></div>
)

const MainContent: React.FC = () => {
  const { user, isLoading } = useAuth()
  const { activeTab, hasCompletedOnboarding, isVisitor, isDataReady } = useAgoraStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center p-4 font-sans"><AgoraLoader detail="Sintonizando seu segundo cérebro…" /></div>
    )
  }

  if (!user) {
    return <LoginView />
  }

  if (!isDataReady) {
    return (
      <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center p-4 font-sans"><AgoraLoader message="Reunindo seu acervo" detail="Recuperando memórias, trilhas e preferências…" /></div>
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
      case 'studium':
        return <StudiumView />
      default:
        return <DashboardView />
    }
  }

  return (
    <>
      <AmbientDepth />
      <SurfaceDepth />
      <div className="app-frame min-h-screen w-full min-w-0 flex bg-transparent text-text-primary font-sans selection:bg-accent-gold/30 selection:text-text-primary">
        {/* Main Content Area */}
        <div className="min-w-0 flex-1 flex flex-col">
          {/* Top Header */}
          <Header />

          {/* Page Content */}
          <main className="app-page-shell flex-1 pt-4 pb-[calc(8.5rem+env(safe-area-inset-bottom))] sm:pt-6 lg:pb-28">
            <Suspense fallback={<ViewLoading />}>{renderActiveView()}</Suspense>
          </main>
        </div>

        {/* Modals & Drawers */}
        <SearchModal />
        <MediaDetailModal />
        <LeftDrawer />
        <RightChatDrawer />
        <AmbientSoundControl />
        <CommandPalette />

        {/* Bottom Floating Navigation Tab Bar */}
        <TabBar />
      </div>
    </>
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
