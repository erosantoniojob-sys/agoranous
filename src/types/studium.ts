export type CommonplaceKind = 'Citação' | 'Ideia' | 'Pergunta' | 'Argumento' | 'Contradição' | 'Vocabulário' | 'Referência'

export interface CommonplaceEntry {
  id: string
  kind: CommonplaceKind
  title: string
  content: string
  mediaIds: string[]
  tags: string[]
  createdAt: string
  nextReviewAt: string
  reviewIntervalDays: number
  reviewCount: number
}

export interface IntellectualJournalEntry {
  id: string
  date: string
  studied: string
  understood: string
  unresolved: string
  changed: string
  nextStep: string
}

export interface ReadingSession {
  id: string
  mediaId: string
  startedAt: string
  durationMinutes: number
  progressAmount: number
  progressUnit: 'páginas' | 'episódios' | 'minutos' | 'horas' | 'percentual'
  notes: string
  summary: string
}

export interface EssayDraft {
  id: string
  title: string
  thesis: string
  arguments: string[]
  objections: string[]
  referenceMediaIds: string[]
  content: string
  isPublic: boolean
  updatedAt: string
}

export interface DiscoveryItem {
  id: string
  title: string
  type: string
  reason: string
  sourceUrl: string
  status: 'Caixa de entrada' | 'Considerando' | 'Arquivado'
  createdAt: string
}

export interface DeletedStudiumItem {
  id: string
  entity: 'commonplace' | 'journal' | 'essay' | 'discovery'
  label: string
  payload: unknown
  deletedAt: string
}

export interface StudiumHistoryEntry {
  id: string
  action: string
  label: string
  timestamp: string
}

export interface StudiumData {
  commonplace: CommonplaceEntry[]
  journal: IntellectualJournalEntry[]
  sessions: ReadingSession[]
  essays: EssayDraft[]
  discoveries: DiscoveryItem[]
  trash: DeletedStudiumItem[]
  history: StudiumHistoryEntry[]
}
