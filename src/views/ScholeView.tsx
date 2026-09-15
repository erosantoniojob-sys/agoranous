import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, BarChart3, Check, ChevronRight, Circle, Clock3, Keyboard, LayoutDashboard, Music2, Pause, Play, Plus, Settings2, Sparkles, Trash2, X } from 'lucide-react'
import { readScholeValue, writeScholeValue } from '../lib/scholeStorage'
import { useAgoraStore } from '../store/useAgoraStore'
import { PomodoroDial } from '../components/PomodoroDial'

type TaskStatus = 'backlog' | 'doing' | 'done'
type Task = { id: string; label: string; completed: boolean; status: TaskStatus; category: string; priority: 'Baixa' | 'Média' | 'Alta'; estimate: number; dueDate?: string }
type TimerSettings = { focusMinutes: number; breakMinutes: number; goal: number }
type StudySession = { id: string; startedAt: string; minutes: number; taskId?: string }
type Tab = 'focus' | 'tasks' | 'stats'
type MusicSource = { id: string; name: string; url: string }
type TimerPhase = 'focus' | 'break'
type TimerRuntime = { phase: TimerPhase; running: boolean; secondsLeft: number; endsAt: number | null; sessionStartedAt: string | null; taskId?: string; taskLabel?: string }

const INITIAL_TASKS: Task[] = [
  { id: 'monografia', label: 'Revisão da Monografia', completed: false, status: 'doing', category: 'Pesquisa', priority: 'Alta', estimate: 50 },
  { id: 'abnt', label: 'Formatação ABNT da Bibliografia', completed: false, status: 'backlog', category: 'Acadêmico', priority: 'Média', estimate: 25 },
  { id: 'traducao', label: 'Tradução do Capítulo 1', completed: false, status: 'backlog', category: 'Idiomas', priority: 'Baixa', estimate: 25 },
]
const DEFAULT_TIMER: TimerSettings = { focusMinutes: 25, breakMinutes: 5, goal: 4 }
const TIMER_PRESETS = [
  { name: 'Centelha', detail: '15 + 3', focusMinutes: 15, breakMinutes: 3 },
  { name: 'Ritual', detail: '25 + 5', focusMinutes: 25, breakMinutes: 5 },
  { name: 'Imersão', detail: '50 + 10', focusMinutes: 50, breakMinutes: 10 },
] as const
const INITIAL_SOURCES: MusicSource[] = [
  { id: 'lofi', name: 'Lo-fi de estudo', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
  { id: 'classica', name: 'Clássicos instrumentais', url: '' },
  { id: 'natureza', name: 'Chuva e natureza', url: '' },
  { id: 'sacra', name: 'Cantos contemplativos', url: '' },
]
const STATUS_META: Record<TaskStatus, { title: string; description: string; color: string }> = {
  backlog: { title: 'A cultivar', description: 'próximos estudos', color: 'border-text-primary/15' },
  doing: { title: 'Em contemplação', description: 'foco atual', color: 'border-accent-gold/45' },
  done: { title: 'Concluídas', description: 'saberes colhidos', color: 'border-emerald-400/35' },
}
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `schole-${Date.now()}-${Math.random().toString(36).slice(2)}`
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))
const normalizeTasks = (saved: unknown): Task[] => Array.isArray(saved) ? saved.map((item: Partial<Task>, index) => ({
  id: item.id || `legacy-${index}`, label: item.label || 'Nova tarefa', completed: Boolean(item.completed), status: item.status || (item.completed ? 'done' : 'backlog'), category: item.category || 'Estudos', priority: item.priority || 'Média', estimate: item.estimate || 25, dueDate: item.dueDate,
})) : INITIAL_TASKS

const readInitialRuntime = (settings: TimerSettings): TimerRuntime => {
  const legacySeconds = readScholeValue('seconds-left', settings.focusMinutes * 60)
  const fallback: TimerRuntime = { phase: 'focus', running: false, secondsLeft: legacySeconds, endsAt: null, sessionStartedAt: null }
  const saved = readScholeValue<Partial<TimerRuntime> | null>('timer-runtime', null)
  if (!saved || (saved.phase !== 'focus' && saved.phase !== 'break')) return fallback
  const phaseSeconds = (saved.phase === 'break' ? settings.breakMinutes : settings.focusMinutes) * 60
  const endsAt = typeof saved.endsAt === 'number' && Number.isFinite(saved.endsAt) ? saved.endsAt : null
  const running = Boolean(saved.running && endsAt)
  const secondsLeft = running && endsAt
    ? Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
    : clamp(Number(saved.secondsLeft), 0, phaseSeconds)
  return {
    phase: saved.phase,
    running,
    secondsLeft,
    endsAt: running ? endsAt : null,
    sessionStartedAt: typeof saved.sessionStartedAt === 'string' ? saved.sessionStartedAt : null,
    taskId: typeof saved.taskId === 'string' ? saved.taskId : undefined,
    taskLabel: typeof saved.taskLabel === 'string' ? saved.taskLabel : undefined,
  }
}

function getYouTubeEmbedUrl(sourceUrl: string, autoplay = false) {
  try {
    const url = new URL(sourceUrl.trim())
    if (!/(^|\.)youtube\.com$|(^|\.)youtube-nocookie\.com$|(^|\.)youtu\.be$/.test(url.hostname)) return null
    const playlistId = url.searchParams.get('list')
    const videoId = url.hostname.endsWith('youtu.be') ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.match(/\/embed\/([^/?]+)/)?.[1]
    const params = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' })
    if (autoplay) params.set('autoplay', '1')
    if (playlistId) return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&${params.toString()}`
    return videoId ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${params.toString()}` : null
  } catch { return null }
}

let bellContext: AudioContext | null = null

function playBell(kind: 'start' | 'end') {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const context = bellContext ?? new AudioContextClass()
    bellContext = context
    void context.resume()
    const notes = kind === 'start' ? [523.25, 659.25] : [659.25, 523.25, 783.99]
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'; oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, context.currentTime + index * .18)
      gain.gain.exponentialRampToValueAtTime(.12, context.currentTime + index * .18 + .02)
      gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + index * .18 + .16)
      oscillator.connect(gain); gain.connect(context.destination)
      oscillator.start(context.currentTime + index * .18); oscillator.stop(context.currentTime + index * .18 + .18)
    })
  } catch { /* Audio is optional and must never block the timer. */ }
}

export const ScholeView: React.FC = () => {
  const { activeTab, setActiveTab } = useAgoraStore()
  const [tab, setTab] = useState<Tab>('focus')
  const [tasks, setTasks] = useState<Task[]>(() => normalizeTasks(readScholeValue<unknown>('tasks', INITIAL_TASKS)))
  const [activeTaskId, setActiveTaskId] = useState(() => readScholeValue('active-task', INITIAL_TASKS[0].id))
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(() => readScholeValue('timer', DEFAULT_TIMER))
  const [settingsDraft, setSettingsDraft] = useState<TimerSettings>(timerSettings)
  const [timerRuntime, setTimerRuntime] = useState<TimerRuntime>(() => readInitialRuntime(timerSettings))
  const [cycles, setCycles] = useState(() => readScholeValue('cycles', 0))
  const [sessions, setSessions] = useState<StudySession[]>(() => readScholeValue('study-sessions', []))
  const [soundEnabled, setSoundEnabled] = useState(() => readScholeValue('sound-enabled', true))
  const [sources, setSources] = useState<MusicSource[]>(() => readScholeValue('music-sources', INITIAL_SOURCES))
  const [selectedSourceId, setSelectedSourceId] = useState(() => readScholeValue('music-source', INITIAL_SOURCES[0].id))
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isPlaylistEditorOpen, setIsPlaylistEditorOpen] = useState(false)
  const [playlistName, setPlaylistName] = useState('')
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [playlistError, setPlaylistError] = useState('')
  const [isTimerSettingsOpen, setIsTimerSettingsOpen] = useState(false)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [draft, setDraft] = useState({ label: '', category: 'Estudos', priority: 'Média' as Task['priority'], estimate: 25, dueDate: '', status: 'backlog' as TaskStatus })
  const transitionedDeadline = useRef<number | null>(null)
  const originalTitle = useRef(document.title)

  const isRunning = timerRuntime.running
  const isBreak = timerRuntime.phase === 'break'
  const secondsLeft = timerRuntime.secondsLeft

  useEffect(() => writeScholeValue('tasks', tasks), [tasks])
  useEffect(() => writeScholeValue('active-task', activeTaskId), [activeTaskId])
  useEffect(() => writeScholeValue('timer', timerSettings), [timerSettings])
  useEffect(() => writeScholeValue('timer-runtime', timerRuntime), [timerRuntime])
  useEffect(() => writeScholeValue('cycles', cycles), [cycles])
  useEffect(() => writeScholeValue('study-sessions', sessions), [sessions])
  useEffect(() => writeScholeValue('sound-enabled', soundEnabled), [soundEnabled])
  useEffect(() => writeScholeValue('music-sources', sources), [sources])
  useEffect(() => writeScholeValue('music-source', selectedSourceId), [selectedSourceId])

  useEffect(() => {
    if (!timerRuntime.running || !timerRuntime.endsAt) return

    const synchronize = () => {
      if (!timerRuntime.endsAt) return
      const nextSeconds = Math.max(0, Math.ceil((timerRuntime.endsAt - Date.now()) / 1000))
      if (nextSeconds > 0) {
        if (activeTab === 'schole') {
          setTimerRuntime(current => current.secondsLeft === nextSeconds ? current : { ...current, secondsLeft: nextSeconds })
        } else {
          const time = `${Math.floor(nextSeconds / 60).toString().padStart(2, '0')}:${(nextSeconds % 60).toString().padStart(2, '0')}`
          document.title = `${time} · ${timerRuntime.phase === 'break' ? 'Pausa' : 'Foco'} | Àgora`
        }
        return
      }
      if (transitionedDeadline.current === timerRuntime.endsAt) return
      transitionedDeadline.current = timerRuntime.endsAt

      if (timerRuntime.phase === 'focus') {
        setSessions(current => [...current, {
          id: makeId(),
          startedAt: timerRuntime.sessionStartedAt || new Date().toISOString(),
          minutes: timerSettings.focusMinutes,
          taskId: timerRuntime.taskId,
        }])
        setCycles(value => Math.min(value + 1, timerSettings.goal))
        if (soundEnabled) playBell('end')
        const breakSeconds = timerSettings.breakMinutes * 60
        setTimerRuntime({ phase: 'break', running: true, secondsLeft: breakSeconds, endsAt: Date.now() + breakSeconds * 1000, sessionStartedAt: null })
        return
      }

      if (soundEnabled) playBell('start')
      const focusSeconds = timerSettings.focusMinutes * 60
      const nextTask = tasks.find(task => task.id === activeTaskId) ?? tasks.find(task => task.status !== 'done')
      setTimerRuntime({
        phase: 'focus',
        running: true,
        secondsLeft: focusSeconds,
        endsAt: Date.now() + focusSeconds * 1000,
        sessionStartedAt: new Date().toISOString(),
        taskId: nextTask?.id,
        taskLabel: nextTask?.label,
      })
    }

    synchronize()
    const timer = window.setInterval(synchronize, 500)
    document.addEventListener('visibilitychange', synchronize)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', synchronize)
    }
  }, [activeTab, activeTaskId, soundEnabled, tasks, timerRuntime.endsAt, timerRuntime.phase, timerRuntime.running, timerRuntime.sessionStartedAt, timerRuntime.taskId, timerSettings.breakMinutes, timerSettings.focusMinutes, timerSettings.goal])

  const activeTask = useMemo(() => tasks.find(task => task.id === activeTaskId) ?? tasks.find(task => task.status !== 'done'), [activeTaskId, tasks])
  const timerTaskLabel = !isBreak && (timerRuntime.running || timerRuntime.sessionStartedAt)
    ? timerRuntime.taskLabel || tasks.find(task => task.id === timerRuntime.taskId)?.label || 'Intenção em foco'
    : activeTask?.label
  const totalMinutes = sessions.reduce((sum, session) => sum + session.minutes, 0)
  const todayKey = new Date().toDateString()
  const todayMinutes = sessions.filter(session => new Date(session.startedAt).toDateString() === todayKey).reduce((sum, session) => sum + session.minutes, 0)
  const days = Array.from({ length: 7 }, (_, offset) => { const date = new Date(); date.setDate(date.getDate() - (6 - offset)); return date })
  const maxDaily = Math.max(60, ...days.map(date => sessions.filter(s => new Date(s.startedAt).toDateString() === date.toDateString()).reduce((sum, s) => sum + s.minutes, 0)))

  const updateTask = (id: string, patch: Partial<Task>) => setTasks(current => current.map(task => task.id === id ? { ...task, ...patch } : task))
  const moveTask = (task: Task, status: TaskStatus) => { updateTask(task.id, { status, completed: status === 'done' }); if (status === 'doing') setActiveTaskId(task.id) }
  const selectFocusTask = (id: string) => {
    if (isRunning && !isBreak) return
    setActiveTaskId(id)
    if (!isBreak && timerRuntime.sessionStartedAt) {
      setTimerRuntime(current => ({ ...current, taskId: id, taskLabel: tasks.find(task => task.id === id)?.label }))
    }
  }
  const addTask = (event: React.FormEvent) => { event.preventDefault(); if (!draft.label.trim()) return; const task = { ...draft, id: makeId(), label: draft.label.trim(), completed: draft.status === 'done' }; setTasks(current => [...current, task]); setActiveTaskId(task.id); setDraft({ label: '', category: 'Estudos', priority: 'Média', estimate: 25, dueDate: '', status: 'backlog' }); setIsTaskFormOpen(false) }
  const startTimer = () => {
    if (!activeTask && !isBreak) return
    const duration = Math.max(1, timerRuntime.secondsLeft)
    setTimerRuntime(current => ({
      ...current,
      running: true,
      secondsLeft: duration,
      endsAt: Date.now() + duration * 1000,
      sessionStartedAt: current.phase === 'focus' ? current.sessionStartedAt || new Date().toISOString() : null,
      taskId: current.phase === 'focus' ? current.taskId || activeTask?.id : undefined,
      taskLabel: current.phase === 'focus' ? current.taskLabel || activeTask?.label : undefined,
    }))
    if (cycles >= timerSettings.goal && !isBreak) setCycles(0)
    if (soundEnabled) playBell('start')
  }
  const pauseTimer = () => {
    setTimerRuntime(current => ({
      ...current,
      running: false,
      secondsLeft: current.endsAt ? Math.max(1, Math.ceil((current.endsAt - Date.now()) / 1000)) : current.secondsLeft,
      endsAt: null,
    }))
  }
  const toggleTimer = () => isRunning ? pauseTimer() : startTimer()
  const resetTimer = () => setTimerRuntime({ phase: 'focus', running: false, secondsLeft: timerSettings.focusMinutes * 60, endsAt: null, sessionStartedAt: null })
  const skipPhase = () => {
    const nextPhase: TimerPhase = isBreak ? 'focus' : 'break'
    const nextSeconds = (nextPhase === 'focus' ? timerSettings.focusMinutes : timerSettings.breakMinutes) * 60
    setTimerRuntime({
      phase: nextPhase,
      running: true,
      secondsLeft: nextSeconds,
      endsAt: Date.now() + nextSeconds * 1000,
      sessionStartedAt: nextPhase === 'focus' ? new Date().toISOString() : null,
      taskId: nextPhase === 'focus' ? activeTask?.id : undefined,
      taskLabel: nextPhase === 'focus' ? activeTask?.label : undefined,
    })
    if (soundEnabled) playBell(nextPhase === 'focus' ? 'start' : 'end')
  }
  const applyTimerSettings = (event: React.FormEvent) => {
    event.preventDefault()
    const clean = { focusMinutes: clamp(settingsDraft.focusMinutes, 1, 180), breakMinutes: clamp(settingsDraft.breakMinutes, 1, 60), goal: clamp(settingsDraft.goal, 1, 12) }
    setTimerSettings(clean)
    setSettingsDraft(clean)
    setTimerRuntime({ phase: 'focus', running: false, secondsLeft: clean.focusMinutes * 60, endsAt: null, sessionStartedAt: null })
    setCycles(value => Math.min(value, clean.goal))
    setIsTimerSettingsOpen(false)
  }
  const applyPreset = (focusMinutes: number, breakMinutes: number) => {
    const settings = { ...timerSettings, focusMinutes, breakMinutes }
    setTimerSettings(settings)
    setSettingsDraft(settings)
    setTimerRuntime({ phase: 'focus', running: false, secondsLeft: focusMinutes * 60, endsAt: null, sessionStartedAt: null })
  }
  useEffect(() => {
    if (isRunning) {
      const time = `${Math.floor(secondsLeft / 60).toString().padStart(2, '0')}:${(secondsLeft % 60).toString().padStart(2, '0')}`
      document.title = `${time} · ${isBreak ? 'Pausa' : 'Foco'} | Àgora`
    } else {
      document.title = originalTitle.current
    }
  }, [isBreak, isRunning, secondsLeft])
  useEffect(() => () => { document.title = originalTitle.current }, [])
  const shortcutActions = useRef({ toggleTimer, resetTimer, skipPhase })
  shortcutActions.current = { toggleTimer, resetTimer, skipPhase }
  useEffect(() => {
    if (activeTab !== 'schole' || tab !== 'focus') return
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.matches('input, select, textarea, button, [contenteditable="true"]')) return
      if (event.code === 'Space') { event.preventDefault(); shortcutActions.current.toggleTimer() }
      else if (event.key.toLowerCase() === 'r') shortcutActions.current.resetTimer()
      else if (event.key.toLowerCase() === 'b') shortcutActions.current.skipPhase()
      else if (event.key.toLowerCase() === 'm') setSoundEnabled(value => !value)
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [activeTab, tab])
  const selectedSource = sources.find(source => source.id === selectedSourceId) ?? sources[0]
  const embedUrl = selectedSource ? getYouTubeEmbedUrl(selectedSource.url, isMusicPlaying) : null
  const selectSource = (source: MusicSource) => { setSelectedSourceId(source.id); setIsMusicPlaying(Boolean(getYouTubeEmbedUrl(source.url))) }
  const savePlaylist = (event: React.FormEvent) => {
    event.preventDefault()
    const url = playlistUrl.trim()
    if (!getYouTubeEmbedUrl(url)) { setPlaylistError('Cole uma URL válida de vídeo ou playlist do YouTube.'); return }
    const source = { id: makeId(), name: playlistName.trim() || 'Nova playlist', url }
    setSources(current => [...current, source]); setSelectedSourceId(source.id); setIsMusicPlaying(true)
    setPlaylistName(''); setPlaylistUrl(''); setPlaylistError(''); setIsPlaylistEditorOpen(false)
  }
  const removeSource = (id: string) => {
    if (sources.length === 1) return
    setSources(current => current.filter(source => source.id !== id))
    if (id === selectedSourceId) { setSelectedSourceId(sources.find(source => source.id !== id)?.id || ''); setIsMusicPlaying(false) }
  }

  return <div className="space-y-7 pb-12 font-sans animate-fadeIn">
    <header className="flex items-center justify-between gap-4"><button type="button" onClick={() => setActiveTab('inicio')} className="group inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-xs font-medium text-text-secondary hover:text-accent-gold"><ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5" />Voltar ao início</button><div className="text-right"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-accent-gold">Foco e contemplação</p><h1 className="font-serif text-2xl font-bold text-text-primary">Scholé</h1></div></header>
    <nav className="grid grid-cols-3 rounded-xl border border-text-primary/10 bg-bg-surface/70 p-1" aria-label="Áreas da Scholé" role="tablist">{([['focus', Clock3, 'Foco'], ['tasks', LayoutDashboard, 'Tarefas'], ['stats', BarChart3, 'Estatísticas']] as const).map(([id, Icon, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${tab === id ? 'bg-accent-gold text-bg-base shadow-lg' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}><Icon className="h-4 w-4" />{label}</button>)}</nav>

    {tab === 'focus' && <><section className="schole-focus-layout agora-panel-enter">
      <aside className="schole-intention-panel" data-depth-surface>
        <span className="depth-glare" aria-hidden="true" />
        <div className="relative z-[5]">
          <div className="mb-5 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-accent-gold">Intenção da sessão</p><span className="text-[10px] text-text-secondary">{tasks.filter(t => t.status === 'done').length}/{tasks.length} concluídas</span></div>
          <div className="space-y-2">{tasks.filter(t => t.status !== 'done').slice(0, 4).map(task => <button key={task.id} type="button" disabled={isRunning && !isBreak} onClick={() => selectFocusTask(task.id)} aria-pressed={activeTask?.id === task.id} className={`schole-intention ${activeTask?.id === task.id ? 'is-active' : ''}`}><Circle className={`h-3 w-3 ${activeTask?.id === task.id ? 'fill-accent-gold text-accent-gold' : 'text-text-secondary'}`} /><span className="min-w-0 flex-1 truncate text-sm">{task.label}</span><span className="text-[10px] text-text-secondary">{task.estimate} min</span></button>)}</div>
          <button type="button" onClick={() => setTab('tasks')} className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-accent-gold hover:text-accent-gold-bright">Organizar tarefas <ChevronRight className="h-3.5 w-3.5" /></button>

          <div className="schole-presets">
            <div><Sparkles className="h-3.5 w-3.5" /><span>Ritmos de foco</span></div>
            <div className="grid grid-cols-3 gap-2">{TIMER_PRESETS.map(preset => <button key={preset.name} type="button" disabled={isRunning} onClick={() => applyPreset(preset.focusMinutes, preset.breakMinutes)} className={timerSettings.focusMinutes === preset.focusMinutes && timerSettings.breakMinutes === preset.breakMinutes ? 'is-active' : ''}><strong>{preset.name}</strong><small>{preset.detail} min</small></button>)}</div>
          </div>
          <p className="schole-shortcuts"><Keyboard className="h-3.5 w-3.5" /> Espaço inicia · R reinicia · B alterna a fase · M silencia</p>
        </div>
      </aside>

      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex items-center gap-2"><p className="text-[10px] font-semibold uppercase tracking-[.22em] text-text-secondary">{isBreak ? 'Pausa restauradora' : 'Astrolábio do tempo'}</p><button type="button" disabled={isRunning} onClick={() => { setSettingsDraft(timerSettings); setIsTimerSettingsOpen(open => !open) }} className="rounded-md p-1 text-text-secondary hover:bg-bg-surface hover:text-accent-gold disabled:cursor-not-allowed disabled:opacity-35" aria-label="Configurar Pomodoro" aria-expanded={isTimerSettingsOpen}><Settings2 className="h-4 w-4" /></button></div>
        {isTimerSettingsOpen && <form onSubmit={applyTimerSettings} className="pomodoro-settings"><label>Foco<input type="number" min="1" max="180" value={settingsDraft.focusMinutes} onChange={e => setSettingsDraft(v => ({ ...v, focusMinutes: Number(e.target.value) }))} /></label><label>Pausa<input type="number" min="1" max="60" value={settingsDraft.breakMinutes} onChange={e => setSettingsDraft(v => ({ ...v, breakMinutes: Number(e.target.value) }))} /></label><label>Ciclos<input type="number" min="1" max="12" value={settingsDraft.goal} onChange={e => setSettingsDraft(v => ({ ...v, goal: Number(e.target.value) }))} /></label><button>Aplicar duração</button></form>}
        <PomodoroDial
          secondsLeft={secondsLeft}
          totalSeconds={(isBreak ? timerSettings.breakMinutes : timerSettings.focusMinutes) * 60}
          isRunning={isRunning}
          isBreak={isBreak}
          taskLabel={timerTaskLabel}
          cycles={cycles}
          goal={timerSettings.goal}
          soundEnabled={soundEnabled}
          onToggle={toggleTimer}
          onReset={resetTimer}
          onSkip={skipPhase}
          onToggleSound={() => setSoundEnabled(value => !value)}
        />
        <p className="sr-only" aria-live="polite">{isRunning ? isBreak ? 'Pausa iniciada.' : 'Sessão de foco iniciada.' : isBreak ? 'Pausa suspensa.' : 'Cronômetro pausado.'}</p>
      </div>
    </section><section className="rounded-2xl border border-text-primary/10 bg-bg-surface/55 p-4 sm:p-5 agora-panel-enter" aria-label="Playlist do Pomodoro">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg border border-accent-gold/25 bg-bg-elevated text-accent-gold"><Music2 className="h-4 w-4" /></span><div><p className="font-serif text-sm font-bold">Ambiente sonoro</p><p className="text-[11px] text-text-secondary">Escolha uma trilha para acompanhar o ciclo.</p></div></div><button type="button" onClick={() => setIsPlaylistEditorOpen(open => !open)} className="rounded-lg border border-accent-gold/45 px-3 py-1.5 text-xs font-semibold text-accent-gold hover:bg-accent-gold/10"><Plus className="mr-1 inline h-3.5 w-3.5" />Adicionar playlist</button></div>
      <div className="mt-4 flex flex-wrap gap-2">{sources.map(source => <div key={source.id} className={`flex items-center rounded-full border ${selectedSourceId === source.id ? 'border-accent-gold bg-accent-gold/10 text-accent-gold' : 'border-text-primary/20 text-text-secondary'}`}><button type="button" onClick={() => selectSource(source)} className="px-3 py-1.5 text-[11px] font-medium">{source.name}</button>{sources.length > 1 && <button type="button" onClick={() => removeSource(source.id)} className="border-l border-current/20 px-2 py-1.5 opacity-60 hover:opacity-100" aria-label={`Remover ${source.name}`}><X className="h-3 w-3" /></button>}</div>)}</div>
      <div className="mt-3 flex items-center gap-3"><button type="button" disabled={!getYouTubeEmbedUrl(selectedSource?.url || '')} onClick={() => setIsMusicPlaying(playing => !playing)} className="inline-flex items-center gap-2 rounded-lg bg-accent-gold px-3 py-2 text-xs font-bold text-bg-base disabled:cursor-not-allowed disabled:opacity-40">{isMusicPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}{isMusicPlaying ? 'Pausar música' : 'Tocar música'}</button>{selectedSource && !getYouTubeEmbedUrl(selectedSource.url) && <span className="text-[11px] text-text-secondary">Esta seleção ainda não possui link. Adicione uma playlist para usá-la.</span>}</div>
      {isPlaylistEditorOpen && <form onSubmit={savePlaylist} className="mt-4 grid gap-2 border-t border-text-primary/10 pt-4 sm:grid-cols-[.7fr_1.5fr_auto]"><input value={playlistName} onChange={event => setPlaylistName(event.target.value)} placeholder="Nome da playlist" className="rounded-lg border border-text-primary/15 bg-bg-base px-3 py-2 text-xs outline-none focus:border-accent-gold" /><input value={playlistUrl} onChange={event => { setPlaylistUrl(event.target.value); setPlaylistError('') }} placeholder="Link de vídeo ou playlist do YouTube" className="rounded-lg border border-text-primary/15 bg-bg-base px-3 py-2 text-xs outline-none focus:border-accent-gold" /><button className="rounded-lg bg-accent-gold px-4 py-2 text-xs font-bold text-bg-base">Salvar</button>{playlistError && <p className="text-xs text-red-300 sm:col-span-3">{playlistError}</p>}</form>}
      {isMusicPlaying && embedUrl && <div className="mt-4 overflow-hidden rounded-xl border border-text-primary/10 bg-black"><iframe key={embedUrl} title={`Playlist: ${selectedSource.name}`} src={embedUrl} className="h-44 w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /><p className="px-3 py-2 text-[10px] text-text-secondary">Caso o navegador bloqueie o início automático, toque em reproduzir no player.</p></div>}
    </section></>}

    {tab === 'tasks' && <section className="space-y-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-accent-gold">Seu atelier de estudos</p><h2 className="mt-1 font-serif text-2xl font-bold">Tarefas à sua maneira</h2><p className="mt-1 text-xs text-text-secondary">Defina tema, prioridade, prazo e duração para cada intenção.</p></div><button type="button" onClick={() => setIsTaskFormOpen(v => !v)} className="inline-flex items-center gap-2 rounded-lg bg-accent-gold px-4 py-2.5 text-xs font-bold text-bg-base"><Plus className="h-4 w-4" />Nova tarefa</button></div>{isTaskFormOpen && <form onSubmit={addTask} className="grid gap-3 rounded-2xl border border-accent-gold/35 bg-bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5"><input required autoFocus value={draft.label} onChange={e => setDraft(v => ({ ...v, label: e.target.value }))} placeholder="O que deseja realizar?" className="rounded-lg border border-text-primary/15 bg-bg-base px-3 py-2 text-sm outline-none focus:border-accent-gold sm:col-span-2" /><input value={draft.category} onChange={e => setDraft(v => ({ ...v, category: e.target.value }))} placeholder="Área (ex.: Filosofia)" className="rounded-lg border border-text-primary/15 bg-bg-base px-3 py-2 text-xs outline-none focus:border-accent-gold" /><select value={draft.priority} onChange={e => setDraft(v => ({ ...v, priority: e.target.value as Task['priority'] }))} className="rounded-lg border border-text-primary/15 bg-bg-base px-3 py-2 text-xs outline-none focus:border-accent-gold"><option>Baixa</option><option>Média</option><option>Alta</option></select><input type="number" min="5" step="5" value={draft.estimate} onChange={e => setDraft(v => ({ ...v, estimate: Number(e.target.value) }))} className="rounded-lg border border-text-primary/15 bg-bg-base px-3 py-2 text-xs outline-none focus:border-accent-gold" /><input type="date" value={draft.dueDate} onChange={e => setDraft(v => ({ ...v, dueDate: e.target.value }))} className="rounded-lg border border-text-primary/15 bg-bg-base px-3 py-2 text-xs outline-none focus:border-accent-gold" /><select value={draft.status} onChange={e => setDraft(v => ({ ...v, status: e.target.value as TaskStatus }))} className="rounded-lg border border-text-primary/15 bg-bg-base px-3 py-2 text-xs outline-none focus:border-accent-gold"><option value="backlog">A cultivar</option><option value="doing">Em contemplação</option><option value="done">Concluída</option></select><div className="flex gap-2"><button className="rounded-lg bg-accent-gold px-4 py-2 text-xs font-bold text-bg-base">Adicionar</button><button type="button" onClick={() => setIsTaskFormOpen(false)} className="rounded-lg border border-text-primary/15 px-3 text-text-secondary"><X className="h-4 w-4" /></button></div></form>}<div className="grid gap-4 lg:grid-cols-3">{(Object.keys(STATUS_META) as TaskStatus[]).map(status => <div key={status} className={`min-h-72 rounded-2xl border bg-bg-surface/50 p-3 ${STATUS_META[status].color}`} onDragOver={e => e.preventDefault()} onDrop={e => { const task = tasks.find(item => item.id === e.dataTransfer.getData('text/plain')); if (task) moveTask(task, status) }}><div className="mb-3 flex items-baseline justify-between px-1"><div><h3 className="font-serif font-bold">{STATUS_META[status].title}</h3><p className="text-[10px] text-text-secondary">{STATUS_META[status].description}</p></div><span className="text-xs text-text-secondary">{tasks.filter(t => t.status === status).length}</span></div><div className="space-y-2">{tasks.filter(t => t.status === status).map(task => <article key={task.id} draggable onDragStart={e => e.dataTransfer.setData('text/plain', task.id)} className="cursor-grab rounded-xl border border-text-primary/10 bg-bg-elevated/70 p-3 shadow-sm active:cursor-grabbing"><div className="flex justify-between gap-2"><button type="button" onClick={() => { setActiveTaskId(task.id); if (status !== 'done') moveTask(task, 'doing') }} className={`text-left text-sm font-semibold ${task.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{task.label}</button><button type="button" onClick={() => setTasks(current => current.filter(item => item.id !== task.id))} className="text-text-secondary hover:text-red-400" aria-label={`Excluir ${task.label}`}><Trash2 className="h-3.5 w-3.5" /></button></div><div className="mt-3 flex flex-wrap gap-1.5 text-[10px]"><span className="rounded-full bg-bg-base px-2 py-1 text-accent-gold">{task.category}</span><span className={`rounded-full px-2 py-1 ${task.priority === 'Alta' ? 'bg-red-400/10 text-red-300' : 'bg-text-primary/5 text-text-secondary'}`}>{task.priority}</span><span className="inline-flex items-center gap-1 rounded-full bg-bg-base px-2 py-1 text-text-secondary"><Clock3 className="h-3 w-3" />{task.estimate} min</span></div>{task.dueDate && <p className="mt-2 text-[10px] text-text-secondary">Até {new Date(`${task.dueDate}T12:00:00`).toLocaleDateString('pt-BR')}</p>}<div className="mt-3 flex gap-1 border-t border-text-primary/10 pt-2">{(Object.keys(STATUS_META) as TaskStatus[]).filter(next => next !== status).map(next => <button key={next} type="button" onClick={() => moveTask(task, next)} className="rounded-md px-1.5 py-1 text-[10px] text-text-secondary hover:bg-bg-base hover:text-accent-gold">→ {STATUS_META[next].title}</button>)}</div></article>)}</div></div>)}</div></section>}

    {tab === 'stats' && <section className="space-y-5"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-accent-gold">Registro de dedicação</p><h2 className="mt-1 font-serif text-2xl font-bold">Horas estudadas</h2></div><div className="grid gap-3 sm:grid-cols-3"><StatCard label="Hoje" value={`${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}min`} note="tempo de foco concluído" /><StatCard label="Total" value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}min`} note={`${sessions.length} sessões registradas`} /><StatCard label="Tarefas colhidas" value={`${tasks.filter(t => t.status === 'done').length}`} note={`de ${tasks.length} intenções`} /></div><div className="rounded-2xl border border-text-primary/10 bg-bg-surface/55 p-5"><div className="mb-6 flex items-center justify-between"><div><h3 className="font-serif text-lg font-bold">Ritmo dos últimos 7 dias</h3><p className="text-xs text-text-secondary">Cada coluna representa minutos de estudo concluídos.</p></div><BarChart3 className="h-5 w-5 text-accent-gold" /></div><div className="flex h-48 items-end justify-between gap-2">{days.map(date => { const minutes = sessions.filter(s => new Date(s.startedAt).toDateString() === date.toDateString()).reduce((sum, s) => sum + s.minutes, 0); return <div key={date.toISOString()} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2 text-center"><span className="text-[10px] text-text-secondary">{minutes || ''}</span><div className="min-h-1 rounded-t-md bg-gradient-to-t from-accent-gold/60 to-accent-gold" style={{ height: `${Math.max(minutes ? 8 : 2, (minutes / maxDaily) * 100)}%` }} /><span className="text-[10px] text-text-secondary">{date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span></div> })}</div></div><p className="text-center text-xs text-text-secondary">As estatísticas começam a ser registradas ao concluir cada ciclo de foco.</p></section>}
  </div>
}

const StatCard: React.FC<{ label: string; value: string; note: string }> = ({ label, value, note }) => <article className="rounded-2xl border border-text-primary/10 bg-bg-surface/55 p-4"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-text-secondary">{label}</p><p className="mt-2 font-serif text-3xl font-bold text-accent-gold">{value}</p><p className="mt-1 text-[11px] text-text-secondary">{note}</p></article>
