import React, { useMemo, useState } from 'react'
import { BookOpen, Check, Film, GraduationCap, Search, X } from 'lucide-react'
import { CoverImage } from '../components/CoverImage'
import { useAgoraStore } from '../store/useAgoraStore'
import { useModalAccessibility } from '../lib/useModalAccessibility'
import { CINEMA_CATEGORY, cinemaFilms, cinemaMediaInput, findCinemaMedia, normalizeCinemaTitle, type CinemaFilm } from '../data/cinema'

const suggestedIds = cinemaFilms.filter(film => film.foundation).map(film => film.id)
const genres = [...new Set(cinemaFilms.map(film => film.genre))].sort((a, b) => a.localeCompare(b, 'pt-BR'))

function FilmDetails({ film, onClose }: { film: CinemaFilm; onClose: () => void }) {
  const ref = useModalAccessibility<HTMLDivElement>(true, onClose)
  return <div className="cinema-modal-backdrop" onClick={onClose}>
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="cinema-film-title" className="cinema-modal" onClick={event => event.stopPropagation()}>
      <button type="button" className="cinema-close" onClick={onClose} aria-label="Fechar detalhes"><X size={22} /></button>
      <div className="cinema-detail-layout">
        <CoverImage url={film.poster} title={film.title} tipo="Filme" />
        <div>
          <p className="cinema-eyebrow">{film.genre} · {film.year}</p>
          <h2 id="cinema-film-title">{film.title}</h2>
          <p className="cinema-muted">Direção: {film.director}</p>
          <p className="cinema-muted">{film.country} · aproximadamente {film.minutes} min*</p>
          <p className="cinema-synopsis">{film.synopsis}</p>
          <section className="cinema-study"><h3>Para apurar o olhar</h3><p>{film.study}</p></section>
          <section className="cinema-book">
            <h3><BookOpen size={17} /> Do livro à tela</h3>
            {film.book ? <><h4>{film.book.title}</h4><p>{film.book.author} · {film.book.year}</p><p>{film.book.relationship}</p></> : <p>Não há um livro-base indicado nesta curadoria. Algumas obras partem de roteiros originais, peças teatrais ou outras fontes.</p>}
          </section>
          <p className="cinema-footnote">*A duração pode variar conforme a versão. Seleção sem pornografia; isso não significa classificação livre. Alguns títulos contêm nudez não pornográfica, violência ou temas sensíveis.</p>
          <a href={film.source} target="_blank" rel="noreferrer">Consultar ficha e origem do cartaz ↗</a>
        </div>
      </div>
    </div>
  </div>
}

export function CinemaView() {
  const { mediaItems, customTrails, addMedia, updateMedia, addCustomTrail, updateCustomTrail, isVisitor, syncStatus, retryCloudSync } = useAgoraStore()
  const [section, setSection] = useState<'catalog' | 'formation'>('catalog')
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('all')
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState<CinemaFilm | null>(null)
  const [editing, setEditing] = useState(false)
  const [draftIds, setDraftIds] = useState<string[]>(suggestedIds)
  const [name, setName] = useState('Minha formação em 50 clássicos')
  const [notice, setNotice] = useState('')
  const formation = customTrails.find(trail => trail.categoria === CINEMA_CATEGORY)
  const mediaByFilm = useMemo(() => new Map(cinemaFilms.map(film => [film.id, findCinemaMedia(film, mediaItems)])), [mediaItems])
  const formationFilms = cinemaFilms.filter(film => {
    const media = mediaByFilm.get(film.id)
    return media && formation?.mediaIds.includes(media.id)
  })
  const watched = cinemaFilms.filter(film => mediaByFilm.get(film.id)?.status === 'Concluído').length
  const completed = formationFilms.filter(film => mediaByFilm.get(film.id)?.status === 'Concluído').length
  const building = section === 'formation' && (!formation || editing)
  const term = normalizeCinemaTitle(query)
  const visible = cinemaFilms.filter(film => {
    const inSection = section === 'catalog' || building || formationFilms.includes(film)
    const matchesQuery = !term || normalizeCinemaTitle(`${film.title} ${film.director} ${film.year} ${film.country} ${film.book?.title || ''} ${film.book?.author || ''}`).includes(term)
    const isWatched = mediaByFilm.get(film.id)?.status === 'Concluído'
    return inSection && matchesQuery && (genre === 'all' || film.genre === genre) && (status === 'all' || (status === 'watched' ? isWatched : !isWatched))
  })
  const setPage = (page: 'catalog' | 'formation') => { setSection(page); setQuery(''); setGenre('all'); setStatus('all'); setNotice('') }
  const toggleDraft = (id: string) => setDraftIds(current => current.includes(id) ? current.filter(value => value !== id) : current.length < 50 ? [...current, id] : current)

  const saveFormation = () => {
    if (draftIds.length !== 50 || !name.trim()) return
    const chosen = cinemaFilms.filter(film => draftIds.includes(film.id)).sort((a, b) => a.year - b.year || a.title.localeCompare(b.title, 'pt-BR'))
    const works = chosen.map(film => mediaByFilm.get(film.id) || addMedia(cinemaMediaInput(film)))
    const progress = works.filter(item => item.status === 'Concluído').length * 2
    const description = 'Um percurso por 50 clássicos do cinema, em ordem histórica. Assista, observe a linguagem e registre suas reflexões no acervo.'
    if (formation) updateCustomTrail(formation.id, { nome: name.trim(), mediaIds: works.map(item => item.id), progresso_percentual: progress })
    else {
      const created = addCustomTrail(name.trim(), description, works.map(item => item.id), CINEMA_CATEGORY)
      updateCustomTrail(created.id, { progresso_percentual: progress, objetivo: 'Formar o olhar por meio de 50 clássicos do cinema.', criterio_conclusao: 'Assistir aos 50 filmes da formação.' })
    }
    setEditing(false)
    setQuery(''); setGenre('all'); setStatus('all')
    setNotice(formation ? 'Formação atualizada. Seu histórico de filmes assistidos foi preservado.' : 'Formação criada! Os 50 filmes estão no seu acervo e a formação também aparece em Trilhas.')
  }

  const toggleWatched = (film: CinemaFilm) => {
    const existing = mediaByFilm.get(film.id)
    const item = existing || addMedia(cinemaMediaInput(film))
    const done = item.status !== 'Concluído'
    updateMedia(item.id, { status: done ? 'Concluído' : 'Pendente', progresso_percentual: done ? 100 : 0, progresso_detalhado: { atual: done ? film.minutes : 0, total: film.minutes, unidade: 'minutos' } })
    if (formation?.mediaIds.includes(item.id)) updateCustomTrail(formation.id, { progresso_percentual: Math.round((completed + (done ? 1 : -1)) / 50 * 100) })
    setNotice(`${film.title}: ${done ? 'marcado como assistido' : 'marcado como pendente'}.`)
  }

  const editFormation = () => {
    setDraftIds(formationFilms.map(film => film.id)); setName(formation?.nome || 'Minha formação em 50 clássicos'); setEditing(true)
    setQuery(''); setGenre('all'); setStatus('all')
  }

  return <div className="cinema-page">
    <header className="cinema-hero">
      <div className="cinema-hero-copy">
        <p className="cinema-eyebrow"><Film size={16} /> A sétima arte · Curadoria Ágora</p>
        <h1>Grandes filmes.<br /><em>Um olhar em formação.</em></h1>
        <p>100 obras para conhecer o cinema. 50 clássicos para construir seu próprio percurso — uma sessão de cada vez.</p>
        <button className="cinema-primary" type="button" onClick={() => setPage('formation')}><GraduationCap size={18} /> {formation ? 'Continuar minha formação' : 'Criar minha formação'}</button>
      </div>
      <div className="cinema-hero-art" aria-hidden="true">
        {[cinemaFilms[14], cinemaFilms[20], cinemaFilms[49]].map(film => <CoverImage key={film.id} url={film.poster} title={film.title} tipo="Filme" />)}
        <span>O cinema também se aprende a ver.</span>
      </div>
    </header>

    <div className="cinema-intro">
      <p>Uma seleção editorial de grandes filmes de todos os tempos, sem pornografia. A numeração organiza o acervo; não é um ranking universal.</p>
      <details><summary>Critérios e conteúdo da seleção</summary><p>Relevância histórica, linguagem cinematográfica e diversidade de épocas e países orientam esta curadoria. O <a href="https://www.bfi.org.uk/sight-and-sound/greatest-films-all-time" target="_blank" rel="noreferrer">levantamento Sight and Sound / BFI</a> é uma referência crítica, não a lista reproduzida aqui. A formação inicial reúne 50 obras, de 1921 a 2001, e pode ser personalizada. Não incluímos pornografia; alguns filmes apresentam nudez não pornográfica, violência e temas adultos. Consulte a classificação da versão antes de assistir.</p></details>
    </div>

    <div className="cinema-tabs" role="group" aria-label="Seções de cinema">
      <button type="button" aria-pressed={section === 'catalog'} onClick={() => setPage('catalog')}>Os 100 filmes <span>{watched}/100 assistidos</span></button>
      <button type="button" aria-pressed={section === 'formation'} onClick={() => setPage('formation')}>Formação de clássicos <span>50 filmes</span></button>
    </div>

    {section === 'formation' ? <section className="cinema-formation" aria-labelledby="cinema-formation-title">
      <div><p className="cinema-eyebrow">Seu percurso de cinema</p><h2 id="cinema-formation-title">{building ? 'Escolha os seus 50 clássicos' : formation?.nome}</h2><p>{building ? 'Comece com a seleção sugerida ou troque títulos abaixo. Para incluir outro filme, desmarque um dos 50 selecionados.' : `${completed} de 50 assistidos · ${Math.round(completed / 50 * 100)}% do percurso concluído`}</p></div>
      {building ? <>
        <label className="cinema-name">Nome da formação<input value={name} maxLength={100} onChange={event => setName(event.target.value)} /></label>
        <div className="cinema-builder-actions"><strong aria-live="polite">{draftIds.length}/50 selecionados</strong><button type="button" onClick={() => setDraftIds(suggestedIds)}>Usar os 50 sugeridos</button><button type="button" onClick={() => setDraftIds([])}>Limpar seleção</button><button className="cinema-primary" type="button" disabled={draftIds.length !== 50 || !name.trim()} onClick={saveFormation}>{formation ? 'Salvar formação' : 'Criar formação com 50 filmes'}</button>{editing ? <button type="button" onClick={() => setEditing(false)}>Cancelar</button> : null}</div>
      </> : <><progress aria-label="Progresso da formação" max={50} value={completed} /><button type="button" className="cinema-secondary" onClick={editFormation}>Personalizar os 50 filmes</button>{formationFilms.length < 50 ? <p role="status">Alguns filmes foram removidos do acervo. Personalize a formação para completar os 50 títulos.</p> : null}</>}
      <p className="cinema-footnote">{isVisitor ? 'Modo visitante: formação e progresso ficam salvos neste navegador.' : syncStatus === 'error' ? 'Não foi possível sincronizar agora. Seus dados estão guardados neste navegador.' : syncStatus === 'syncing' ? 'Sincronizando sua formação com a conta…' : 'Formação e progresso usam a sincronização do seu acervo.'}</p>
      {syncStatus === 'error' && !isVisitor ? <button type="button" onClick={retryCloudSync}>Tentar sincronizar novamente</button> : null}
    </section> : null}

    <div className="cinema-toolbar">
      <label className="cinema-search"><Search size={18} /><span className="sr-only">Buscar filmes, diretores ou livros</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Filme, diretor, país ou livro…" /></label>
      <label><span className="sr-only">Filtrar por gênero</span><select value={genre} onChange={event => setGenre(event.target.value)}><option value="all">Todos os gêneros</option>{genres.map(value => <option key={value}>{value}</option>)}</select></label>
      <label><span className="sr-only">Filtrar por progresso</span><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">Todos os filmes</option><option value="watched">Assistidos</option><option value="pending">Ainda não assistidos</option></select></label>
    </div>
    <div className="cinema-results"><p>{visible.length} {visible.length === 1 ? 'filme' : 'filmes'}{section === 'formation' && !building ? ' · ordem histórica' : ''}</p><p role="status" aria-live="polite">{notice}</p></div>
    <div className="cinema-grid">
      {(section === 'formation' && !building ? [...visible].sort((a, b) => a.year - b.year || a.title.localeCompare(b.title, 'pt-BR')) : visible).map(film => {
        const done = mediaByFilm.get(film.id)?.status === 'Concluído'
        const picked = draftIds.includes(film.id)
        return <article key={film.id} className={`cinema-card ${done ? 'is-watched' : ''}`}>
          <button type="button" className="cinema-film-open" onClick={() => setSelected(film)} aria-label={`Ver detalhes de ${film.title}`}>
            <div className="cinema-poster"><CoverImage url={film.poster} title={film.title} tipo="Filme" /><span className="cinema-number">{film.id.slice(-3)}</span>{done ? <span className="cinema-watched-badge"><Check size={12} /> Assistido</span> : null}</div>
            <div className="cinema-card-copy"><p>{film.year} · {film.genre}</p><h3>{film.title}</h3><p>{film.director}</p>{film.book ? <span className="cinema-book-tag"><BookOpen size={12} /> Do livro à tela</span> : null}</div>
          </button>
          {building ? <label className={`cinema-pick ${picked ? 'is-picked' : ''}`}><input type="checkbox" checked={picked} disabled={!picked && draftIds.length >= 50} onChange={() => toggleDraft(film.id)} aria-label={`Incluir ${film.title} na formação`} />{picked ? 'Na sua formação' : 'Incluir na formação'}</label> : <button type="button" className="cinema-watch" aria-pressed={done} onClick={() => toggleWatched(film)} aria-label={`${done ? 'Desmarcar assistido' : 'Marcar assistido'}: ${film.title}`}><Check size={15} />{done ? 'Assistido' : 'Marcar assistido'}</button>}
        </article>
      })}
    </div>
    {!visible.length ? <div className="cinema-empty"><Film size={32} /><h2>Nenhum filme encontrado</h2><p>Tente outro título ou remova os filtros.</p><button type="button" onClick={() => { setQuery(''); setGenre('all'); setStatus('all') }}>Limpar filtros</button></div> : null}
    {selected ? <FilmDetails film={selected} onClose={() => setSelected(null)} /> : null}
  </div>
}
