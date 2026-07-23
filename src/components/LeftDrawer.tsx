import React from 'react'
import { X, Calendar, PenTool, Music, Sliders, Database, Sparkles, CheckSquare, Layers } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'

export const LeftDrawer: React.FC = () => {
  const { isLeftDrawerOpen, setIsLeftDrawerOpen, userProfile } = useAgoraStore()

  if (!isLeftDrawerOpen) return null

  const handleBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem('agora_media_items_v3') || '{}')
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `agora_second_brain_backup_${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={() => setIsLeftDrawerOpen(false)}
        className="fixed inset-0 bg-bg-base/80 backdrop-blur-sm animate-fadeIn"
      />

      {/* Left Drawer Panel */}
      <div className="relative w-80 max-w-[85vw] bg-bg-surface border-r border-text-primary/15 h-full z-10 p-6 flex flex-col justify-between shadow-2xl animate-slideRight">
        <div className="space-y-6">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-text-primary/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-bg-elevated border border-accent-gold/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-gold" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-text-primary">
                  Estilo de Vida
                </h2>
                <p className="text-[10px] text-accent-gold uppercase tracking-widest">
                  Segundo Cérebro
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsLeftDrawerOpen(false)}
              className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-elevated transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Persona Quick Info */}
          <div className="p-3 bg-bg-elevated/60 rounded-xl border border-text-primary/10 flex items-center gap-3">
            {userProfile.avatar_url ? (
              <img
                src={userProfile.avatar_url}
                alt={userProfile.nome || 'Convidado'}
                className="w-10 h-10 rounded-full object-cover border border-accent-gold/40"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-bg-base border border-accent-gold/40 flex items-center justify-center text-accent-gold font-serif font-bold text-sm">
                {(userProfile.nome || 'C').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-serif font-bold text-sm text-text-primary truncate">
                {userProfile.nome || 'Convidado'}
              </h3>
              <p className="text-[11px] text-text-secondary truncate">
                {userProfile.biografia || 'Sem biografia informada'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-2">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block px-2 mb-2">
              Seções de Estilo de Vida
            </span>

            <button
              onClick={() => {
                alert('Módulo Rotina & Hábitos: 100% integrado ao perfil.')
                setIsLeftDrawerOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-text-primary hover:text-accent-gold hover:bg-bg-elevated/80 rounded-xl transition-all"
            >
              <CheckSquare className="w-4 h-4 text-accent-gold" />
              <span>Rotina & Hábitos (Dieta & Treino)</span>
            </button>

            <button
              onClick={() => {
                alert('Módulo Escrita Criativa & Roteiros ativado no Segundo Cérebro.')
                setIsLeftDrawerOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-text-primary hover:text-accent-gold hover:bg-bg-elevated/80 rounded-xl transition-all"
            >
              <PenTool className="w-4 h-4 text-accent-gold" />
              <span>Escrita Criativa & Roteiros</span>
            </button>

            <button
              onClick={() => {
                alert('Módulo Projetos Musicais sincronizado.')
                setIsLeftDrawerOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-text-primary hover:text-accent-gold hover:bg-bg-elevated/80 rounded-xl transition-all"
            >
              <Music className="w-4 h-4 text-accent-gold" />
              <span>Projetos Musicais</span>
            </button>
          </nav>

          {/* System Settings & Backup */}
          <div className="space-y-1 pt-4 border-t border-text-primary/10">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block px-2 mb-2">
              Configurações & Dados
            </span>

            <button
              onClick={() => {
                alert('Configurações da Interface Ágora: Modo Dark Academia Ativo.')
                setIsLeftDrawerOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50 rounded-xl transition-all"
            >
              <Sliders className="w-4 h-4 text-accent-gold" />
              <span>Ajustes de Interface</span>
            </button>

            <button
              onClick={handleBackup}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50 rounded-xl transition-all"
            >
              <Database className="w-4 h-4 text-accent-gold" />
              <span>Exportar Backup do Acervo (JSON)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-text-primary/10 text-center space-y-1">
          <p className="font-serif font-bold text-xs text-text-primary">
            Àgora v3.0
          </p>
          <p className="font-sans font-light text-[11px] text-text-secondary">
            Tudo o que você assiste, lê e aprende, em um só lugar.
          </p>
        </div>
      </div>
    </div>
  )
}
