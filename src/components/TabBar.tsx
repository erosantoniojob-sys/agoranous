import React, { useEffect } from 'react'
import { Film, Bookmark, Feather, Home, Menu, Plus, UserRound } from 'lucide-react'
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
  { label: 'Descobrir', icon: Film, tab: 'cinema' },
  { label: 'Notas', icon: Feather, tab: 'memoria' },
]

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab, setIsLeftDrawerOpen, setIsSearchOpen } = useAgoraStore()

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches) return

    const docks = Array.from(document.querySelectorAll<HTMLElement>('.velocity-dock'))
    let lastY = window.scrollY
    let lastTime = performance.now()
    let targetVelocity = 0
    let currentVelocity = 0
    let frame = 0

    const render = () => {
      targetVelocity *= 0.84
      currentVelocity += (targetVelocity - currentVelocity) * 0.18
      const value = currentVelocity.toFixed(3)
      const energy = Math.abs(currentVelocity).toFixed(3)
      docks.forEach((dock) => {
        dock.style.setProperty('--scroll-velocity', value)
        dock.style.setProperty('--scroll-energy', energy)
      })

      if (Math.abs(currentVelocity) > 0.003 || Math.abs(targetVelocity) > 0.003) frame = window.requestAnimationFrame(render)
      else {
        docks.forEach((dock) => {
          dock.style.setProperty('--scroll-velocity', '0')
          dock.style.setProperty('--scroll-energy', '0')
        })
        frame = 0
      }
    }

    const onScroll = () => {
      const now = performance.now()
      const elapsed = Math.max(now - lastTime, 16)
      const distance = window.scrollY - lastY
      targetVelocity = Math.max(-1, Math.min(1, distance / elapsed / 1.25))
      lastY = window.scrollY
      lastTime = now
      if (!frame) frame = window.requestAnimationFrame(render)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  const openCreate = () => setIsSearchOpen(true)

  return (
    <>
      <nav className="mobile-dock-shell lg:hidden fixed inset-x-0 bottom-0 z-40 flex justify-center px-[max(0.55rem,env(safe-area-inset-left))] py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]" aria-label="Navegação principal">
        <div className="velocity-dock tab-bar-mobile mobile-navigation relative grid w-full max-w-[34rem] grid-cols-5 items-center rounded-2xl border border-border-primary px-1.5 py-1.5">
          <MobileNavButton label="Hoje" icon={Home} tab="inicio" active={activeTab === 'inicio'} onClick={() => setActiveTab('inicio')} />
          <MobileNavButton label="Biblioteca" icon={Bookmark} tab="explorar" active={activeTab === 'explorar'} onClick={() => setActiveTab('explorar')} />
          <button type="button" onClick={openCreate} className="mobile-nav-create" aria-label="Criar ou adicionar obra" title="Criar">
            <Plus className="h-5 w-5" />
            <span>Adicionar</span>
          </button>
          <MobileNavButton label="Descobrir" icon={Film} tab="cinema" active={activeTab === 'cinema'} onClick={() => setActiveTab('cinema')} />
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
