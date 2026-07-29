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

const DesktopNavItem: React.FC<NavItemProps> = ({ label, icon: Icon, active, onClick, view }) => (
  <button type="button" onClick={onClick} onPointerEnter={() => preloadView(view)} onFocus={() => preloadView(view)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-all ${active ? 'bg-accent-gold/13 text-accent-gold shadow-[inset_3px_0_0_#D4AF37]' : 'text-text-secondary hover:bg-bg-elevated/70 hover:text-text-primary'}`}>
    <Icon className="h-5 w-5 shrink-0 stroke-[1.7]" />
    <span>{label}</span>
  </button>
)

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useAgoraStore()

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 gap-1 border-t border-text-primary/10 bg-bg-surface/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-2xl backdrop-blur-lg lg:hidden" aria-label="Navegação principal">
        <MobileNavItem label="Início" icon={Home} active={activeTab === 'inicio'} view="inicio" onClick={() => setActiveTab('inicio')} />
        <MobileNavItem label="Explorar" icon={Compass} active={activeTab === 'explorar'} view="explorar" onClick={() => setActiveTab('explorar')} />
        <MobileNavItem label="Scholé" icon={Hourglass} active={activeTab === 'schole'} view="schole" onClick={() => setActiveTab('schole')} />
        <MobileNavItem label="Poíesis" icon={Feather} active={activeTab === 'poiesis'} view="poiesis" onClick={() => setActiveTab('poiesis')} />
        <MobileNavItem label="Trilhas" icon={Map} active={activeTab === 'trilhas'} view="trilhas" onClick={() => setActiveTab('trilhas')} />
        <MobileNavItem label="Memória" icon={Bookmark} active={activeTab === 'memoria'} view="memoria" onClick={() => setActiveTab('memoria')} />
        <MobileNavItem label="Virtudes" icon={HeartHandshake} active={activeTab === 'rotina'} view="rotina" onClick={() => setActiveTab('rotina')} />
      </nav>

      <nav
        className="fixed left-5 top-36 z-40 hidden w-52 rounded-2xl border border-text-primary/10 bg-bg-surface/80 p-2 shadow-2xl backdrop-blur-xl lg:block"
        aria-label="Navegação principal"
      >
      <div className="space-y-1">
        <DesktopNavItem label="Início" icon={Home} active={activeTab === 'inicio'} view="inicio" onClick={() => setActiveTab('inicio')} />
        <DesktopNavItem label="Explorar" icon={Compass} active={activeTab === 'explorar'} view="explorar" onClick={() => setActiveTab('explorar')} />
        <DesktopNavItem label="Scholé" icon={Hourglass} active={activeTab === 'schole'} view="schole" onClick={() => setActiveTab('schole')} />
        <DesktopNavItem label="Poíesis" icon={Feather} active={activeTab === 'poiesis'} view="poiesis" onClick={() => setActiveTab('poiesis')} />
        <DesktopNavItem label="Trilhas" icon={Map} active={activeTab === 'trilhas'} view="trilhas" onClick={() => setActiveTab('trilhas')} />
        <DesktopNavItem label="Memória" icon={Bookmark} active={activeTab === 'memoria'} view="memoria" onClick={() => setActiveTab('memoria')} />
        <DesktopNavItem label="Virtudes" icon={HeartHandshake} active={activeTab === 'rotina'} view="rotina" onClick={() => setActiveTab('rotina')} />
      </div>
      </nav>
    </>
  )
}
