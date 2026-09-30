import React from 'react'
import { Film, Compass, Bookmark, Feather, Home, Menu, Plus, UserRound } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { preloadView, type ViewName } from '../lib/viewPreload'

type NavEntry = {
  label: string
  icon: React.ElementType
  tab: ViewName
}

type NavButtonProps = NavEntry & {
  active: boolean
  onClick: () => void
}

const MobileNavButton: React.FC<NavButtonProps> = ({ label, icon: Icon, tab, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    onPointerEnter={() => preloadView(tab)}
    onFocus={() => preloadView(tab)}
    aria-current={active ? 'page' : undefined}
    className={`mobile-nav-item ${active ? 'is-active' : ''}`}
  >
    <Icon className="h-[1.15rem] w-[1.15rem]" />
    <span>{label}</span>
  </button>
)

const RailNavButton: React.FC<NavButtonProps> = ({ label, icon: Icon, tab, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    onPointerEnter={() => preloadView(tab)}
    onFocus={() => preloadView(tab)}
    aria-current={active ? 'page' : undefined}
    className={`nav-rail__item ${active ? 'is-active' : ''}`}
    title={label}
  >
    <Icon className="h-[1.1rem] w-[1.1rem]" />
    <span>{label}</span>
  </button>
)

const mainNav: NavEntry[] = [
  { label: 'Hoje', icon: Home, tab: 'inicio' },
  { label: 'Biblioteca', icon: Bookmark, tab: 'explorar' },
  { label: 'Cinema', icon: Film, tab: 'cinema' },
  { label: 'Explorar', icon: Compass, tab: 'descobrir' },
  { label: 'Notas', icon: Feather, tab: 'memoria' },
]

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab, setIsLeftDrawerOpen, setIsSearchOpen } = useAgoraStore()

  const openCreate = () => setIsSearchOpen(true)

  return (
    <>
      <nav className="mobile-dock-shell lg:hidden fixed inset-x-0 bottom-0 z-40 flex justify-center px-[max(0.55rem,env(safe-area-inset-left))] py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]" aria-label="Navegação principal">
        <div className="tab-bar-mobile mobile-navigation relative grid w-full max-w-[34rem] grid-cols-5 items-center rounded-2xl border border-border-primary px-1.5 py-1.5">
          <MobileNavButton label="Hoje" icon={Home} tab="inicio" active={activeTab === 'inicio'} onClick={() => setActiveTab('inicio')} />
          <MobileNavButton label="Biblioteca" icon={Bookmark} tab="explorar" active={activeTab === 'explorar'} onClick={() => setActiveTab('explorar')} />
          <MobileNavButton label="Cinema" icon={Film} tab="cinema" active={activeTab === 'cinema'} onClick={() => setActiveTab('cinema')} />
          <MobileNavButton label="Explorar" icon={Compass} tab="descobrir" active={activeTab === 'descobrir'} onClick={() => setActiveTab('descobrir')} />
          <button type="button" onClick={() => setIsLeftDrawerOpen(true)} className="mobile-nav-item" aria-label="Mais opções" title="Mais">
            <Menu className="h-[1.15rem] w-[1.15rem]" />
            <span>Mais</span>
          </button>
        </div>
      </nav>

      <nav className="nav-rail hidden lg:flex fixed left-4 top-1/2 z-40 -translate-y-1/2 flex-col items-center" aria-label="Navegação principal">
        <div className="nav-rail__monogram" aria-hidden="true">A</div>
        <div className="nav-rail__group">
          {mainNav.map((item) => <RailNavButton key={item.tab} {...item} active={activeTab === item.tab} onClick={() => setActiveTab(item.tab)} />)}
        </div>
        <div className="nav-rail__separator" />
        <button type="button" onClick={openCreate} className="nav-rail__create" aria-label="Criar ou adicionar obra" title="Criar ou adicionar obra"><Plus className="h-5 w-5" /></button>
        <div className="nav-rail__separator" />
        <button type="button" onClick={() => setActiveTab('perfil')} className={`nav-rail__item ${activeTab === 'perfil' ? 'is-active' : ''}`} aria-current={activeTab === 'perfil' ? 'page' : undefined} title="Perfil"><UserRound className="h-[1.1rem] w-[1.1rem]" /><span>Perfil</span></button>
      </nav>
    </>
  )
}
