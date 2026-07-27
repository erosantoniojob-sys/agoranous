const MEDIA_TYPES = new Set(['Livro', 'Filme', 'Série', 'Jogo'])

function cleanText(value = '', maxLength = 650) {
  const text = String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

function yearFrom(value) {
  const year = Number.parseInt(String(value || '').slice(0, 4), 10)
  return Number.isInteger(year) ? year : null
}

async function searchBook(query) {
  const url = new URL('https://www.googleapis.com/books/v1/volumes')
  url.searchParams.set('q', `intitle:${query}`)
  url.searchParams.set('maxResults', '1')
  url.searchParams.set('printType', 'books')

  const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new Error('Google Books indisponível.')

  const volume = (await response.json()).items?.[0]?.volumeInfo
  if (!volume) return null

  const cover = volume.imageLinks?.thumbnail?.replace('http://', 'https://')
    || volume.imageLinks?.smallThumbnail?.replace('http://', 'https://')

  return {
    titulo: volume.title || query,
    tipo: 'Livro',
    autor_criador: volume.authors?.join(', ') || 'Autor não informado',
    ano: yearFrom(volume.publishedDate),
    data_lancamento_oficial: volume.publishedDate || '',
    sinopse: cleanText(volume.description) || 'Sinopse não disponível na fonte consultada.',
    generos: volume.categories || [],
    url_capa_oficial: cover || '',
    url_capa: cover || '',
    fonte: 'Google Books',
  }
}

async function searchEntertainment(query, tipo) {
  const media = { Filme: 'movie', Série: 'tvShow', Jogo: 'software' }[tipo]
  const url = new URL('https://itunes.apple.com/search')
  url.searchParams.set('term', query)
  url.searchParams.set('media', media)
  url.searchParams.set('limit', '1')
  url.searchParams.set('country', 'br')

  const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new Error('Catálogo de mídia indisponível.')

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
    const result = tipo === 'Livro'
      ? await searchBook(query)
      : await searchEntertainment(query, tipo)

    if (!result) return res.status(404).json({ error: 'Nenhuma obra encontrada para esse título.' })
    return res.status(200).json(result)
  } catch (error) {
    console.error('Erro ao pesquisar mídia:', error)
    return res.status(502).json({ error: 'Não foi possível consultar a fonte agora. Tente novamente.' })
  }
}
