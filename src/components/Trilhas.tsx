import React, { useState } from 'react'
import {
  Brain,
  BookOpen,
  Flame,
  Globe,
  Feather,
  Compass,
  Church,
  Plus,
  Sparkles,
  Layers,
  ChevronRight,
  X,
  Check,
} from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { TrailDetailModal } from './TrailDetailModal'

export interface TrilhaData {
  id: string
  titulo: string
  conteudosCount: number
  notasCount: number
  progressoPercentual: number
  categoria: string
  icon: React.ElementType
  colorTheme: 'blue' | 'green' | 'purple' | 'orange'
  descricao?: string
}

export const Trilhas: React.FC = () => {
  const { customTrails, mediaItems, aprendizados, addCustomTrail } = useAgoraStore()
  const [activeTab, setActiveTab] = useState<'minhas' | 'descobrir'>('minhas')
  const [selectedTrailId, setSelectedTrailId] = useState<string | null>(null)
  const [isCreatingTrail, setIsCreatingTrail] = useState(false)

  // New Trail Form state
  const [trailName, setTrailName] = useState('')
  const [trailDesc, setTrailDesc] = useState('')
  const [trailCat, setTrailCat] = useState('Filosofia & Cosmovisão')
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([])

  const handleCreateTrail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trailName.trim()) return

    addCustomTrail(
      trailName.trim(),
      trailDesc.trim(),
      selectedMediaIds,
      trailCat
    )

    setTrailName('')
    setTrailDesc('')
    setSelectedMediaIds([])
    setIsCreatingTrail(false)
  }

  // Convert customTrails from store into TrilhaData format with EXACT real counts!
  const minhasTrilhasList: TrilhaData[] = customTrails.map((trail, index) => {
    const colorThemes: ('blue' | 'green' | 'purple' | 'orange')[] = ['blue', 'green', 'purple', 'orange']
    const icons = [Brain, BookOpen, Flame, Globe]
    const theme = colorThemes[index % 4]
    const icon = icons[index % 4]

    // Calculate exact count of media and exact notes
    const mediaCount = trail.mediaIds.length
    const notesCount = aprendizados.filter((a) => trail.mediaIds.includes(a.mediaId)).length

    return {
      id: trail.id,
      titulo: trail.nome,
      conteudosCount: mediaCount,
      notasCount: notesCount,
      progressoPercentual: trail.progresso_percentual || 0,
      categoria: trail.categoria || 'Geral',
      icon: icon,
      colorTheme: theme,
      descricao: trail.descricao,
    }
  })

  // Discover template options that user can copy or start
  const descobrirTrilhasList: TrilhaData[] = [
    {
      id: 'desc_russa',
      titulo: 'Literatura Russa e Existência',
      conteudosCount: 0,
      notasCount: 0,
      progressoPercentual: 0,
      categoria: 'Literatura',
      icon: Feather,
      colorTheme: 'blue',
      descricao: 'Dostoiévski, Tolstói e Turguênev sob a perspective do amor ativo e redenção.',
    },
    {
      id: 'desc_cosmovisao',
      titulo: 'Cosmovisão e Cultura Contemporânea',
      conteudosCount: 0,
      notasCount: 0,
      progressoPercentual: 0,
      categoria: 'Teologia',
      icon: Compass,
      colorTheme: 'orange',
      descricao: 'Análise das 6 funções da cosmovisão e diagnóstico das correntes modernas.',
    },
    {
      id: 'desc_patristica',
      titulo: 'Patrística e Filosofia Antiga',
      conteudosCount: 0,
      notasCount: 0,
      progressoPercentual: 0,
      categoria: 'Filosofia',
      icon: Church,
      colorTheme: 'green',
      descricao: 'Dos Padres Apologistas à Cidade de Deus de Santo Agostinho.',
    },
    {
      id: 'desc_estetica',
      titulo: 'Estética e Filosofia da Arte',
      conteudosCount: 0,
      notasCount: 0,
      progressoPercentual: 0,
      categoria: 'Estética',
      icon: Sparkles,
      colorTheme: 'purple',
      descricao: 'O Belo, a contemplação e a transcendência na literatura e na música.',
    },
  ]

  const handleStartDiscoverTrail = (template: TrilhaData) => {
    addCustomTrail(template.titulo, template.descricao || '', [], template.categoria)
    setActiveTab('minhas')
  }

  // Helper for low-saturation Dark Academia color theme styling
  const getColorThemeStyles = (colorTheme: 'blue' | 'green' | 'purple' | 'orange') => {
    switch (colorTheme) {
      case 'blue':
        return {
          bgGradient: 'bg-gradient-to-br from-[#1A324B] to-[#111F30]',
          border: 'border-[#3B82F6]/25 group-hover:border-[#60A5FA]/50',
          iconColor: 'text-[#93C5FD]',
          accentGlow: 'shadow-[#1E3A5F]/40',
        }
      case 'green':
        return {
          bgGradient: 'bg-gradient-to-br from-[#1E3A2B] to-[#11221B]',
          border: 'border-[#22C55E]/25 group-hover:border-[#4ADE80]/50',
          iconColor: 'text-[#86EFAC]',
          accentGlow: 'shadow-[#1E3E2B]/40',
        }
      case 'purple':
        return {
          bgGradient: 'bg-gradient-to-br from-[#2F2042] to-[#1D1428]',
          border: 'border-[#A855F7]/25 group-hover:border-[#C084FC]/50',
          iconColor: 'text-[#E9D5FF]',
          accentGlow: 'shadow-[#301D47]/40',
        }
      case 'orange':
        return {
          bgGradient: 'bg-gradient-to-br from-[#3F281E] to-[#271710]',
          border: 'border-[#F97316]/25 group-hover:border-[#FB923C]/50',
          iconColor: 'text-[#FDBA74]',
          accentGlow: 'shadow-[#422216]/40',
        }
      default:
        return {
          bgGradient: 'bg-gradient-to-br from-[#1A324B] to-[#111F30]',
          border: 'border-[#3B82F6]/25 group-hover:border-[#60A5FA]/50',
          iconColor: 'text-[#93C5FD]',
          accentGlow: 'shadow-[#1E3A5F]/40',
        }
    }
  }

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Header Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-text-primary/10">
        <div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-text-primary tracking-wide">
            Trilhas de Aprendizado
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary font-sans font-light mt-0.5">
            Jornadas estruturadas de conhecimento, leituras e reflexões temáticas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bg-surface border border-accent-gold/30 text-accent-gold text-xs font-medium">
            <Layers className="w-4 h-4 text-accent-gold" />
            <span>{minhasTrilhasList.length} trilhas ativas</span>
          </div>

          <button
            onClick={() => setIsCreatingTrail(!isCreatingTrail)}
            className="py-1.5 px-3.5 bg-accent-gold hover:bg-accent-gold-bright text-bg-base font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Trilha</span>
          </button>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="border-b border-text-primary/15 flex items-center gap-8 pt-1">
        <button
          type="button"
          onClick={() => setActiveTab('minhas')}
          className={`pb-3 text-sm sm:text-base font-sans transition-all relative cursor-pointer ${
            activeTab === 'minhas'
              ? 'text-accent-gold font-semibold'
              : 'text-text-secondary hover:text-text-primary font-normal'
          }`}
        >
          Minhas trilhas ({minhasTrilhasList.length})
          {activeTab === 'minhas' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-gold rounded-full shadow-md shadow-accent-gold/50" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('descobrir')}
          className={`pb-3 text-sm sm:text-base font-sans transition-all relative cursor-pointer ${
            activeTab === 'descobrir'
              ? 'text-accent-gold font-semibold'
              : 'text-text-secondary hover:text-text-primary font-normal'
          }`}
        >
          Descobrir Modelos
          {activeTab === 'descobrir' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-gold rounded-full shadow-md shadow-accent-gold/50" />
          )}
        </button>
      </div>

      {/* Inline Create Trail Form */}
      {isCreatingTrail && (
        <form onSubmit={handleCreateTrail} className="p-6 bg-bg-surface border border-accent-gold/40 rounded-2xl space-y-4 shadow-3d-deep animate-fadeIn">
          <div className="flex items-center justify-between border-b border-text-primary/10 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-gold">
              Criar Nova Trilha Personalizada
            </span>
            <button type="button" onClick={() => setIsCreatingTrail(false)} className="text-text-secondary hover:text-text-primary">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                Nome da Trilha
              </label>
              <input
                type="text"
                required
                value={trailName}
                onChange={(e) => setTrailName(e.target.value)}
                placeholder="Ex: Teologia Reformada & Existencialismo"
                className="w-full p-2.5 bg-bg-base text-text-primary rounded-xl border border-text-primary/15 focus:border-accent-gold focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                Descrição Curta
              </label>
              <input
                type="text"
                value={trailDesc}
                onChange={(e) => setTrailDesc(e.target.value)}
                placeholder="Ex: Análise da graça, liberdade e cosmovisão teológica."
                className="w-full p-2.5 bg-bg-base text-text-primary rounded-xl border border-text-primary/15 focus:border-accent-gold focus:outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-2">
              Vincular Mídias do Acervo
            </label>
            {mediaItems.length === 0 ? (
              <p className="text-xs text-text-secondary italic p-3 bg-bg-base rounded-xl border border-text-primary/10">
                Nenhuma obra cadastrada ainda no acervo.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-bg-base rounded-xl border border-text-primary/10">
                {mediaItems.map((m) => {
                  const isSel = selectedMediaIds.includes(m.id)
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        if (isSel) {
                          setSelectedMediaIds(selectedMediaIds.filter((id) => id !== m.id))
                        } else {
                          setSelectedMediaIds([...selectedMediaIds, m.id])
                        }
                      }}
                      className={`p-2 rounded-lg text-left text-xs font-medium border flex items-center justify-between transition-colors ${
                        isSel
                          ? 'bg-accent-gold/20 text-accent-gold border-accent-gold'
                          : 'bg-bg-surface text-text-primary border-text-primary/10 hover:border-accent-gold/30'
                      }`}
                    >
                      <span className="truncate">{m.titulo} ({m.tipo})</span>
                      {isSel && <Check className="w-3.5 h-3.5 text-accent-gold flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={!trailName.trim()}
              className="py-2 px-5 bg-accent-gold text-bg-base font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer shadow-md"
            >
              Salvar Trilha
            </button>
          </div>
        </form>
      )}

      {/* Block List Cards Grid */}
      {activeTab === 'minhas' && minhasTrilhasList.length === 0 ? (
        <div className="p-12 text-center bg-bg-surface border border-white/5 rounded-2xl space-y-4 shadow-3d-card">
          <Layers className="w-10 h-10 text-accent-gold mx-auto" />
          <h3 className="font-serif font-bold text-lg text-text-primary">
            Nenhuma trilha criada ainda
          </h3>
          <p className="text-xs text-text-secondary max-w-md mx-auto">
            Suas trilhas estão limpas. Clique no botão (+ Nova Trilha) acima para criar sua primeira jornada de conhecimento.
          </p>
          <button
            onClick={() => setIsCreatingTrail(true)}
            className="py-2.5 px-5 bg-accent-gold text-bg-base font-bold text-xs rounded-xl uppercase tracking-wider shadow-md cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Primeira Trilha</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {(activeTab === 'minhas' ? minhasTrilhasList : descobrirTrilhasList).map((trail) => {
            const IconComponent = trail.icon
            const themeStyle = getColorThemeStyles(trail.colorTheme)

            return (
              <div
                key={trail.id}
                onClick={() => {
                  if (activeTab === 'minhas') {
                    setSelectedTrailId(trail.id)
                  } else {
                    handleStartDiscoverTrail(trail)
                  }
                }}
                className="w-full bg-bg-surface border border-white/5 rounded-2xl p-4 hover:border-accent-gold/50 transition-all shadow-3d-card hover:shadow-3d-gold flex items-center gap-4 group relative overflow-hidden cursor-pointer"
              >
                {/* Subtle background glow effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-full blur-2xl pointer-events-none group-hover:bg-accent-gold/10 transition-all" />

                {/* Icon Block */}
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex-shrink-0 flex items-center justify-center relative overflow-hidden border ${themeStyle.border} ${themeStyle.bgGradient} shadow-inner ${themeStyle.accentGlow}`}
                >
                  <div className="absolute inset-0 bg-white/5 opacity-40 pointer-events-none" />
                  <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 ${themeStyle.iconColor} stroke-[1.75] relative z-10 drop-shadow-md`} />
                </div>

                {/* Main Content Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-sans font-medium text-base sm:text-lg text-text-primary group-hover:text-accent-gold transition-colors truncate">
                      {trail.titulo}
                    </h3>

                    <span className="font-serif font-bold text-xl sm:text-2xl text-accent-gold flex-shrink-0">
                      {trail.progressoPercentual}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="font-sans font-regular text-xs sm:text-sm text-text-secondary truncate">
                      {trail.conteudosCount} conteúdos • {trail.notasCount} notas
                    </p>

                    {trail.descricao && (
                      <span className="hidden md:inline-block text-[11px] font-sans font-light text-text-secondary/70 truncate max-w-xs">
                        {trail.descricao}
                      </span>
                    )}
                  </div>

                  <div className="w-full bg-bg-base/80 h-1 sm:h-1.5 rounded-full overflow-hidden border border-text-primary/10 mt-1">
                    <div
                      className="bg-accent-gold h-full rounded-full transition-all duration-500 shadow-sm shadow-accent-gold/40"
                      style={{ width: `${trail.progressoPercentual}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Internal Trail Detail Modal */}
      <TrailDetailModal
        trailId={selectedTrailId}
        onClose={() => setSelectedTrailId(null)}
      />
    </div>
  )
}

export default Trilhas
