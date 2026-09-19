import React, { lazy, Suspense, useEffect, useState } from 'react'
import { ArchiveRestore, CloudAlert, RotateCcw } from 'lucide-react'
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
import { CosmicWelcome } from './components/CosmicWelcome'

const DashboardView = lazy(() => import('./views/DashboardView').then((module) => ({ default: module.DashboardView })))
const ExploreView = lazy(() => import('./views/ExploreView').then((module) => ({ default: module.ExploreView })))
const TimelineView = lazy(() => import('./views/TimelineView').then((module) => ({ default: module.TimelineView })))
const ProfileView = lazy(() => import('./views/ProfileView').then((module) => ({ default: module.ProfileView })))
const Trilhas = lazy(() => import('./components/Trilhas').then((module) => ({ default: module.Trilhas })))
const ScholeView = lazy(() => import('./views/ScholeView').then((module) => ({ default: module.ScholeView })))
const RoutineView = lazy(() => import('./views/RoutineView').then((module) => ({ default: module.RoutineView })))
const PoiesisView = lazy(() => import('./views/PoiesisView').then((module) => ({ default: module.PoiesisView })))
const StudiumView = lazy(() => import('./views/StudiumView').then((module) => ({ default: module.StudiumView })))

const CinemaView = lazy(() => import('./views/CinemaView').then((module) => ({ default: module.CinemaView })))

const ViewLoading: React.FC = () => (
  <div className="flex min-h-[45vh] items-center justify-center"><AgoraLoader compact message="Abrindo este espaço" /></div>
)

const CloudRecovery: React.FC<{ error: string | null; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center p-4 font-sans">
    <section className="w-full max-w-md rounded-2xl border border-red-400/25 bg-bg-surface p-6 text-center shadow-2xl">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-red-400/30 bg-red-950/30 text-red-300"><CloudAlert className="h-6 w-6" /></div>
      <h1 className="mt-4 font-serif text-xl font-bold">Não foi possível recuperar seu acervo</h1>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">Nenhum cache local será enviado até a nuvem responder. Tente novamente antes de iniciar uma conta vazia.</p>
      {error ? <p className="mt-3 rounded-xl border border-red-300/15 bg-red-950/25 px-3 py-2 text-xs leading-relaxed text-red-200">{error}</p> : null}
      <button type="button" onClick={onRetry} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-gold px-4 py-2.5 text-xs font-semibold text-bg-base transition-colors hover:bg-accent-gold-bright">
        <RotateCcw className="h-4 w-4" /> Tentar novamente
      </button>
    </section>
  </div>
)

const LocalDataRecovery: React.FC<{
  mediaCount: number
  learningCount: number
  trailCount: number
  sourceLabel: string
  onRecover: () => void
  onDiscard: () => void
}> = ({ mediaCount, learningCount, trailCount, sourceLabel, onRecover, onDiscard }) => {
  const recoveredParts = [
    mediaCount > 0 ? `${mediaCount} ${mediaCount === 1 ? 'obra' : 'obras'}` : '',
    learningCount > 0 ? `${learningCount} ${learningCount === 1 ? 'nota' : 'notas'}` : '',
    trailCount > 0 ? `${trailCount} ${trailCount === 1 ? 'trilha' : 'trilhas'}` : '',
  ].filter(Boolean)

  const discard = () => {
    const confirmed = window.confirm('Descartar esta cópia local e continuar somente com os dados da nuvem? Essa escolha não pode ser desfeita neste navegador.')
    if (confirmed) onDiscard()
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center p-4 font-sans">
      <section aria-labelledby="local-recovery-title" className="w-full max-w-lg rounded-2xl border border-accent-gold/30 bg-bg-surface p-6 text-center shadow-2xl">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-accent-gold/35 bg-accent-gold/10 text-accent-gold"><ArchiveRestore className="h-6 w-6" /></div>
        <h1 id="local-recovery-title" className="mt-4 font-serif text-xl font-bold">Encontramos uma cópia recuperável</h1>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          A nuvem não contém todos os dados de {sourceLabel}. Podemos restaurar {recoveredParts.join(', ')} sem apagar o que já veio da nuvem.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={onRecover} className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-gold px-4 py-2.5 text-xs font-semibold text-bg-base transition-colors hover:bg-accent-gold-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold">
            <ArchiveRestore className="h-4 w-4" /> Recuperar cópia local
          </button>
          <button type="button" onClick={discard} className="rounded-xl border border-red-300/20 px-4 py-2.5 text-xs font-semibold text-red-200 transition-colors hover:bg-red-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300">
            Usar apenas a nuvem
          </button>
        </div>
      </section>
    </div>
  )
}

const MainContent: React.FC = () => {
  const { user, isLoading } = useAuth()
  const {
    activeTab,
    cloudError,
    discardLocalRecovery,
    hasCompletedOnboarding,
    isVisitor,
    isDataReady,
    isCloudReady,
    localRecovery,
    recoverLocalData,
    retryCloudSync,
    syncStatus,
  } = useAgoraStore()
  const [hasMountedSchole, setHasMountedSchole] = useState(activeTab === 'schole')

  useEffect(() => {
    if (activeTab === 'schole') setHasMountedSchole(true)
  }, [activeTab])

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

  if (localRecovery) {
    return (
      <LocalDataRecovery
        mediaCount={localRecovery.mediaCount}
        learningCount={localRecovery.learningCount}
        trailCount={localRecovery.trailCount}
        sourceLabel={localRecovery.sourceLabel}
        onRecover={recoverLocalData}
        onDiscard={discardLocalRecovery}
      />
    )
  }

  // Uma conta sem cache não deve cair no onboarding quando a leitura remota
  // falhou: isso pareceria uma conta nova e poderia levar à perda do acervo.
  if (!isVisitor && !hasCompletedOnboarding && !isCloudReady) {
    if (syncStatus === 'error') return <CloudRecovery error={cloudError} onRetry={retryCloudSync} />
    return (
      <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center p-4 font-sans"><AgoraLoader message="Conectando ao seu acervo" detail="Confirmando a cópia segura da sua conta…" /></div>
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
      case 'cinema':
        return <CinemaView />
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
            <Suspense fallback={<ViewLoading />}>
              {(hasMountedSchole || activeTab === 'schole') ? (
                <div
                  hidden={activeTab !== 'schole'}
                  inert={activeTab !== 'schole'}
                  aria-hidden={activeTab !== 'schole'}
                  className={activeTab === 'schole' ? 'agora-view-transition' : ''}
                >
                  <ScholeView />
                </div>
              ) : null}
              {activeTab !== 'schole' ? <div key={activeTab} className="agora-view-transition">{renderActiveView()}</div> : null}
            </Suspense>
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
        <CosmicWelcome />
        <MainContent />
      </AgoraProvider>
    </AuthProvider>
  )
}

export default App
