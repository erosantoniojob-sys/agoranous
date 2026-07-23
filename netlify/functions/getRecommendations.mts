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

const RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: 'rec_platao',
    titulo: 'A República',
    tipo: 'Livro',
    autor_criador: 'Platão',
    ano: -375,
    data_lancamento_oficial: '0375-01-01 a.C.',
    sinopse: 'Diálogo clássico fundacional da filosofia ocidental. Investiga a justiça na alma e no Estado, a Teoria das Idéias e a lendária Caverna de Platão.',
    generos: ['Filosofia', 'Clássico Grego', 'Ética'],
    url_capa_oficial: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop',
    url_capa: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop',
    fonte: 'Recomendado pelo Perfil de Filosofia',
    motivoRecomendacao: 'Essencial para aprofundar sua coleção de pensamento político e teoria do conhecimento.',
  },
  {
    id: 'rec_nietzsche',
    titulo: 'Assim Falou Zaratustra',
    tipo: 'Livro',
    autor_criador: 'Friedrich Nietzsche',
    ano: 1883,
    data_lancamento_oficial: '1883-05-15',
    sinopse: 'Poema filosófico denso no qual Zaratustra desce da montanha para anunciar o Übermensch (Além-do-Homem), o eterno retorno e a superação moral.',
    generos: ['Filosofia Existencial', 'Literatura Alemã'],
    url_capa_oficial: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop',
    url_capa: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop',
    fonte: 'Recomendado pelo Perfil de Filosofia',
    motivoRecomendacao: 'Obras-primas do existencialismo indicadas para expandir sua trilha de reflexões morais.',
  },
  {
    id: 'rec_dostoievski',
    titulo: 'Crime e Castigo',
    tipo: 'Livro',
    autor_criador: 'Fiódor Dostoiévski',
    ano: 1866,
    data_lancamento_oficial: '1866-01-01',
    sinopse: 'A profunda jornada psicológica do jovem Raskólnikov em São Petersburgo, confrontando culpa, redenção e os limites do utilitarismo moral.',
    generos: ['Literatura Clássica', 'Romance Psicológico'],
    url_capa_oficial: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
    url_capa: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
    fonte: 'Acervo de Literatura Clássica',
    motivoRecomendacao: 'Acompanhamento ideal para quem aprecia "Os Irmãos Karamázov".',
  },
  {
    id: 'rec_fifa',
    titulo: 'EA Sports FC 24 (FIFA)',
    tipo: 'Jogo',
    autor_criador: 'EA Vancouver / EA Sports',
    ano: 2023,
    data_lancamento_oficial: '2023-09-29',
    sinopse: 'Simulador esportivo de futebol mundial com o motor de física HyperMotionV, PlayStyles e mais de 19.000 atletas licenciados.',
    generos: ['Esporte', 'Simulação Competitiva'],
    url_capa_oficial: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    url_capa: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    fonte: 'Recomendado pelo Perfil de Jogos',
    motivoRecomendacao: 'Destaque no gênero esportivo e estratégia tática para momentos de lazer e maestria digital.',
  },
  {
    id: 'rec_bergman',
    titulo: 'O Sétimo Selo',
    tipo: 'Filme',
    autor_criador: 'Ingmar Bergman',
    ano: 1957,
    data_lancamento_oficial: '1957-02-16',
    sinopse: 'Marco do cinema mundial que explora a angústia existencial, a fé e o silêncio divino através de uma lendária partida de xadrez com a Morte.',
    generos: ['Cinema Clássico', 'Filosofia'],
    url_capa_oficial: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop',
    url_capa: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop',
    fonte: 'Cinemateca de Filosofia',
    motivoRecomendacao: 'Aclamado pelo equilíbrio estético e diálogos filosóficos marcantes.',
  },
]

export default async (request: Request) => {
  try {
    return Response.json({
      timestamp: new Date().toISOString(),
      perfil: 'Dark Academia / Filosofia & Cultura',
      total: RECOMMENDATIONS.length,
      recommendations: RECOMMENDATIONS,
    })
  } catch (error) {
    console.error('getRecommendations function error:', error)
    return Response.json({ error: 'Erro ao carregar recomendações.' }, { status: 500 })
  }
}

export const config: Config = {
  path: ['/api/getRecommendations', '/.netlify/functions/getRecommendations'],
}
