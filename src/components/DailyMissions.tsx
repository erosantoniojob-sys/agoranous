import React from 'react'
import { BookMarked, Check, Link2, PenLine } from 'lucide-react'
import { DAILY_MISSIONS, missionKey } from '../lib/journeyProgress'

type DailyMissionsProps = {
  completedMissionKeys: string[]
  onComplete: (missionId: string) => void
}

const MISSION_ICONS = {
  'advance-reading': BookMarked,
  'record-note': PenLine,
  'make-connection': Link2,
}

export const DailyMissions: React.FC<DailyMissionsProps> = ({ completedMissionKeys, onComplete }) => (
  <section className="journey-panel journey-missions" aria-labelledby="daily-missions-title">
    <div className="journey-section-heading">
      <div>
        <p>Progresso diário</p>
        <h2 id="daily-missions-title">Missões de hoje</h2>
      </div>
      <span className="journey-section-count">{completedMissionKeys.filter((key) => key.startsWith(`${new Date().toISOString().slice(0, 10)}:`)).length} / {DAILY_MISSIONS.length}</span>
    </div>

    <div className="journey-missions__grid">
      {DAILY_MISSIONS.map((mission) => {
        const Icon = MISSION_ICONS[mission.id]
        const completed = completedMissionKeys.includes(missionKey(mission.id))
        return (
          <article key={mission.id} className={`mission-card ${completed ? 'mission-card--completed' : ''}`}>
            <div className="mission-card__icon"><Icon className="h-4 w-4" /></div>
            <div className="min-w-0 flex-1">
              <p className="mission-card__eyebrow">{mission.eyebrow}</p>
              <h3>{mission.title}</h3>
              <p className="mission-card__description">{mission.description}</p>
            </div>
            <div className="mission-card__footer">
              <span>+{mission.xp} XP</span>
              <button type="button" onClick={() => onComplete(mission.id)} disabled={completed} className="mission-card__button">
                {completed ? <><Check className="h-3.5 w-3.5" /> Concluída</> : 'Marcar feita'}
              </button>
            </div>
          </article>
        )
      })}
    </div>
  </section>
)
