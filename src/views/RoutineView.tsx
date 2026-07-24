import React, { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, ChevronRight, Dumbbell, Flame, Plus, TimerReset } from 'lucide-react'
import { readScholeValue, writeScholeValue } from '../lib/scholeStorage'
import { useAgoraStore } from '../store/useAgoraStore'

type Habit = { id: string; name: string; completed: boolean }
type Workout = { id: string; name: string; detail: string; duration: number; completed: boolean }

const DEFAULT_HABITS: Habit[] = [
  { id: 'water', name: 'Hidratação consciente', completed: false },
  { id: 'movement', name: 'Movimento e mobilidade', completed: false },
  { id: 'reading', name: 'Leitura intencional', completed: false },
]
const DEFAULT_WORKOUTS: Workout[] = [
  { id: 'strength', name: 'Força essencial', detail: 'Peito, costas e pernas', duration: 45, completed: false },
  { id: 'walk', name: 'Caminhada restauradora', detail: 'Ritmo leve, sem notificações', duration: 30, completed: false },
]
const todayKey = new Date().toISOString().slice(0, 10)
const key = (item: string) => `routine.${todayKey}.${item}`

export const RoutineView: React.FC = () => {
  const { setActiveTab } = useAgoraStore()
  const [habits, setHabits] = useState<Habit[]>(() => readScholeValue(key('habits'), DEFAULT_HABITS))
  const [workouts, setWorkouts] = useState<Workout[]>(() => readScholeValue(key('workouts'), DEFAULT_WORKOUTS))
  const [isCreating, setIsCreating] = useState(false)
  const [workoutName, setWorkoutName] = useState('')
  const [workoutMinutes, setWorkoutMinutes] = useState(30)

  useEffect(() => writeScholeValue(key('habits'), habits), [habits])
  useEffect(() => writeScholeValue(key('workouts'), workouts), [workouts])

  const completedHabits = habits.filter((habit) => habit.completed).length
  const completedWorkouts = workouts.filter((workout) => workout.completed).length
  const consistency = useMemo(() => Math.round(((completedHabits + completedWorkouts) / Math.max(habits.length + workouts.length, 1)) * 100), [completedHabits, completedWorkouts, habits.length, workouts.length])

  const addWorkout = (event: React.FormEvent) => {
    event.preventDefault()
    if (!workoutName.trim()) return
    setWorkouts((current) => [...current, { id: crypto.randomUUID?.() ?? String(Date.now()), name: workoutName.trim(), detail: 'Sessão personalizada', duration: Math.max(5, workoutMinutes), completed: false }])
    setWorkoutName('')
    setWorkoutMinutes(30)
    setIsCreating(false)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <header className="flex items-center justify-between">
        <button onClick={() => setActiveTab('inicio')} className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-accent-gold"><ArrowLeft className="h-4 w-4" />Voltar</button>
        <div className="text-right"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-gold">Estilo de vida</p><h1 className="font-serif text-2xl font-bold">Rotina & Hábitos</h1></div>
      </header>

      <section className="grid gap-4 sm:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-text-primary/10 bg-bg-surface p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Constância de hoje</p><p className="mt-2 font-serif text-4xl font-bold text-accent-gold">{consistency}%</p></div><div className="grid h-11 w-11 place-items-center rounded-xl border border-accent-gold/30 bg-bg-elevated text-accent-gold"><Flame className="h-5 w-5" /></div></div><p className="mt-4 text-sm text-text-secondary">Pequenas práticas, registradas com honestidade. O objetivo é voltar amanhã.</p></div>
        <button onClick={() => setActiveTab('schole')} className="group rounded-2xl border border-text-primary/10 bg-bg-surface p-6 text-left transition-colors hover:border-accent-gold/50"><TimerReset className="h-5 w-5 text-accent-gold" /><p className="mt-4 font-serif text-lg font-bold">Preparar foco</p><p className="mt-1 text-xs text-text-secondary">Abra a Scholé para sua próxima sessão.</p><ChevronRight className="mt-3 h-4 w-4 text-text-secondary transition-transform group-hover:translate-x-1 group-hover:text-accent-gold" /></button>
      </section>

      <section className="rounded-2xl border border-text-primary/10 bg-bg-surface p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-gold">Práticas diárias</p><h2 className="mt-1 font-serif text-xl font-bold">Hábitos</h2></div><span className="text-xs text-text-secondary">{completedHabits}/{habits.length}</span></div><div className="grid gap-2 sm:grid-cols-3">{habits.map((habit) => <button key={habit.id} onClick={() => setHabits((current) => current.map((item) => item.id === habit.id ? { ...item, completed: !item.completed } : item))} className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition-colors ${habit.completed ? 'border-accent-gold/50 bg-accent-gold/10 text-text-primary' : 'border-text-primary/10 bg-bg-base/40 text-text-secondary hover:border-text-primary/30'}`}><span className={`grid h-5 w-5 place-items-center rounded-md border ${habit.completed ? 'border-accent-gold bg-accent-gold text-bg-base' : 'border-text-secondary/50'}`}>{habit.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}</span>{habit.name}</button>)}</div></section>

      <section className="rounded-2xl border border-text-primary/10 bg-bg-surface p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-gold">Corpo em movimento</p><h2 className="mt-1 font-serif text-xl font-bold">Sessões de treino</h2></div><button onClick={() => setIsCreating((open) => !open)} className="inline-flex items-center gap-1.5 rounded-full border border-accent-gold/50 px-3 py-1.5 text-xs font-semibold text-accent-gold hover:bg-accent-gold/10"><Plus className="h-3.5 w-3.5" />Sessão</button></div>
        {isCreating && <form onSubmit={addWorkout} className="mb-4 grid gap-2 rounded-xl border border-text-primary/10 bg-bg-base/50 p-3 sm:grid-cols-[1fr_100px_auto]"><input value={workoutName} onChange={(event) => setWorkoutName(event.target.value)} placeholder="Ex.: Treino de superiores" className="rounded-lg border border-text-primary/15 bg-bg-base px-3 py-2 text-sm outline-none focus:border-accent-gold" /><input type="number" min="5" value={workoutMinutes} onChange={(event) => setWorkoutMinutes(Number(event.target.value))} className="rounded-lg border border-text-primary/15 bg-bg-base px-3 py-2 text-sm outline-none focus:border-accent-gold" /><button className="rounded-lg bg-accent-gold px-4 py-2 text-xs font-bold text-bg-base">Criar</button></form>}
        <div className="space-y-2">{workouts.map((workout) => <button key={workout.id} onClick={() => setWorkouts((current) => current.map((item) => item.id === workout.id ? { ...item, completed: !item.completed } : item))} className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${workout.completed ? 'border-accent-gold/40 bg-accent-gold/5' : 'border-text-primary/10 bg-bg-base/30 hover:border-text-primary/30'}`}><span className={`grid h-9 w-9 place-items-center rounded-lg ${workout.completed ? 'bg-accent-gold text-bg-base' : 'bg-bg-elevated text-accent-gold'}`}>{workout.completed ? <Check className="h-4 w-4" /> : <Dumbbell className="h-4 w-4" />}</span><span className="min-w-0 flex-1"><span className={`block text-sm font-semibold ${workout.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{workout.name}</span><span className="text-xs text-text-secondary">{workout.detail}</span></span><span className="text-xs text-text-secondary">{workout.duration} min</span></button>)}</div>
      </section>
    </div>
  )
}
