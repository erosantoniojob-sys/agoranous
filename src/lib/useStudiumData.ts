import { useCallback, useEffect, useRef, useState } from 'react'
import { readBrowserValue, writeBrowserValue } from './browserStorage'
import type { CommonplaceEntry, DiscoveryItem, EssayDraft, IntellectualJournalEntry, ReadingSession, StudiumData } from '../types/studium'
import { supabase, useAuth } from '../context/AuthContext'

const KEY = 'agora.studium.v1.'
const EMPTY: StudiumData = { commonplace: [], journal: [], sessions: [], essays: [], discoveries: [], trash: [], history: [] }
const id = (prefix: string) => `${prefix}_${crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`

export function useStudiumData() {
  const { user } = useAuth()
  const storageKey = KEY + (user?.id || 'anonymous')
  const isVisitor = !user || user.id.startsWith('guest_')
  const [hydratedStorageKey, setHydratedStorageKey] = useState<string | null>(null)
  const cloudReadyStorageKey = useRef<string | null>(null)
  const hydrationRun = useRef(0)
  const [data, setData] = useState<StudiumData>(() => ({ ...EMPTY, ...readBrowserValue<Partial<StudiumData>>(storageKey, {}) }))

  useEffect(() => {
    const run = ++hydrationRun.current
    let cancelled = false
    const isCurrent = () => !cancelled && hydrationRun.current === run
    const local = { ...EMPTY, ...readBrowserValue<Partial<StudiumData>>(storageKey, {}) }

    // Nunca reutilize a permissão de sincronização da conta anterior. O efeito
    // de persistência roda depois deste e também consulta esta ref, o que evita
    // publicar um estado transitório enquanto a nova conta ainda é carregada.
    cloudReadyStorageKey.current = null
    setHydratedStorageKey(null)

    if (isVisitor) {
      setData(local)
      setHydratedStorageKey(storageKey)
      return
    }

    const expectedUserId = user?.id
    void supabase.auth.getSession().then(async ({ data: sessionData }) => {
      const session = sessionData.session
      const token = session?.access_token
      if (!token || session.user.id !== expectedUserId) {
        if (isCurrent()) {
          setData(local)
          setHydratedStorageKey(storageKey)
        }
        return
      }

      try {
        const response = await fetch('/api/getUserData', { headers: { Authorization: `Bearer ${token}` } })
        if (!response.ok) throw new Error(`Falha ao recuperar o Studium (${response.status}).`)

        const responseData = await response.json() as unknown
        if (!responseData || typeof responseData !== 'object' || Array.isArray(responseData)) {
          throw new Error('A nuvem retornou o Studium em formato inválido.')
        }
        const cloud = responseData as { studium?: Partial<StudiumData> }
        const hasCloud = Object.prototype.hasOwnProperty.call(cloud, 'studium')
        if (hasCloud && (!cloud.studium || typeof cloud.studium !== 'object' || Array.isArray(cloud.studium))) {
          throw new Error('A cópia remota do Studium é inválida.')
        }
        if (isCurrent()) {
          // Uma coleção existente, mesmo com todas as listas vazias, é a fonte
          // de verdade; só recorremos ao cache se a coleção ainda não existe.
          setData({ ...EMPTY, ...(hasCloud ? cloud.studium : local) })
          // Só uma leitura remota válida para a própria conta pode liberar POST.
          cloudReadyStorageKey.current = storageKey
          setHydratedStorageKey(storageKey)
        }
      } catch {
        if (isCurrent()) {
          setData(local)
          setHydratedStorageKey(storageKey)
        }
      }
    })

    return () => { cancelled = true }
  }, [isVisitor, storageKey, user?.id])

  useEffect(() => {
    if (hydratedStorageKey !== storageKey) return
    writeBrowserValue(storageKey, data)
    if (isVisitor) return
    if (cloudReadyStorageKey.current !== storageKey) return

    const timer = window.setTimeout(() => { void supabase.auth.getSession().then(({ data: sessionData }) => {
      const session = sessionData.session
      const token = session?.access_token
      if (token && session.user.id === user?.id && cloudReadyStorageKey.current === storageKey) {
        void fetch('/api/syncUserData', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ collection: 'studium', data }) })
      }
    }) }, 650)
    return () => window.clearTimeout(timer)
  }, [data, hydratedStorageKey, isVisitor, storageKey, user?.id])

  const record = useCallback((action: string, label: string) => ({ id: id('history'), action, label, timestamp: new Date().toISOString() }), [])

  const addCommonplace = useCallback((entry: Omit<CommonplaceEntry, 'id' | 'createdAt' | 'nextReviewAt' | 'reviewIntervalDays' | 'reviewCount'>) => {
    const created: CommonplaceEntry = { ...entry, id: id('common'), createdAt: new Date().toISOString(), nextReviewAt: new Date().toISOString(), reviewIntervalDays: 1, reviewCount: 0 }
    setData(current => ({ ...current, commonplace: [created, ...current.commonplace], history: [record('Criou registro', created.title), ...current.history].slice(0, 100) }))
  }, [record])

  const reviewCommonplace = useCallback((entryId: string, quality: 'again' | 'good' | 'easy') => {
    setData(current => ({ ...current, commonplace: current.commonplace.map(entry => {
      if (entry.id !== entryId) return entry
      const interval = quality === 'again' ? 1 : quality === 'good' ? Math.max(3, Math.round(entry.reviewIntervalDays * 2.2)) : Math.max(7, Math.round(entry.reviewIntervalDays * 3.5))
      const next = new Date(); next.setDate(next.getDate() + interval)
      return { ...entry, reviewIntervalDays: interval, reviewCount: entry.reviewCount + 1, nextReviewAt: next.toISOString() }
    }) }))
  }, [])

  const addJournal = useCallback((entry: Omit<IntellectualJournalEntry, 'id'>) => {
    const created = { ...entry, id: id('journal') }
    setData(current => ({ ...current, journal: [created, ...current.journal.filter(item => item.date !== created.date)], history: [record('Registrou diário', created.date), ...current.history].slice(0, 100) }))
  }, [record])

  const addSession = useCallback((session: Omit<ReadingSession, 'id' | 'startedAt'>) => {
    const created = { ...session, id: id('session'), startedAt: new Date().toISOString() }
    setData(current => ({ ...current, sessions: [created, ...current.sessions], history: [record('Concluiu sessão', `${created.durationMinutes} min`), ...current.history].slice(0, 100) }))
  }, [record])

  const saveEssay = useCallback((draft: Omit<EssayDraft, 'id' | 'updatedAt'> & { id?: string }) => {
    const saved: EssayDraft = { ...draft, id: draft.id || id('essay'), updatedAt: new Date().toISOString() }
    setData(current => ({ ...current, essays: [saved, ...current.essays.filter(item => item.id !== saved.id)], history: [record('Salvou ensaio', saved.title), ...current.history].slice(0, 100) }))
    return saved
  }, [record])

  const addDiscovery = useCallback((item: Omit<DiscoveryItem, 'id' | 'createdAt'>) => {
    const created = { ...item, id: id('discovery'), createdAt: new Date().toISOString() }
    setData(current => ({ ...current, discoveries: [created, ...current.discoveries], history: [record('Adicionou descoberta', created.title), ...current.history].slice(0, 100) }))
  }, [record])

  const remove = useCallback((entity: 'commonplace' | 'journal' | 'essay' | 'discovery', itemId: string) => {
    setData(current => {
      const key = entity === 'discovery' ? 'discoveries' : entity === 'essay' ? 'essays' : entity
      const collection = current[key] as Array<{ id: string; title?: string; date?: string }>
      const item = collection.find(value => value.id === itemId)
      if (!item) return current
      const label = item.title || item.date || 'Registro'
      return { ...current, [key]: collection.filter(value => value.id !== itemId), trash: [{ id: id('trash'), entity, label, payload: item, deletedAt: new Date().toISOString() }, ...current.trash], history: [record('Moveu para lixeira', label), ...current.history].slice(0, 100) }
    })
  }, [record])

  const restore = useCallback((trashId: string) => {
    setData(current => {
      const deleted = current.trash.find(item => item.id === trashId)
      if (!deleted) return current
      const key = deleted.entity === 'discovery' ? 'discoveries' : deleted.entity === 'essay' ? 'essays' : deleted.entity
      return { ...current, [key]: [deleted.payload, ...(current[key] as unknown[])], trash: current.trash.filter(item => item.id !== trashId), history: [record('Restaurou registro', deleted.label), ...current.history].slice(0, 100) }
    })
  }, [record])

  const importData = useCallback((incoming: Partial<StudiumData>) => setData(current => ({ ...current, ...incoming, history: [record('Importou dados', 'Arquivo Studium'), ...current.history].slice(0, 100) })), [record])

  return { data, addCommonplace, reviewCommonplace, addJournal, addSession, saveEssay, addDiscovery, remove, restore, importData }
}
