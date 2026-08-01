import React, { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Bold, Feather, Heading2, History, Italic, List, Music2, Plus, Quote, RotateCcw, Sparkles, Trash2, Underline } from 'lucide-react'
import { readScholeValue, writeScholeValue } from '../lib/scholeStorage'
import { useAgoraStore } from '../store/useAgoraStore'

type CreativeMode = 'poesia' | 'composicoes'
type CreativeEntry = { id: string; title: string; content: string; updatedAt: string }
type CreativeCatalog = Record<CreativeMode, CreativeEntry[]>
type CreativeBackup = { id: string; savedAt: string; catalog: CreativeCatalog }

const emptyCatalog: CreativeCatalog = { poesia: [], composicoes: [] }
const prompts = {
  poesia: 'Comece por uma imagem, uma memória ou uma pergunta que mereça ganhar ritmo.',
  composicoes: 'Escreva uma frase, um refrão ou uma progressão que queira continuar ouvindo.',
}
const placeholder = {
  poesia: 'Versos, imagens, rascunhos…',
  composicoes: 'Letra, refrão, acordes, ideias de arranjo…',
}

const getInitialCatalog = (): CreativeCatalog => {
  const saved = readScholeValue<CreativeCatalog>('poiesis.catalog', emptyCatalog)
  if (Array.isArray(saved?.poesia) || Array.isArray(saved?.composicoes)) {
    return { poesia: Array.isArray(saved.poesia) ? saved.poesia : [], composicoes: Array.isArray(saved.composicoes) ? saved.composicoes : [] }
  }

  const poetry = readScholeValue('poiesis.poetry', '')
  const composition = readScholeValue('poiesis.compositions', '')
  const now = new Date().toISOString()
  return {
    poesia: poetry ? [{ id: 'poetry-legacy', title: 'Poema sem título', content: poetry, updatedAt: now }] : [],
    composicoes: composition ? [{ id: 'composition-legacy', title: 'Composição sem título', content: composition, updatedAt: now }] : [],
  }
}

const hasCreations = (catalog: CreativeCatalog) => catalog.poesia.length > 0 || catalog.composicoes.length > 0

export const PoiesisView: React.FC = () => {
  const { setActiveTab, userProfile } = useAgoraStore()
  const [mode, setMode] = useState<CreativeMode>('poesia')
  const [catalog, setCatalog] = useState<CreativeCatalog>(getInitialCatalog)
  const [backups, setBackups] = useState<CreativeBackup[]>(() => readScholeValue<CreativeBackup[]>('poiesis.backups', []))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const lastBackupAtRef = useRef(0)
  const entries = catalog[mode]
  const selected = entries.find((entry) => entry.id === selectedId) || null
  const Icon = mode === 'poesia' ? Feather : Music2
  const name = userProfile.nome?.trim().split(' ')[0]

  useEffect(() => writeScholeValue('poiesis.catalog', catalog), [catalog])
  useEffect(() => writeScholeValue('poiesis.backups', backups), [backups])
  useEffect(() => setSelectedId(catalog[mode][0]?.id || null), [mode])
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = selected?.content || ''
  }, [selectedId, mode])

  const backupCatalog = (snapshot: CreativeCatalog, force = false) => {
    if (!hasCreations(snapshot)) return
    const now = Date.now()
    if (!force && now - lastBackupAtRef.current < 15_000) return
    lastBackupAtRef.current = now
    setBackups((current) => {
      const serialized = JSON.stringify(snapshot)
      if (JSON.stringify(current[0]?.catalog) === serialized) return current
      return [{ id: `backup-${now}`, savedAt: new Date(now).toISOString(), catalog: JSON.parse(serialized) as CreativeCatalog }, ...current].slice(0, 15)
    })
  }

  const createEntry = () => {
    backupCatalog(catalog, true)
    const entry: CreativeEntry = {
      id: crypto.randomUUID?.() ?? `creation-${Date.now()}`,
      title: mode === 'poesia' ? 'Poema sem título' : 'Composição sem título',
      content: '',
      updatedAt: new Date().toISOString(),
    }
    setCatalog((current) => ({ ...current, [mode]: [entry, ...current[mode]] }))
    setSelectedId(entry.id)
  }

  const updateEntry = (updates: Partial<CreativeEntry>) => {
    if (!selected) return
    backupCatalog(catalog)
    setCatalog((current) => ({
      ...current,
      [mode]: current[mode].map((entry) => entry.id === selected.id ? { ...entry, ...updates, updatedAt: new Date().toISOString() } : entry),
    }))
  }

  const removeEntry = () => {
    if (!selected || !window.confirm(`Excluir “${selected.title}”?`)) return
    backupCatalog(catalog, true)
    setCatalog((current) => ({ ...current, [mode]: current[mode].filter((entry) => entry.id !== selected.id) }))
    setSelectedId(entries.find((entry) => entry.id !== selected.id)?.id || null)
  }

  const format = (command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    updateEntry({ content: editorRef.current?.innerHTML || '' })
  }

  const selectMode = (nextMode: CreativeMode) => {
    setMode(nextMode)
    setSelectedId(catalog[nextMode][0]?.id || null)
  }

  const restoreLatestBackup = () => {
    const latest = backups[0]
    if (!latest || !window.confirm(`Restaurar a cópia de ${new Date(latest.savedAt).toLocaleString('pt-BR')}? As alterações atuais serão preservadas em uma nova cópia.`)) return
    backupCatalog(catalog, true)
    setCatalog(latest.catalog)
    setSelectedId(latest.catalog[mode][0]?.id || null)
  }

  return (
    <div className="space-y-6 pb-12 font-sans animate-fadeIn">
      <header className="flex items-center justify-between">
        <button type="button" onClick={() => setActiveTab('inicio')} className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary transition-colors hover:text-accent-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"><ArrowLeft className="h-4 w-4" />Voltar</button>
        <div className="text-right"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-gold">Oficina criativa</p><h1 className="font-serif text-2xl font-bold">Poíesis</h1></div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-accent-gold/25 bg-gradient-to-br from-bg-surface via-bg-elevated/60 to-bg-surface p-6 sm:p-8">
        <Sparkles className="h-5 w-5 text-accent-gold" />
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-gold">ποίησις · o ato de criar</p>
        <h2 className="mt-2 font-serif text-2xl font-bold text-text-primary">{name ? `${name}, dê forma ao que está vivo em você.` : 'Dê forma ao que está vivo em você.'}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">Guarde poemas e composições em um acervo pessoal — cada criação tem seu próprio caderno.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs"><span className="inline-flex items-center gap-1.5 text-emerald-300"><History className="h-3.5 w-3.5" />Cópias de segurança automáticas ativas</span>{backups.length > 0 && <button type="button" onClick={restoreLatestBackup} className="inline-flex items-center gap-1.5 rounded-lg border border-accent-gold/40 px-3 py-1.5 font-semibold text-accent-gold transition-colors hover:bg-accent-gold/10"><RotateCcw className="h-3.5 w-3.5" />Restaurar último rascunho</button>}</div>
      </section>

      <section className="rounded-2xl border border-text-primary/10 bg-bg-surface p-4 sm:p-6">
        <div className="mb-5 flex gap-2 border-b border-text-primary/10 pb-3" role="tablist" aria-label="Formatos de criação">
          <button type="button" role="tab" aria-selected={mode === 'poesia'} onClick={() => selectMode('poesia')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${mode === 'poesia' ? 'bg-accent-gold text-bg-base' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}><Feather className="h-3.5 w-3.5" />Poesia</button>
          <button type="button" role="tab" aria-selected={mode === 'composicoes'} onClick={() => selectMode('composicoes')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${mode === 'composicoes' ? 'bg-accent-gold text-bg-base' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}><Music2 className="h-3.5 w-3.5" />Composições</button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="rounded-xl border border-text-primary/10 bg-bg-base/35 p-3">
            <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">{entries.length} {entries.length === 1 ? 'criação' : 'criações'}</span><button type="button" onClick={createEntry} className="inline-flex items-center gap-1 rounded-lg bg-accent-gold px-2.5 py-1.5 text-[10px] font-bold text-bg-base"><Plus className="h-3.5 w-3.5" />Nova</button></div>
            <div className="max-h-64 space-y-1 overflow-y-auto lg:max-h-[480px]">
              {entries.map((entry) => <button type="button" key={entry.id} onClick={() => setSelectedId(entry.id)} className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${entry.id === selectedId ? 'bg-accent-gold/15 text-text-primary' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}><span className="block truncate font-serif text-sm font-bold">{entry.title || 'Sem título'}</span><span className="mt-1 block text-[10px] opacity-70">{new Date(entry.updatedAt).toLocaleDateString('pt-BR')}</span></button>)}
              {!entries.length && <p className="p-3 text-xs leading-relaxed text-text-secondary">Seu acervo está esperando a primeira criação.</p>}
            </div>
          </aside>

          <div className="min-w-0">
            {selected ? <>
              <div className="mb-3 flex items-center gap-2"><Icon className="h-4 w-4 shrink-0 text-accent-gold" /><input value={selected.title} onChange={(event) => updateEntry({ title: event.target.value })} aria-label="Título da criação" placeholder="Título" className="min-w-0 flex-1 bg-transparent font-serif text-xl font-bold text-text-primary outline-none placeholder:text-text-secondary/50" /><button type="button" onClick={removeEntry} className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-red-950/40 hover:text-red-400" aria-label="Excluir criação"><Trash2 className="h-4 w-4" /></button></div>
              <div className="mb-3 flex flex-wrap gap-1 rounded-xl border border-text-primary/10 bg-bg-base/60 p-1.5" aria-label="Opções de formatação">
                <FormatButton label="Negrito" onClick={() => format('bold')}><Bold className="h-3.5 w-3.5" /></FormatButton>
                <FormatButton label="Itálico" onClick={() => format('italic')}><Italic className="h-3.5 w-3.5" /></FormatButton>
                <FormatButton label="Sublinhado" onClick={() => format('underline')}><Underline className="h-3.5 w-3.5" /></FormatButton>
                <FormatButton label="Título" onClick={() => format('formatBlock', 'h2')}><Heading2 className="h-3.5 w-3.5" /></FormatButton>
                <FormatButton label="Lista" onClick={() => format('insertUnorderedList')}><List className="h-3.5 w-3.5" /></FormatButton>
                <FormatButton label="Citação" onClick={() => format('formatBlock', 'blockquote')}><Quote className="h-3.5 w-3.5" /></FormatButton>
              </div>
              <div ref={editorRef} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" data-placeholder={placeholder[mode]} onInput={() => updateEntry({ content: editorRef.current?.innerHTML || '' })} className="min-h-[360px] rounded-xl border border-text-primary/15 bg-bg-base/60 px-4 py-3 font-serif text-base leading-relaxed text-text-primary outline-none transition-colors empty:before:pointer-events-none empty:before:text-sm empty:before:font-sans empty:before:text-text-secondary/50 empty:before:content-[attr(data-placeholder)] focus:border-accent-gold [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-accent-gold [&_blockquote]:pl-4 [&_h2]:my-3 [&_h2]:text-xl [&_h2]:font-bold [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5" />
              <p className="mt-2 text-right text-[10px] text-text-secondary">Salvo automaticamente neste navegador · histórico de até 15 cópias</p>
            </> : <div className="grid min-h-[320px] place-items-center rounded-xl border border-dashed border-text-primary/15 bg-bg-base/25 p-6 text-center"><div><Icon className="mx-auto h-6 w-6 text-accent-gold" /><p className="mt-3 font-serif text-lg font-bold text-text-primary">Comece uma nova criação</p><p className="mt-1 max-w-sm text-xs text-text-secondary">{prompts[mode]}</p><button type="button" onClick={createEntry} className="mt-4 rounded-lg bg-accent-gold px-4 py-2 text-xs font-bold text-bg-base">Criar {mode === 'poesia' ? 'poema' : 'composição'}</button></div></div>}
          </div>
        </div>
      </section>
    </div>
  )
}

const FormatButton: React.FC<{ label: string; onClick: () => void; children: React.ReactNode }> = ({ label, onClick, children }) => (
  <button type="button" title={label} aria-label={label} onMouseDown={(event) => event.preventDefault()} onClick={onClick} className="rounded-md p-2 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-accent-gold">{children}</button>
)
