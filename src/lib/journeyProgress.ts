import type { Aprendizado, CustomTrail, MediaItem, MediaType } from '../types/agora'

/**
 * Ponto único de configuração da economia de progresso da Ágora.
 * Os eventos, e não um contador solto no perfil, permanecem como fonte de
 * verdade para permitir auditoria, reprocessamento e ajustes futuros.
 */
export const XP_RULES = {
  media_added: 10,
  media_started: 20,
  book_completed: 150,
  film_completed: 60,
  series_completed: 100,
  game_completed: 80,
  learning_added: 25,
  reflection_added: 40,
  connection_created: 15,
  trail_created: 30,
  trail_completed: 300,
  study_session: 50,
  daily_mission: 0,
  legacy_catalog: 0,
} as const

export type JourneyEventType = keyof typeof XP_RULES

export type XpEvent = {
  id: string
  type: JourneyEventType
  xp: number
  sourceId?: string
  label: string
  createdAt: string
}

export type JourneyState = {
  events: XpEvent[]
  completedMissionKeys: string[]
  legacyMigrationApplied?: boolean
}

export const createEmptyJourneyState = (): JourneyState => ({
  events: [],
  completedMissionKeys: [],
  legacyMigrationApplied: false,
})

export const JOURNEY_LEVELS = [
  { name: 'Curioso', minimumXp: 0 },
  { name: 'Leitor', minimumXp: 160 },
  { name: 'Explorador', minimumXp: 420 },
  { name: 'Investigador', minimumXp: 820 },
  { name: 'Intérprete', minimumXp: 1_380 },
  { name: 'Pensador', minimumXp: 2_120 },
  { name: 'Erudito', minimumXp: 3_060 },
  { name: 'Cartógrafo', minimumXp: 4_240 },
  { name: 'Sábio', minimumXp: 5_700 },
] as const

export const DAILY_MISSIONS = [
  {
    id: 'advance-reading',
    eyebrow: 'Movimento atento',
    title: 'Continuar uma obra',
    description: 'Reserve 25 minutos para manter o fio daquilo que está formando você.',
    xp: 90,
  },
  {
    id: 'record-note',
    eyebrow: 'Memória viva',
    title: 'Registrar uma nota',
    description: 'Guarde uma ideia que mereça retornar quando o tempo passar.',
    xp: 60,
  },
  {
    id: 'make-connection',
    eyebrow: 'Cartografia',
    title: 'Aproximar duas ideias',
    description: 'Encontre um tema, uma tensão ou uma pergunta entre obras do acervo.',
    xp: 110,
  },
] as const

export type DailyMission = (typeof DAILY_MISSIONS)[number]

const isRecord = (value: unknown): value is Record<string, unknown> => (
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
)

const isJourneyEventType = (value: unknown): value is JourneyEventType => (
  typeof value === 'string' && value in XP_RULES
)

export function normalizeJourneyState(value: unknown): JourneyState {
  if (!isRecord(value)) return createEmptyJourneyState()

  const events = Array.isArray(value.events)
    ? value.events.flatMap((event): XpEvent[] => {
      if (!isRecord(event) || !isJourneyEventType(event.type) || typeof event.id !== 'string' || typeof event.xp !== 'number' || typeof event.label !== 'string' || typeof event.createdAt !== 'string') return []
      return [{
        id: event.id,
        type: event.type,
        xp: Math.max(0, Math.round(event.xp)),
        label: event.label,
        createdAt: event.createdAt,
        ...(typeof event.sourceId === 'string' ? { sourceId: event.sourceId } : {}),
      }]
    })
    : []

  return {
    events,
    completedMissionKeys: Array.isArray(value.completedMissionKeys)
      ? value.completedMissionKeys.filter((key): key is string => typeof key === 'string')
      : [],
    legacyMigrationApplied: Boolean(value.legacyMigrationApplied),
  }
}

export function createXpEvent(
  type: JourneyEventType,
  label: string,
  options: { sourceId?: string; xp?: number; createdAt?: string } = {},
): XpEvent {
  const timestamp = options.createdAt || new Date().toISOString()
  return {
    id: `xp_${crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`,
    type,
    xp: Math.max(0, Math.round(options.xp ?? XP_RULES[type])),
    label,
    createdAt: timestamp,
    ...(options.sourceId ? { sourceId: options.sourceId } : {}),
  }
}

export function completionEventType(type: MediaType): JourneyEventType {
  switch (type) {
    case 'Livro': return 'book_completed'
    case 'Filme': return 'film_completed'
    case 'Série': return 'series_completed'
    case 'Jogo': return 'game_completed'
    default: return 'book_completed'
  }
}

export function calculateJourneyXp(events: XpEvent[]): number {
  return events.reduce((total, event) => total + Math.max(0, event.xp), 0)
}

export function getLevelProgress(totalXp: number) {
  const levelIndex = JOURNEY_LEVELS.reduce((current, level, index) => (
    totalXp >= level.minimumXp ? index : current
  ), 0)
  const level = JOURNEY_LEVELS[levelIndex]
  const nextLevel = JOURNEY_LEVELS[levelIndex + 1]
  const startXp = level.minimumXp
  const endXp = nextLevel?.minimumXp ?? startXp + 1_800
  const earnedWithinLevel = Math.max(0, totalXp - startXp)
  const levelSpan = Math.max(1, endXp - startXp)

  return {
    level: levelIndex + 1,
    title: level.name,
    totalXp,
    earnedWithinLevel,
    levelSpan,
    progress: Math.min(100, Math.round((earnedWithinLevel / levelSpan) * 100)),
    nextTitle: nextLevel?.name || null,
  }
}

export function dayKey(date = new Date()): string {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export function missionKey(missionId: string, date = new Date()): string {
  return `${dayKey(date)}:${missionId}`
}

export function getStreak(events: XpEvent[]) {
  const activeDays = new Set(
    events
      .filter((event) => event.type !== 'legacy_catalog')
      .map((event) => dayKey(new Date(event.createdAt))),
  )

  const countBackwards = (from: Date) => {
    let current = new Date(from)
    let count = 0
    while (activeDays.has(dayKey(current))) {
      count += 1
      current.setDate(current.getDate() - 1)
    }
    return count
  }

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const current = activeDays.has(dayKey(today))
    ? countBackwards(today)
    : activeDays.has(dayKey(yesterday))
      ? countBackwards(yesterday)
      : 0

  const sortedDays = [...activeDays].sort()
  let longest = 0
  let run = 0
  let previous: Date | null = null
  for (const key of sortedDays) {
    const date = new Date(`${key}T12:00:00`)
    if (previous && Math.round((date.getTime() - previous.getTime()) / 86_400_000) === 1) run += 1
    else run = 1
    longest = Math.max(longest, run)
    previous = date
  }

  return { current, longest }
}

export function calculateLegacyCatalogXp(media: MediaItem[], learnings: Aprendizado[], trails: CustomTrail[]) {
  const mediaXp = media.reduce((total, item) => {
    const addition = XP_RULES.media_added
    const started = ['Lendo', 'Assistindo', 'Jogando', 'Concluído'].includes(item.status) ? XP_RULES.media_started : 0
    const completed = item.status === 'Concluído' ? XP_RULES[completionEventType(item.tipo)] : 0
    return total + addition + started + completed
  }, 0)
  const learningXp = learnings.length * XP_RULES.learning_added
  const trailXp = trails.length * XP_RULES.trail_created
  return mediaXp + learningXp + trailXp
}
