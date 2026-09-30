import type { MediaType } from '../types/agora'
import type { CatalogResponse } from '../types/catalog'

export async function searchCatalog(query: string, tipo: MediaType, signal?: AbortSignal): Promise<CatalogResponse> {
  if (tipo === 'Curso') {
    const { coursesCatalog } = await import('../data/courses')
    const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
    const term = normalize(query.trim())
    return { items: coursesCatalog.filter(course => normalize(`${course.titulo} ${course.autor_criador}`).includes(term)), source: 'Catálogo de cursos Ágora' }
  }
  const response = await fetch('/api/searchMedia', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, tipo, mode: 'catalog' }), signal,
  })
  const data = await response.json().catch(() => null)
  if (!response.ok || !Array.isArray(data?.items)) throw new Error(data?.error || 'A busca está indisponível. Tente novamente.')
  return data as CatalogResponse
}
