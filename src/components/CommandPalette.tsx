import React, { useEffect, useMemo, useState } from 'react'
import { BookOpen, Brain, Compass, Feather, Hourglass, Map, Plus, Search, X } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { useModalAccessibility } from '../lib/useModalAccessibility'
import type { ViewName } from '../lib/viewPreload'

export const CommandPalette: React.FC = () => {
  const { mediaItems, setSelectedMedia, setActiveTab, setIsSearchOpen } = useAgoraStore()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useModalAccessibility<HTMLDivElement>(open, () => setOpen(false))
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(value => !value) }
    }
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler)
  }, [])
  const navigate = (view: ViewName) => { setActiveTab(view); setOpen(false); setQuery('') }
  const commands = [
    { label: 'Abrir início', icon: Compass, run: () => navigate('inicio') },
    { label: 'Abrir Studium', icon: Brain, run: () => navigate('studium') },
    { label: 'Abrir trilhas', icon: Map, run: () => navigate('trilhas') },
    { label: 'Iniciar foco', icon: Hourglass, run: () => navigate('schole') },
    { label: 'Abrir Poíesis', icon: Feather, run: () => navigate('poiesis') },
    { label: 'Adicionar obra', icon: Plus, run: () => { setIsSearchOpen(true); setOpen(false) } },
  ]
  const results = useMemo(() => {
    const term = query.toLocaleLowerCase('pt-BR').trim()
    const base = commands.filter(command => !term || command.label.toLocaleLowerCase('pt-BR').includes(term))
    const works = mediaItems.filter(item => term && item.titulo.toLocaleLowerCase('pt-BR').includes(term)).slice(0, 6).map(item => ({ label: item.titulo, icon: BookOpen, run: () => { setSelectedMedia(item); setOpen(false) } }))
    return [...base, ...works]
  }, [mediaItems, query])
  if (!open) return null
  return <div className="fixed inset-0 z-[80] flex items-start justify-center bg-bg-base/80 p-4 pt-[12vh] backdrop-blur-md"><button type="button" className="fixed inset-0" onClick={() => setOpen(false)} aria-label="Fechar comandos" /><div ref={ref} role="dialog" aria-modal="true" aria-label="Paleta de comandos" className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-accent-gold/25 bg-bg-surface shadow-2xl"><div className="flex items-center gap-3 border-b border-text-primary/10 p-4"><Search className="h-5 w-5 text-accent-gold" /><input data-autofocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Busque uma obra ou comando…" className="flex-1 bg-transparent text-sm outline-none" /><kbd className="rounded border border-text-primary/15 px-2 py-1 text-[10px] text-text-secondary">Esc</kbd><button type="button" onClick={() => setOpen(false)} aria-label="Fechar"><X className="h-4 w-4" /></button></div><div className="max-h-80 overflow-auto p-2">{results.map((command, index) => { const Icon = command.icon; return <button key={`${command.label}-${index}`} type="button" onClick={command.run} className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm hover:bg-bg-elevated"><Icon className="h-4 w-4 text-accent-gold" />{command.label}</button> })}{!results.length ? <p className="p-6 text-center text-sm text-text-secondary">Nenhum resultado.</p> : null}</div></div></div>
}
