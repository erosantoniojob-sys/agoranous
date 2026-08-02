import React from 'react'
import { Bookmark, Compass, Dumbbell, Feather, Home, Hourglass, Map, Plus } from 'lucide-react'
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
  <button type="button" onClick={onClick} onPointerEnter={() => preloadView(view)} onFocus={() => preloadView(view)} className={`nav-pill flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-all duration-200 ${active ? 'active' : ''}`}>
    <Icon className="h-4.5 w-4.5 stroke-[1.8]" />
    <span className="max-w-full truncate">{label}</span>
  </button>
)

const BottomItem: React.FC<NavItemProps> = ({ label, icon: Icon, active, onClick, view }) => (
  <button type="button" onClick={onClick} onPointerEnter={() => preloadView(view)} onFocus={() => preloadView(view)} className={`nav-pill-desktop flex min-w-14 flex-col items-center gap-1 px-2 py-1 text-[10px] font-medium transition-all duration-200 ${active ? 'active' : ''}`}>
    <Icon className="h-4.5 w-4.5 stroke-[1.7]" />
    <span>{label}</span>
  </button>
)

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab, setIsSearchOpen } = useAgoraStore()
  const openAddMedia = () => setIsSearchOpen(true)

  return (
    <>
      <nav className="tab-bar-mobile fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 gap-1.5 border-t border-white/10 px-2 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-2 sm:mx-auto sm:max-w-2xl sm:rounded-t-[1.35rem] lg:hidden" aria-label="Navegação principal">
        <MobileNavItem label="Início" icon={Home} active={activeTab === 'inicio'} view="inicio" onClick={() => setActiveTab('inicio')} />
        <MobileNavItem label="Explorar" icon={Compass} active={activeTab === 'explorar'} view="explorar" onClick={() => setActiveTab('explorar')} />
        <MobileNavItem label="Trilhas" icon={Map} active={activeTab === 'trilhas'} view="trilhas" onClick={() => setActiveTab('trilhas')} />
        <button type="button" onClick={openAddMedia} className="nav-pill nav-pill-add flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl bg-accent-gold text-[10px] font-bold text-bg-base shadow-[0_8px_18px_rgba(212,175,55,0.22)] transition-all duration-200 hover:-translate-y-0.5" aria-label="Adicionar obra ao acervo"><Plus className="h-5 w-5" /><span>Nova</span></button>
        <MobileNavItem label="Poíesis" icon={Feather} active={activeTab === 'poiesis'} view="poiesis" onClick={() => setActiveTab('poiesis')} />
        <MobileNavItem label="Memória" icon={Bookmark} active={activeTab === 'memoria'} view="memoria" onClick={() => setActiveTab('memoria')} />
        <MobileNavItem label="Scholé" icon={Hourglass} active={activeTab === 'schole'} view="schole" onClick={() => setActiveTab('schole')} />
        <MobileNavItem label="Rotina" icon={Dumbbell} active={activeTab === 'rotina'} view="rotina" onClick={() => setActiveTab('rotina')} />
      </nav>

      <nav className="tab-bar-desktop fixed bottom-3 left-1/2 z-40 hidden -translate-x-1/2 items-end rounded-full px-5 py-2 shadow-[0_14px_36px_rgba(0,0,0,0.28)] backdrop-blur-2xl lg:flex" aria-label="Ações rápidas">
        <BottomItem label="Início" icon={Home} active={activeTab === 'inicio'} view="inicio" onClick={() => setActiveTab('inicio')} />
        <BottomItem label="Explorar" icon={Compass} active={activeTab === 'explorar'} view="explorar" onClick={() => setActiveTab('explorar')} />
        <BottomItem label="Trilhas" icon={Map} active={activeTab === 'trilhas'} view="trilhas" onClick={() => setActiveTab('trilhas')} />
        <BottomItem label="Poíesis" icon={Feather} active={activeTab === 'poiesis'} view="poiesis" onClick={() => setActiveTab('poiesis')} />
        <button type="button" onClick={openAddMedia} className="-mt-8 mx-2 grid h-15 w-15 place-items-center rounded-full border border-accent-gold-bright/60 bg-gradient-to-b from-[#f7e7ad] via-accent-gold to-[#a38222] text-bg-base shadow-[0_10px_22px_rgba(0,0,0,0.45),0_0_16px_rgba(212,175,55,0.3)] transition-transform duration-200 hover:-translate-y-1 hover:scale-105" aria-label="Adicionar obra ao acervo"><Plus className="h-7 w-7 stroke-[2]" /></button>
        <BottomItem label="Memória" icon={Bookmark} active={activeTab === 'memoria'} view="memoria" onClick={() => setActiveTab('memoria')} />
        <BottomItem label="Scholé" icon={Hourglass} active={activeTab === 'schole'} view="schole" onClick={() => setActiveTab('schole')} />
        <BottomItem label="Rotina" icon={Dumbbell} active={activeTab === 'rotina'} view="rotina" onClick={() => setActiveTab('rotina')} />
      </nav>
    </>
  )
}
