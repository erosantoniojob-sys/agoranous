import type { CSSProperties } from 'react'
import { Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX } from 'lucide-react'

type PomodoroDialProps = {
  secondsLeft: number
  totalSeconds: number
  isRunning: boolean
  isBreak: boolean
  taskLabel?: string
  cycles: number
  goal: number
  soundEnabled: boolean
  onToggle: () => void
  onReset: () => void
  onSkip: () => void
  onToggleSound: () => void
}

const formatTime = (total: number) => `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`

export function PomodoroDial({
  secondsLeft,
  totalSeconds,
  isRunning,
  isBreak,
  taskLabel,
  cycles,
  goal,
  soundEnabled,
  onToggle,
  onReset,
  onSkip,
  onToggleSound,
}: PomodoroDialProps) {
  const progress = totalSeconds > 0 ? Math.min(1, Math.max(0, 1 - secondsLeft / totalSeconds)) : 0
  const progressDegrees = `${progress * 360}deg`
  const endTime = new Date(Date.now() + secondsLeft * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const stateLabel = isBreak
    ? isRunning ? 'Pausa em curso' : 'Pausa suspensa'
    : isRunning ? 'Sessão em órbita' : progress > 0 ? 'Tempo suspenso' : 'Pronto para começar'
  const dialStyle = { '--timer-progress': progressDegrees } as CSSProperties

  return (
    <div className="pomodoro-stage">
      <div
        className="pomodoro-dial"
        data-depth-surface
        data-running={isRunning}
        data-phase={isBreak ? 'break' : 'focus'}
        style={dialStyle}
      >
        <span className="pomodoro-dial__ticks" aria-hidden="true" />
        <span className="pomodoro-dial__orbit pomodoro-dial__orbit--outer" aria-hidden="true"><i /></span>
        <span className="pomodoro-dial__orbit pomodoro-dial__orbit--inner" aria-hidden="true"><i /></span>
        <span className="pomodoro-dial__halo" aria-hidden="true" />
        <span className="depth-glare" aria-hidden="true" />

        <div className="pomodoro-dial__face" role="timer" aria-label={`${stateLabel}. ${formatTime(secondsLeft)} restantes.`}>
          <span className="pomodoro-dial__state">{stateLabel}</span>
          <time dateTime={`PT${secondsLeft}S`}>{formatTime(secondsLeft)}</time>
          <p title={taskLabel}>{taskLabel || 'Crie uma tarefa para começar'}</p>
          {isRunning && <span className="pomodoro-dial__finish">Até {endTime}</span>}
        </div>
      </div>

      <div className="pomodoro-cycles" aria-label={`${cycles} de ${goal} ciclos concluídos`}>
        {Array.from({ length: goal }, (_, index) => (
          <span key={index} className={index < cycles ? 'is-complete' : index === cycles ? 'is-current' : ''} aria-hidden="true"><i /></span>
        ))}
      </div>

      <div className="pomodoro-controls">
        <button type="button" onClick={onReset} className="pomodoro-control pomodoro-control--minor" aria-label="Reiniciar foco" title="Reiniciar (R)">
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onToggle}
          disabled={!isRunning && !taskLabel && !isBreak}
          className="pomodoro-control pomodoro-control--primary"
          aria-label={isRunning ? 'Pausar cronômetro' : 'Iniciar cronômetro'}
          aria-pressed={isRunning}
          title={`${isRunning ? 'Pausar' : 'Iniciar'} (Espaço)`}
        >
          {isRunning ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current translate-x-0.5" />}
        </button>
        <button type="button" onClick={onSkip} className="pomodoro-control pomodoro-control--minor" aria-label={isBreak ? 'Voltar ao foco' : 'Iniciar pausa'} title={`${isBreak ? 'Voltar ao foco' : 'Iniciar pausa'} (B)`}>
          <SkipForward className="h-4 w-4" />
        </button>
      </div>

      <div className="pomodoro-meta">
        <span>Ciclos <b>{cycles}/{goal}</b></span>
        <button type="button" onClick={onToggleSound} aria-pressed={soundEnabled} title="Alternar sons (M)">
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          {soundEnabled ? 'Sons ativos' : 'Sons inativos'}
        </button>
      </div>
    </div>
  )
}
