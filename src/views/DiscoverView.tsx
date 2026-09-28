import React, { useEffect, useRef, useState } from 'react'
import { Search, Plus, ExternalLink, Check, Loader2 } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { CoverImage } from '../components/CoverImage'
import { searchCatalog } from '../lib/catalogSearch'
import { cinemaFilms, cinemaMediaInput } from '../data/cinema'
import { classicalWorks, classicalMediaInput } from '../data/classicalFormations'
import type { MediaType } from '../types/agora'
import type { CatalogItem } from '../types/catalog'

const suggestions: CatalogItem[] = [
  ...cinemaFilms.slice(0, 12).map(film => ({ ...cinemaMediaInput(film), catalogId: film.id, sourceUrl: film.source })),
  ...classicalWorks.map(work => ({ ...classicalMediaInput(work), catalogId: work.id, sourceUrl: work.source || `https://en.wikipedia.org/wiki/${encodeURIComponent(work.wiki)}` })),
]
export const DiscoverView: React.FC = () => {
  const { mediaItems, addMedia, setSelectedMedia, setIsSearchOpen } = useAgoraStore()
  const [query, setQuery] = useState('')
  const [tipo, setTipo] = useState<MediaType>('Filme')
  const [results, setResults] = useState<CatalogItem[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [source, setSource] = useState('Curadoria Ágora')
  const [notice, setNotice] = useState('')
  const request = useRef<AbortController | null>(null)
  useEffect(() => () => request.current?.abort(), [])
  const runSearch = async (event: React.FormEvent) => {
    event.preventDefault()
    request.current?.abort()
    const controller = new AbortController(); request.current = controller
    setLoading(true); setError(''); setResults(null)
    try {
      const data = await searchCatalog(query, tipo, controller.signal)
      if (!controller.signal.aborted) { setResults(data.items); setSource(data.source) }
    } catch (error) { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Falha na pesquisa.') }
    finally { if (!controller.signal.aborted) setLoading(false) }
  }
  const visible = results ?? suggestions.filter(item => item.tipo === tipo)
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  const existing = (item: CatalogItem) => mediaItems.find(media => media.tipo === item.tipo && normalize(media.titulo) === normalize(item.titulo) && (!media.ano || !item.ano || media.ano === item.ano))
  const add = (item: CatalogItem) => {
    const saved = existing(item)
    if (saved) { setSelectedMedia(saved); return }
    const { catalogId, sourceUrl, ...media } = item
    addMedia({ ...media, status: 'Pendente', avaliacao_numerica: 0, progresso_percentual: 0 })
    setNotice(`${item.titulo} adicionado à lista Para depois.`)
  }
  return <div className="catalog-page">
    <header><p className="session-eyebrow">UM MUNDO ALÉM DA SUA BIBLIOTECA</p><h1>Encontre sua próxima descoberta.</h1><p>Filmes, álbuns, livros e textos teatrais. Explore as capas e guarde o que despertar sua curiosidade.</p></header>
    <form onSubmit={runSearch} className="catalog-search"><label className="sr-only" htmlFor="catalog-query">Pesquisar catálogo</label><Search size={20} /><input id="catalog-query" value={query} maxLength={180} onChange={event => setQuery(event.target.value)} placeholder="Título, artista ou autor…" required minLength={2} /><label className="sr-only" htmlFor="catalog-type">Formato do catálogo</label><select id="catalog-type" value={tipo} onChange={event => { request.current?.abort(); setLoading(false); setTipo(event.target.value as MediaType); setResults(null); setSource('Curadoria Ágora'); setError('') }}>{['Filme', 'Série', 'Música', 'Livro', 'Teatro', 'Podcast'].map(type => <option key={type}>{type}</option>)}</select><button className="session-primary" disabled={loading || query.trim().length < 2}>{loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Buscar</button></form>
    <div className="catalog-amazon"><div><strong>Quer procurar na Amazon?</strong><p>Pesquise no catálogo da Amazon Brasil em uma nova aba. Os resultados abaixo vêm das fontes identificadas em cada obra.</p></div><a target="_blank" rel="noreferrer" href={`https://www.amazon.com.br/s?k=${encodeURIComponent(query.trim() || ({ Música: 'música álbuns', Teatro: 'teatro peças livros', Filme: 'filmes', Série: 'séries', Livro: 'livros', Podcast: 'podcasts' } as Record<string, string>)[tipo])}`}>Pesquisar na Amazon <ExternalLink size={15} /></a></div>
    <div className="catalog-result-heading"><h2>{results ? `Resultados · ${results.length}` : 'Para começar a explorar'}</h2><span>{source}</span></div>
    {error ? <p role="alert" className="catalog-message">{error} <button onClick={() => setIsSearchOpen(true)}>Adicionar manualmente</button></p> : null}
    <p role="status" className="catalog-notice">{loading ? 'Buscando capas e obras…' : notice}</p>
    {!loading && !visible.length ? <div className="session-empty"><p>{results ? 'Nenhuma obra encontrada.' : 'Pesquise para descobrir obras neste formato.'}</p><span>Tente o título original ou o nome do autor ou artista.</span></div> : null}
    {!loading ? <div className="catalog-grid">{visible.map(item => <article key={item.catalogId} className="catalog-card"><CoverImage url={item.url_capa} title={item.titulo} tipo={item.tipo} /><div><small>{item.tipo}{item.ano ? ` · ${item.ano}` : ''}</small><h3>{item.titulo}</h3><p>{item.autor_criador}</p><button onClick={() => add(item)}>{existing(item) ? <Check size={15} /> : <Plus size={15} />}{existing(item) ? 'Na biblioteca · abrir' : 'Quero conhecer'}</button><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.fonte?.startsWith('agora:') ? 'Referência da obra' : item.fonte} <ExternalLink size={12} /></a></div></article>)}</div> : null}
    <p className="catalog-footnote">Música: capas de álbuns e gravações. Teatro: capas de edições ou imagens de referência; não indicam uma montagem em cartaz. Disponibilidade e preços devem ser consultados no serviço de origem.</p>
  </div>
}
