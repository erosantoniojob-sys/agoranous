import React from 'react'
import { Bookmark, Compass, Feather, HeartHandshake, Home, Hourglass, Map } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { ViewName, preloadView } from '../lib/viewPreload'

type NavItemProps = {
  label: string
  icon: React.ElementType
  active: boolean
  onClick: () => void
  view: ViewName
}

const NavItem: React.FC<NavItemProps> = ({ label, icon: Icon, active, onClick, view }) => (
  <button
    type="button"
    onClick={onClick}
    onPointerEnter={() => preloadView(view)}
    onFocus={() => preloadView(view)}
    className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[10px] transition-colors sm:text-xs ${
      active ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'
    }`}
  >
    <Icon className="h-5 w-5 shrink-0 stroke-[1.8]" />
    <span className="truncate font-semibold tracking-wide">{label}</span>
  </button>
)

const MobileNavItem: React.FC<NavItemProps> = ({ label, icon: Icon, active, onClick, view }) => (
  <button
    type="button"
    onClick={onClick}
    onPointerEnter={() => preloadView(view)}
    onFocus={() => preloadView(view)}
    className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors ${
      active ? 'bg-accent-gold/12 text-accent-gold' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
    }`}
  >
    <Icon className="h-5 w-5 stroke-[1.8]" />
    <span className="max-w-full truncate">{label}</span>
  </button>
)

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useAgoraStore()

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 gap-1 border-t border-text-primary/10 bg-bg-surface/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-2xl backdrop-blur-lg md:hidden" aria-label="Navegação principal">
        <MobileNavItem label="Início" icon={Home} active={activeTab === 'inicio'} view="inicio" onClick={() => setActiveTab('inicio')} />
        <MobileNavItem label="Explorar" icon={Compass} active={activeTab === 'explorar'} view="explorar" onClick={() => setActiveTab('explorar')} />
        <MobileNavItem label="Scholé" icon={Hourglass} active={activeTab === 'schole'} view="schole" onClick={() => setActiveTab('schole')} />
        <MobileNavItem label="Poíesis" icon={Feather} active={activeTab === 'poiesis'} view="poiesis" onClick={() => setActiveTab('poiesis')} />
        <MobileNavItem label="Trilhas" icon={Map} active={activeTab === 'trilhas'} view="trilhas" onClick={() => setActiveTab('trilhas')} />
        <MobileNavItem label="Memória" icon={Bookmark} active={activeTab === 'memoria'} view="memoria" onClick={() => setActiveTab('memoria')} />
        <MobileNavItem label="Virtudes" icon={HeartHandshake} active={activeTab === 'rotina'} view="rotina" onClick={() => setActiveTab('rotina')} />
      </nav>

      <nav
        className="fixed bottom-5 left-1/2 z-40 hidden w-[min(760px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-text-primary/10 bg-bg-surface/95 px-2 py-2 shadow-2xl backdrop-blur-lg md:block"
        aria-label="Navegação principal"
      >
      <div className="grid w-full grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] items-end gap-1 sm:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)]">
        {/* Descoberta e foco */}
        <div className="grid grid-cols-3">
          <NavItem label="Início" icon={Home} active={activeTab === 'inicio'} view="inicio" onClick={() => setActiveTab('inicio')} />
          <NavItem label="Explorar" icon={Compass} active={activeTab === 'explorar'} view="explorar" onClick={() => setActiveTab('explorar')} />
          <NavItem label="Scholé" icon={Hourglass} active={activeTab === 'schole'} view="schole" onClick={() => setActiveTab('schole')} />
        </div>

        {/* Espaço criativo central */}
        <div className="relative -top-4 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setActiveTab('poiesis')}
            onPointerEnter={() => preloadView('poiesis')}
            onFocus={() => preloadView('poiesis')}
            className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-accent-gold-bright/60 bg-gradient-to-b from-[#F7E7AD] via-[#D4AF37] to-[#A38222] text-bg-base shadow-[0_8px_18px_rgba(0,0,0,0.45),0_0_14px_rgba(212,175,55,0.28)] transition-transform hover:scale-105 active:scale-95 sm:h-14 sm:w-14"
            aria-label="Abrir Poíesis"
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-1.5 rounded-t-full bg-white/40 blur-[1px]" />
            <Feather className="relative z-10 h-6 w-6 stroke-[2.2] transition-transform duration-300 group-hover:-rotate-6" />
          </button>
          <span className="absolute -bottom-5 whitespace-nowrap text-[10px] font-semibold tracking-wide text-accent-gold">Poíesis</span>
        </div>

        {/* Organização e prática */}
        <div className="grid grid-cols-3">
          <NavItem label="Trilhas" icon={Map} active={activeTab === 'trilhas'} view="trilhas" onClick={() => setActiveTab('trilhas')} />
          <NavItem label="Memória" icon={Bookmark} active={activeTab === 'memoria'} view="memoria" onClick={() => setActiveTab('memoria')} />
          <NavItem label="Virtudes" icon={HeartHandshake} active={activeTab === 'rotina'} view="rotina" onClick={() => setActiveTab('rotina')} />
        </div>
      </div>
      </nav>
    </>
  )
}
