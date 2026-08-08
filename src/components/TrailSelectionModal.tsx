import React, { useState } from 'react'
import { X, Network, Plus, Check, Layers, Sparkles, BookOpen } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { useModalAccessibility } from '../lib/useModalAccessibility'

interface TrailSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTrail?: (trailId: string) => void
}

export const TrailSelectionModal: React.FC<TrailSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectTrail,
}) => {
  const { customTrails, mediaItems, addCustomTrail, updateCustomTrail, setActiveTab } = useAgoraStore()

  const [mode, setMode] = useState<'choose' | 'create'>('choose')
  const [trailName, setTrailName] = useState('')
  const [trailDesc, setTrailDesc] = useState('')
  const [trailCat, setTrailCat] = useState('Filosofia & Cosmovisão')
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([])
  const [objective, setObjective] = useState('')
  const [centralQuestion, setCentralQuestion] = useState('')
  const [finalProject, setFinalProject] = useState('')
  const modalRef = useModalAccessibility<HTMLDivElement>(isOpen, onClose)

  if (!isOpen) return null

  const handleCreateTrail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trailName.trim()) return

    const newTrail = addCustomTrail(
      trailName.trim(),
      trailDesc.trim(),
      selectedMediaIds,
      trailCat
    )
    updateCustomTrail(newTrail.id, { objetivo: objective.trim(), pergunta_central: centralQuestion.trim(), projeto_final: finalProject.trim(), etapas: ['Fundamentos', 'Leitura orientada', 'Síntese e revisão'], criterio_conclusao: 'Concluir as obras e produzir a síntese final.' })

    setTrailName('')
    setTrailDesc('')
    setSelectedMediaIds([])
    setObjective(''); setCentralQuestion(''); setFinalProject('')
    setMode('choose')

    if (onSelectTrail) {
      onSelectTrail(newTrail.id)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans">
      <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="trail-selection-title" className="w-full max-w-lg bg-bg-surface border border-accent-gold/40 rounded-2xl shadow-3d-deep p-6 space-y-5 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-text-primary/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accent-gold/15 text-accent-gold border border-accent-gold/30">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 id="trail-selection-title" className="font-serif font-bold text-lg text-text-primary">
                Escolher ou Criar Trilha
              </h3>
              <p className="text-xs text-text-secondary">
                Gerencie suas jornadas temáticas do Segundo Cérebro
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar seleção de trilha"
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-base rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch mode */}
        <div className="flex bg-bg-base p-1 rounded-xl border border-text-primary/10">
          <button
            onClick={() => setMode('choose')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'choose'
                ? 'bg-accent-gold text-bg-base shadow-md'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Escolher Existente ({customTrails.length})
          </button>
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'create'
                ? 'bg-accent-gold text-bg-base shadow-md'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            + Criar Nova Trilha
          </button>
        </div>

        {/* MODE 1: CHOOSE TRAIL */}
        {mode === 'choose' && (
          <div className="space-y-3">
            {customTrails.length === 0 ? (
              <div className="p-8 text-center bg-bg-base rounded-xl border border-text-primary/10 space-y-3">
                <Sparkles className="w-8 h-8 text-accent-gold mx-auto" />
                <h4 className="font-serif font-bold text-sm text-text-primary">
                  Nenhuma trilha criada ainda
                </h4>
                <p className="text-xs text-text-secondary">
                  Crie sua primeira trilha para conectar suas leituras, filmes e estudos em um percurso estruturado.
                </p>
                <button
                  onClick={() => setMode('create')}
                  className="py-2 px-4 bg-accent-gold text-bg-base font-bold text-xs rounded-xl uppercase tracking-wider shadow-md cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Trilha Agora</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {customTrails.map((trail) => (
                  <div
                    key={trail.id}
                    onClick={() => {
                      if (onSelectTrail) onSelectTrail(trail.id)
                      setActiveTab('memoria')
                      onClose()
                    }}
                    className="p-3.5 bg-bg-base hover:bg-bg-elevated border border-text-primary/10 hover:border-accent-gold/50 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-accent-gold px-2 py-0.5 rounded bg-accent-gold/10 border border-accent-gold/20">
                          {trail.categoria || 'Geral'}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-text-primary group-hover:text-accent-gold truncate">
                          {trail.nome}
                        </h4>
                      </div>
                      <p className="text-xs text-text-secondary truncate">
                        {trail.descricao || 'Sem descrição'} • {trail.mediaIds.length} conteúdos
                      </p>
                    </div>

                    <span className="font-serif font-bold text-accent-gold text-sm flex-shrink-0">
                      {trail.progresso_percentual || 0}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODE 2: CREATE NEW TRAIL */}
        {mode === 'create' && (
          <form onSubmit={handleCreateTrail} className="space-y-4">
            <div className="flex flex-wrap gap-2">{[
              ['Filosofia Grega','Compreender virtude, justiça e vida boa','O que constitui uma vida boa?'],
              ['Literatura Russa','Investigar liberdade, culpa e redenção','Como a liberdade transforma a responsabilidade?'],
              ['Cinema Contemplativo','Ler imagens, silêncio e transcendência','Como o cinema torna visível o interior?'],
            ].map(([name,goal,question]) => <button key={name} type="button" onClick={() => { setTrailName(name); setObjective(goal); setCentralQuestion(question); setTrailCat('Modelo guiado') }} className="rounded-full border border-accent-gold/30 px-3 py-1 text-[10px] text-accent-gold hover:bg-accent-gold/10">{name}</button>)}</div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-text-secondary">
                Nome da Trilha
              </label>
              <input
                type="text"
                required
                value={trailName}
                onChange={(e) => setTrailName(e.target.value)}
                placeholder="Ex: Teologia Reformada & Existencialismo"
                className="w-full p-2.5 bg-bg-base text-text-primary rounded-xl border border-text-primary/15 focus:border-accent-gold focus:outline-none text-xs"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold uppercase text-text-secondary">Objetivo<input value={objective} onChange={event => setObjective(event.target.value)} placeholder="O que deseja formar?" className="mt-1 w-full rounded-xl border border-text-primary/15 bg-bg-base p-2.5 text-xs normal-case text-text-primary outline-none focus:border-accent-gold" /></label><label className="text-xs font-semibold uppercase text-text-secondary">Pergunta central<input value={centralQuestion} onChange={event => setCentralQuestion(event.target.value)} placeholder="Qual pergunta orienta a trilha?" className="mt-1 w-full rounded-xl border border-text-primary/15 bg-bg-base p-2.5 text-xs normal-case text-text-primary outline-none focus:border-accent-gold" /></label></div>
            <label className="block text-xs font-semibold uppercase text-text-secondary">Projeto final<input value={finalProject} onChange={event => setFinalProject(event.target.value)} placeholder="Ensaio, apresentação ou síntese" className="mt-1 w-full rounded-xl border border-text-primary/15 bg-bg-base p-2.5 text-xs normal-case text-text-primary outline-none focus:border-accent-gold" /></label>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-text-secondary">
                Descrição Curta
              </label>
              <input
                type="text"
                value={trailDesc}
                onChange={(e) => setTrailDesc(e.target.value)}
                placeholder="Ex: Análise comparativa entre graça, liberdade e responsabilidade moral."
                className="w-full p-2.5 bg-bg-base text-text-primary rounded-xl border border-text-primary/15 focus:border-accent-gold focus:outline-none text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-text-secondary">
                Vincular Obras do Seu Acervo
              </label>
              {mediaItems.length === 0 ? (
                <p className="text-xs text-text-secondary italic p-3 bg-bg-base rounded-xl border border-text-primary/10">
                  Nenhuma obra cadastrada ainda no seu acervo.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-bg-base rounded-xl border border-text-primary/10">
                  {mediaItems.map((m) => {
                    const isSel = selectedMediaIds.includes(m.id)
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          if (isSel) {
                            setSelectedMediaIds(selectedMediaIds.filter((id) => id !== m.id))
                          } else {
                            setSelectedMediaIds([...selectedMediaIds, m.id])
                          }
                        }}
                        className={`p-2 rounded-lg text-left text-xs font-medium border flex items-center justify-between transition-all cursor-pointer ${
                          isSel
                            ? 'bg-accent-gold/20 text-accent-gold border-accent-gold'
                            : 'bg-bg-surface text-text-primary border-text-primary/10 hover:border-accent-gold/30'
                        }`}
                      >
                        <span className="truncate">{m.titulo} ({m.tipo})</span>
                        {isSel && <Check className="w-3.5 h-3.5 flex-shrink-0 text-accent-gold" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMode('choose')}
                className="px-4 py-2 bg-bg-base text-text-secondary hover:text-text-primary rounded-xl text-xs font-semibold"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={!trailName.trim()}
                className="px-5 py-2 bg-accent-gold hover:bg-accent-gold-bright disabled:opacity-50 text-bg-base font-bold text-xs rounded-xl uppercase tracking-wider shadow-md cursor-pointer flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Trilha</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
