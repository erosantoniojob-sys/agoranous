import React, { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, Circle, Music2, Pause, Play, RotateCcw, SkipForward, Volume2 } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'

type Task = { id: string; label: string; completed: boolean }

const INITIAL_TASKS: Task[] = [
  { id: 'monografia', label: 'Revisão da Monografia', completed: false },
  { id: 'abnt', label: 'Formatação ABNT da Bibliografia', completed: false },
  { id: 'traducao', label: 'Tradução do Capítulo 1', completed: false },
]

const SOUNDTRACKS = [
  { name: 'Lo-Fi', description: 'Fluxo contínuo para leitura', duration: 'Ao vivo · +1h' },
  { name: 'Música Clássica', description: 'Concentração sem palavras', duration: 'Playlist · 1h 42min' },
  { name: 'Instrumental Worship', description: 'Ambiente contemplativo', duration: 'Playlist · 1h 18min' },
  { name: 'Orthodox Catholic Chants', description: 'Cantos sacros orientais', duration: 'Playlist · 1h 24min' },
]

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const seconds = (totalSeconds % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

export const ScholeView: React.FC = () => {
  const { setActiveTab } = useAgoraStore()
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [activeTaskId, setActiveTaskId] = useState(INITIAL_TASKS[0].id)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [cycles, setCycles] = useState(2)
  const [soundtrack, setSoundtrack] = useState(0)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)

  useEffect(() => {
    if (!isRunning) return
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current > 1) return current - 1
        setIsRunning(false)
        setCycles((value) => Math.min(value + 1, 4))
        return 25 * 60
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isRunning])

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? tasks[0],
    [activeTaskId, tasks],
  )

  const toggleTask = (id: string) => {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task))
    setActiveTaskId(id)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setSecondsLeft(25 * 60)
  }

  const focusDim = isRunning ? 'opacity-40' : 'opacity-100'
  const activeSoundtrack = SOUNDTRACKS[soundtrack]

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans selection:bg-accent-gold/30">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-10 sm:py-8 lg:px-16">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveTab('inicio')}
            className="group inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-accent-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
            aria-label="Sair do modo imersão"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Sair da Scholé
          </button>
          <h1 className="font-serif text-2xl font-bold tracking-wide text-text-primary sm:text-3xl">Scholé</h1>
          <div aria-hidden="true" className="w-24" />
        </header>

        <section className="grid flex-1 items-center gap-14 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] lg:gap-24 lg:py-16">
          <div>
            <p className={`mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-gold transition-opacity duration-500 ${isRunning ? 'opacity-40' : 'opacity-100'}`}>Intenção desta sessão</p>
            <div className="mb-8 h-px w-12 bg-accent-gold/70" />
            <div className="space-y-1" role="list" aria-label="Tarefas da sessão">
              {tasks.map((task) => {
                const isActive = task.id === activeTask.id
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={`group flex w-full items-center gap-4 rounded-xl px-3 py-4 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold ${
                      isActive && isRunning ? 'bg-bg-surface/60 text-text-primary' : 'hover:bg-bg-surface/60'
                    } ${task.completed ? 'opacity-30' : isRunning && !isActive ? 'opacity-40' : 'opacity-100'}`}
                    role="listitem"
                    aria-pressed={task.completed}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${task.completed ? 'border-accent-gold bg-accent-gold text-bg-base' : 'border-text-secondary/60 group-hover:border-accent-gold'}`}>
                      {task.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </span>
                    <span className={`text-sm font-medium sm:text-base ${task.completed ? 'text-text-secondary line-through' : ''}`}>{task.label}</span>
                    {isActive && !task.completed && <Circle className="ml-auto h-2 w-2 fill-accent-gold text-accent-gold" aria-label="Tarefa ativa" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-text-secondary">O tempo oportuno</p>
            <div className={`relative grid h-64 w-64 place-items-center rounded-full border transition-all duration-500 sm:h-72 sm:w-72 ${isRunning ? 'border-accent-gold shadow-[0_0_0_12px_rgba(212,175,55,0.04),0_0_42px_rgba(212,175,55,0.18)]' : 'border-text-primary/15'}`}>
              <div className="absolute inset-3 rounded-full border border-text-primary/5" />
              <div className="relative">
                <time className={`font-serif text-6xl font-bold tabular-nums tracking-tight sm:text-7xl ${isRunning ? 'text-accent-gold' : 'text-text-primary'}`}>{formatTime(secondsLeft)}</time>
                <p className="mt-2 text-xs text-text-secondary">{activeTask.label}</p>
              </div>
            </div>
            <div className="mt-7 flex items-center gap-3" aria-label="Controles do Pomodoro">
              <button type="button" onClick={resetTimer} className="grid h-10 w-10 place-items-center rounded-full text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent-gold" aria-label="Reiniciar cronômetro"><RotateCcw className="h-4 w-4" /></button>
              <button type="button" onClick={() => setIsRunning((running) => !running)} className="grid h-12 w-12 place-items-center rounded-full bg-accent-gold text-bg-base shadow-lg shadow-accent-gold/20 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-gold" aria-label={isRunning ? 'Pausar cronômetro' : 'Iniciar cronômetro'}>{isRunning ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current translate-x-0.5" />}</button>
              <button type="button" onClick={() => setSecondsLeft(5 * 60)} className="grid h-10 w-10 place-items-center rounded-full text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent-gold" aria-label="Iniciar pausa curta"><SkipForward className="h-4 w-4" /></button>
            </div>
            <p className="mt-5 text-xs text-text-secondary">Ciclos: <span className="text-text-primary">{cycles}/4</span></p>
          </div>
        </section>

        <footer className={`rounded-2xl border border-text-primary/10 bg-bg-surface/45 px-4 py-3.5 backdrop-blur-sm transition-opacity duration-500 sm:px-5 ${focusDim}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-accent-gold/25 bg-bg-elevated text-accent-gold"><Music2 className="h-4 w-4" /></div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-text-primary">{activeSoundtrack.name}</p>
                <p className="truncate text-[11px] text-text-secondary">YouTube Music · {activeSoundtrack.description} · {activeSoundtrack.duration}</p>
              </div>
              <button type="button" onClick={() => setIsMusicPlaying((playing) => !playing)} className="ml-1 text-accent-gold hover:text-accent-gold-bright focus-visible:outline-2 focus-visible:outline-accent-gold" aria-label={isMusicPlaying ? 'Pausar música' : 'Tocar música'}>{isMusicPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}</button>
              <Volume2 className="hidden h-4 w-4 text-text-secondary sm:block" aria-hidden="true" />
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Selecionar ambiente musical">
              {SOUNDTRACKS.map((item, index) => <button key={item.name} type="button" onClick={() => setSoundtrack(index)} className={`rounded-full border px-3 py-1.5 text-[10px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent-gold ${soundtrack === index ? 'border-accent-gold text-accent-gold' : 'border-text-primary/20 text-text-secondary hover:border-text-primary/45 hover:text-text-primary'}`}>{item.name}</button>)}
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
