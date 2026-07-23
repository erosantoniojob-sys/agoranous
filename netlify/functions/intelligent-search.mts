import type { Config } from '@netlify/functions'

type Category = 'livro' | 'filme' | 'serie' | 'jogo' | 'app' | 'aprendizado'

type SearchResult = {
  titulo: string
  autor_criador: string
  ano: number | null
  sinopse: string
  generos: string[]
  url_capa: string | null
  categoria: Category
  fonte: string
}

const categoryHints: Record<Category, string[]> = {
  livro: ['book', 'novel', 'livro', 'romance'],
  filme: ['film', 'movie', 'filme'],
  serie: ['television', 'series', 'série', 'tv'],
  jogo: ['video game', 'videogame', 'game', 'jogo'],
  app: ['software', 'mobile app', 'application', 'aplicativo', 'app'],
  aprendizado: ['concept', 'knowledge', 'topic', 'learning', 'curso', 'estudo', 'tutorial'],
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

function summarize(text = '', maxLength = 520) {
  const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  if (cleanText.length <= maxLength) return cleanText

  const excerpt = cleanText.slice(0, maxLength)
  const sentenceEnd = Math.max(excerpt.lastIndexOf('. '), excerpt.lastIndexOf('! '), excerpt.lastIndexOf('? '))
  return `${excerpt.slice(0, sentenceEnd > 180 ? sentenceEnd + 1 : maxLength).trim()}…`
}

async function searchBook(title: string): Promise<SearchResult | null> {
  const url = new URL('https://www.googleapis.com/books/v1/volumes')
  url.searchParams.set('q', `intitle:${title}`)
  url.searchParams.set('maxResults', '5')
  url.searchParams.set('printType', 'books')
  url.searchParams.set('langRestrict', 'pt')

  const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new Error('Google Books indisponível')

  const data = await response.json()
  const volume = data.items?.[0]?.volumeInfo
  if (!volume) return null

  return {
    titulo: volume.title || title,
    autor_criador: volume.authors?.join(', ') || 'Autor não informado',
    ano: Number.parseInt(volume.publishedDate?.slice(0, 4), 10) || null,
    sinopse: summarize(volume.description) || 'Sinopse não disponível.',
    generos: volume.categories || [],
    url_capa: volume.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
    categoria: 'livro',
    fonte: 'Google Books',
  }
}

function claimEntityIds(entity: any, properties: string[]) {
  return properties.flatMap((property) =>
    (entity.claims?.[property] || [])
      .map((claim: any) => claim.mainsnak?.datavalue?.value?.id)
      .filter(Boolean),
  )
}

async function getEntityLabels(ids: string[]) {
  if (!ids.length) return new Map<string, string>()

  const url = new URL('https://www.wikidata.org/w/api.php')
  url.search = new URLSearchParams({
    action: 'wbgetentities',
    ids: [...new Set(ids)].join('|'),
    props: 'labels',
    languages: 'pt|en',
    format: 'json',
    origin: '*',
  }).toString()

  const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!response.ok) return new Map<string, string>()
  const data = await response.json()

  return new Map(
    Object.entries<any>(data.entities || {}).map(([id, item]) => [
      id,
      item.labels?.pt?.value || item.labels?.en?.value || id,
    ]),
  )
}

async function getWikipediaExtract(entity: any) {
  const sitelink = entity.sitelinks?.ptwiki || entity.sitelinks?.enwiki
  if (!sitelink?.title) return ''

  const language = entity.sitelinks?.ptwiki ? 'pt' : 'en'
  const url = new URL(`https://${language}.wikipedia.org/w/api.php`)
  url.search = new URLSearchParams({
    action: 'query',
    prop: 'extracts',
    exintro: '1',
    explaintext: '1',
    redirects: '1',
    titles: sitelink.title,
    format: 'json',
    origin: '*',
  }).toString()

  const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!response.ok) return ''
  const data = await response.json()
  return Object.values<any>(data.query?.pages || {})[0]?.extract || ''
}

async function searchWikidata(title: string, category: Category): Promise<SearchResult | null> {
  const searchUrl = new URL('https://www.wikidata.org/w/api.php')
  searchUrl.search = new URLSearchParams({
    action: 'wbsearchentities',
    search: title,
    language: 'pt',
    uselang: 'pt',
    type: 'item',
    limit: '8',
    format: 'json',
    origin: '*',
  }).toString()

  const searchResponse = await fetch(searchUrl, { signal: AbortSignal.timeout(8000) })
  if (!searchResponse.ok) throw new Error('Wikidata indisponível')
  const searchData = await searchResponse.json()
  const candidates = searchData.search || []
  if (!candidates.length) return null

  const hints = categoryHints[category]
  const candidate = candidates.find((item: any) =>
    hints.some((hint) => `${item.label} ${item.description || ''}`.toLowerCase().includes(hint)),
  ) || candidates[0]

  const entityResponse = await fetch(
    `https://www.wikidata.org/wiki/Special:EntityData/${candidate.id}.json`,
    { signal: AbortSignal.timeout(8000) },
  )
  if (!entityResponse.ok) throw new Error('Detalhes do Wikidata indisponíveis')
  const entityData = await entityResponse.json()
  const entity = entityData.entities?.[candidate.id]
  if (!entity) return null

  const creatorProperties = category === 'filme' || category === 'serie' ? ['P57', 'P58', 'P162'] : ['P178', 'P50']
  const creatorIds = claimEntityIds(entity, creatorProperties)
  const genreIds = claimEntityIds(entity, ['P136'])
  const labels = await getEntityLabels([...creatorIds, ...genreIds])
  const dateValue = entity.claims?.P577?.[0]?.mainsnak?.datavalue?.value?.time
  const imageName = entity.claims?.P18?.[0]?.mainsnak?.datavalue?.value
  const extract = await getWikipediaExtract(entity)

  return {
    titulo: entity.labels?.pt?.value || entity.labels?.en?.value || candidate.label,
    autor_criador: creatorIds.map((id) => labels.get(id)).filter(Boolean).join(', ') || 'Criador não informado',
    ano: dateValue ? Number.parseInt(dateValue.slice(1, 5), 10) : null,
    sinopse: summarize(extract || entity.descriptions?.pt?.value || entity.descriptions?.en?.value) || 'Sinopse não disponível.',
    generos: genreIds.map((id) => labels.get(id)).filter((label): label is string => Boolean(label)),
    url_capa: imageName
      ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageName)}?width=600`
      : null,
    categoria: category,
    fonte: 'Wikidata e Wikipédia',
  }
}

export default async (request: Request) => {
  if (request.method !== 'POST') return jsonError('Método não permitido.', 405)

  try {
    const body = await request.json()
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const category = body.category as Category

    if (title.length < 2) return jsonError('Informe um título com pelo menos 2 caracteres.', 400)
    if (!Object.hasOwn(categoryHints, category)) return jsonError('Categoria inválida.', 400)

    let result: SearchResult | null = null
    if (category === 'livro') {
      try {
        result = await searchBook(title)
      } catch (error) {
        console.warn('Google Books fallback activated', error instanceof Error ? error.message : 'Unknown error')
      }
    }

    result ||= await searchWikidata(title, category)

    if (!result) return jsonError('Nenhum resultado encontrado para esse título.', 404)
    return Response.json(result)
  } catch (error) {
    console.error('Intelligent search failed', error instanceof Error ? error.message : 'Unknown error')
    return jsonError('Não foi possível concluir a busca agora. Tente novamente.', 502)
  }
}

export const config: Config = {
  path: '/api/intelligent-search',
  method: 'POST',
}
