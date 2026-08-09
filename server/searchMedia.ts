type MediaType = 'Livro' | 'Filme' | 'Série' | 'Jogo'
type EntertainmentType = Exclude<MediaType, 'Livro'>

type SearchMediaResult = {
  titulo: string
  tipo: MediaType
  autor_criador: string
  ano: number | null
  data_lancamento_oficial: string
  sinopse: string
  generos: string[]
  url_capa_oficial: string
  url_capa: string
  fonte: string
}

type GeminiMetadata = Pick<SearchMediaResult, 'titulo' | 'autor_criador' | 'ano' | 'sinopse'>
type RateBucket = { startedAt: number; count: number }
type CachedEnrichment = { createdAt: number; value: GeminiMetadata }

type GoogleBooksResponse = {
  items?: Array<{
    volumeInfo?: {
      title?: string
      authors?: string[]
      publishedDate?: string
      description?: string
      categories?: string[]
      imageLinks?: { thumbnail?: string; smallThumbnail?: string }
    }
  }>
}

type OpenLibraryResponse = {
  docs?: Array<{
    title?: string
    author_name?: string[]
    first_publish_year?: number
    cover_i?: number
    subject?: string[]
  }>
}

type ITunesResponse = {
  results?: Array<{
    trackName?: string
    collectionName?: string
    artistName?: string
    sellerName?: string
    releaseDate?: string
    longDescription?: string
    description?: string
    primaryGenreName?: string
    artworkUrl100?: string
  }>
}

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> }
  }>
}

const MEDIA_TYPES = new Set<MediaType>(['Livro', 'Filme', 'Série', 'Jogo'])
const ENTERTAINMENT_MEDIA: Record<EntertainmentType, string> = {
  Filme: 'movie',
  Série: 'tvShow',
  Jogo: 'software',
}
const DAY_MS = 24 * 60 * 60 * 1000
const GEMINI_CACHE_MS = 12 * 60 * 60 * 1000
const geminiDailyLimit = Math.max(0, Number.parseInt(process.env.GEMINI_DAILY_LIMIT || '3', 10) || 3)
const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite'
const rateBuckets = new Map<string, RateBucket>()
const enrichmentCache = new Map<string, CachedEnrichment>()

const DEFAULT_HEADERS = {
  'User-Agent': 'AgoraCatalog/1.0 (https://seu-app.com; contato@seu-app.com)',
  Accept: 'application/json',
}

function isMediaType(value: unknown): value is MediaType {
  return typeof value === 'string' && MEDIA_TYPES.has(value as MediaType)
}

function cleanText(value: unknown = '', maxLength = 650): string {
  const text = String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

function yearFrom(value: unknown): number | null {
  const year = Number.parseInt(String(value || '').slice(0, 4), 10)
  return Number.isInteger(year) ? year : null
}

function clientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for') || request.headers.get('x-vercel-forwarded-for')
  return String(forwarded || 'anonymous').split(',')[0].trim()
}

function canUseGemini(request: Request): boolean {
  if (!process.env.GEMINI_API_KEY || geminiDailyLimit === 0) return false

  const now = Date.now()
  const identifier = clientIdentifier(request)
  const bucket = rateBuckets.get(identifier)
  if (!bucket || now - bucket.startedAt >= DAY_MS) {
    rateBuckets.set(identifier, { startedAt: now, count: 1 })
    return true
  }
  if (bucket.count >= geminiDailyLimit) return false
  bucket.count += 1
  return true
}

function synopsisMissing(result: SearchMediaResult | null | undefined): boolean {
  const synopsis = result?.sinopse?.trim() || ''
  return !synopsis || /^(sinopse não disponível|ficha oficial|ficha catalogada)/i.test(synopsis)
}

function parseGeminiJson(raw: unknown): GeminiMetadata | null {
  const cleaned = String(raw || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  try {
    const parsed: unknown = JSON.parse(cleaned)
    if (!parsed || typeof parsed !== 'object') return null

    const value = parsed as Record<string, unknown>
    if (typeof value.titulo !== 'string' || typeof value.sinopse !== 'string') return null

    return {
      titulo: cleanText(value.titulo, 160),
      autor_criador: cleanText(value.autor_criador, 160),
      ano: Number.isInteger(value.ano) ? value.ano as number : yearFrom(value.ano),
      sinopse: cleanText(value.sinopse, 650),
    }
  } catch {
    return null
  }
}

async function enrichMetadata(
  request: Request,
  query: string,
  tipo: MediaType,
  currentResult: SearchMediaResult | null,
): Promise<GeminiMetadata | null> {
  const cacheKey = `${tipo}:${query.toLocaleLowerCase('pt-BR')}`
  const cached = enrichmentCache.get(cacheKey)
  if (cached && Date.now() - cached.createdAt < GEMINI_CACHE_MS) return cached.value
  if (!canUseGemini(request)) return null

  const geminiApiKey = process.env.GEMINI_API_KEY
  if (!geminiApiKey) return null

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: `Identifique a obra abaixo e devolva somente JSON válido. Não invente URLs, citações ou informações incertas. A sinopse deve ter 2 a 4 frases em português brasileiro e no máximo 600 caracteres.\n\nTítulo pesquisado: ${query}\nCategoria: ${tipo}\nResultado da fonte pública: ${currentResult ? JSON.stringify({ titulo: currentResult.titulo, criador: currentResult.autor_criador, ano: currentResult.ano }) : 'nenhum'}\n\nFormato: {"titulo":"", "autor_criador":"", "ano":null, "sinopse":""}`,
          }],
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 260,
          responseMimeType: 'application/json',
        },
      }),
    },
  )

  if (!response.ok) throw new Error(`Gemini retornou status ${response.status}`)
  const data = await response.json() as GeminiResponse
  const raw = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('')
  const value = parseGeminiJson(raw)
  if (!value?.titulo || !value.sinopse) return null

  enrichmentCache.set(cacheKey, { createdAt: Date.now(), value })
  return value
}

async function searchBook(query: string): Promise<SearchMediaResult | null> {
  const url = new URL('https://www.googleapis.com/books/v1/volumes')
  url.searchParams.set('q', `intitle:${query}`)
  url.searchParams.set('maxResults', '1')
  url.searchParams.set('printType', 'books')
  url.searchParams.set('langRestrict', 'pt')

  const response = await fetch(url, {
    signal: AbortSignal.timeout(5000),
    headers: DEFAULT_HEADERS,
  })
  if (!response.ok) throw new Error(`Google Books retornou status ${response.status}`)

  const data = await response.json() as GoogleBooksResponse
  const volume = data.items?.[0]?.volumeInfo
  if (!volume) return null

  let cover = volume.imageLinks?.thumbnail || volume.imageLinks?.smallThumbnail || ''
  if (cover) {
    cover = cover
      .replace('http://', 'https://')
      .replace('&edge=curl', '')
      .replace('zoom=1', 'zoom=2')
  }

  return {
    titulo: volume.title || query,
    tipo: 'Livro',
    autor_criador: volume.authors?.join(', ') || 'Autor não informado',
    ano: yearFrom(volume.publishedDate),
    data_lancamento_oficial: volume.publishedDate || '',
    sinopse: cleanText(volume.description) || 'Sinopse não disponível na fonte consultada.',
    generos: volume.categories || [],
    url_capa_oficial: cover,
    url_capa: cover,
    fonte: 'Google Books',
  }
}

async function searchOpenLibraryBook(query: string): Promise<SearchMediaResult | null> {
  const url = new URL('https://openlibrary.org/search.json')
  url.searchParams.set('title', query)
  url.searchParams.set('limit', '1')
  url.searchParams.set('fields', 'title,author_name,first_publish_year,cover_i,key,subject')

  const response = await fetch(url, {
    signal: AbortSignal.timeout(7000),
    headers: DEFAULT_HEADERS,
  })
  if (!response.ok) throw new Error(`Open Library retornou status ${response.status}`)

  const data = await response.json() as OpenLibraryResponse
  const item = data.docs?.[0]
  if (!item?.title) return null

  const cover = item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg` : ''
  return {
    titulo: item.title,
    tipo: 'Livro',
    autor_criador: item.author_name?.join(', ') || 'Autor não informado',
    ano: item.first_publish_year || null,
    data_lancamento_oficial: item.first_publish_year ? String(item.first_publish_year) : '',
    sinopse: 'Sinopse não disponível na fonte consultada.',
    generos: (item.subject || []).slice(0, 4),
    url_capa_oficial: cover,
    url_capa: cover,
    fonte: 'Open Library',
  }
}

async function searchEntertainment(query: string, tipo: EntertainmentType): Promise<SearchMediaResult | null> {
  const url = new URL('https://itunes.apple.com/search')
  url.searchParams.set('term', query)
  url.searchParams.set('media', ENTERTAINMENT_MEDIA[tipo])
  url.searchParams.set('limit', '1')
  url.searchParams.set('country', 'br')
  url.searchParams.set('lang', 'pt_br')

  const response = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: DEFAULT_HEADERS,
  })
  if (!response.ok) throw new Error(`iTunes Search retornou status ${response.status}`)

  const data = await response.json() as ITunesResponse
  const item = data.results?.[0]
  if (!item) return null

  const cover = item.artworkUrl100?.replace(/\d+x\d+bb/, '600x600bb') || ''
  const releaseDate = item.releaseDate?.slice(0, 10) || ''

  return {
    titulo: item.trackName || item.collectionName || query,
    tipo,
    autor_criador: item.artistName || item.sellerName || 'Criador não informado',
    ano: yearFrom(releaseDate),
    data_lancamento_oficial: releaseDate,
    sinopse: cleanText(item.longDescription || item.description) || 'Sinopse não disponível na fonte consultada.',
    generos: item.primaryGenreName ? [item.primaryGenreName] : [],
    url_capa_oficial: cover,
    url_capa: cover,
    fonte: 'iTunes Search',
  }
}

export async function handleSearchMedia(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Método não permitido.' }, { status: 405 })
  }

  const body = await request.json().catch(() => ({})) as { query?: unknown; tipo?: unknown }
  const query = typeof body.query === 'string' ? body.query.trim() : ''
  const tipo = body.tipo

  if (query.length < 2) {
    return Response.json({ error: 'Informe um título com pelo menos 2 caracteres.' }, { status: 400 })
  }
  if (!isMediaType(tipo)) {
    return Response.json({ error: 'Categoria inválida.' }, { status: 400 })
  }

  try {
    let result: SearchMediaResult | null = null

    if (tipo === 'Livro') {
      try {
        result = await searchBook(query)
      } catch (error) {
        console.warn(
          'Google Books indisponível ou tempo limite excedido:',
          error instanceof Error ? error.message : 'Erro desconhecido',
        )
      }

      if (!result) {
        try {
          result = await searchOpenLibraryBook(query)
        } catch (error) {
          console.warn(
            'Open Library indisponível ou tempo limite excedido:',
            error instanceof Error ? error.message : 'Erro desconhecido',
          )
        }
      }
    } else {
      result = await searchEntertainment(query, tipo)
    }

    if (!result || !result.url_capa || synopsisMissing(result)) {
      try {
        const enrichment = await enrichMetadata(request, query, tipo, result)
        if (enrichment) {
          let coverResult = result
          if (!coverResult?.url_capa && enrichment.titulo.toLocaleLowerCase('pt-BR') !== query.toLocaleLowerCase('pt-BR')) {
            try {
              coverResult = tipo === 'Livro'
                ? (await searchBook(enrichment.titulo)) || (await searchOpenLibraryBook(enrichment.titulo))
                : await searchEntertainment(enrichment.titulo, tipo)
            } catch (error) {
              console.warn(
                'Busca de capa após identificação do Gemini falhou:',
                error instanceof Error ? error.message : 'Erro desconhecido',
              )
            }
          }

          result = {
            ...(coverResult || {}),
            titulo: coverResult?.titulo || enrichment.titulo,
            tipo,
            autor_criador: coverResult?.autor_criador || enrichment.autor_criador || 'Criador não informado',
            ano: coverResult?.ano ?? enrichment.ano,
            data_lancamento_oficial: coverResult?.data_lancamento_oficial || (enrichment.ano ? String(enrichment.ano) : ''),
            sinopse: synopsisMissing(coverResult) ? enrichment.sinopse : coverResult!.sinopse,
            generos: coverResult?.generos || [],
            url_capa_oficial: coverResult?.url_capa_oficial || '',
            url_capa: coverResult?.url_capa || '',
            fonte: `${coverResult?.fonte ? `${coverResult.fonte} + ` : ''}Gemini`,
          }
        }
      } catch (error) {
        console.warn(
          'Enriquecimento Gemini indisponível:',
          error instanceof Error ? error.message : 'Erro desconhecido',
        )
      }
    }

    if (!result) {
      return Response.json({ error: 'Nenhuma obra encontrada para esse título.' }, { status: 404 })
    }

    return Response.json(result)
  } catch (error) {
    console.error('Erro na rota /api/searchMedia:', error)
    return Response.json(
      { error: 'Não foi possível consultar a fonte agora. Tente novamente.' },
      { status: 502 },
    )
  }
}
