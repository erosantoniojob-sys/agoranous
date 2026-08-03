import React, { useEffect } from 'react'
import { X, Sliders, Database, Home, Compass, Map, BookOpen, Bookmark, Hourglass, Dumbbell } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { preloadView } from '../lib/viewPreload'

// 1. Definição do tipo exato que o seu app espera
type ViewName = "inicio" | "explorar" | "memoria" | "trilhas" | "perfil" | "schole" | "rotina" | "poiesis";

interface NavItem {
  label: string
  icon: React.ElementType
  tab: ViewName
}

export const LeftDrawer: React.FC = () => {
  const { isLeftDrawerOpen, setIsLeftDrawerOpen, setActiveTab, activeTab } = useAgoraStore()

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

  // 2. Array devidamente tipado para não inferir `tab` como 'string'
  const navigationItems: NavItem[] = [
    { label: 'Início', icon: Home, tab: 'inicio' },
    { label: 'Explorar', icon: Compass, tab: 'explorar' },
    { label: 'Trilhas', icon: Map, tab: 'trilhas' },
    { label: 'Acervo', icon: BookOpen, tab: 'inicio' },
    { label: 'Memória', icon: Bookmark, tab: 'memoria' },
  ]

  // 3. Tipagem exata do parâmetro 'tab'
  const handleNavClick = (tab: ViewName) => {
    setActiveTab(tab)
    setIsLeftDrawerOpen(false)
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        onClick={() => setIsLeftDrawerOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 bg-bg-base/80 backdrop-blur-sm transition-opacity duration-300 ${isLeftDrawerOpen ? 'pointer-events-auto opacity-100' : 'opacity-0'}`}
      />

      {/* Sidebar */}
      <aside
        id="menu-lateral"
        aria-label="Menu lateral principal"
        aria-hidden={!isLeftDrawerOpen}
        className={`pointer-events-auto fixed inset-y-0 left-0 z-50 flex h-full w-80 max-w-[85vw] flex-col border-r border-text-primary/15 bg-bg-surface p-6 shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${isLeftDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="font-serif font-bold text-sm text-text-primary">ÁGORA</div>
              <p className="text-[10px] text-text-secondary uppercase tracking-widest">Conhecimento que forma caráter.</p>
            </div>

            <button
              onClick={() => setIsLeftDrawerOpen(false)}
              className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-elevated transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  onPointerEnter={() => preloadView(item.tab)}
                  onFocus={() => preloadView(item.tab)}
                  onClick={() => handleNavClick(item.tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === item.tab
                      ? 'bg-accent-gold/15 text-accent-gold border border-accent-gold/40'
                      : 'text-text-primary hover:text-accent-gold hover:bg-bg-elevated/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Lifestyle Spaces */}
          <div className="border-t border-text-primary/15 pt-4">
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider px-2 mb-3">
              Espaços de Cultivo
            </p>
            <div className="space-y-2">
              <button
                onPointerEnter={() => preloadView('schole')}
                onFocus={() => preloadView('schole')}
                onClick={() => handleNavClick('schole')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'schole'
                    ? 'bg-accent-gold/15 text-accent-gold border border-accent-gold/40'
                    : 'text-text-primary hover:text-accent-gold hover:bg-bg-elevated/50'
                }`}
              >
                <Hourglass className="w-4 h-4" />
                <span>Scholé</span>
              </button>

              <button
                onPointerEnter={() => preloadView('rotina')}
                onFocus={() => preloadView('rotina')}
                onClick={() => handleNavClick('rotina')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'rotina'
                    ? 'bg-accent-gold/15 text-accent-gold border border-accent-gold/40'
                    : 'text-text-primary hover:text-accent-gold hover:bg-bg-elevated/50'
                }`}
              >
                <Dumbbell className="w-4 h-4" />
                <span>Rotina</span>
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="border-t border-text-primary/15 pt-4 space-y-2">
            <button
              onClick={() => {
                alert('Configurações da Interface Ágora: Modo Dark Academia Ativo.')
                setIsLeftDrawerOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50 rounded-xl transition-all"
            >
              <Sliders className="w-4 h-4" />
              <span>Ajustes</span>
            </button>

            <button
              onClick={handleBackup}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50 rounded-xl transition-all"
            >
              <Database className="w-4 h-4" />
              <span>Exportar Backup</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
