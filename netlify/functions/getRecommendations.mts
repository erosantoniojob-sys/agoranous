import type { Config } from '@netlify/functions'

type MediaType = 'Livro' | 'Filme' | 'Série' | 'Jogo'

type RecommendationItem = {
  id: string
  titulo: string
  tipo: MediaType
  autor_criador: string
  ano: number
  data_lancamento_oficial: string
  sinopse: string
  generos: string[]
  url_capa_oficial: string
  url_capa: string
  fonte: string
  motivoRecomendacao: string
}

type Candidate = {
  title: string
  author: string
  type: MediaType
  year: number
  themes: string[]
  relatedAuthors?: string[]
  synopsis: string
}
type TasteSignal = {
  titulo?: string
  tipo?: string
  autor_criador?: string
  generos?: string[]
  avaliacao_numerica?: number
  status?: string
}
type OpenLibraryDoc = { title?: string; author_name?: string[]; first_publish_year?: number; cover_i?: number; key?: string; subject?: string[] }

const cache = new Map<string, { expiresAt: number; recommendations: RecommendationItem[] }>()

const CANDIDATES: Candidate[] = [
  { title: 'The Symposium', author: 'Plato', type: 'Livro', year: -385, themes: ['filosofia grega', 'amor', 'classico'], relatedAuthors: ['platao', 'socrates'], synopsis: 'Um diálogo sobre amor, beleza e formação da alma.' },
  { title: 'Nicomachean Ethics', author: 'Aristotle', type: 'Livro', year: -340, themes: ['filosofia', 'virtudes', 'etica'], relatedAuthors: ['aristoteles'], synopsis: 'Uma investigação clássica sobre virtude, hábito e vida boa.' },
  { title: 'Crime and Punishment', author: 'Fyodor Dostoyevsky', type: 'Livro', year: 1866, themes: ['literatura russa', 'psicologico', 'moralidade', 'fe'], relatedAuthors: ['dostoievski', 'dostoevsky'], synopsis: 'Romance de consciência, culpa e redenção.' },
  { title: 'Notes from Underground', author: 'Fyodor Dostoyevsky', type: 'Livro', year: 1864, themes: ['literatura russa', 'existencialismo', 'niilismo'], relatedAuthors: ['dostoievski', 'dostoevsky'], synopsis: 'Uma descida breve e intensa à liberdade e à contradição humana.' },
  { title: 'Confessions', author: 'Augustine of Hippo', type: 'Livro', year: 397, themes: ['teologia', 'filosofia crista', 'interioridade'], relatedAuthors: ['agostinho'], synopsis: 'Memória, desejo e busca espiritual em uma obra fundadora.' },
  { title: 'The Abolition of Man', author: 'C. S. Lewis', type: 'Livro', year: 1943, themes: ['cosmovisao', 'etica', 'educacao', 'teologia'], relatedAuthors: ['c s lewis'], synopsis: 'Um ensaio sobre valores, educação e a formação do humano.' },
  { title: 'Stalker', author: 'Andrei Tarkovsky', type: 'Filme', year: 1979, themes: ['filosofia', 'ficcao cientifica', 'existencialismo', 'contemplacao'], synopsis: 'Uma viagem contemplativa sobre desejo, fé e conhecimento.' },
  { title: 'Arrival', author: 'Denis Villeneuve', type: 'Filme', year: 2016, themes: ['ficcao cientifica', 'linguagem', 'drama', 'filosofia'], synopsis: 'Ficção científica sensível sobre linguagem, tempo e encontro.' },
  { title: 'The Seventh Seal', author: 'Ingmar Bergman', type: 'Filme', year: 1957, themes: ['fe', 'filosofia', 'drama', 'classico'], synopsis: 'Um cavaleiro confronta a morte e as grandes perguntas da fé.' },
  { title: 'A Man for All Seasons', author: 'Fred Zinnemann', type: 'Filme', year: 1966, themes: ['historia', 'etica', 'fe', 'drama'], synopsis: 'Drama histórico sobre consciência, integridade e poder.' },
  { title: 'The Leftovers', author: 'Damon Lindelof', type: 'Série', year: 2014, themes: ['fe', 'luto', 'filosofia', 'drama'], synopsis: 'Uma série sobre perda, significado e as formas de seguir adiante.' },
  { title: 'Dark', author: 'Baran bo Odar', type: 'Série', year: 2017, themes: ['ficcao cientifica', 'tempo', 'mistério', 'filosofia'], synopsis: 'Mistério de ficção científica que conecta tempo, família e destino.' },
  { title: 'True Detective', author: 'Nic Pizzolatto', type: 'Série', year: 2014, themes: ['policial', 'psicologico', 'filosofia', 'drama'], synopsis: 'Antologia policial de atmosfera densa e perguntas existenciais.' },
  { title: 'The Good Place', author: 'Michael Schur', type: 'Série', year: 2016, themes: ['etica', 'filosofia', 'comedia', 'virtudes'], synopsis: 'Comédia inteligente que transforma dilemas éticos em narrativa.' },
]

const normalise = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')

function words(value: string) {
  return normalise(value).split(/[^a-z0-9]+/).filter((word) => word.length > 2)
}

function selectCandidates(tags: string[], existingTitles: string[], signals: TasteSignal[]) {
  const liked = signals.filter((item) => (item.avaliacao_numerica || 0) >= 4 || item.status === 'Concluído')
  const relevant = liked.length ? liked : signals
  const profileTerms = new Set([...tags.flatMap(words), ...relevant.flatMap((item) => (item.generos || []).flatMap(words))])
  const preferredTypes = relevant.reduce<Record<string, number>>((total, item) => {
    total[item.tipo || ''] = (total[item.tipo || ''] || 0) + Math.max(item.avaliacao_numerica || 1, 1)
    return total
  }, {})
  const favouriteAuthors = relevant.flatMap((item) => words(item.autor_criador || ''))
  const available = CANDIDATES.filter((candidate) => !existingTitles.some((title) => normalise(title) === normalise(candidate.title)))
  const scored = available.map((candidate) => {
    const candidateTerms = candidate.themes.flatMap(words)
    const matches = candidateTerms.filter((term) => profileTerms.has(term))
    const authorMatch = candidate.relatedAuthors?.some((author) => favouriteAuthors.includes(normalise(author)))
    const score = 1 + matches.length * 5 + (authorMatch ? 12 : 0) + Math.min(preferredTypes[candidate.type] || 0, 8)
    return { candidate, score, matches, authorMatch: Boolean(authorMatch) }
  }).sort((a, b) => b.score - a.score)

  // Garante variedade: depois das melhores escolhas, não repetimos um formato
  // até que livro, filme e série com afinidade tenham tido uma oportunidade.
  const selected: typeof scored = []
  const typeCount = new Map<string, number>()
  for (const item of scored) {
    if ((typeCount.get(item.candidate.type) || 0) >= 2) continue
    selected.push(item)
    typeCount.set(item.candidate.type, (typeCount.get(item.candidate.type) || 0) + 1)
    if (selected.length === 6) break
  }
  return selected
}

async function fetchBook(candidate: Candidate): Promise<RecommendationItem | null> {
  const query = new URLSearchParams({
    title: candidate.title,
    author: candidate.author,
    limit: '1',
    fields: 'title,author_name,first_publish_year,cover_i,key,subject',
  })
  const response = await fetch(`https://openlibrary.org/search.json?${query.toString()}`, {
    headers: { 'User-Agent': 'Agora/1.0 (personal study catalog)' },
  })
  if (!response.ok) return null
  const data = await response.json() as { docs?: OpenLibraryDoc[] }
  const result = data.docs?.[0]
  if (!result?.title || !result.cover_i) return null

  const author = result.author_name?.[0] || candidate.author
  const year = result.first_publish_year || 0
  const cover = `https://covers.openlibrary.org/b/id/${result.cover_i}-L.jpg`
  return {
    id: `openlibrary-${result.key?.replace(/\W/g, '-') || result.cover_i}`,
    titulo: result.title,
    tipo: 'Livro',
    autor_criador: author,
    ano: year,
    data_lancamento_oficial: year ? `${year}-01-01` : '',
    sinopse: candidate.synopsis,
    generos: [...candidate.themes, ...(result.subject || []).slice(0, 2)],
    url_capa_oficial: cover,
    url_capa: cover,
    fonte: 'Open Library · capa do catálogo',
    motivoRecomendacao: '',
  }
}

function staticRecommendation(candidate: Candidate): RecommendationItem {
  return {
    id: `curadoria-${normalise(candidate.title).replace(/\W/g, '-')}`,
    titulo: candidate.title,
    tipo: candidate.type,
    autor_criador: candidate.author,
    ano: candidate.year,
    data_lancamento_oficial: candidate.year > 0 ? `${candidate.year}-01-01` : '',
    sinopse: candidate.synopsis,
    generos: candidate.themes,
    url_capa_oficial: '',
    url_capa: '',
    fonte: 'Curadoria Ágora',
    motivoRecomendacao: '',
  }
}

function recommendationReason(item: ReturnType<typeof selectCandidates>[number]) {
  if (item.authorMatch) return 'Você já demonstrou afinidade com este autor ou com obras de sua tradição criativa.'
  if (item.matches.length) return `Conecta-se aos seus interesses em ${[...new Set(item.matches)].slice(0, 2).join(' e ')}.`
  return 'Uma escolha para ampliar seu repertório, respeitando os formatos que você mais aprecia.'
}

export default async (request: Request) => {
  try {
    const body = request.method === 'POST' ? await request.json().catch(() => ({})) as { tags?: string[]; existingTitles?: string[]; tasteSignals?: TasteSignal[] } : {}
    const tags = Array.isArray(body.tags) ? body.tags.slice(0, 12) : ['Filosofia', 'Literatura Clássica', 'Teologia']
    const existingTitles = Array.isArray(body.existingTitles) ? body.existingTitles.slice(0, 100) : []
    const tasteSignals = Array.isArray(body.tasteSignals) ? body.tasteSignals.slice(0, 100) : []
    const cacheKey = JSON.stringify({ tags, existingTitles, tasteSignals })
    const cached = cache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) return Response.json({ recommendations: cached.recommendations, source: 'cache' })

    const selected = selectCandidates(tags, existingTitles, tasteSignals)
    const recommendations = await Promise.all(selected.map(async (selection) => {
      const item = selection.candidate.type === 'Livro'
        ? await fetchBook(selection.candidate).catch(() => null)
        : staticRecommendation(selection.candidate)
      return item ? { ...item, motivoRecomendacao: recommendationReason(selection) } : null
    }))
    const availableRecommendations = recommendations.filter((item): item is RecommendationItem => Boolean(item))

    cache.set(cacheKey, { recommendations: availableRecommendations, expiresAt: Date.now() + 6 * 60 * 60 * 1000 })
    return Response.json({ timestamp: new Date().toISOString(), profileTags: tags, total: availableRecommendations.length, source: 'Curadoria Ágora + Open Library', recommendations: availableRecommendations })
  } catch (error) {
    console.error('getRecommendations function error:', error)
    return Response.json({ error: 'Erro ao consultar recomendações.' }, { status: 500 })
  }
}

export const config: Config = {
  path: ['/api/getRecommendations', '/.netlify/functions/getRecommendations'],
}
