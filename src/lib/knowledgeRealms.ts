import type { MediaItem, MediaType } from '../types/agora'

export type KnowledgeRealmDefinition = {
  id: string
  name: string
  accent: string
  terms: readonly string[]
  includeTypes?: readonly MediaType[]
  fallbackTypes?: readonly MediaType[]
}

export type MediaFormatDefinition = {
  type: MediaType
  label: string
  helper: string
  alwaysVisible?: boolean
}

export const MEDIA_FORMAT_DEFINITIONS: readonly MediaFormatDefinition[] = [
  { type: 'Livro', label: 'Livros', helper: 'Livros e ensaios', alwaysVisible: true },
  { type: 'Filme', label: 'Filmes', helper: 'Filmes e documentários', alwaysVisible: true },
  { type: 'Série', label: 'Séries', helper: 'Narrativas longas', alwaysVisible: true },
  { type: 'Jogo', label: 'Jogos', helper: 'Experiências interativas', alwaysVisible: true },
  { type: 'App', label: 'Aplicativos', helper: 'Ferramentas digitais' },
  { type: 'Podcast', label: 'Podcasts', helper: 'Conversas e investigações' },
  { type: 'Curso', label: 'Cursos', helper: 'Percursos de formação' },
] as const

/**
 * High-level subjects used by both the knowledge map and catalogue filters.
 * Terms are normalized before matching, so source metadata may contain or omit
 * Portuguese diacritics and may use common English category names.
 */
export const KNOWLEDGE_REALM_DEFINITIONS: readonly KnowledgeRealmDefinition[] = [
  {
    id: 'filosofia',
    name: 'Filosofia',
    accent: '#ddb86b',
    terms: ['filosof', 'etica', 'ethic', 'cosmovis', 'worldview', 'epistem', 'metafis', 'existencial', 'stoic', 'moral', 'virtude', 'virtue'],
  },
  {
    id: 'literatura',
    name: 'Literatura',
    accent: '#d68b65',
    terms: ['literat', 'romance', 'novel', 'ficcao', 'fiction', 'poesia', 'poetry', 'conto', 'short stor', 'narrativ', 'ensaio', 'essay'],
    fallbackTypes: ['Livro'],
  },
  {
    id: 'historia',
    name: 'História',
    accent: '#a78bd2',
    terms: ['historia', 'history', 'historical', 'politica', 'politic', 'civilizacao', 'civilization', 'sociedade', 'society', 'social', 'biografia', 'biograph', 'government', 'econom', 'sociolog', 'anthropolog'],
  },
  {
    id: 'cinema',
    name: 'Cinema & Séries',
    accent: '#80b4c9',
    terms: ['cinema', 'documentario', 'documentary', 'animacao', 'animation'],
    includeTypes: ['Filme', 'Série'],
  },
  {
    id: 'tecnologia',
    name: 'Ciência & Tecnologia',
    accent: '#76b79d',
    terms: ['tecnologia', 'technology', 'ciencia', 'science', 'digital', 'computacao', 'computer', 'software', 'programacao', 'engineering', 'inteligencia artificial'],
    includeTypes: ['App'],
  },
  {
    id: 'jogos',
    name: 'Jogos & Estratégia',
    accent: '#77a8d1',
    terms: ['jogo', 'game', 'esporte', 'sport', 'estrateg', 'competit', 'simulacao', 'simulation'],
    includeTypes: ['Jogo'],
  },
  {
    id: 'espiritualidade',
    name: 'Espiritualidade',
    accent: '#d9aa84',
    terms: ['teologia', 'theology', 'espiritual', 'spiritual', 'devocional', 'devotional', 'religiao', 'religion', 'religious', 'crist', 'christian', 'biblia', 'bible', 'fe', 'faith', 'mistic', 'mystic', 'sacred'],
  },
] as const

const GENERIC_GENRE_LABELS = new Set([
  'livro',
  'filme',
  'serie',
  'jogo',
  'app',
  'aplicativo',
  'podcast',
  'curso',
])

export const normalizeCategoryText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/\s+/g, ' ')
    .trim()

const meaningfulGenres = (item: Pick<MediaItem, 'generos'>) =>
  (item.generos || [])
    .map(normalizeCategoryText)
    .filter((genre) => genre && !GENERIC_GENRE_LABELS.has(genre))

export const findKnowledgeRealm = (idOrName: string) => {
  const normalized = normalizeCategoryText(idOrName)
  return KNOWLEDGE_REALM_DEFINITIONS.find(
    (realm) => realm.id === normalized || normalizeCategoryText(realm.name) === normalized,
  )
}

export const mediaMatchesRealm = (
  item: Pick<MediaItem, 'generos' | 'tipo'>,
  realmOrId: KnowledgeRealmDefinition | string,
) => {
  const realm = typeof realmOrId === 'string' ? findKnowledgeRealm(realmOrId) : realmOrId
  if (!realm) return false
  if (realm.includeTypes?.includes(item.tipo)) return true

  const genres = meaningfulGenres(item)
  const normalizedTerms = realm.terms.map(normalizeCategoryText)
  if (genres.some((genre) => normalizedTerms.some((term) => {
    if (term.length > 3) return genre.includes(term)
    return genre.split(/[^a-z0-9]+/).includes(term)
  }))) return true

  return genres.length === 0 && Boolean(realm.fallbackTypes?.includes(item.tipo))
}

export const countExploredKnowledgeRealms = (items: readonly Pick<MediaItem, 'generos' | 'tipo'>[]) =>
  KNOWLEDGE_REALM_DEFINITIONS.filter((realm) => items.some((item) => mediaMatchesRealm(item, realm))).length

export const mediaTypeFilter = (type: MediaType) => `type:${type}`
export const knowledgeRealmFilter = (realmId: string) => `realm:${realmId}`
export const genreFilter = (genre: string) => `genre:${genre}`

const findMediaFormat = (typeOrLabel: string) => {
  const normalized = normalizeCategoryText(typeOrLabel)
  return MEDIA_FORMAT_DEFINITIONS.find(
    (format) => normalizeCategoryText(format.type) === normalized || normalizeCategoryText(format.label) === normalized,
  )
}

export const isAllMediaFilter = (filter: string) => {
  const normalized = normalizeCategoryText(filter)
  return !normalized || normalized === 'todos' || normalized === 'all'
}

/** Accepts canonical filters and labels stored by versions prior to v4. */
export const mediaMatchesFilter = (
  item: Pick<MediaItem, 'generos' | 'tipo'>,
  filter: string,
) => {
  if (isAllMediaFilter(filter)) return true

  if (filter.startsWith('type:')) {
    return item.tipo === findMediaFormat(filter.slice('type:'.length))?.type
  }

  if (filter.startsWith('realm:')) {
    return mediaMatchesRealm(item, filter.slice('realm:'.length))
  }

  const genreQuery = filter.startsWith('genre:') ? filter.slice('genre:'.length) : filter
  const legacyFormat = findMediaFormat(genreQuery)
  if (legacyFormat) return item.tipo === legacyFormat.type

  const legacyRealm = findKnowledgeRealm(genreQuery)
  if (legacyRealm) return mediaMatchesRealm(item, legacyRealm)

  const normalizedGenreQuery = normalizeCategoryText(genreQuery)
  return (item.generos || []).some((genre) => normalizeCategoryText(genre).includes(normalizedGenreQuery))
}

export const getMediaFilterLabel = (filter: string) => {
  if (isAllMediaFilter(filter)) return 'Todos'
  if (filter.startsWith('type:')) return findMediaFormat(filter.slice('type:'.length))?.label || filter.slice('type:'.length)
  if (filter.startsWith('realm:')) return findKnowledgeRealm(filter.slice('realm:'.length))?.name || filter.slice('realm:'.length)
  if (filter.startsWith('genre:')) return filter.slice('genre:'.length)
  return findMediaFormat(filter)?.label || findKnowledgeRealm(filter)?.name || filter
}
