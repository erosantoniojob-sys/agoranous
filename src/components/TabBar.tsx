import React from 'react'
import { Bookmark, Compass, HeartHandshake, Home, Hourglass, Map, Plus } from 'lucide-react'
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

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab, setIsSearchOpen } = useAgoraStore()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-text-primary/10 bg-bg-surface/95 px-2 py-2 shadow-2xl backdrop-blur-lg md:bottom-5 md:left-1/2 md:right-auto md:w-[min(760px,calc(100%-2rem))] md:-translate-x-1/2 md:rounded-2xl md:border"
      aria-label="Navegação principal"
    >
      <div className="grid w-full grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] items-end gap-1 sm:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)]">
        {/* Descoberta e foco */}
        <div className="grid grid-cols-3">
          <NavItem label="Início" icon={Home} active={activeTab === 'inicio'} view="inicio" onClick={() => setActiveTab('inicio')} />
          <NavItem label="Explorar" icon={Compass} active={activeTab === 'explorar'} view="explorar" onClick={() => setActiveTab('explorar')} />
          <NavItem label="Scholé" icon={Hourglass} active={activeTab === 'schole'} view="schole" onClick={() => setActiveTab('schole')} />
        </div>

        {/* Ação primária */}
        <div className="relative -top-4 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-accent-gold-bright/60 bg-gradient-to-b from-[#F7E7AD] via-[#D4AF37] to-[#A38222] text-bg-base shadow-[0_8px_18px_rgba(0,0,0,0.45),0_0_14px_rgba(212,175,55,0.28)] transition-transform hover:scale-105 active:scale-95 sm:h-14 sm:w-14"
            aria-label="Adicionar nova obra ao catálogo"
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-1.5 rounded-t-full bg-white/40 blur-[1px]" />
            <Plus className="relative z-10 h-6 w-6 stroke-[2.8] transition-transform duration-300 group-hover:rotate-90" />
          </button>
          <span className="absolute -bottom-5 whitespace-nowrap text-[10px] font-semibold tracking-wide text-accent-gold">Adicionar</span>
        </div>

        {/* Organização e prática */}
        <div className="grid grid-cols-3">
          <NavItem label="Trilhas" icon={Map} active={activeTab === 'trilhas'} view="trilhas" onClick={() => setActiveTab('trilhas')} />
          <NavItem label="Memória" icon={Bookmark} active={activeTab === 'memoria'} view="memoria" onClick={() => setActiveTab('memoria')} />
          <NavItem label="Virtudes" icon={HeartHandshake} active={activeTab === 'rotina'} view="rotina" onClick={() => setActiveTab('rotina')} />
        </div>
      </div>
    </nav>
  )
}
