import React from 'react'
import { Bookmark, Compass, Feather, HeartHandshake, Home, Hourglass, Map, Plus } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { ViewName, preloadView } from '../lib/viewPreload'

type NavItemProps = {
  label: string
  icon: React.ElementType
  active: boolean
  onClick: () => void
  view: ViewName
}

const MobileNavItem: React.FC<NavItemProps> = ({ label, icon: Icon, active, onClick, view }) => (
  <button type="button" onClick={onClick} onPointerEnter={() => preloadView(view)} onFocus={() => preloadView(view)} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors ${active ? 'bg-accent-gold/12 text-accent-gold' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}>
    <Icon className="h-5 w-5 stroke-[1.8]" />
    <span className="max-w-full truncate">{label}</span>
  </button>
)

const BottomItem: React.FC<NavItemProps> = ({ label, icon: Icon, active, onClick, view }) => (
  <button type="button" onClick={onClick} onPointerEnter={() => preloadView(view)} onFocus={() => preloadView(view)} className={`flex min-w-15 flex-col items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors ${active ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'}`}>
    <Icon className="h-5 w-5 stroke-[1.7]" />
    <span>{label}</span>
  </button>
)

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab, setIsSearchOpen } = useAgoraStore()
  const openAddMedia = () => setIsSearchOpen(true)

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 gap-1 border-t border-text-primary/10 bg-bg-surface/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-2xl backdrop-blur-lg lg:hidden" aria-label="Navegação principal">
        <MobileNavItem label="Início" icon={Home} active={activeTab === 'inicio'} view="inicio" onClick={() => setActiveTab('inicio')} />
        <MobileNavItem label="Explorar" icon={Compass} active={activeTab === 'explorar'} view="explorar" onClick={() => setActiveTab('explorar')} />
        <MobileNavItem label="Scholé" icon={Hourglass} active={activeTab === 'schole'} view="schole" onClick={() => setActiveTab('schole')} />
        <button type="button" onClick={openAddMedia} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl bg-accent-gold text-[10px] font-bold text-bg-base shadow-lg shadow-accent-gold/20" aria-label="Adicionar obra ao acervo"><Plus className="h-6 w-6" /><span>Adicionar</span></button>
        <MobileNavItem label="Poíesis" icon={Feather} active={activeTab === 'poiesis'} view="poiesis" onClick={() => setActiveTab('poiesis')} />
        <MobileNavItem label="Trilhas" icon={Map} active={activeTab === 'trilhas'} view="trilhas" onClick={() => setActiveTab('trilhas')} />
        <MobileNavItem label="Memória" icon={Bookmark} active={activeTab === 'memoria'} view="memoria" onClick={() => setActiveTab('memoria')} />
        <MobileNavItem label="Virtudes" icon={HeartHandshake} active={activeTab === 'rotina'} view="rotina" onClick={() => setActiveTab('rotina')} />
      </nav>

      <nav className="fixed bottom-3 left-1/2 z-40 hidden -translate-x-1/2 items-end rounded-2xl border border-text-primary/15 bg-bg-surface/95 px-5 py-2 shadow-2xl backdrop-blur-xl lg:flex" aria-label="Ações rápidas">
        <BottomItem label="Início" icon={Home} active={activeTab === 'inicio'} view="inicio" onClick={() => setActiveTab('inicio')} />
        <BottomItem label="Explorar" icon={Compass} active={activeTab === 'explorar'} view="explorar" onClick={() => setActiveTab('explorar')} />
        <BottomItem label="Scholé" icon={Hourglass} active={activeTab === 'schole'} view="schole" onClick={() => setActiveTab('schole')} />
        <BottomItem label="Poíesis" icon={Feather} active={activeTab === 'poiesis'} view="poiesis" onClick={() => setActiveTab('poiesis')} />
        <button type="button" onClick={openAddMedia} className="-mt-8 mx-2 grid h-16 w-16 place-items-center rounded-full border border-accent-gold-bright/60 bg-gradient-to-b from-[#f7e7ad] via-accent-gold to-[#a38222] text-bg-base shadow-[0_10px_22px_rgba(0,0,0,0.45),0_0_16px_rgba(212,175,55,0.3)] transition-transform hover:scale-105" aria-label="Adicionar obra ao acervo"><Plus className="h-8 w-8 stroke-[2]" /></button>
        <BottomItem label="Trilhas" icon={Map} active={activeTab === 'trilhas'} view="trilhas" onClick={() => setActiveTab('trilhas')} />
        <BottomItem label="Memória" icon={Bookmark} active={activeTab === 'memoria'} view="memoria" onClick={() => setActiveTab('memoria')} />
        <BottomItem label="Virtudes" icon={HeartHandshake} active={activeTab === 'rotina'} view="rotina" onClick={() => setActiveTab('rotina')} />
      </nav>
    </>
  )
}
