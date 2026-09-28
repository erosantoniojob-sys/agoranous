import type { CatalogItem } from '../src/types/catalog.js'

const types = new Set(['Filme', 'Série', 'Música', 'Livro', 'Teatro', 'Podcast', 'Jogo'])
const clean = (value: unknown) => typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim().slice(0, 1800) : ''
const year = (value: unknown) => Number.parseInt(String(value || '').slice(0, 4), 10) || null

export async function searchCatalog(body: Record<string, unknown>): Promise<Response> {
  const query = typeof body.query === 'string' ? body.query.trim() : ''
  const tipo = body.tipo as CatalogItem['tipo']
  if (query.length < 2 || query.length > 180 || !types.has(tipo)) {
    return Response.json({ error: 'Escolha um formato e informe de 2 a 180 caracteres.' }, { status: 400 })
  }
  try {
    let items: CatalogItem[] = []
    let source: string
    if (tipo === 'Série') {
      const response = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(10000) })
      if (!response.ok) throw new Error('upstream')
      const data = await response.json() as Array<{ show: { id: number; name: string; premiered?: string; summary?: string; url: string; image?: { medium?: string }; genres?: string[] } }>
      source = 'TVmaze · CC BY-SA'
      items = data.slice(0, 24).map(({ show }) => ({ catalogId: `tvmaze:${show.id}`, titulo: show.name, tipo, ano: year(show.premiered), sinopse: clean(show.summary), url_capa: show.image?.medium || '', fonte: source, sourceUrl: show.url, generos: show.genres || [], progresso_percentual: 0 }))
    } else if (tipo === 'Filme') {
      const url = new URL('https://en.wikipedia.org/w/api.php')
      url.search = new URLSearchParams({ action: 'query', generator: 'search', gsrsearch: `${query} ${tipo === 'Filme' ? 'film' : 'television series'}`, gsrlimit: '24', prop: 'pageimages|extracts', piprop: 'thumbnail', pilicense: 'any', pithumbsize: '500', exintro: '1', explaintext: '1', exsentences: '2', exlimit: 'max', format: 'json', formatversion: '2' }).toString()
      const response = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { Accept: 'application/json' } })
      if (!response.ok) throw new Error('upstream')
      const data = await response.json() as { error?: unknown; query?: { pages?: Array<{ pageid: number; title: string; index: number; extract?: string; thumbnail?: { source: string } }> } }
      if (data.error) throw new Error('upstream')
      source = 'Wikipedia · referências em inglês'
      const kind = /\bis an? (?:18|19|20)\d{2}\b[^.]{0,180}\bfilm\b/i
      items = (data.query?.pages || []).filter(item => !/^(List of|Making of)|\(franchise\)/i.test(item.title) && kind.test(item.extract || '')).sort((a, b) => a.index - b.index).map(item => ({
        catalogId: `wikipedia:${item.pageid}`, titulo: item.title, tipo,
        ano: Number((item.extract || '').match(/\bis (?:an? |the )((?:18|19|20)\d{2})\b/)?.[1]) || null,
        sinopse: clean(item.extract), url_capa: item.thumbnail?.source || '',
        fonte: source, sourceUrl: `https://en.wikipedia.org/?curid=${item.pageid}`, progresso_percentual: 0,
      }))
    } else if (tipo === 'Livro' || tipo === 'Teatro') {
      const url = new URL('https://openlibrary.org/search.json')
      url.search = new URLSearchParams({ q: tipo === 'Teatro' ? `${query} subject:drama` : query, limit: '24', fields: 'key,title,author_name,first_publish_year,cover_i' }).toString()
      const response = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { Accept: 'application/json' } })
      if (!response.ok) throw new Error('upstream')
      const data = await response.json() as { docs?: Array<{ key: string; title: string; author_name?: string[]; first_publish_year?: number; cover_i?: number }> }
      source = tipo === 'Teatro' ? 'Open Library · textos e edições teatrais' : 'Open Library'
      items = (data.docs || []).map(item => ({
        catalogId: `openlibrary:${item.key}`, titulo: clean(item.title), tipo,
        autor_criador: item.author_name?.join(', ') || '', ano: item.first_publish_year || null,
        sinopse: tipo === 'Teatro' ? 'Edição de texto teatral. A capa representa esta edição, não uma montagem específica.' : '',
        url_capa: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg` : '',
        fonte: 'Open Library', sourceUrl: `https://openlibrary.org${item.key}`, progresso_percentual: 0,
      }))
    } else {
      const formats: Record<string, [string, string]> = { Filme: ['movie', 'movie'], Série: ['tvShow', 'tvSeason'], Música: ['music', 'album'], Podcast: ['podcast', 'podcast'], Jogo: ['software', 'software'] }
      const [media, entity] = formats[tipo]
      const url = new URL('https://itunes.apple.com/search')
      url.search = new URLSearchParams({ term: query, media, entity, country: 'br', limit: '24' }).toString()
      const response = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { Accept: 'application/json' } })
      if (!response.ok) throw new Error('upstream')
      const data = await response.json() as { results?: Array<Record<string, unknown>> }
      source = 'Apple / iTunes · Brasil'
      items = (data.results || []).map(item => ({
        catalogId: `itunes:${item.trackId || item.collectionId}`, tipo,
        titulo: clean(item.trackName || item.collectionName), autor_criador: clean(item.artistName),
        ano: year(item.releaseDate), sinopse: clean(item.longDescription || item.description),
        url_capa: clean(item.artworkUrl100).replace(/\d+x\d+bb/, '600x600bb'),
        fonte: source, sourceUrl: clean(item.trackViewUrl || item.collectionViewUrl),
        generos: item.primaryGenreName ? [clean(item.primaryGenreName)] : [], progresso_percentual: 0,
      }))
    }
    const seen = new Set<string>()
    items = items.filter(item => item.titulo && !seen.has(item.catalogId) && Boolean(seen.add(item.catalogId)))
    return Response.json({ items, source })
  } catch {
    return Response.json({ error: 'A fonte de catálogo não respondeu. Tente novamente ou adicione a obra manualmente.' }, { status: 502 })
  }
}
