import React from 'react'
import { Bookmark, Compass, Dumbbell, Home, Hourglass, Map, Plus } from 'lucide-react'
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
    className={`group relative flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg transition-all duration-250 ease-out ${
      active
        ? 'bg-accent-gold/15 text-accent-gold'
        : 'text-text-secondary hover:text-text-primary hover:bg-border-primary/30'
    }`}
    title={label}
  >
    <Icon className="w-5 h-5" />
  </button>
)

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab, setIsSearchOpen } = useAgoraStore()
  const openAddMedia = () => setIsSearchOpen(true)

  const mainNavItems = [
    { label: 'Início', icon: Home, tab: 'inicio' },
    { label: 'Explorar', icon: Compass, tab: 'explorar' },
    { label: 'Trilhas', icon: Map, tab: 'trilhas' },
  ]

  const lifestyleItems = [
    { label: 'Memória', icon: Bookmark, tab: 'memoria' },
    { label: 'Scholé', icon: Hourglass, tab: 'schole' },
    { label: 'Rotina', icon: Dumbbell, tab: 'rotina' },
  ]

  return (
    <>
      {/* Mobile Dock - Bottom */}
      <nav className="lg:hidden fixed inset-x-0 bottom-0 z-40 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-1 px-3 py-2.5 bg-bg-sidebar/95 backdrop-blur-md border border-border-primary rounded-2xl shadow-lg-elevation">
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
            className="group flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-accent-gold hover:bg-accent-gold/90 text-bg-base transition-all duration-250 ease-out hover:scale-110"
            title="Adicionar"
          >
            <Plus className="w-5 h-5" />
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
      <nav className="hidden lg:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-40 items-center gap-2 px-4 py-3 bg-bg-sidebar/95 backdrop-blur-md border border-border-primary rounded-2xl shadow-lg-elevation">
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

        <div className="w-px h-8 bg-border-primary/50" />

        <button
          type="button"
          onClick={openAddMedia}
          className="group flex items-center justify-center gap-1 p-2.5 rounded-lg bg-gradient-to-b from-accent-gold to-amber-700 hover:shadow-md-elevation text-bg-base font-bold transition-all duration-250 ease-out hover:scale-110 hover:-translate-y-1"
          title="Adicionar"
        >
          <Plus className="w-6 h-6" />
        </button>

        <div className="w-px h-8 bg-border-primary/50" />

        {lifestyleItems.map((item) => (
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
