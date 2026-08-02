import React, { useEffect, useState } from 'react'
import { X, ChevronLeft, Sliders, Database, Home, Compass, Map, BookOpen, Bookmark, Hourglass, Dumbbell } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { preloadView } from '../lib/viewPreload'

export const LeftDrawer: React.FC = () => {
  const { isLeftDrawerOpen, setIsLeftDrawerOpen, setActiveTab, activeTab } = useAgoraStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsLeftDrawerOpen(false)
    }

    if (isLeftDrawerOpen) window.addEventListener('keydown', closeWithEscape)
    return () => window.removeEventListener('keydown', closeWithEscape)
  }, [isLeftDrawerOpen, setIsLeftDrawerOpen])

  const handleBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem('agora_media_items_v3') || '{}')
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `agora_second_brain_backup_${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const navigationItems = [
    { label: 'Início', icon: Home, tab: 'inicio' },
    { label: 'Explorar', icon: Compass, tab: 'explorar' },
    { label: 'Trilhas', icon: Map, tab: 'trilhas' },
    { label: 'Acervo', icon: BookOpen, tab: 'inicio' },
    { label: 'Memória', icon: Bookmark, tab: 'memoria' },
  ]

  const lifestyleItems = [
    { label: 'Scholé', icon: Hourglass, tab: 'schole' },
    { label: 'Rotina', icon: Dumbbell, tab: 'rotina' },
  ]

  const settingsItems = [
    { label: 'Ajustes', icon: Sliders, action: () => alert('Configurações') },
    { label: 'Backup', icon: Database, action: handleBackup },
  ]

  const handleNavClick = (tab: string) => {
    setActiveTab(tab)
    setIsLeftDrawerOpen(false)
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50 lg:static lg:inset-auto lg:z-auto lg:pointer-events-auto">
      {/* Mobile Backdrop */}
      <div
        onClick={() => setIsLeftDrawerOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 bg-bg-base/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isLeftDrawerOpen ? 'pointer-events-auto opacity-100' : 'opacity-0'}`}
      />

      {/* Sidebar */}
      <aside
        className={`pointer-events-auto fixed inset-y-0 left-0 z-50 lg:relative lg:inset-auto lg:z-auto lg:h-auto lg:border-none lg:shadow-none lg:translate-x-0 lg:bg-transparent lg:p-0 flex flex-col bg-bg-sidebar border-r border-border-primary transition-all duration-250 ease-out motion-reduce:transition-none ${
          isLeftDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64 max-w-[85vw]`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 lg:p-6 border-b border-border-primary ${isCollapsed ? 'lg:flex-col lg:gap-2' : ''}`}>
          <div className={`${isCollapsed ? 'lg:hidden' : ''}`}>
            <div className="font-serif text-lg font-bold text-text-primary">ÁGORA</div>
            <p className="text-xs text-text-secondary uppercase tracking-widest">Conhecimento</p>
          </div>

          <button
            onClick={() => setIsLeftDrawerOpen(false)}
            className="lg:hidden p-1.5 text-text-secondary hover:text-text-primary rounded-md transition-all duration-250 ease-out"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto p-4 lg:p-3 space-y-1 ${isCollapsed ? 'lg:flex lg:flex-col lg:items-center' : ''}`}>
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.tab
            return (
              <button
                key={item.tab}
                onPointerEnter={() => preloadView(item.tab)}
                onFocus={() => preloadView(item.tab)}
                onClick={() => handleNavClick(item.tab)}
                className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-250 ease-out ${
                  isActive
                    ? 'bg-accent-gold/10 text-accent-gold'
                    : 'text-text-primary hover:bg-border-primary/30 hover:text-accent-gold'
                }`}
                title={isCollapsed && item.label}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 w-1 h-6 -translate-y-1/2 bg-accent-gold rounded-r-full" />
                )}
              </button>
            )
          })}

          {/* Lifestyle Spaces */}
          <div className={`border-t border-border-primary mt-4 pt-4 ${isCollapsed ? 'lg:w-full lg:flex lg:flex-col' : ''}`}>
            {!isCollapsed && <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 px-3">Espaços</p>}
            <div className={`space-y-1 ${isCollapsed ? 'lg:flex lg:flex-col lg:gap-1 lg:items-center' : ''}`}>
              {lifestyleItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.tab
                return (
                  <button
                    key={item.tab}
                    onPointerEnter={() => preloadView(item.tab)}
                    onClick={() => handleNavClick(item.tab)}
                    className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-250 ease-out ${
                      isActive
                        ? 'bg-accent-gold/10 text-accent-gold'
                        : 'text-text-primary hover:bg-border-primary/30 hover:text-accent-gold'
                    }`}
                    title={isCollapsed && item.label}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Settings */}
          <div className={`border-t border-border-primary mt-4 pt-4 ${isCollapsed ? 'lg:w-full lg:flex lg:flex-col' : ''}`}>
            {!isCollapsed && <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 px-3">Sistema</p>}
            <div className={`space-y-1 ${isCollapsed ? 'lg:flex lg:flex-col lg:gap-1 lg:items-center' : ''}`}>
              {settingsItems.map((item, idx) => {
                const Icon = item.icon
                return (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-border-primary/30 rounded-lg transition-all duration-250 ease-out"
                    title={isCollapsed && item.label}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="text-sm">{item.label}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </nav>

        {/* Collapse Button - Desktop Only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center p-3 m-3 border border-border-primary rounded-lg hover:bg-border-primary/30 text-text-secondary hover:text-text-primary transition-all duration-250 ease-out"
          title={isCollapsed ? 'Expandir' : 'Recolher'}
        >
          <ChevronLeft className={`w-5 h-5 transition-transform duration-250 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>
    </div>
  )
}


