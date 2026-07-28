import React, { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, Circle, Music2, Pause, Pencil, Play, Plus, RotateCcw, Settings2, SkipForward, Trash2, Volume2, X } from 'lucide-react'
import { readScholeValue, writeScholeValue } from '../lib/scholeStorage'
import { useAgoraStore } from '../store/useAgoraStore'

type Task = { id: string; label: string; completed: boolean }
type MusicSource = { id: string; name: string; url: string }
type TimerSettings = { focusMinutes: number; breakMinutes: number; goal: number }

const INITIAL_TASKS: Task[] = [
  { id: 'monografia', label: 'Revisão da Monografia', completed: false },
  { id: 'abnt', label: 'Formatação ABNT da Bibliografia', completed: false },
  { id: 'traducao', label: 'Tradução do Capítulo 1', completed: false },
]

const INITIAL_SOURCES: MusicSource[] = [
  { id: 'lofi', name: 'Lo-Fi', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
  { id: 'classic', name: 'Música Clássica', url: '' },
  { id: 'worship', name: 'Instrumental Worship', url: '' },
  { id: 'chants', name: 'Orthodox Catholic Chants', url: '' },
]

const DEFAULT_TIMER: TimerSettings = { focusMinutes: 25, breakMinutes: 5, goal: 4 }

const makeId = () => globalThis.crypto?.randomUUID?.() ?? `schole-${Date.now()}-${Math.random().toString(36).slice(2)}`
const formatTime = (totalSeconds: number) => `${Math.floor(totalSeconds / 60).toString().padStart(2, '0')}:${(totalSeconds % 60).toString().padStart(2, '0')}`
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))

function getYouTubeEmbedUrl(sourceUrl: string, autoplay = false) {
  try {
    const url = new URL(sourceUrl.trim())
    const isYoutube = /(^|\.)youtube\.com$|(^|\.)youtube-nocookie\.com$|(^|\.)youtu\.be$/.test(url.hostname)
    if (!isYoutube) return null

    const playlistId = url.searchParams.get('list')
    const videoId = url.hostname.endsWith('youtu.be') ? url.pathname.slice(1) : url.searchParams.get('v')
    const params = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' })
    if (autoplay) params.set('autoplay', '1')
    const embeddedVideoId = url.pathname.match(/\/embed\/([^/?]+)/)?.[1]
    if (playlistId) return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&${params.toString()}`
    const playableId = videoId || embeddedVideoId
    if (playableId) return `https://www.youtube.com/embed/${encodeURIComponent(playableId)}?${params.toString()}`
    return null
  } catch {
    return null
  }
}

export const ScholeView: React.FC = () => {
  const { setActiveTab } = useAgoraStore()
  const [tasks, setTasks] = useState<Task[]>(() => readScholeValue('tasks', INITIAL_TASKS))
  const [activeTaskId, setActiveTaskId] = useState(() => readScholeValue('active-task', INITIAL_TASKS[0].id))
  const [newTask, setNewTask] = useState('')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(() => readScholeValue('timer', DEFAULT_TIMER))
  const [secondsLeft, setSecondsLeft] = useState(() => readScholeValue('seconds-left', DEFAULT_TIMER.focusMinutes * 60))
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [cycles, setCycles] = useState(() => readScholeValue('cycles', 0))
  const [isTimerSettingsOpen, setIsTimerSettingsOpen] = useState(false)
  const [sources, setSources] = useState<MusicSource[]>(() => readScholeValue('music-sources', INITIAL_SOURCES))
  const [selectedSourceId, setSelectedSourceId] = useState(() => readScholeValue('music-source', INITIAL_SOURCES[0].id))
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isMusicEditorOpen, setIsMusicEditorOpen] = useState(false)
  const [musicName, setMusicName] = useState('')
  const [musicUrl, setMusicUrl] = useState('')
  const [musicError, setMusicError] = useState('')
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null)

  useEffect(() => writeScholeValue('tasks', tasks), [tasks])
  useEffect(() => writeScholeValue('active-task', activeTaskId), [activeTaskId])
  useEffect(() => writeScholeValue('timer', timerSettings), [timerSettings])
  useEffect(() => writeScholeValue('seconds-left', secondsLeft), [secondsLeft])
  useEffect(() => writeScholeValue('cycles', cycles), [cycles])
  useEffect(() => writeScholeValue('music-sources', sources), [sources])
  useEffect(() => writeScholeValue('music-source', selectedSourceId), [selectedSourceId])

  useEffect(() => {
    if (!isRunning) return
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current > 1) return current - 1
        if (isBreak) {
          setIsBreak(false)
          return timerSettings.focusMinutes * 60
        }
        setCycles((value) => Math.min(value + 1, timerSettings.goal))
        setIsBreak(true)
        return timerSettings.breakMinutes * 60
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isBreak, isRunning, timerSettings.breakMinutes, timerSettings.focusMinutes, timerSettings.goal])

  const activeTask = useMemo(() => tasks.find((task) => task.id === activeTaskId) ?? tasks[0], [activeTaskId, tasks])
  const selectedSource = sources.find((source) => source.id === selectedSourceId) ?? sources[0]
  const embedUrl = selectedSource ? getYouTubeEmbedUrl(selectedSource.url, isMusicPlaying) : null
  const focusDim = isRunning ? 'opacity-40' : 'opacity-100'

  const toggleTask = (id: string) => {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task))
    setActiveTaskId(id)
  }
  const addTask = (event: React.FormEvent) => {
    event.preventDefault()
    const label = newTask.trim()
    if (!label) return
    const task = { id: makeId(), label, completed: false }
    setTasks((current) => [...current, task])
    setActiveTaskId(task.id)
    setNewTask('')
  }
  const saveTaskEdit = (id: string) => {
    const label = editingLabel.trim()
    if (label) setTasks((current) => current.map((task) => task.id === id ? { ...task, label } : task))
    setEditingTaskId(null)
  }
  const removeTask = (id: string) => {
    setTasks((current) => {
      const remaining = current.filter((task) => task.id !== id)
      if (id === activeTaskId) setActiveTaskId(remaining[0]?.id ?? '')
      return remaining
    })
  }
  const resetTimer = () => {
    setIsRunning(false)
    setIsBreak(false)
    setSecondsLeft(timerSettings.focusMinutes * 60)
  }
  const applyTimerSettings = (event: React.FormEvent) => {
    event.preventDefault()
    const clean = {
      focusMinutes: clamp(timerSettings.focusMinutes, 1, 180),
      breakMinutes: clamp(timerSettings.breakMinutes, 1, 60),
      goal: clamp(timerSettings.goal, 1, 12),
    }
    setTimerSettings(clean)
    setIsRunning(false)
    setIsBreak(false)
    setSecondsLeft(clean.focusMinutes * 60)
    setIsTimerSettingsOpen(false)
  }
  const selectSource = (source: MusicSource) => {
    setSelectedSourceId(source.id)
    setIsMusicPlaying(Boolean(getYouTubeEmbedUrl(source.url)))
  }
  const openMusicEditor = (source?: MusicSource) => {
    setEditingSourceId(source?.id ?? null)
    setMusicName(source?.name ?? '')
    setMusicUrl(source?.url ?? '')
    setMusicError('')
    setIsMusicEditorOpen(true)
  }
  const saveMusicSource = (event: React.FormEvent) => {
    event.preventDefault()
    const url = musicUrl.trim()
    if (!getYouTubeEmbedUrl(url)) {
      setMusicError('Cole um link de vídeo ou playlist do YouTube válido.')
      return
    }
    const source = { id: editingSourceId ?? makeId(), name: musicName.trim() || 'Nova playlist', url }
    setSources((current) => editingSourceId ? current.map((item) => item.id === editingSourceId ? source : item) : [...current, source])
    setSelectedSourceId(source.id)
    setIsMusicPlaying(true)
    setMusicName('')
    setMusicUrl('')
    setMusicError('')
    setEditingSourceId(null)
    setIsMusicEditorOpen(false)
  }
  const deleteMusicSource = (id: string) => {
    setSources((current) => {
      const remaining = current.filter((source) => source.id !== id)
      if (id === selectedSourceId) {
        setSelectedSourceId(remaining[0]?.id ?? '')
        setIsMusicPlaying(false)
      }
      return remaining
    })
  }

  return (
    <div className="space-y-8 pb-12 font-sans animate-fadeIn">
      <main className="flex w-full flex-col">
        <header className="flex items-center justify-between">
          <button type="button" onClick={() => setActiveTab('inicio')} className="group inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-accent-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />Voltar ao início</button>
          <div className="text-right"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-gold">Foco e contemplação</p><h1 className="font-serif text-2xl font-bold tracking-wide text-text-primary">Scholé</h1></div>
        </header>

        <section className="grid items-center gap-10 py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] lg:gap-16">
          <div>
            <div className={`mb-5 flex items-center justify-between transition-opacity duration-500 ${isRunning ? 'opacity-40' : 'opacity-100'}`}><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-gold">Intenção desta sessão</p><span className="text-[10px] text-text-secondary">{tasks.filter((task) => task.completed).length}/{tasks.length} concluídas</span></div>
            <div className="mb-5 h-px w-12 bg-accent-gold/70" />
            <div className="space-y-1" role="list" aria-label="Tarefas da sessão">
              {tasks.map((task) => {
                const isActive = task.id === activeTask?.id
                return <div key={task.id} className={`group relative flex items-center gap-2 rounded-xl px-3 py-2 transition-all ${isActive && isRunning ? 'bg-bg-surface/60' : 'hover:bg-bg-surface/60'} ${task.completed ? 'opacity-30' : isRunning && !isActive ? 'opacity-40' : 'opacity-100'}`} role="listitem">
                  <button type="button" onClick={() => toggleTask(task.id)} className="flex min-w-0 flex-1 items-center gap-4 py-2 text-left focus-visible:outline-2 focus-visible:outline-accent-gold" aria-pressed={task.completed}>
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${task.completed ? 'border-accent-gold bg-accent-gold text-bg-base' : 'border-text-secondary/60 group-hover:border-accent-gold'}`}>{task.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}</span>
                    <span className={`text-sm font-medium sm:text-base ${task.completed ? 'text-text-secondary line-through' : ''}`}>{task.label}</span>{isActive && !task.completed && <Circle className="ml-auto h-2 w-2 shrink-0 fill-accent-gold text-accent-gold" />}
                  </button>
                  <button type="button" onClick={() => { setEditingTaskId(task.id); setEditingLabel(task.label) }} className="p-1.5 text-text-secondary opacity-0 transition-opacity hover:text-accent-gold group-hover:opacity-100 focus:opacity-100" aria-label={`Editar ${task.label}`}><Pencil className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => removeTask(task.id)} className="p-1.5 text-text-secondary opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100 focus:opacity-100" aria-label={`Excluir ${task.label}`}><Trash2 className="h-3.5 w-3.5" /></button>
                  {editingTaskId === task.id && <form onSubmit={(event) => { event.preventDefault(); saveTaskEdit(task.id) }} className="absolute z-10 flex w-[min(95vw,360px)] items-center gap-2 rounded-xl border border-accent-gold/50 bg-bg-elevated p-2 shadow-2xl"><input autoFocus value={editingLabel} onChange={(event) => setEditingLabel(event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 py-1 text-sm outline-none" /><button className="rounded-md bg-accent-gold px-2 py-1 text-xs font-bold text-bg-base">Salvar</button><button type="button" onClick={() => setEditingTaskId(null)} className="p-1 text-text-secondary"><X className="h-4 w-4" /></button></form>}
                </div>
              })}
            </div>
            <form onSubmit={addTask} className={`mt-4 flex items-center gap-2 px-3 transition-opacity duration-500 ${isRunning ? 'opacity-40' : 'opacity-100'}`}><Plus className="h-4 w-4 text-accent-gold" /><input value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Adicionar tarefa à sessão" className="min-w-0 flex-1 border-b border-text-primary/15 bg-transparent py-2 text-sm outline-none placeholder:text-text-secondary/60 focus:border-accent-gold" /><button className="text-xs font-semibold text-accent-gold hover:text-accent-gold-bright">Adicionar</button></form>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex items-center gap-2"><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text-secondary">{isBreak ? 'Pausa restauradora' : 'O tempo oportuno'}</p><button type="button" onClick={() => setIsTimerSettingsOpen((open) => !open)} className="text-text-secondary hover:text-accent-gold" aria-label="Configurar Pomodoro"><Settings2 className="h-4 w-4" /></button></div>
            {isTimerSettingsOpen && <form onSubmit={applyTimerSettings} className="mb-5 grid w-full max-w-sm grid-cols-3 gap-2 rounded-xl border border-text-primary/10 bg-bg-surface p-3 text-left"><label className="text-[10px] text-text-secondary">Foco<input type="number" min="1" max="180" value={timerSettings.focusMinutes} onChange={(event) => setTimerSettings((value) => ({ ...value, focusMinutes: Number(event.target.value) }))} className="mt-1 w-full rounded-md border border-text-primary/15 bg-bg-base p-1.5 text-sm text-text-primary outline-none focus:border-accent-gold" /></label><label className="text-[10px] text-text-secondary">Pausa<input type="number" min="1" max="60" value={timerSettings.breakMinutes} onChange={(event) => setTimerSettings((value) => ({ ...value, breakMinutes: Number(event.target.value) }))} className="mt-1 w-full rounded-md border border-text-primary/15 bg-bg-base p-1.5 text-sm text-text-primary outline-none focus:border-accent-gold" /></label><label className="text-[10px] text-text-secondary">Ciclos<input type="number" min="1" max="12" value={timerSettings.goal} onChange={(event) => setTimerSettings((value) => ({ ...value, goal: Number(event.target.value) }))} className="mt-1 w-full rounded-md border border-text-primary/15 bg-bg-base p-1.5 text-sm text-text-primary outline-none focus:border-accent-gold" /></label><button className="col-span-3 mt-1 rounded-lg bg-accent-gold py-1.5 text-xs font-bold text-bg-base">Aplicar duração</button></form>}
            <div className={`relative grid h-64 w-64 place-items-center rounded-full border transition-all duration-500 sm:h-72 sm:w-72 ${isRunning ? 'border-accent-gold shadow-[0_0_0_12px_rgba(212,175,55,0.04),0_0_42px_rgba(212,175,55,0.18)]' : 'border-text-primary/15'}`}><div className="absolute inset-3 rounded-full border border-text-primary/5" /><div className="relative"><time className={`font-serif text-6xl font-bold tabular-nums tracking-tight sm:text-7xl ${isRunning ? 'text-accent-gold' : 'text-text-primary'}`}>{formatTime(secondsLeft)}</time><p className="mt-2 text-xs text-text-secondary">{activeTask?.label || 'Crie uma tarefa para começar'}</p></div></div>
            <div className="mt-7 flex items-center gap-3" aria-label="Controles do Pomodoro"><button type="button" onClick={resetTimer} className="grid h-10 w-10 place-items-center rounded-full text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary" aria-label="Reiniciar cronômetro"><RotateCcw className="h-4 w-4" /></button><button type="button" onClick={() => setIsRunning((running) => !running)} disabled={!activeTask} className="grid h-12 w-12 place-items-center rounded-full bg-accent-gold text-bg-base shadow-lg shadow-accent-gold/20 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40" aria-label={isRunning ? 'Pausar cronômetro' : 'Iniciar cronômetro'}>{isRunning ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current translate-x-0.5" />}</button><button type="button" onClick={() => { setIsRunning(false); setIsBreak(true); setSecondsLeft(timerSettings.breakMinutes * 60) }} className="grid h-10 w-10 place-items-center rounded-full text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary" aria-label="Iniciar pausa"><SkipForward className="h-4 w-4" /></button></div>
            <p className="mt-5 text-xs text-text-secondary">Ciclos: <span className="text-text-primary">{cycles}/{timerSettings.goal}</span></p>
          </div>
        </section>

        <footer className={`rounded-2xl border border-text-primary/10 bg-bg-surface/45 px-4 py-3.5 backdrop-blur-sm transition-opacity duration-500 sm:px-5 ${focusDim}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-accent-gold/25 bg-bg-elevated text-accent-gold"><Music2 className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate text-xs font-semibold text-text-primary">{selectedSource?.name || 'Escolha uma playlist'}</p><p className="truncate text-[11px] text-text-secondary">YouTube · playlists e vídeos adicionados por você</p></div><button type="button" disabled={!embedUrl} onClick={() => setIsMusicPlaying((playing) => !playing)} className="ml-1 text-accent-gold hover:text-accent-gold-bright disabled:opacity-40" aria-label={isMusicPlaying ? 'Parar música' : 'Tocar música'}>{isMusicPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}</button><Volume2 className="hidden h-4 w-4 text-text-secondary sm:block" /></div><div className="flex flex-wrap gap-2">{sources.map((source) => <button key={source.id} type="button" onClick={() => selectSource(source)} className={`rounded-full border px-3 py-1.5 text-[10px] font-medium transition-colors ${selectedSourceId === source.id ? 'border-accent-gold text-accent-gold' : 'border-text-primary/20 text-text-secondary hover:border-text-primary/45 hover:text-text-primary'}`}>{source.name}</button>)}<button type="button" onClick={() => openMusicEditor()} className="rounded-full border border-accent-gold/50 px-3 py-1.5 text-[10px] font-medium text-accent-gold hover:bg-accent-gold/10"><Plus className="mr-1 inline h-3 w-3" />Playlist</button></div></div>
          {isMusicEditorOpen && <div className="mt-4 border-t border-text-primary/10 pt-3"><form onSubmit={saveMusicSource} className="grid gap-2 sm:grid-cols-[0.75fr_1.5fr_auto]"><input value={musicName} onChange={(event) => setMusicName(event.target.value)} placeholder="Nome da playlist" className="rounded-lg border border-text-primary/15 bg-bg-base px-3 py-2 text-xs outline-none focus:border-accent-gold" /><input value={musicUrl} onChange={(event) => { setMusicUrl(event.target.value); setMusicError('') }} placeholder="Cole o link do YouTube ou YouTube Music" className="rounded-lg border border-text-primary/15 bg-bg-base px-3 py-2 text-xs outline-none focus:border-accent-gold" /><button className="rounded-lg bg-accent-gold px-4 py-2 text-xs font-bold text-bg-base">{editingSourceId ? 'Salvar' : 'Adicionar'}</button>{musicError && <p className="sm:col-span-3 text-xs text-red-300">{musicError}</p>}<p className="sm:col-span-3 text-[10px] text-text-secondary">Aceita links de vídeos e playlists. O botão de tocar abre o player real abaixo.</p></form><div className="mt-3 space-y-1">{sources.map((source) => <div key={source.id} className="flex items-center gap-2 rounded-lg bg-bg-base/50 px-3 py-2 text-xs"><span className="min-w-0 flex-1 truncate text-text-secondary">{source.name} {source.url ? '· configurada' : '· sem link'}</span><button type="button" onClick={() => openMusicEditor(source)} className="text-accent-gold hover:text-accent-gold-bright">Editar</button><button type="button" onClick={() => deleteMusicSource(source.id)} className="text-text-secondary hover:text-red-400">Excluir</button></div>)}</div></div>}
          {isMusicPlaying && embedUrl && <div className="mt-4 overflow-hidden rounded-xl border border-text-primary/10 bg-black"><iframe key={embedUrl} title={`YouTube: ${selectedSource.name}`} src={embedUrl} className="h-44 w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /><p className="px-3 py-2 text-[10px] text-text-secondary">Se o navegador bloquear o início automático, clique em reproduzir dentro do player do YouTube.</p></div>}
          {selectedSource && !embedUrl && <p className="mt-3 text-xs text-text-secondary">Esta opção ainda não tem um link configurado. Clique em “Playlist” e cole uma URL do YouTube.</p>}
        </footer>
      </main>
    </div>
  )
}
