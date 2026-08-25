import React from 'react'
import { Menu, Search, Compass, LogOut, UserRound, Cloud, CloudAlert, CloudUpload, HardDrive } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { useAuth } from '../context/AuthContext'
import { ClassicArchLogoIcon } from './ClassicArchLogo'

export const Header: React.FC = () => {
  const { setIsSearchOpen, isLeftDrawerOpen, setIsLeftDrawerOpen, setIsRightChatOpen, setActiveTab, userProfile, syncStatus, retryCloudSync, isVisitor } = useAgoraStore()
  const { logout } = useAuth()
  const syncMeta = {
    local: { label: 'Salvo neste navegador', Icon: HardDrive, color: 'text-text-secondary' },
    syncing: { label: 'Sincronizando', Icon: CloudUpload, color: 'text-accent-gold' },
    synced: { label: 'Sincronizado', Icon: Cloud, color: 'text-emerald-300' },
    error: { label: 'Falha na sincronização', Icon: CloudAlert, color: 'text-red-300' },
  }[syncStatus]
  const SyncIcon = syncMeta.Icon

  // Dynamic greeting: Moment of day, day of week, user name
  const getDynamicGreeting = () => {
    const now = new Date()
    const hour = now.getHours()

    let period = 'Boa tarde'
    if (hour >= 5 && hour < 12) period = 'Bom dia'
    else if (hour >= 18 || hour < 5) period = 'Boa noite'

    const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(now)
    const dayOfWeek = weekday.charAt(0).toUpperCase() + weekday.slice(1)
    const name = userProfile.nome?.trim() || 'Erudito'

    return `${period}, ${dayOfWeek}, ${name}.`
  }

  return (
    <header className="app-header w-full sticky top-0 z-30 py-2.5 sm:py-3.5">
      <div className="app-header-shell flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Left Side: Hamburger Drawer Button & Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            {/* Hamburger Button ☰ */}
            <button
              type="button"
              onClick={() => setIsLeftDrawerOpen(!isLeftDrawerOpen)}
              title={isLeftDrawerOpen ? 'Recolher menu lateral' : 'Abrir menu lateral'}
              aria-label={isLeftDrawerOpen ? 'Recolher menu lateral' : 'Abrir menu lateral'}
              aria-controls="menu-lateral"
              aria-expanded={isLeftDrawerOpen}
              className="grid h-11 w-11 place-items-center rounded-xl border border-text-primary/10 text-text-secondary transition-all hover:bg-bg-surface hover:text-accent-gold md:h-auto md:w-auto md:p-2"
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
              <p data-greeting className="hidden max-w-[min(42vw,260px)] truncate font-sans text-xs font-medium text-accent-gold sm:block">
                {getDynamicGreeting()}
              </p>
            </div>
            {syncStatus === 'error' && !isVisitor ? (
              <button type="button" onClick={retryCloudSync} className={`hidden xl:inline-flex items-center gap-1 text-[10px] ${syncMeta.color} hover:underline`} title="Tentar recuperar os dados da nuvem" aria-label="Tentar recuperar os dados da nuvem" aria-live="polite">
                <SyncIcon className="h-3.5 w-3.5" /> Tentar recuperar
              </button>
            ) : (
              <span className={`hidden xl:inline-flex items-center gap-1 text-[10px] ${syncMeta.color}`} title={syncMeta.label} aria-live="polite">
                <SyncIcon className="h-3.5 w-3.5" /> {syncMeta.label}
              </span>
            )}
          </div>

          {/* Right Mobile Actions */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              title="Buscar no acervo"
              aria-label="Buscar no acervo"
              className="grid h-11 w-11 place-items-center rounded-xl border border-accent-gold/30 bg-bg-surface text-accent-gold transition-colors hover:bg-bg-elevated"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsRightChatOpen(true)}
              title="Abrir Guia da Ágora"
              className="grid h-11 w-11 place-items-center rounded-xl bg-accent-gold text-bg-base shadow-md transition-all hover:bg-accent-gold-bright"
            >
              <Compass className="w-4 h-4" />
            </button>
            <button
              onClick={() => logout()}
              title="Sair"
              className="grid h-11 w-11 place-items-center rounded-xl text-text-secondary transition-colors hover:bg-bg-surface hover:text-red-400"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center/Right: Search Bar & Mentor Oráculo Button */}
        <div className="hidden w-full items-center gap-3 md:flex md:w-auto">
          <div className="relative w-full md:w-64 xl:w-80">
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
            className="hidden items-center gap-2 whitespace-nowrap rounded-full bg-accent-gold px-4 py-2 text-xs font-bold text-bg-base shadow-lg shadow-accent-gold/20 transition-all hover:bg-accent-gold-bright xl:flex"
          >
            <Compass className="w-4 h-4" />
            <span>Guia da Ágora</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            title="Personalizar perfil"
            className="hidden items-center gap-1.5 rounded-full border border-accent-gold/30 bg-bg-surface px-3 py-2 text-xs font-semibold text-accent-gold transition-all hover:bg-bg-elevated xl:flex"
          >
            <UserRound className="w-3.5 h-3.5" />
            <span>Perfil</span>
          </button>

          <button
            onClick={() => logout()}
            title="Sair da sessão"
            className="hidden items-center gap-1.5 rounded-full border border-text-primary/10 bg-bg-surface px-3 py-2 text-xs font-semibold text-text-secondary transition-all hover:bg-bg-elevated hover:text-red-400 xl:flex"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}
