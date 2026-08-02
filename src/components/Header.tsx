import React from 'react'
import { Menu, Search, Bell, LogOut } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { useAuth } from '../context/AuthContext'
import { ClassicArchLogoIcon } from './ClassicArchLogo'

export const Header: React.FC = () => {
  const { setIsSearchOpen, isLeftDrawerOpen, setIsLeftDrawerOpen, setIsRightChatOpen, userProfile } = useAgoraStore()
  const { logout } = useAuth()

  const getDynamicGreeting = () => {
    const now = new Date()
    const hour = now.getHours()
    let period = 'Boa tarde'
    if (hour >= 5 && hour < 12) period = 'Bom dia'
    else if (hour >= 18 || hour < 5) period = 'Boa noite'
    return period
  }

  return (
    <header className="w-full bg-bg-base/95 backdrop-blur-sm border-b border-border-primary sticky top-0 z-30">
      <div className="app-header-shell flex flex-col gap-4 py-4">
        {/* Top row */}
        <div className="flex items-center justify-between">
          {/* Left: Hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsLeftDrawerOpen(!isLeftDrawerOpen)}
              className="lg:hidden p-2 text-text-secondary hover:text-accent-gold rounded-lg transition-all duration-250 ease-out"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden lg:flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center">
                <ClassicArchLogoIcon className="w-5 h-5 text-accent-gold" />
              </div>
              <span className="font-serif text-sm font-bold text-text-primary">ÁGORA</span>
            </div>
          </div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-text-secondary hover:text-accent-gold hover:bg-border-primary/30 rounded-lg transition-all duration-250 ease-out"
              title="Notificações"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => logout()}
              className="p-2 text-text-secondary hover:text-red-400 hover:bg-border-primary/30 rounded-lg transition-all duration-250 ease-out"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom row: Greeting + Search */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-serif font-bold text-text-primary">
              {getDynamicGreeting()}{userProfile.nome ? `, ${userProfile.nome.split(' ')[0]}` : ''}
            </p>
            <p className="text-xs text-text-secondary">Explorar seu conhecimento</p>
          </div>

          {/* Large Search Bar */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-bg-card border border-border-primary rounded-lg hover:border-accent-gold/50 transition-all duration-250 ease-out group"
          >
            <Search className="w-5 h-5 text-text-secondary group-hover:text-accent-gold transition-all duration-250 ease-out" />
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-all duration-250 ease-out">Buscar mídias, notas e trilhas…</span>
          </button>
        </div>
      </div>
    </header>
  )
}
