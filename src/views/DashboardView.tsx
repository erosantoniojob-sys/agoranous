import React, { lazy, Suspense, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Clock3,
  Compass,
  Film,
  Flame,
  Gamepad2,
  GraduationCap,
  Headphones,
  LibraryBig,
  Map as MapIcon,
  PenLine,
  Plus,
  Smartphone,
  Sparkles,
  Tv,
  X,
} from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { CoverImage } from '../components/CoverImage'
import { DailyMissions } from '../components/DailyMissions'
import { JourneyCampaign } from '../components/JourneyCampaign'
import { KnowledgeOrbit, type KnowledgeRealm } from '../components/KnowledgeOrbit'
import { LevelProgress } from '../components/LevelProgress'
import { TrailSelectionModal } from '../components/TrailSelectionModal'
import { calculateJourneyXp, getLevelProgress, getStreak } from '../lib/journeyProgress'
import {
  genreFilter,
  KNOWLEDGE_REALM_DEFINITIONS,
  knowledgeRealmFilter,
  MEDIA_FORMAT_DEFINITIONS,
  mediaMatchesRealm,
  mediaTypeFilter,
} from '../lib/knowledgeRealms'
import type { MediaType } from '../types/agora'

const DailyQuoteCard = lazy(() => import('../components/DailyQuoteCard').then((module) => ({ default: module.DailyQuoteCard })))

const CATEGORY_ICONS: Record<MediaType, React.ElementType> = {
  Livro: BookOpen,
  Filme: Film,
  Série: Tv,
  Jogo: Gamepad2,
  App: Smartphone,
  Podcast: Headphones,
  Curso: GraduationCap,
}

const greetingForHour = (hour: number) => {
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

const getMediaTypeLabel = (type: string) => ({
  Livro: 'Leitura em curso',
  Filme: 'Filme em curso',
  Série: 'Série em curso',
  Jogo: 'Jogo em curso',
  App: 'Aplicativo em curso',
  Podcast: 'Podcast em curso',
  Curso: 'Curso em curso',
}[type] || 'Em curso')

const formatEventDate = (createdAt: string) => {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return 'data indisponível'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date)
}

export const DashboardView: React.FC = () => {
  const {
    aprendizados,
    completeDailyMission,
    customCategories,
    customTrails,
    getEstatisticas,
    journey,
    mediaItems,
    setActiveTab,
    setIsSearchOpen,
    setSelectedFilter,
    setSelectedMedia,
    userProfile,
  } = useAgoraStore()
  const [isTrailModalOpen, setIsTrailModalOpen] = useState(false)
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false)

  const stats = useMemo(() => getEstatisticas(), [getEstatisticas])
  const totalXp = useMemo(() => calculateJourneyXp(journey.events), [journey.events])
  const levelProgress = useMemo(() => getLevelProgress(totalXp), [totalXp])
  const streak = useMemo(() => getStreak(journey.events), [journey.events])
  const mediaById = useMemo(() => new Map(mediaItems.map((item) => [item.id, item])), [mediaItems])

  const currentMedia = useMemo(() => {
    const active = mediaItems.filter((item) => ['Lendo', 'Assistindo', 'Jogando'].includes(item.status))
    return [...active].sort((first, second) => (second.progresso_percentual || 0) - (first.progresso_percentual || 0))[0] || null
  }, [mediaItems])

  const currentTrail = useMemo(
    () => [...customTrails].sort((first, second) => (second.progresso_percentual || 0) - (first.progresso_percentual || 0))[0] || null,
    [customTrails],
  )

  const realms = useMemo<KnowledgeRealm[]>(() => {
    return KNOWLEDGE_REALM_DEFINITIONS.map((realm) => {
      const items = mediaItems.filter((item) => mediaMatchesRealm(item, realm))
      const progress = items.length
        ? Math.round(items.reduce((sum, item) => sum + (item.status === 'Concluído' ? 100 : item.progresso_percentual || 0), 0) / items.length)
        : 0
      return {
        id: realm.id,
        name: realm.name,
        accent: realm.accent,
        progress,
        level: items.length ? Math.min(9, Math.max(1, Math.ceil((progress || 1) / (100 / 9)))) : 0,
        itemCount: items.length,
      }
    })
  }, [mediaItems])
  const activeRealms = realms.filter((realm) => (realm.itemCount || 0) > 0)

  const openExplore = (filter = 'Todos') => {
    setSelectedFilter(filter)
    setActiveTab('explorar')
  }

  const handleRealmSelect = (realm: KnowledgeRealm) => {
    openExplore(realm.id ? knowledgeRealmFilter(realm.id) : realm.name)
  }

  const greetingName = userProfile.nome?.trim() ? `, ${userProfile.nome.trim().split(' ')[0]}` : ''
  const greeting = `${greetingForHour(new Date().getHours())}${greetingName}.`
  const activeItems = mediaItems.filter((item) => ['Lendo', 'Assistindo', 'Jogando'].includes(item.status)).length
  const recentEvents = journey.events.slice(0, 3)

  return (
    <div className="journey-home animate-fadeIn">
      <section className="universe-hero" aria-labelledby="journey-home-title">
        <div className="universe-hero__copy">
          <p className="journey-eyebrow"><Sparkles className="h-3.5 w-3.5" /> Seu universo intelectual</p>
          <h1 id="journey-home-title">{greeting}</h1>
          <p className="universe-hero__subtitle">Você não está apenas consumindo conteúdo. Está construindo repertório, conexões e critérios para pensar melhor.</p>

          <LevelProgress {...levelProgress} />

          <div className="journey-signals" aria-label="Resumo da sua jornada">
            <span><Sparkles className="h-3.5 w-3.5" /> {totalXp.toLocaleString('pt-BR')} XP</span>
            <span><Flame className="h-3.5 w-3.5" /> {streak.current} {streak.current === 1 ? 'dia em sequência' : 'dias em sequência'}</span>
            <span><PenLine className="h-3.5 w-3.5" /> {aprendizados.length} {aprendizados.length === 1 ? 'nota' : 'notas'}</span>
          </div>

          <div className="journey-create">
            <button
              type="button"
              className="journey-create__trigger"
              aria-expanded={isCreateMenuOpen}
              aria-controls="journey-create-menu"
              onClick={() => setIsCreateMenuOpen((open) => !open)}
            >
              <Plus className="h-4 w-4" /> Criar
            </button>
            {isCreateMenuOpen ? (
              <div id="journey-create-menu" className="journey-create__menu" role="menu">
                <button type="button" role="menuitem" onClick={() => { setIsSearchOpen(true); setIsCreateMenuOpen(false) }}><LibraryBig className="h-4 w-4" /> Adicionar obra</button>
                <button type="button" role="menuitem" onClick={() => { setActiveTab('memoria'); setIsCreateMenuOpen(false) }}><PenLine className="h-4 w-4" /> Registrar nota</button>
                <button type="button" role="menuitem" onClick={() => { setIsTrailModalOpen(true); setIsCreateMenuOpen(false) }}><Compass className="h-4 w-4" /> Criar trilha</button>
                <button type="button" role="menuitem" onClick={() => { setActiveTab('studium'); setIsCreateMenuOpen(false) }}><Clock3 className="h-4 w-4" /> Abrir Studium</button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="universe-hero__orbit">
          <KnowledgeOrbit
            realms={activeRealms}
            heading="Mapa do conhecimento"
            description="Os domínios ganham massa conforme as obras do seu acervo avançam."
            onRealmSelect={handleRealmSelect}
          />
        </div>
      </section>

      <DailyMissions completedMissionKeys={journey.completedMissionKeys} onComplete={completeDailyMission} />

      <div className="journey-home__middle-grid">
        <JourneyCampaign
          trail={currentTrail}
          mediaById={mediaById}
          onOpen={() => setActiveTab('trilhas')}
          onCreate={() => setIsTrailModalOpen(true)}
        />

        <section className="journey-panel journey-continue" aria-labelledby="continue-title">
          <div className="journey-section-heading">
            <div><p>Ritmo de agora</p><h2 id="continue-title">Continue de onde parou</h2></div>
            {currentMedia ? <button type="button" onClick={() => setSelectedMedia(currentMedia)} className="journey-link">Abrir <ArrowUpRight className="h-3.5 w-3.5" /></button> : null}
          </div>
          {currentMedia ? (
            <button type="button" className="journey-continue__card" onClick={() => setSelectedMedia(currentMedia)}>
              <CoverImage url={currentMedia.url_capa || currentMedia.capa_oficial} title={currentMedia.titulo} tipo={currentMedia.tipo} className="journey-continue__cover" />
              <span className="journey-continue__body">
                <span className="journey-continue__kind">{getMediaTypeLabel(currentMedia.tipo)}</span>
                <strong>{currentMedia.titulo}</strong>
                <small>{currentMedia.autor_criador || 'Obra do seu acervo'}</small>
                <span className="journey-continue__progress"><i style={{ width: `${currentMedia.progresso_percentual || 0}%` }} /><b>{currentMedia.progresso_percentual || 0}%</b></span>
              </span>
            </button>
          ) : (
            <div className="journey-continue__empty">
              <span><BookOpen className="h-5 w-5" /></span>
              <p>Escolha a primeira obra para dar forma ao seu percurso.</p>
              <button type="button" onClick={() => setIsSearchOpen(true)}>Adicionar obra <ArrowUpRight className="h-4 w-4" /></button>
            </div>
          )}
        </section>
      </div>

      <section className="journey-domains" aria-labelledby="domains-title">
        <div className="journey-section-heading">
          <div><p>Acervo vivo</p><h2 id="domains-title">Explore por domínio</h2></div>
          <button type="button" className="journey-link" onClick={() => openExplore()}>Ver acervo <ArrowUpRight className="h-3.5 w-3.5" /></button>
        </div>
        {activeRealms.length > 0 ? (
          <div className="realm-grid">
            {activeRealms.map((realm) => (
              <button key={realm.id} type="button" className="realm-card" onClick={() => handleRealmSelect(realm)} style={{ '--realm-accent': realm.accent, '--realm-progress': `${realm.progress}%` } as React.CSSProperties}>
                <span className="realm-card__orb" />
                <span className="realm-card__body"><small>Nível {realm.level || '—'}</small><strong>{realm.name}</strong><em>{realm.progress}% explorado</em></span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-text-primary/15 bg-bg-surface/40 p-5 text-center text-xs text-text-secondary">
            Adicione uma obra com gêneros ou temas para formar seus primeiros domínios.
          </p>
        )}
      </section>

      <div className="journey-home__lower-grid">
        <section className="journey-panel journey-categories" aria-labelledby="categories-title">
          <div className="journey-section-heading">
            <div><p>Biblioteca organizada</p><h2 id="categories-title">Formatos e coleções</h2></div>
            <button type="button" className="journey-link" onClick={() => setIsSearchOpen(true)}><Plus className="h-3.5 w-3.5" /> Obra</button>
          </div>
          <div className="category-grid">
            {MEDIA_FORMAT_DEFINITIONS.filter(
              (category) => category.alwaysVisible || mediaItems.some((item) => item.tipo === category.type),
            ).map((category) => {
              const Icon = CATEGORY_ICONS[category.type]
              const count = mediaItems.filter((item) => item.tipo === category.type).length
              return (
                <button type="button" key={category.type} className="category-module" onClick={() => openExplore(mediaTypeFilter(category.type))}>
                  <span><Icon className="h-4 w-4" /></span>
                  <strong>{category.label}</strong>
                  <small>{count} {count === 1 ? 'obra' : 'obras'}</small>
                  <em>{category.helper}</em>
                </button>
              )
            })}
            {customCategories.slice(0, 2).map((category) => (
              <button type="button" key={category.id} className="category-module category-module--custom" onClick={() => openExplore(genreFilter(category.label))}>
                <span><Sparkles className="h-4 w-4" /></span>
                <strong>{category.label}</strong>
                <small>coleção</small>
                <em>Seu próprio domínio</em>
              </button>
            ))}
          </div>
        </section>

        <section className="journey-panel journey-milestones" aria-labelledby="milestones-title">
          <div className="journey-section-heading">
            <div><p>Seu rastro</p><h2 id="milestones-title">Marcos recentes</h2></div>
            <span className="journey-section-count">{journey.events.length}</span>
          </div>
          {recentEvents.length ? (
            <ol className="milestone-list">
              {recentEvents.map((event) => (
                <li key={event.id}>
                  <span><Sparkles className="h-3.5 w-3.5" /></span>
                  <div><strong>{event.label}</strong><small>{formatEventDate(event.createdAt)}</small></div>
                  <b>+{event.xp} XP</b>
                </li>
              ))}
            </ol>
          ) : (
            <div className="journey-milestones__empty"><MapIcon className="h-5 w-5" /><p>Os próximos passos que você registrar aparecerão aqui.</p></div>
          )}
        </section>
      </div>

      <div className="journey-home__closing-grid">
        <section className="journey-panel journey-statistics" aria-labelledby="statistics-title">
          <div className="journey-section-heading"><div><p>Panorama</p><h2 id="statistics-title">Sua biblioteca em números</h2></div></div>
          <dl className="statistics-grid">
            <div><dt>Obras</dt><dd>{stats.totalItens}</dd><small>{activeItems} em andamento</small></div>
            <div><dt>Notas</dt><dd>{stats.totalAprendizados}</dd><small>ideias preservadas</small></div>
            <div><dt>Domínios</dt><dd>{stats.categoriasExploradas}</dd><small>campos explorados</small></div>
            <div><dt>Sequência</dt><dd>{streak.longest}</dd><small>melhor marca</small></div>
          </dl>
        </section>

        <div className="journey-quote-slot">
          <Suspense fallback={<div className="journey-panel journey-quote-slot__loading">Preparando a abertura do dia…</div>}>
            <DailyQuoteCard />
          </Suspense>
        </div>
      </div>

      <TrailSelectionModal isOpen={isTrailModalOpen} onClose={() => setIsTrailModalOpen(false)} />
    </div>
  )
}
