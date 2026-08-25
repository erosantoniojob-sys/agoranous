import React from 'react'
import { ArrowUpRight, Compass, LockKeyhole, Sparkles } from 'lucide-react'
import type { CustomTrail, MediaItem } from '../types/agora'

type JourneyCampaignProps = {
  trail: CustomTrail | null
  mediaById: Map<string, MediaItem>
  onOpen: () => void
  onCreate: () => void
}

export const JourneyCampaign: React.FC<JourneyCampaignProps> = ({ trail, mediaById, onOpen, onCreate }) => {
  if (!trail) {
    return (
      <section className="journey-panel journey-campaign journey-campaign--empty" aria-labelledby="campaign-title">
        <div className="journey-section-heading">
          <div><p>Progresso intermediário</p><h2 id="campaign-title">Sua próxima campanha</h2></div>
        </div>
        <div className="journey-campaign__empty">
          <span><Compass className="h-5 w-5" /></span>
          <div><h3>Desenhe um percurso que valha a pena atravessar.</h3><p>Uma trilha transforma obras, perguntas e sínteses em uma campanha intelectual.</p></div>
          <button type="button" onClick={onCreate}>Criar trilha <ArrowUpRight className="h-4 w-4" /></button>
        </div>
      </section>
    )
  }

  const steps = (trail.etapas?.filter(Boolean).length ? trail.etapas : trail.mediaIds.map((id) => mediaById.get(id)?.titulo).filter(Boolean)) as string[]
  const visibleSteps = steps.length ? steps.slice(0, 6) : ['Fundamentos', 'Leitura orientada', 'Síntese']
  const completedSteps = Math.min(visibleSteps.length, Math.floor(((trail.progresso_percentual || 0) / 100) * visibleSteps.length))

  return (
    <section className="journey-panel journey-campaign" aria-labelledby="campaign-title">
      <div className="journey-section-heading">
        <div><p>Progresso intermediário</p><h2 id="campaign-title">Continuar jornada</h2></div>
        <button type="button" onClick={onOpen} className="journey-link">Abrir trilha <ArrowUpRight className="h-3.5 w-3.5" /></button>
      </div>

      <div className="journey-campaign__header">
        <div><span>{trail.categoria || 'Campanha'}</span><h3>{trail.nome}</h3><p>{trail.pergunta_central || trail.descricao || 'Um caminho para ligar repertório e intenção.'}</p></div>
        <strong>{trail.progresso_percentual || 0}%</strong>
      </div>

      <ol className="campaign-path" aria-label={`Etapas da trilha ${trail.nome}`}>
        {visibleSteps.map((step, index) => {
          const completed = index < completedSteps
          const current = index === completedSteps && completedSteps < visibleSteps.length
          return (
            <li key={`${step}-${index}`} className={completed ? 'is-complete' : current ? 'is-current' : ''}>
              <span className="campaign-path__node">{completed ? <Sparkles className="h-3 w-3" /> : current ? <span /> : <LockKeyhole className="h-3 w-3" />}</span>
              <span className="campaign-path__label">{step}</span>
            </li>
          )
        })}
        <li className="campaign-path__final"><span className="campaign-path__node">✦</span><span className="campaign-path__label">Síntese</span></li>
      </ol>
    </section>
  )
}
