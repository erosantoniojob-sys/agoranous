const MEDIA_TYPES = new Set(['Livro', 'Filme', 'Série', 'Jogo'])
const DAY_MS = 24 * 60 * 60 * 1000
const GEMINI_CACHE_MS = 12 * 60 * 60 * 1000
const geminiDailyLimit = Math.max(0, Number.parseInt(process.env.GEMINI_DAILY_LIMIT || '3', 10) || 3)
const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite'
const rateBuckets = new Map()
const enrichmentCache = new Map()

function cleanText(value = '', maxLength = 650) {
  const text = String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

function yearFrom(value) {
  const year = Number.parseInt(String(value || '').slice(0, 4), 10)
  return Number.isInteger(year) ? year : null
}

const DEFAULT_HEADERS = {
  'User-Agent': 'AgoraCatalog/1.0 (https://seu-app.com; contato@seu-app.com)',
  'Accept': 'application/json',
}

function clientIdentifier(req) {
  const forwarded = req.headers['x-forwarded-for'] || req.headers['x-vercel-forwarded-for']
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || 'anonymous')
    .split(',')[0]
    .trim()
}

function canUseGemini(req) {
  if (!process.env.GEMINI_API_KEY || geminiDailyLimit === 0) return false

  const now = Date.now()
  const identifier = clientIdentifier(req)
  const bucket = rateBuckets.get(identifier)
  if (!bucket || now - bucket.startedAt >= DAY_MS) {
    rateBuckets.set(identifier, { startedAt: now, count: 1 })
    return true
  }
  if (bucket.count >= geminiDailyLimit) return false
  bucket.count += 1
  return true
}

function synopsisMissing(result) {
  const synopsis = result?.sinopse?.trim() || ''
  return !synopsis || /^(sinopse não disponível|ficha oficial|ficha catalogada)/i.test(synopsis)
}

function parseGeminiJson(raw) {
  const cleaned = String(raw || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  try {
    const value = JSON.parse(cleaned)
    return value && typeof value === 'object' ? value : null
  } catch {
    return null
  }
}

async function enrichMetadata(req, query, tipo, currentResult) {
  const cacheKey = `${tipo}:${query.toLocaleLowerCase('pt-BR')}`
  const cached = enrichmentCache.get(cacheKey)
  if (cached && Date.now() - cached.createdAt < GEMINI_CACHE_MS) return cached.value
  if (!canUseGemini(req)) return null

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
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
  const data = await response.json()
  const raw = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('')
  const parsed = parseGeminiJson(raw)
  if (!parsed?.titulo || !parsed?.sinopse) return null

  const value = {
    titulo: cleanText(parsed.titulo, 160),
    autor_criador: cleanText(parsed.autor_criador, 160),
    ano: Number.isInteger(parsed.ano) ? parsed.ano : yearFrom(parsed.ano),
    sinopse: cleanText(parsed.sinopse, 650),
  }
  enrichmentCache.set(cacheKey, { createdAt: Date.now(), value })
  return value
}

async function searchBook(query) {
  const url = new URL('https://www.googleapis.com/books/v1/volumes')
  url.searchParams.set('q', `intitle:${query}`)
  url.searchParams.set('maxResults', '1')
  url.searchParams.set('printType', 'books')
  url.searchParams.set('langRestrict', 'pt') // Força prioridade para resultados em português

  const response = await fetch(url, {
    signal: AbortSignal.timeout(5000),
    headers: DEFAULT_HEADERS,
  })
  if (!response.ok) throw new Error(`Google Books retornou status ${response.status}`)

  const volume = (await response.json()).items?.[0]?.volumeInfo
  if (!volume) return null

  // Trata e eleva a qualidade da imagem da capa
  let cover = volume.imageLinks?.thumbnail || volume.imageLinks?.smallThumbnail || ''
  if (cover) {
    cover = cover
      .replace('http://', 'https://')
      .replace('&edge=curl', '') // Remove o efeito visual de folha dobrada
      .replace('zoom=1', 'zoom=2') // Aumenta a resolução do thumbnail
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

async function searchOpenLibraryBook(query) {
  const url = new URL('https://openlibrary.org/search.json')
  url.searchParams.set('title', query)
  url.searchParams.set('limit', '1')
  url.searchParams.set('fields', 'title,author_name,first_publish_year,cover_i,key,subject')

  const response = await fetch(url, {
    signal: AbortSignal.timeout(7000),
    headers: DEFAULT_HEADERS,
  })
  if (!response.ok) throw new Error(`Open Library retornou status ${response.status}`)

  const item = (await response.json()).docs?.[0]
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

async function searchEntertainment(query, tipo) {
  const media = { Filme: 'movie', Série: 'tvShow', Jogo: 'software' }[tipo]
  const url = new URL('https://itunes.apple.com/search')
  url.searchParams.set('term', query)
  url.searchParams.set('media', media)
  url.searchParams.set('limit', '1')
  url.searchParams.set('country', 'br')
  url.searchParams.set('lang', 'pt_br')

  const response = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: DEFAULT_HEADERS,
  })
  if (!response.ok) throw new Error(`iTunes Search retornou status ${response.status}`)

  const item = (await response.json()).results?.[0]
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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' })

  const query = typeof req.body?.query === 'string' ? req.body.query.trim() : ''
  const tipo = req.body?.tipo

  if (query.length < 2) return res.status(400).json({ error: 'Informe um título com pelo menos 2 caracteres.' })
  if (!MEDIA_TYPES.has(tipo)) return res.status(400).json({ error: 'Categoria inválida.' })

  try {
    let result = null

    if (tipo === 'Livro') {
      // 1. Tenta buscar no Google Books em Português
      try {
        result = await searchBook(query)
      } catch (googleError) {
        console.warn('Google Books indisponível ou tempo limite excedido:', googleError.message)
      }

      // 2. Se falhar ou não encontrar, usa Open Library como fallback seguro
      if (!result) {
        try {
          result = await searchOpenLibraryBook(query)
        } catch (openLibError) {
          console.warn('Open Library indisponível ou tempo limite excedido:', openLibError.message)
        }
      }
    } else {
      result = await searchEntertainment(query, tipo)
    }

    if (!result || !result.url_capa || synopsisMissing(result)) {
      try {
        const enrichment = await enrichMetadata(req, query, tipo, result)
        if (enrichment) {
          let coverResult = result
          if (!coverResult?.url_capa && enrichment.titulo.toLocaleLowerCase('pt-BR') !== query.toLocaleLowerCase('pt-BR')) {
            try {
              coverResult = tipo === 'Livro'
                ? (await searchBook(enrichment.titulo)) || (await searchOpenLibraryBook(enrichment.titulo))
                : await searchEntertainment(enrichment.titulo, tipo)
            } catch (coverError) {
              console.warn('Busca de capa após identificação do Gemini falhou:', coverError.message)
            }
          }

          result = {
            ...(coverResult || {}),
            titulo: coverResult?.titulo || enrichment.titulo,
            tipo,
            autor_criador: coverResult?.autor_criador || enrichment.autor_criador || 'Criador não informado',
            ano: coverResult?.ano ?? enrichment.ano,
            data_lancamento_oficial: coverResult?.data_lancamento_oficial || (enrichment.ano ? String(enrichment.ano) : ''),
            sinopse: synopsisMissing(coverResult) ? enrichment.sinopse : coverResult.sinopse,
            generos: coverResult?.generos || [],
            url_capa_oficial: coverResult?.url_capa_oficial || '',
            url_capa: coverResult?.url_capa || '',
            fonte: `${coverResult?.fonte ? `${coverResult.fonte} + ` : ''}Gemini`,
          }
        }
      } catch (geminiError) {
        console.warn('Enriquecimento Gemini indisponível:', geminiError.message)
      }
    }

    if (!result) return res.status(404).json({ error: 'Nenhuma obra encontrada para esse título.' })

    return res.status(200).json(result)
  } catch (error) {
    console.error('Erro na rota /api/searchMedia:', error)
    return res.status(502).json({ error: 'Não foi possível consultar a fonte agora. Tente novamente.' })
  }
}
