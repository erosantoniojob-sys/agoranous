import React, { lazy, Suspense, useMemo, useState } from 'react'
import {
  Sparkles,
  BookOpen,
  Film,
  Tv,
  Gamepad2,
  Play,
  Flame,
  Plus,
  ArrowUpRight,
  Network,
  X,
  Check,
  ChevronRight,
} from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { NetflixMediaCard } from '../components/NetflixMediaCard'
import { TrailSelectionModal } from '../components/TrailSelectionModal'
import { AgoraOrrery } from '../components/AgoraOrrery'
import dawnLandscape from '../assets/agora-dawn-landscape.jpg'

const DailyQuoteCard = lazy(() => import('../components/DailyQuoteCard').then((module) => ({ default: module.DailyQuoteCard })))
const RecommendationsSection = lazy(() => import('../components/RecommendationsSection').then((module) => ({ default: module.RecommendationsSection })))

export const DashboardView: React.FC = () => {
  const {
    mediaItems,
    selectedFilter,
    setSelectedFilter,
    setSelectedMedia,
    getEstatisticas,
    setActiveTab,
    setIsSearchOpen,
    customCategories,
    addCategory,
    customTrails,
    userProfile,
  } = useAgoraStore()

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [isTrailModalOpen, setIsTrailModalOpen] = useState(false)

  const baseCategories = [
    { label: 'Filmes', icon: Film, type: 'Filme' },
    { label: 'Séries', icon: Tv, type: 'Série' },
    { label: 'Livros', icon: BookOpen, type: 'Livro' },
    { label: 'Jogos', icon: Gamepad2, type: 'Jogo' },
  ]

  const stats = useMemo(() => getEstatisticas(), [getEstatisticas])

  const filteredMediaItems = useMemo(() => {
    return mediaItems.filter((item) => {
      if (selectedFilter === 'Todos') return true
      if (selectedFilter === 'Livros') return item.tipo === 'Livro'
      if (selectedFilter === 'Filmes') return item.tipo === 'Filme'
      if (selectedFilter === 'Séries') return item.tipo === 'Série'
      if (selectedFilter === 'Jogos') return item.tipo === 'Jogo'
      return item.generos?.includes(selectedFilter) || item.tipo === selectedFilter
    })
  }, [mediaItems, selectedFilter])

  const activeItems = useMemo(
    () => mediaItems.filter((item) => ['Lendo', 'Assistindo', 'Jogando'].includes(item.status)).length,
    [mediaItems],
  )

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    addCategory(newCatName.trim())
    setSelectedFilter(newCatName.trim())
    setNewCatName('')
    setIsAddCategoryOpen(false)
  }

  return (
    <div className="space-y-8 pb-12 font-sans animate-fadeIn">
      <section data-depth-surface="hero" className="journey-hero overflow-hidden rounded-3xl px-5 py-6 sm:px-8 sm:py-8">
        <AgoraOrrery />
        <span className="depth-glare" aria-hidden="true" />
        <div className="journey-hero__content relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-accent-gold">
              <Sparkles className="h-3.5 w-3.5" /> O fio da sua jornada
            </p>
            <h2 className="font-serif text-3xl font-bold leading-tight text-text-primary sm:text-4xl">
              {userProfile.nome ? `Bem-vindo de volta, ${userProfile.nome}.` : 'Seu acervo começa aqui.'}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-text-secondary">
              Cada obra guardada é uma ideia à espera de se conectar à próxima.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="journey-stat">
              <strong>{stats.totalItens}</strong>
              <span>obras</span>
            </div>
            <div className="journey-stat">
              <strong>{activeItems}</strong>
              <span>em curso</span>
            </div>
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent-gold px-3.5 py-3 text-xs font-bold text-bg-base shadow-lg shadow-accent-gold/15 transition-transform hover:-translate-y-0.5 hover:bg-accent-gold-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
            >
              Adicionar <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 1. CITAÇÃO DIÁRIA */}
      <Suspense fallback={<div className="rounded-2xl border border-accent-gold/20 bg-bg-surface/80 p-4 text-sm text-text-secondary">Carregando abertura…</div>}>
        <DailyQuoteCard />
      </Suspense>

      {/* 2. TRILHAS EM ANDAMENTO (MOVIDO PARA CIMA) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-text-primary flex items-center gap-2">
            <Network className="w-4.5 h-4.5 text-accent-gold" />
            Trilhas em Andamento
          </h3>

          <button
            onClick={() => setIsTrailModalOpen(true)}
            className="py-1.5 px-3 bg-accent-gold/15 hover:bg-accent-gold/25 text-accent-gold border border-accent-gold/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Escolher ou Criar Trilha</span>
          </button>
        </div>

        {customTrails.length === 0 ? (
          <div
            data-depth-surface="feature"
            onClick={() => setIsTrailModalOpen(true)}
            className="trail-landscape relative overflow-hidden p-5 border border-accent-gold/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-3d-card hover:shadow-3d-gold transition-all cursor-pointer group"
            style={{ backgroundImage: `url(${dawnLandscape})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-bg-surface via-bg-surface/85 to-bg-base/10" />
            <div className="relative z-10 space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent-gold">
                Inicie sua Primeira Trilha
              </span>
              <h4 className="font-serif font-bold text-base sm:text-lg text-text-primary group-hover:text-accent-gold transition-colors">
                Nenhuma trilha temática configurada no momento
              </h4>
              <p className="text-xs text-text-secondary">
                Clique aqui para escolher ou criar uma nova jornada de estudos.
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsTrailModalOpen(true)
              }}
              className="relative z-10 py-2 px-4 bg-accent-gold text-bg-base font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>+ Criar Trilha</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {customTrails.slice(0, 2).map((trail) => (
              <div
                key={trail.id}
                data-depth-surface="feature"
                onClick={() => setActiveTab('trilhas')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setActiveTab('trilhas')
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Abrir trilha ${trail.nome}, ${trail.progresso_percentual || 0}% concluída, ${trail.mediaIds.length} conteúdos`}
                className="p-4 bg-gradient-to-r from-bg-surface via-[#182838] to-bg-surface border border-white/5 hover:border-accent-gold/50 rounded-2xl space-y-2 shadow-3d-card hover:shadow-3d-gold transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent-gold px-2 py-0.5 rounded bg-accent-gold/10 border border-accent-gold/20">
                    {trail.categoria || 'Trilha'}
                  </span>
                  <span className="font-serif font-bold text-lg text-accent-gold">
                    {trail.progresso_percentual || 0}%
                  </span>
                </div>

                <h4 className="font-serif font-bold text-base text-text-primary group-hover:text-accent-gold transition-colors truncate">
                  {trail.nome}
                </h4>

                <p className="text-xs text-text-secondary line-clamp-1">
                  {trail.descricao || 'Sem descrição'} • {trail.mediaIds.length} conteúdos
                </p>

                <div className="w-full bg-bg-base h-1.5 rounded-full overflow-hidden border border-text-primary/10 mt-2">
                  <div
                    className="bg-accent-gold h-full rounded-full transition-all duration-500"
                    style={{ width: `${trail.progresso_percentual || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. CATEGORIAS DO ACERVO */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-accent-gold" />
            Categorias do Acervo
          </h3>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="rounded-lg bg-accent-gold px-3 py-1.5 text-xs font-bold text-bg-base shadow-sm transition-colors hover:bg-accent-gold-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
            >
              <span className="flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Adicionar obra
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddCategoryOpen(!isAddCategoryOpen)}
              className="text-xs font-semibold text-accent-gold hover:underline"
            >
              Nova Categoria
            </button>
          </div>
        </div>

        {/* Modal/Inline Add Category Box */}
        {isAddCategoryOpen && (
          <form onSubmit={handleCreateCategory} className="p-4 bg-bg-surface border border-accent-gold/40 rounded-xl space-y-3 shadow-3d-card animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-accent-gold">Criar Categoria Personalizada</span>
              <button type="button" onClick={() => setIsAddCategoryOpen(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Ex: Teologia, Perfumaria, Filosofia Política..."
                className="flex-1 px-3 py-2 bg-bg-base text-text-primary placeholder:text-text-secondary/50 rounded-lg border border-text-primary/15 focus:border-accent-gold focus:outline-none text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-accent-gold text-bg-base font-bold text-xs rounded-lg uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                Criar
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setSelectedFilter('Todos')}
            className={`p-3.5 bg-bg-surface hover:bg-bg-elevated border rounded-xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer shadow-3d-card group ${
              selectedFilter === 'Todos' ? 'border-accent-gold bg-bg-elevated/90 shadow-3d-gold' : 'border-white/5 hover:border-accent-gold/40'
            }`}
          >
            <div className="p-2 rounded-lg bg-bg-base text-accent-gold border border-accent-gold/20 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-bold text-xs text-text-primary block group-hover:text-accent-gold transition-colors">
                Todos
              </span>
              <span className="text-[10px] text-text-secondary">
                {stats.totalItens} itens
              </span>
            </div>
          </button>

          {baseCategories.map((cat) => {
            const IconComp = cat.icon
            const count = mediaItems.filter((i) => i.tipo === cat.type).length
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedFilter(cat.label)}
                className={`p-3.5 bg-bg-surface hover:bg-bg-elevated border rounded-xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer shadow-3d-card group ${
                  selectedFilter === cat.label ? 'border-accent-gold bg-bg-elevated/90 shadow-3d-gold' : 'border-white/5 hover:border-accent-gold/40'
                }`}
              >
                <div className="p-2 rounded-lg bg-bg-base text-accent-gold border border-accent-gold/20 group-hover:scale-110 transition-transform">
                  <IconComp className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-serif font-bold text-xs text-text-primary block group-hover:text-accent-gold transition-colors">
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    {count} {count === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              </button>
            )
          })}

          {/* Custom Categories */}
          {customCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.label)}
              className={`p-3.5 bg-bg-surface hover:bg-bg-elevated border rounded-xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer shadow-3d-card group ${
                selectedFilter === cat.label ? 'border-accent-gold bg-bg-elevated/90 shadow-3d-gold' : 'border-white/5 hover:border-accent-gold/40'
              }`}
            >
              <div className="p-2 rounded-lg bg-bg-base text-accent-gold border border-accent-gold/20 group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif font-bold text-xs text-text-primary block group-hover:text-accent-gold transition-colors truncate max-w-[80px]">
                  {cat.label}
                </span>
                <span className="text-[10px] text-text-secondary">Personalizada</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. CATÁLOGO DE MÍDIAS */}
      <section className="content-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-xl text-text-primary">
              Catálogo do Acervo
            </h3>
            <p className="text-xs text-text-secondary">
              Exibindo {filteredMediaItems.length} {filteredMediaItems.length === 1 ? 'obra' : 'obras'} • Role para o lado
            </p>
          </div>
        </div>

        {filteredMediaItems.length === 0 ? (
          <div className="p-12 text-center bg-bg-surface border border-white/5 rounded-2xl space-y-3 shadow-3d-card">
            <span className="text-3xl text-accent-gold block font-serif">✦</span>
            <h4 className="font-serif font-bold text-lg text-text-primary">Nenhuma mídia cadastrada</h4>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Seu acervo está pronto para a primeira descoberta.
            </p>
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="mx-auto inline-flex items-center gap-1.5 rounded-xl border border-accent-gold/40 bg-accent-gold/10 px-4 py-2 text-xs font-bold text-accent-gold transition-colors hover:bg-accent-gold hover:text-bg-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
            >
              <Sparkles className="h-3.5 w-3.5" /> Encontrar uma obra
            </button>
          </div>
        ) : (
          <div className="-mx-4 flex overflow-x-auto snap-x space-x-4 px-4 pb-4 pt-5 scrollbar-thin scrollbar-thumb-accent-gold/40 scrollbar-track-bg-base">
            {filteredMediaItems.map((item) => (
              <NetflixMediaCard
                key={item.id}
                item={item}
                onClick={() => setSelectedMedia(item)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. RECOMENDAÇÕES DO PERFIL */}
      {selectedFilter === 'Todos' && (
        <section className="content-auto pt-6 border-t border-text-primary/10">
          <Suspense fallback={<div className="rounded-2xl border border-text-primary/10 bg-bg-surface/70 p-4 text-sm text-text-secondary">Consultando recomendações…</div>}>
            <RecommendationsSection />
          </Suspense>
        </section>
      )}

      {/* Fast Modal for Choose or Create Trail */}
      <TrailSelectionModal
        isOpen={isTrailModalOpen}
        onClose={() => setIsTrailModalOpen(false)}
      />
    </div>
  )
}
