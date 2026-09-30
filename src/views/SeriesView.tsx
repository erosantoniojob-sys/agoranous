import { useMemo, useState } from 'react'
import { Check, ExternalLink, Plus, Search, Tv } from 'lucide-react'
import { CoverImage } from '../components/CoverImage'
import { useAgoraStore } from '../store/useAgoraStore'
import { findSeriesMedia, normalizeSeriesTitle, seriesCatalog, seriesMediaInput, type SeriesEntry } from '../data/series'

const providers = [...new Set(seriesCatalog.flatMap(series => series.offers.map(offer => offer.name)))].sort((a, b) => a.localeCompare(b, 'pt-BR'))

export function SeriesView() {
  const { mediaItems, addMedia, setSelectedMedia, isVisitor, syncStatus, retryCloudSync } = useAgoraStore()
  const [query, setQuery] = useState('')
  const [provider, setProvider] = useState('all')
  const [notice, setNotice] = useState('')
  const savedById = useMemo(() => new Map(seriesCatalog.map(series => [series.id, findSeriesMedia(series, mediaItems)])), [mediaItems])
  const term = normalizeSeriesTitle(query)
  const visible = seriesCatalog.filter(series => (!term || normalizeSeriesTitle(`${series.title} ${series.originalTitle} ${series.year}`).includes(term)) && (provider === 'all' || series.offers.some(offer => offer.name === provider)))

  const save = (series: SeriesEntry) => {
    const saved = savedById.get(series.id)
    if (saved) { setSelectedMedia(saved); return }
    addMedia(seriesMediaInput(series))
    setNotice(`${series.title} adicionada à sua biblioteca.`)
  }

  return <div className="catalog-page series-page">
    <header><p className="session-eyebrow"><Tv size={16} /> CURADORIA ÁGORA</p><h1>100 séries para conhecer.</h1><p>Uma seleção de grandes dramas, comédias, animações e minisséries. Clássicos e descobertas, sem ordem de classificação.</p></header>
    <div className="catalog-search">
      <Search size={20} aria-hidden="true" />
      <label className="sr-only" htmlFor="series-query">Buscar séries por título ou ano</label>
      <input id="series-query" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar entre as 100 séries…" />
      <label className="sr-only" htmlFor="series-provider">Filtrar por streaming</label>
      <select id="series-provider" value={provider} onChange={event => setProvider(event.target.value)}><option value="all">Todos os serviços</option>{providers.map(name => <option key={name}>{name}</option>)}</select>
    </div>
    <p className="catalog-footnote">Onde assistir no Brasil · consulta em 30/09/2026 via JustWatch. A oferta pode variar por temporada e plano. Canais adicionais, compra e aluguel podem exigir pagamento separado.</p>
    {isVisitor ? <p className="catalog-footnote">No modo visitante, sua lista fica neste navegador. Entre na conta para sincronizar entre dispositivos.</p> : null}
    {syncStatus === 'error' && !isVisitor ? <p role="alert">Não foi possível sincronizar sua biblioteca. <button className="session-text-button" onClick={retryCloudSync}>Tentar novamente</button></p> : null}
    <div className="catalog-result-heading"><h2>Séries · {visible.length} de 100</h2><button className="session-text-button" onClick={() => { setQuery(''); setProvider('all') }}>Limpar filtros</button></div>
    <p role="status" className="catalog-notice">{notice}</p>
    {!visible.length ? <p className="session-empty">Nenhuma série encontrada com esses filtros.</p> : null}
    <div className="catalog-grid">{visible.map(series => <article key={series.id} className="catalog-card">
      <CoverImage url={series.poster} title={series.title} tipo="Série" />
      <div><small>Série · {series.year}</small><h2 className="series-card-title">{series.title}</h2>
        <details className="series-synopsis"><summary>Sinopse</summary><p>{series.synopsis}</p></details>
        <h3 className="series-streaming-title">Onde assistir</h3>
        {series.offers.length ? <ul className="series-offers">{series.offers.map(offer => <li key={`${offer.name}:${offer.mode}`}><a href={offer.url} target="_blank" rel="noreferrer"><span>{offer.name}<small>{offer.mode}</small></span><ExternalLink size={12} aria-hidden="true" /></a></li>)}</ul> : <p>Sem oferta no Brasil identificada nesta consulta.</p>}
        <a href={series.source} target="_blank" rel="noreferrer">Conferir no JustWatch <ExternalLink size={12} aria-hidden="true" /></a>
        <button type="button" onClick={() => save(series)} aria-label={`${savedById.get(series.id) ? 'Abrir' : 'Adicionar'} ${series.title}`}>{savedById.get(series.id) ? <Check size={15} /> : <Plus size={15} />}{savedById.get(series.id) ? 'Na biblioteca · abrir' : 'Quero assistir'}</button>
      </div>
    </article>)}</div>
    <p className="catalog-footnote">Seleção editorial Ágora, sem ranking oficial. Referências de capas e disponibilidade: JustWatch, com fonte em cada ficha. As imagens pertencem aos respectivos titulares.</p>
  </div>
}
