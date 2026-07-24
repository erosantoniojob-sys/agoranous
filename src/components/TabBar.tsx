import React from 'react'
import { Home, Compass, Hourglass, Plus, Bookmark, User } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab, setIsSearchOpen } = useAgoraStore()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-bg-surface/95 backdrop-blur-lg border-t border-text-primary/10 py-2 px-4 shadow-2xl">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-1 relative">
        {/* 1. Início */}
        <button
          onClick={() => setActiveTab('inicio')}
          className={`flex flex-col items-center gap-0.5 transition-colors py-1 px-1.5 sm:px-3 cursor-pointer ${
            activeTab === 'inicio' ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Home className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] font-semibold tracking-wider">Início</span>
        </button>

        {/* 2. Explorar */}
        <button
          onClick={() => setActiveTab('explorar')}
          className={`flex flex-col items-center gap-0.5 transition-colors py-1 px-1.5 sm:px-3 cursor-pointer ${
            activeTab === 'explorar' ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Compass className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] font-semibold tracking-wider">Explorar</span>
        </button>

        {/* 3. Scholé */}
        <button
          onClick={() => setActiveTab('schole')}
          className={`flex flex-col items-center gap-0.5 transition-colors py-1 px-1.5 sm:px-3 cursor-pointer ${
            activeTab === 'schole' ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Hourglass className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] font-semibold tracking-wider">Scholé</span>
        </button>

        {/* 4. Central Add Button */}
        <div className="relative -top-6 flex items-center justify-center">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-14 h-13 rounded-full bg-gradient-to-b from-[#F7E7AD] via-[#D4AF37] to-[#A38222] text-bg-base shadow-[0_12px_28px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-accent-gold-bright/60 p-2.5 cursor-pointer relative overflow-hidden group"
            aria-label="Adicionar nova obra ao catálogo"
          >
            {/* Top inner golden highlight reflection */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-white/40 blur-[1px] rounded-t-full pointer-events-none" />
            <Plus className="w-7 h-7 stroke-[2.8] text-bg-base drop-shadow-md relative z-10 group-hover:rotate-90 transition-transform duration-300" />
          </button>
          <span className="absolute -bottom-4 text-[10px] font-semibold tracking-wider text-accent-gold">Adicionar</span>
        </div>

        {/* 5. Memória (Mapa do Conhecimento & Dossiê) */}
        <button
          onClick={() => setActiveTab('memoria')}
          className={`flex flex-col items-center gap-0.5 transition-colors py-1 px-1.5 sm:px-3 cursor-pointer ${
            activeTab === 'memoria' || activeTab === 'trilhas' ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Bookmark className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] font-semibold tracking-wider">Memória</span>
        </button>

        {/* 6. Perfil */}
        <button
          onClick={() => setActiveTab('perfil')}
          className={`flex flex-col items-center gap-0.5 transition-colors py-1 px-1.5 sm:px-3 cursor-pointer ${
            activeTab === 'perfil' ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <User className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] font-semibold tracking-wider">Perfil</span>
        </button>
      </div>
    </div>
  )
}
