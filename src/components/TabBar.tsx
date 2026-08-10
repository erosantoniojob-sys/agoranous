import React, { useEffect } from 'react'
import { Bookmark, Brain, Compass, Dumbbell, Feather, Home, Hourglass, Map, Plus } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { ViewName, preloadView } from '../lib/viewPreload'

type NavItemProps = {
  label: string
  icon: React.ElementType
  active: boolean
  onClick: () => void
  view: ViewName
}

const DockItem: React.FC<NavItemProps> = ({ label, icon: Icon, active, onClick, view }) => (
  <button
    type="button"
    onClick={onClick}
    onPointerEnter={() => preloadView(view)}
    onFocus={() => preloadView(view)}
    aria-label={label}
    aria-current={active ? 'page' : undefined}
    className={`group relative flex min-w-10 flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all duration-250 ease-out ${
      active
        ? 'bg-accent-gold/15 text-accent-gold'
        : 'text-text-secondary hover:text-text-primary hover:bg-border-primary/30'
    }`}
    title={label}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[9px] font-semibold leading-none lg:hidden">{label}</span>
  </button>
)

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab, setIsSearchOpen } = useAgoraStore()
  const openAddMedia = () => setIsSearchOpen(true)

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

      if (Math.abs(currentVelocity) > 0.003 || Math.abs(targetVelocity) > 0.003) {
        frame = window.requestAnimationFrame(render)
      } else {
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

  const mainNavItems: Array<{ label: string; icon: React.ElementType; tab: ViewName }> = [
    { label: 'Início', icon: Home, tab: 'inicio' },
    { label: 'Explorar', icon: Compass, tab: 'explorar' },
    { label: 'Trilhas', icon: Map, tab: 'trilhas' },
  ]

  const memoryItem = { label: 'Memória', icon: Bookmark, tab: 'memoria' as const }

  const lifestyleItems: Array<{ label: string; icon: React.ElementType; tab: ViewName }> = [
    { label: 'Scholé', icon: Hourglass, tab: 'schole' },
    { label: 'Rotina', icon: Dumbbell, tab: 'rotina' },
  ]

  const desktopLeftItems = [...mainNavItems, memoryItem]
  const desktopRightItems: Array<{ label: string; icon: React.ElementType; tab: ViewName }> = [
    ...lifestyleItems,
    { label: 'Poíesis', icon: Feather, tab: 'poiesis' },
    { label: 'Studium', icon: Brain, tab: 'studium' },
  ]

  return (
    <>
      {/* Mobile Dock - Bottom */}
      <nav className="mobile-dock-shell lg:hidden fixed inset-x-0 bottom-0 z-40 flex justify-center px-[max(0.75rem,env(safe-area-inset-left))] py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="velocity-dock tab-bar-mobile relative flex w-full max-w-[30rem] items-center justify-between gap-1 px-2 py-2 rounded-2xl border border-border-primary">
          {mainNavItems.map((item) => (
            <DockItem
              key={item.tab}
              label={item.label}
              icon={item.icon}
              active={activeTab === item.tab}
              view={item.tab}
              onClick={() => setActiveTab(item.tab)}
            />
          ))}

          <div className="w-px h-6 bg-border-primary/50" />

          <button
            type="button"
            onClick={openAddMedia}
            aria-label="Adicionar mídia"
            className="group flex min-w-10 flex-col items-center justify-center gap-1 p-2 rounded-lg bg-accent-gold hover:bg-accent-gold/90 text-bg-base transition-all duration-250 ease-out hover:scale-110"
            title="Adicionar"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[9px] font-bold leading-none lg:hidden">Adicionar</span>
          </button>

          <div className="w-px h-6 bg-border-primary/50" />

          {lifestyleItems.slice(0, 2).map((item) => (
            <DockItem
              key={item.tab}
              label={item.label}
              icon={item.icon}
              active={activeTab === item.tab}
              view={item.tab}
              onClick={() => setActiveTab(item.tab)}
            />
          ))}
        </div>
      </nav>

      {/* Desktop Dock - Bottom Center */}
      <nav className="velocity-dock tab-bar-desktop hidden lg:flex fixed bottom-6 left-1/2 z-40 -translate-x-1/2 items-center gap-2 px-4 py-3 rounded-2xl shadow-lg-elevation">
        {desktopLeftItems.map((item) => (
          <DockItem
            key={item.tab}
            label={item.label}
            icon={item.icon}
            active={activeTab === item.tab}
            view={item.tab}
            onClick={() => setActiveTab(item.tab)}
          />
        ))}

        <div className="w-px h-8 bg-border-primary/50" />

        <button
          type="button"
          onClick={openAddMedia}
          aria-label="Adicionar mídia"
          className="group flex items-center justify-center gap-1 p-2.5 rounded-lg bg-gradient-to-b from-accent-gold to-amber-700 hover:shadow-md-elevation text-bg-base font-bold transition-all duration-250 ease-out hover:scale-110 hover:-translate-y-1"
          title="Adicionar"
        >
          <Plus className="w-6 h-6" />
        </button>

        <div className="w-px h-8 bg-border-primary/50" />

        {desktopRightItems.map((item) => (
          <DockItem
            key={item.tab}
            label={item.label}
            icon={item.icon}
            active={activeTab === item.tab}
            view={item.tab}
            onClick={() => setActiveTab(item.tab)}
          />
        ))}
      </nav>
    </>
  )
}
