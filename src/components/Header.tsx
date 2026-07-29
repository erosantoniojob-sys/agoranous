import React from 'react'
import { Menu, Search, Compass, LogOut } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { useAuth } from '../context/AuthContext'
import { ClassicArchLogoIcon } from './ClassicArchLogo'

export const Header: React.FC = () => {
  const { setIsSearchOpen, setIsLeftDrawerOpen, setIsRightChatOpen, userProfile } = useAgoraStore()
  const { logout } = useAuth()

  // Dynamic greeting: Moment of day, day of week, user name
  const getDynamicGreeting = () => {
    const now = new Date()
    const hour = now.getHours()

    let period = 'Boa tarde'
    if (hour >= 5 && hour < 12) period = 'Bom dia'
    else if (hour >= 18 || hour < 5) period = 'Boa noite'

    const days = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ]
    const dayOfWeek = days[now.getDay()]

    const nameStr = userProfile.nome ? `, ${userProfile.nome}` : ''

    return `${period}, ${dayOfWeek}${nameStr}.`
  }

  return (
    <header className="w-full bg-bg-base/90 backdrop-blur-md sticky top-0 z-30 border-b border-text-primary/10 py-2.5 sm:py-3.5">
      <div className="app-header-shell flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Left Side: Hamburger Drawer Button & Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            {/* Hamburger Button ☰ */}
            <button
              onClick={() => setIsLeftDrawerOpen(true)}
              title="Abrir Menu de Estilo de Vida"
              className="p-2 text-text-secondary hover:text-accent-gold hover:bg-bg-surface rounded-xl border border-text-primary/10 transition-all cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Classical Logo Arch */}
            <div className="w-10 h-10 rounded-xl bg-bg-surface border border-accent-gold/40 flex items-center justify-center shadow-lg p-1.5">
              <ClassicArchLogoIcon className="w-7 h-7 text-accent-gold" />
            </div>

            <div className="min-w-0">
              <h1 className="font-serif font-bold text-xl text-text-primary tracking-wide leading-tight">
                Àgora
              </h1>
              <p className="max-w-[min(42vw,260px)] text-xs font-sans font-medium text-accent-gold truncate">
                {getDynamicGreeting()}
              </p>
            </div>
          </div>

          {/* Right Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsRightChatOpen(true)}
              title="Abrir Guia da Ágora"
              className="p-2 text-bg-base bg-accent-gold hover:bg-accent-gold-bright rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer font-bold text-xs"
            >
              <Compass className="w-4 h-4" />
            </button>
            <button
              onClick={() => logout()}
              title="Sair"
              className="p-2 text-text-secondary hover:text-red-400 hover:bg-bg-surface rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center/Right: Search Bar & Mentor Oráculo Button */}
        <div className="w-full md:w-auto flex items-center gap-3">
          <div className="w-full md:w-80 relative">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="w-full py-2.5 px-4 pl-10 bg-bg-surface border border-text-primary/15 hover:border-accent-gold/50 rounded-full text-left text-xs sm:text-sm text-text-secondary hover:text-text-primary transition-all flex items-center justify-between shadow-inner"
            >
              <span>Buscar mídias ou notas no acervo...</span>
              <Search className="w-4 h-4 text-accent-gold" />
            </button>
          </div>

          {/* Local guide button */}
          <button
            type="button"
            onClick={() => setIsRightChatOpen(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-accent-gold hover:bg-accent-gold-bright text-bg-base font-bold text-xs rounded-full shadow-lg shadow-accent-gold/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Compass className="w-4 h-4" />
            <span>Guia da Ágora</span>
          </button>

          <button
            onClick={() => logout()}
            title="Sair da sessão"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-text-secondary hover:text-red-400 bg-bg-surface hover:bg-bg-elevated border border-text-primary/10 rounded-full transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}
