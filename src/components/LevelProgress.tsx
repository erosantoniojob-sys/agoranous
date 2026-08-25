import React from 'react'
import { Sparkles } from 'lucide-react'

type LevelProgressProps = {
  level: number
  title: string
  earnedWithinLevel: number
  levelSpan: number
  progress: number
  nextTitle: string | null
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
  level,
  title,
  earnedWithinLevel,
  levelSpan,
  progress,
  nextTitle,
}) => (
  <section className="level-progress" aria-label={`Nível ${level}, ${title}`}>
    <div className="level-progress__topline">
      <span className="level-progress__seal"><Sparkles className="h-3.5 w-3.5" /> Nível {level}</span>
      <span className="level-progress__next">{nextTitle ? `rumo a ${nextTitle}` : 'cume alcançado'}</span>
    </div>
    <div className="mt-3 flex items-end justify-between gap-3">
      <div>
        <p className="font-serif text-2xl font-semibold leading-none text-text-primary sm:text-3xl">{title}</p>
        <p className="mt-2 text-xs text-text-secondary">{earnedWithinLevel.toLocaleString('pt-BR')} / {levelSpan.toLocaleString('pt-BR')} XP neste nível</p>
      </div>
      <strong className="font-serif text-lg font-semibold text-accent-gold">{progress}%</strong>
    </div>
    <div className="level-progress__track mt-3" role="progressbar" aria-label="Progresso para o próximo nível" aria-valuemin={0} aria-valuemax={levelSpan} aria-valuenow={earnedWithinLevel}>
      <span className="level-progress__fill" style={{ width: `${progress}%` }} />
    </div>
  </section>
)
