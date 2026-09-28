import type { MediaItem } from './agora'

export type CatalogItem = Omit<MediaItem, 'id' | 'criadoEm' | 'status' | 'avaliacao_numerica'> & {
  catalogId: string
  sourceUrl: string
}
export interface CatalogResponse { items: CatalogItem[]; source: string }
