import React from 'react'
import { Home, Compass, Hourglass, Plus, Bookmark, Map } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab, setIsSearchOpen } = useAgoraStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-text-primary/10 bg-bg-surface/95 px-3 py-2 shadow-2xl backdrop-blur-lg md:bottom-5 md:left-1/2 md:right-auto md:w-[min(720px,calc(100%-2rem))] md:-translate-x-1/2 md:rounded-2xl md:border" aria-label="Navegação principal">
      <div className="mx-auto flex w-full max-w-[680px] items-center justify-between gap-1">
        {/* 1. Início */}
        <button
          onClick={() => setActiveTab('inicio')}
          className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] transition-colors sm:text-xs ${
            activeTab === 'inicio' ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Home className="h-5 w-5 stroke-[1.8]" />
          <span className="font-semibold tracking-wide">Início</span>
        </button>

        {/* 2. Explorar */}
        <button
          onClick={() => setActiveTab('explorar')}
          className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] transition-colors sm:text-xs ${
            activeTab === 'explorar' ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Compass className="h-5 w-5 stroke-[1.8]" />
          <span className="font-semibold tracking-wide">Explorar</span>
        </button>

        {/* 3. Scholé */}
        <button
          onClick={() => setActiveTab('schole')}
          className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] transition-colors sm:text-xs ${
            activeTab === 'schole' ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Hourglass className="h-5 w-5 stroke-[1.8]" />
          <span className="font-semibold tracking-wide">Scholé</span>
        </button>

        {/* 4. Central Add Button */}
        <div className="relative -top-4 flex min-w-0 flex-1 flex-col items-center justify-center">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-accent-gold-bright/60 bg-gradient-to-b from-[#F7E7AD] via-[#D4AF37] to-[#A38222] p-2 text-bg-base shadow-[0_8px_18px_rgba(0,0,0,0.45),0_0_14px_rgba(212,175,55,0.28)] transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Adicionar nova obra ao catálogo"
          >
            {/* Top inner golden highlight reflection */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-white/40 blur-[1px] rounded-t-full pointer-events-none" />
            <Plus className="relative z-10 h-6 w-6 stroke-[2.8] text-bg-base transition-transform duration-300 group-hover:rotate-90" />
          </button>
          <span className="absolute -bottom-5 whitespace-nowrap text-[10px] font-semibold tracking-wide text-accent-gold">Adicionar</span>
        </div>

        {/* 5. Trilhas */}
        <button
          onClick={() => setActiveTab('trilhas')}
          className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] transition-colors sm:text-xs ${
            activeTab === 'trilhas' ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Map className="h-5 w-5 stroke-[1.8]" />
          <span className="font-semibold tracking-wide">Trilhas</span>
        </button>

        {/* 6. Memória */}
        <button
          onClick={() => setActiveTab('memoria')}
          className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] transition-colors sm:text-xs ${
            activeTab === 'memoria' ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Bookmark className="h-5 w-5 stroke-[1.8]" />
          <span className="font-semibold tracking-wide">Memória</span>
        </button>
      </div>
    </nav>
  )
}
