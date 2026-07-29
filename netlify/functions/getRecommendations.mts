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

type Candidate = { title: string; author: string; theme: string; reason: string }
type OpenLibraryDoc = { title?: string; author_name?: string[]; first_publish_year?: number; cover_i?: number; key?: string; subject?: string[] }

const cache = new Map<string, { expiresAt: number; recommendations: RecommendationItem[] }>()

const CANDIDATES: Candidate[] = [
  { title: 'The Symposium', author: 'Plato', theme: 'Filosofia Grega', reason: 'Amplia sua trilha de filosofia grega com uma investigação clássica sobre amor, beleza e formação da alma.' },
  { title: 'Nicomachean Ethics', author: 'Aristotle', theme: 'Virtudes', reason: 'Um fundamento direto para refletir sobre hábitos, virtudes e a vida boa.' },
  { title: 'The Brothers Karamazov', author: 'Fyodor Dostoyevsky', theme: 'Literatura Russa', reason: 'Uma escolha central para quem deseja aprofundar fé, liberdade e responsabilidade moral.' },
  { title: 'Notes from Underground', author: 'Fyodor Dostoyevsky', theme: 'Literatura Russa', reason: 'Curta, intensa e ideal para acompanhar seus estudos sobre consciência, liberdade e niilismo.' },
  { title: 'Confessions', author: 'Augustine of Hippo', theme: 'Teologia', reason: 'Une filosofia, memória, interioridade e teologia em uma obra formadora.' },
  { title: 'Orthodoxy', author: 'G. K. Chesterton', theme: 'Teologia', reason: 'Oferece uma defesa literária e acessível da cosmovisão cristã.' },
  { title: 'The Abolition of Man', author: 'C. S. Lewis', theme: 'Cosmovisão', reason: 'Aprofunda ética, educação e a formação do humano — assuntos alinhados às suas trilhas.' },
  { title: 'The Republic', author: 'Plato', theme: 'Filosofia', reason: 'Uma base para justiça, educação e a célebre alegoria da caverna.' },
  { title: 'The Poetics', author: 'Aristotle', theme: 'Criatividade', reason: 'Uma ponte entre forma, imaginação e criação — indicada para quem quer transformar repertório em expressão.' },
  { title: 'Letters to a Young Poet', author: 'Rainer Maria Rilke', theme: 'Poesia', reason: 'Uma companhia breve e exigente para nutrir a voz autoral, a observação e a paciência criativa.' },
]

const normalise = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')

function selectCandidates(tags: string[], existingTitles: string[]) {
  const profile = normalise(tags.join(' '))
  const available = CANDIDATES.filter((candidate) => !existingTitles.some((title) => normalise(title) === normalise(candidate.title)))
  const scored = available.map((candidate) => {
    const theme = normalise(candidate.theme)
    const score =
      (profile.includes('russa') && theme.includes('russa') ? 6 : 0) +
      (profile.includes('filosofia') && (theme.includes('filosofia') || theme.includes('virtudes')) ? 5 : 0) +
      (profile.includes('teologia') && (theme.includes('teologia') || theme.includes('cosmovisao')) ? 5 : 0) +
      (profile.includes('cosmovisao') && theme.includes('cosmovisao') ? 5 : 0) +
      ((profile.includes('poesia') || profile.includes('composicao') || profile.includes('escrita')) && (theme.includes('poesia') || theme.includes('criatividade')) ? 5 : 0) +
      (profile.includes(theme) ? 3 : 0) + 1
    return { candidate, score }
  })
  return scored.sort((a, b) => b.score - a.score).slice(0, 4).map(({ candidate }) => candidate)
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
    sinopse: `Edição catalogada pela Open Library, selecionada para a trilha de ${candidate.theme}.`,
    generos: [candidate.theme, ...(result.subject || []).slice(0, 2)],
    url_capa_oficial: cover,
    url_capa: cover,
    fonte: 'Open Library · capa do catálogo',
    motivoRecomendacao: candidate.reason,
  }
}

export default async (request: Request) => {
  try {
    const body = request.method === 'POST' ? await request.json().catch(() => ({})) as { tags?: string[]; existingTitles?: string[] } : {}
    const tags = Array.isArray(body.tags) ? body.tags.slice(0, 12) : ['Filosofia', 'Literatura Clássica', 'Teologia']
    const existingTitles = Array.isArray(body.existingTitles) ? body.existingTitles.slice(0, 100) : []
    const cacheKey = JSON.stringify({ tags, existingTitles })
    const cached = cache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) return Response.json({ recommendations: cached.recommendations, source: 'cache' })

    const recommendations: RecommendationItem[] = []
    for (const candidate of selectCandidates(tags, existingTitles)) {
      const item = await fetchBook(candidate)
      if (item) recommendations.push(item)
    }

    cache.set(cacheKey, { recommendations, expiresAt: Date.now() + 6 * 60 * 60 * 1000 })
    return Response.json({ timestamp: new Date().toISOString(), profileTags: tags, total: recommendations.length, source: 'Open Library', recommendations })
  } catch (error) {
    console.error('getRecommendations function error:', error)
    return Response.json({ error: 'Erro ao consultar recomendações.' }, { status: 500 })
  }
}

export const config: Config = {
  path: ['/api/getRecommendations', '/.netlify/functions/getRecommendations'],
}
