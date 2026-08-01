import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, BarChart3, Check, ChevronRight, Circle, Clock3, LayoutDashboard, Pause, Play, Plus, RotateCcw, Settings2, SkipForward, Trash2, Volume2, VolumeX, X } from 'lucide-react'
import { readScholeValue, writeScholeValue } from '../lib/scholeStorage'
import { useAgoraStore } from '../store/useAgoraStore'

type TaskStatus = 'backlog' | 'doing' | 'done'
type Task = { id: string; label: string; completed: boolean; status: TaskStatus; category: string; priority: 'Baixa' | 'Média' | 'Alta'; estimate: number; dueDate?: string }
type TimerSettings = { focusMinutes: number; breakMinutes: number; goal: number }
type StudySession = { id: string; startedAt: string; minutes: number; taskId?: string }
type Tab = 'focus' | 'tasks' | 'stats'

const INITIAL_TASKS: Task[] = [
  { id: 'monografia', label: 'Revisão da Monografia', completed: false, status: 'doing', category: 'Pesquisa', priority: 'Alta', estimate: 50 },
  { id: 'abnt', label: 'Formatação ABNT da Bibliografia', completed: false, status: 'backlog', category: 'Acadêmico', priority: 'Média', estimate: 25 },
  { id: 'traducao', label: 'Tradução do Capítulo 1', completed: false, status: 'backlog', category: 'Idiomas', priority: 'Baixa', estimate: 25 },
]
const DEFAULT_TIMER: TimerSettings = { focusMinutes: 25, breakMinutes: 5, goal: 4 }
const STATUS_META: Record<TaskStatus, { title: string; description: string; color: string }> = {
  backlog: { title: 'A cultivar', description: 'próximos estudos', color: 'border-text-primary/15' },
  doing: { title: 'Em contemplação', description: 'foco atual', color: 'border-accent-gold/45' },
  done: { title: 'Concluídas', description: 'saberes colhidos', color: 'border-emerald-400/35' },
}
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `schole-${Date.now()}-${Math.random().toString(36).slice(2)}`
const formatTime = (total: number) => `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))
const normalizeTasks = (saved: unknown): Task[] => Array.isArray(saved) ? saved.map((item: Partial<Task>, index) => ({
  id: item.id || `legacy-${index}`, label: item.label || 'Nova tarefa', completed: Boolean(item.completed), status: item.status || (item.completed ? 'done' : 'backlog'), category: item.category || 'Estudos', priority: item.priority || 'Média', estimate: item.estimate || 25, dueDate: item.dueDate,
})) : INITIAL_TASKS

function playBell(kind: 'start' | 'end') {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const context = new AudioContextClass()
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
    window.setTimeout(() => void context.close(), 900)
  } catch { /* Audio is optional and must never block the timer. */ }
}

export const ScholeView: React.FC = () => {
  const { setActiveTab } = useAgoraStore()
  const [tab, setTab] = useState<Tab>('focus')
  const [tasks, setTasks] = useState<Task[]>(() => normalizeTasks(readScholeValue<unknown>('tasks', INITIAL_TASKS)))
  const [activeTaskId, setActiveTaskId] = useState(() => readScholeValue('active-task', INITIAL_TASKS[0].id))
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(() => readScholeValue('timer', DEFAULT_TIMER))
  const [secondsLeft, setSecondsLeft] = useState(() => readScholeValue('seconds-left', DEFAULT_TIMER.focusMinutes * 60))
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [cycles, setCycles] = useState(() => readScholeValue('cycles', 0))
  const [sessions, setSessions] = useState<StudySession[]>(() => readScholeValue('study-sessions', []))
  const [soundEnabled, setSoundEnabled] = useState(() => readScholeValue('sound-enabled', true))
  const [isTimerSettingsOpen, setIsTimerSettingsOpen] = useState(false)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [draft, setDraft] = useState({ label: '', category: 'Estudos', priority: 'Média' as Task['priority'], estimate: 25, dueDate: '', status: 'backlog' as TaskStatus })
  const sessionStartedAt = useRef<string | null>(null)

  useEffect(() => writeScholeValue('tasks', tasks), [tasks])
  useEffect(() => writeScholeValue('active-task', activeTaskId), [activeTaskId])
  useEffect(() => writeScholeValue('timer', timerSettings), [timerSettings])
  useEffect(() => writeScholeValue('seconds-left', secondsLeft), [secondsLeft])
  useEffect(() => writeScholeValue('cycles', cycles), [cycles])
  useEffect(() => writeScholeValue('study-sessions', sessions), [sessions])
  useEffect(() => writeScholeValue('sound-enabled', soundEnabled), [soundEnabled])

  const completeFocus = () => {
    setSessions(current => [...current, { id: makeId(), startedAt: sessionStartedAt.current || new Date().toISOString(), minutes: timerSettings.focusMinutes, taskId: activeTaskId }])
    setCycles(value => Math.min(value + 1, timerSettings.goal))
    if (soundEnabled) playBell('end')
  }
  useEffect(() => {
    if (!isRunning) return
    const timer = window.setInterval(() => setSecondsLeft(current => {
      if (current > 1) return current - 1
      if (isBreak) { setIsBreak(false); if (soundEnabled) playBell('start'); return timerSettings.focusMinutes * 60 }
      completeFocus(); setIsBreak(true); return timerSettings.breakMinutes * 60
    }), 1000)
    return () => window.clearInterval(timer)
  }, [isBreak, isRunning, soundEnabled, timerSettings.breakMinutes, timerSettings.focusMinutes])

  const activeTask = useMemo(() => tasks.find(task => task.id === activeTaskId) ?? tasks.find(task => task.status !== 'done'), [activeTaskId, tasks])
  const totalMinutes = sessions.reduce((sum, session) => sum + session.minutes, 0)
  const todayKey = new Date().toDateString()
  const todayMinutes = sessions.filter(session => new Date(session.startedAt).toDateString() === todayKey).reduce((sum, session) => sum + session.minutes, 0)
  const days = Array.from({ length: 7 }, (_, offset) => { const date = new Date(); date.setDate(date.getDate() - (6 - offset)); return date })
  const maxDaily = Math.max(60, ...days.map(date => sessions.filter(s => new Date(s.startedAt).toDateString() === date.toDateString()).reduce((sum, s) => sum + s.minutes, 0)))

  const updateTask = (id: string, patch: Partial<Task>) => setTasks(current => current.map(task => task.id === id ? { ...task, ...patch } : task))
  const moveTask = (task: Task, status: TaskStatus) => { updateTask(task.id, { status, completed: status === 'done' }); if (status === 'doing') setActiveTaskId(task.id) }
  const addTask = (event: React.FormEvent) => { event.preventDefault(); if (!draft.label.trim()) return; const task = { ...draft, id: makeId(), label: draft.label.trim(), completed: draft.status === 'done' }; setTasks(current => [...current, task]); setActiveTaskId(task.id); setDraft({ label: '', category: 'Estudos', priority: 'Média', estimate: 25, dueDate: '', status: 'backlog' }); setIsTaskFormOpen(false) }
  const startTimer = () => { if (!activeTask) return; sessionStartedAt.current = new Date().toISOString(); setIsRunning(true); if (soundEnabled) playBell('start') }
  const resetTimer = () => { setIsRunning(false); setIsBreak(false); setSecondsLeft(timerSettings.focusMinutes * 60); sessionStartedAt.current = null }
  const applyTimerSettings = (event: React.FormEvent) => { event.preventDefault(); const clean = { focusMinutes: clamp(timerSettings.focusMinutes, 1, 180), breakMinutes: clamp(timerSettings.breakMinutes, 1, 60), goal: clamp(timerSettings.goal, 1, 12) }; setTimerSettings(clean); setSecondsLeft(clean.focusMinutes * 60); setIsRunning(false); setIsBreak(false); setIsTimerSettingsOpen(false) }

  return <div className="space-y-7 pb-12 font-sans animate-fadeIn">
    <header className="flex items-center justify-between gap-4"><button type="button" onClick={() => setActiveTab('inicio')} className="group inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-xs font-medium text-text-secondary hover:text-accent-gold"><ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5" />Voltar ao início</button><div className="text-right"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-accent-gold">Foco e contemplação</p><h1 className="font-serif text-2xl font-bold text-text-primary">Scholé</h1></div></header>
    <nav className="grid grid-cols-3 rounded-xl border border-text-primary/10 bg-bg-surface/70 p-1" aria-label="Áreas da Scholé">{([['focus', Clock3, 'Foco'], ['tasks', LayoutDashboard, 'Tarefas'], ['stats', BarChart3, 'Estatísticas']] as const).map(([id, Icon, label]) => <button key={id} type="button" onClick={() => setTab(id)} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${tab === id ? 'bg-accent-gold text-bg-base' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}><Icon className="h-4 w-4" />{label}</button>)}</nav>

    {tab === 'focus' && <section className="grid items-center gap-8 py-3 lg:grid-cols-[.85fr_1.15fr] lg:gap-14">
      <div className="rounded-2xl border border-text-primary/10 bg-bg-surface/45 p-5"><div className="mb-5 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-accent-gold">Intenção da sessão</p><span className="text-[10px] text-text-secondary">{tasks.filter(t => t.status === 'done').length}/{tasks.length} concluídas</span></div><div className="space-y-2">{tasks.filter(t => t.status !== 'done').slice(0, 4).map(task => <button key={task.id} type="button" onClick={() => setActiveTaskId(task.id)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left ${activeTask?.id === task.id ? 'bg-accent-gold/10 ring-1 ring-accent-gold/40' : 'hover:bg-bg-elevated/70'}`}><Circle className={`h-3 w-3 ${activeTask?.id === task.id ? 'fill-accent-gold text-accent-gold' : 'text-text-secondary'}`} /><span className="min-w-0 flex-1 truncate text-sm">{task.label}</span><span className="text-[10px] text-text-secondary">{task.estimate} min</span></button>)}</div><button type="button" onClick={() => setTab('tasks')} className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-accent-gold hover:text-accent-gold-bright">Organizar tarefas <ChevronRight className="h-3.5 w-3.5" /></button></div>
      <div className="flex flex-col items-center text-center"><div className="mb-4 flex items-center gap-2"><p className="text-[10px] font-semibold uppercase tracking-[.22em] text-text-secondary">{isBreak ? 'Pausa restauradora' : 'O tempo oportuno'}</p><button type="button" onClick={() => setIsTimerSettingsOpen(open => !open)} className="text-text-secondary hover:text-accent-gold" aria-label="Configurar Pomodoro"><Settings2 className="h-4 w-4" /></button></div>{isTimerSettingsOpen && <form onSubmit={applyTimerSettings} className="mb-5 grid w-full max-w-sm grid-cols-3 gap-2 rounded-xl border border-text-primary/10 bg-bg-surface p-3 text-left"><label className="text-[10px] text-text-secondary">Foco<input type="number" min="1" max="180" value={timerSettings.focusMinutes} onChange={e => setTimerSettings(v => ({ ...v, focusMinutes: Number(e.target.value) }))} className="mt-1 w-full rounded-md border border-text-primary/15 bg-bg-base p-1.5 text-sm outline-none focus:border-accent-gold" /></label><label className="text-[10px] text-text-secondary">Pausa<input type="number" min="1" max="60" value={timerSettings.breakMinutes} onChange={e => setTimerSettings(v => ({ ...v, breakMinutes: Number(e.target.value) }))} className="mt-1 w-full rounded-md border border-text-primary/15 bg-bg-base p-1.5 text-sm outline-none focus:border-accent-gold" /></label><label className="text-[10px] text-text-secondary">Ciclos<input type="number" min="1" max="12" value={timerSettings.goal} onChange={e => setTimerSettings(v => ({ ...v, goal: Number(e.target.value) }))} className="mt-1 w-full rounded-md border border-text-primary/15 bg-bg-base p-1.5 text-sm outline-none focus:border-accent-gold" /></label><button className="col-span-3 rounded-lg bg-accent-gold py-1.5 text-xs font-bold text-bg-base">Aplicar duração</button></form>}<div className={`relative grid h-64 w-64 place-items-center rounded-full border sm:h-72 sm:w-72 ${isRunning ? 'border-accent-gold shadow-[0_0_42px_rgba(212,175,55,.18)]' : 'border-text-primary/15'}`}><div className="absolute inset-3 rounded-full border border-text-primary/5" /><div className="relative"><time className={`font-serif text-6xl font-bold tabular-nums sm:text-7xl ${isRunning ? 'text-accent-gold' : ''}`}>{formatTime(secondsLeft)}</time><p className="mt-2 max-w-48 truncate text-xs text-text-secondary">{activeTask?.label || 'Crie uma tarefa para começar'}</p></div></div><div className="mt-7 flex items-center gap-3"><button type="button" onClick={resetTimer} className="grid h-10 w-10 place-items-center rounded-full text-text-secondary hover:bg-bg-surface hover:text-text-primary" aria-label="Reiniciar"><RotateCcw className="h-4 w-4" /></button><button type="button" onClick={() => isRunning ? setIsRunning(false) : startTimer()} disabled={!activeTask} className="grid h-12 w-12 place-items-center rounded-full bg-accent-gold text-bg-base shadow-lg disabled:opacity-40" aria-label={isRunning ? 'Pausar' : 'Iniciar'}>{isRunning ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current translate-x-0.5" />}</button><button type="button" onClick={() => { setIsRunning(false); setIsBreak(true); setSecondsLeft(timerSettings.breakMinutes * 60); if (soundEnabled) playBell('end') }} className="grid h-10 w-10 place-items-center rounded-full text-text-secondary hover:bg-bg-surface hover:text-text-primary" aria-label="Iniciar pausa"><SkipForward className="h-4 w-4" /></button></div><div className="mt-5 flex items-center gap-3 text-xs text-text-secondary"><span>Ciclos: <b className="text-text-primary">{cycles}/{timerSettings.goal}</b></span><button type="button" onClick={() => setSoundEnabled(v => !v)} className="inline-flex items-center gap-1 text-accent-gold" aria-pressed={soundEnabled}>{soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}{soundEnabled ? 'Sons ativos' : 'Sons inativos'}</button></div></div>
    </section>}

    {tab === 'tasks' && <section className="space-y-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-accent-gold">Seu atelier de estudos</p><h2 className="mt-1 font-serif text-2xl font-bold">Tarefas à sua maneira</h2><p className="mt-1 text-xs text-text-secondary">Defina tema, prioridade, prazo e duração para cada intenção.</p></div><button type="button" onClick={() => setIsTaskFormOpen(v => !v)} className="inline-flex items-center gap-2 rounded-lg bg-accent-gold px-4 py-2.5 text-xs font-bold text-bg-base"><Plus className="h-4 w-4" />Nova tarefa</button></div>{isTaskFormOpen && <form onSubmit={addTask} className="grid gap-3 rounded-2xl border border-accent-gold/35 bg-bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5"><input required autoFocus value={draft.label} onChange={e => setDraft(v => ({ ...v, label: e.target.value }))} placeholder="O que deseja realizar?" className="rounded-lg border border-text-primary/15 bg-bg-base px-3 py-2 text-sm outline-none focus:border-accent-gold sm:col-span-2" /><input value={draft.category} onChange={e => setDraft(v => ({ ...v, category: e.target.value }))} placeholder="Área (ex.: Filosofia)" className="rounded-lg border border-text-primary/15 bg-bg-base px-3 py-2 text-xs outline-none focus:border-accent-gold" /><select value={draft.priority} onChange={e => setDraft(v => ({ ...v, priority: e.target.value as Task['priority'] }))} className="rounded-lg border border-text-primary/15 bg-bg-base px-3 py-2 text-xs outline-none focus:border-accent-gold"><option>Baixa</option><option>Média</option><option>Alta</option></select><input type="number" min="5" step="5" value={draft.estimate} onChange={e => setDraft(v => ({ ...v, estimate: Number(e.target.value) }))} className="rounded-lg border border-text-primary/15 bg-bg-base px-3 py-2 text-xs outline-none focus:border-accent-gold" /><input type="date" value={draft.dueDate} onChange={e => setDraft(v => ({ ...v, dueDate: e.target.value }))} className="rounded-lg border border-text-primary/15 bg-bg-base px-3 py-2 text-xs outline-none focus:border-accent-gold" /><select value={draft.status} onChange={e => setDraft(v => ({ ...v, status: e.target.value as TaskStatus }))} className="rounded-lg border border-text-primary/15 bg-bg-base px-3 py-2 text-xs outline-none focus:border-accent-gold"><option value="backlog">A cultivar</option><option value="doing">Em contemplação</option><option value="done">Concluída</option></select><div className="flex gap-2"><button className="rounded-lg bg-accent-gold px-4 py-2 text-xs font-bold text-bg-base">Adicionar</button><button type="button" onClick={() => setIsTaskFormOpen(false)} className="rounded-lg border border-text-primary/15 px-3 text-text-secondary"><X className="h-4 w-4" /></button></div></form>}<div className="grid gap-4 lg:grid-cols-3">{(Object.keys(STATUS_META) as TaskStatus[]).map(status => <div key={status} className={`min-h-72 rounded-2xl border bg-bg-surface/50 p-3 ${STATUS_META[status].color}`} onDragOver={e => e.preventDefault()} onDrop={e => { const task = tasks.find(item => item.id === e.dataTransfer.getData('text/plain')); if (task) moveTask(task, status) }}><div className="mb-3 flex items-baseline justify-between px-1"><div><h3 className="font-serif font-bold">{STATUS_META[status].title}</h3><p className="text-[10px] text-text-secondary">{STATUS_META[status].description}</p></div><span className="text-xs text-text-secondary">{tasks.filter(t => t.status === status).length}</span></div><div className="space-y-2">{tasks.filter(t => t.status === status).map(task => <article key={task.id} draggable onDragStart={e => e.dataTransfer.setData('text/plain', task.id)} className="cursor-grab rounded-xl border border-text-primary/10 bg-bg-elevated/70 p-3 shadow-sm active:cursor-grabbing"><div className="flex justify-between gap-2"><button type="button" onClick={() => { setActiveTaskId(task.id); if (status !== 'done') moveTask(task, 'doing') }} className={`text-left text-sm font-semibold ${task.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{task.label}</button><button type="button" onClick={() => setTasks(current => current.filter(item => item.id !== task.id))} className="text-text-secondary hover:text-red-400" aria-label={`Excluir ${task.label}`}><Trash2 className="h-3.5 w-3.5" /></button></div><div className="mt-3 flex flex-wrap gap-1.5 text-[10px]"><span className="rounded-full bg-bg-base px-2 py-1 text-accent-gold">{task.category}</span><span className={`rounded-full px-2 py-1 ${task.priority === 'Alta' ? 'bg-red-400/10 text-red-300' : 'bg-text-primary/5 text-text-secondary'}`}>{task.priority}</span><span className="inline-flex items-center gap-1 rounded-full bg-bg-base px-2 py-1 text-text-secondary"><Clock3 className="h-3 w-3" />{task.estimate} min</span></div>{task.dueDate && <p className="mt-2 text-[10px] text-text-secondary">Até {new Date(`${task.dueDate}T12:00:00`).toLocaleDateString('pt-BR')}</p>}<div className="mt-3 flex gap-1 border-t border-text-primary/10 pt-2">{(Object.keys(STATUS_META) as TaskStatus[]).filter(next => next !== status).map(next => <button key={next} type="button" onClick={() => moveTask(task, next)} className="rounded-md px-1.5 py-1 text-[10px] text-text-secondary hover:bg-bg-base hover:text-accent-gold">→ {STATUS_META[next].title}</button>)}</div></article>)}</div></div>)}</div></section>}

    {tab === 'stats' && <section className="space-y-5"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-accent-gold">Registro de dedicação</p><h2 className="mt-1 font-serif text-2xl font-bold">Horas estudadas</h2></div><div className="grid gap-3 sm:grid-cols-3"><StatCard label="Hoje" value={`${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}min`} note="tempo de foco concluído" /><StatCard label="Total" value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}min`} note={`${sessions.length} sessões registradas`} /><StatCard label="Tarefas colhidas" value={`${tasks.filter(t => t.status === 'done').length}`} note={`de ${tasks.length} intenções`} /></div><div className="rounded-2xl border border-text-primary/10 bg-bg-surface/55 p-5"><div className="mb-6 flex items-center justify-between"><div><h3 className="font-serif text-lg font-bold">Ritmo dos últimos 7 dias</h3><p className="text-xs text-text-secondary">Cada coluna representa minutos de estudo concluídos.</p></div><BarChart3 className="h-5 w-5 text-accent-gold" /></div><div className="flex h-48 items-end justify-between gap-2">{days.map(date => { const minutes = sessions.filter(s => new Date(s.startedAt).toDateString() === date.toDateString()).reduce((sum, s) => sum + s.minutes, 0); return <div key={date.toISOString()} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2 text-center"><span className="text-[10px] text-text-secondary">{minutes || ''}</span><div className="min-h-1 rounded-t-md bg-gradient-to-t from-accent-gold/60 to-accent-gold" style={{ height: `${Math.max(minutes ? 8 : 2, (minutes / maxDaily) * 100)}%` }} /><span className="text-[10px] text-text-secondary">{date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span></div> })}</div></div><p className="text-center text-xs text-text-secondary">As estatísticas começam a ser registradas ao concluir cada ciclo de foco.</p></section>}
  </div>
}

const StatCard: React.FC<{ label: string; value: string; note: string }> = ({ label, value, note }) => <article className="rounded-2xl border border-text-primary/10 bg-bg-surface/55 p-4"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-text-secondary">{label}</p><p className="mt-2 font-serif text-3xl font-bold text-accent-gold">{value}</p><p className="mt-1 text-[11px] text-text-secondary">{note}</p></article>
