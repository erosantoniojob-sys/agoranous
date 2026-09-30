import catalog from './series.json'
import type { MediaItem } from '../types/agora'

export interface SeriesEntry {
  id: string
  title: string
  originalTitle: string
  year: number
  synopsis: string
  poster: string
  source: string
  checkedAt: string
  offers: { name: string; mode: string; url: string }[]
}

export const seriesCatalog: SeriesEntry[] = catalog
export const normalizeSeriesTitle = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]/g, '')

export function findSeriesMedia(series: SeriesEntry, items: MediaItem[]) {
  const titles = [series.title, series.originalTitle].map(normalizeSeriesTitle)
  return items.find(item => item.tipo === 'Série' && (
    item.fonte === `agora:series:${series.id}` ||
    ((!item.ano || item.ano === series.year) && titles.includes(normalizeSeriesTitle(item.titulo)))
  ))
}

export function seriesMediaInput(series: SeriesEntry): Omit<MediaItem, 'id' | 'criadoEm'> {
  return {
    titulo: series.title, tipo: 'Série', ano: series.year,
    sinopse: series.synopsis, url_capa: series.poster,
    status: 'Pendente', avaliacao_numerica: 0, progresso_percentual: 0,
    fonte: `agora:series:${series.id}`,
    progresso_detalhado: { atual: 0, unidade: 'episódios' },
  }
}
