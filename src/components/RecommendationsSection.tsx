import React, { useEffect, useState } from 'react'
import { Compass, Plus, Check, Sparkles } from 'lucide-react'
import { useAgoraStore, Recommendation } from '../store/useAgoraStore'
import { CoverImage } from './CoverImage'

export const RecommendationsSection: React.FC = () => {
  const { fetchRecommendations, addMedia, mediaItems, setSelectedMedia } = useAgoraStore()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let active = true
    async function loadRecs() {
      setLoading(true)
      const data = await fetchRecommendations()
      if (active) {
        setRecommendations(data)
        setLoading(false)
      }
    }
    loadRecs()
    return () => {
      active = false
    }
  }, [fetchRecommendations])

  const isAlreadyInLibrary = (recTitle: string) => {
    return mediaItems.some(
      (m) => m.titulo.toLowerCase().trim() === recTitle.toLowerCase().trim()
    )
  }

  const handleAddRecommendation = (rec: Recommendation, e: React.MouseEvent) => {
    e.stopPropagation()

    if (isAlreadyInLibrary(rec.titulo)) return

    const newMedia = addMedia({
      titulo: rec.titulo,
      tipo: rec.tipo,
      url_capa: rec.url_capa,
      sinopse: rec.sinopse,
      status: 'Pendente',
      avaliacao_numerica: 0,
      autor_criador: rec.autor_criador,
      ano: rec.ano,
      generos: rec.generos,
      fonte: rec.fonte || 'Curadoria Ágora',
    })

    setAddedIds((prev) => new Set(prev).add(rec.id))
    setSelectedMedia(newMedia)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-text-secondary">
          <Compass className="w-4 h-4 text-accent-gold animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Consultando o catálogo bibliográfico...
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-32 bg-bg-card/50 border border-text-primary/10 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-lg text-text-primary flex items-center gap-2">
            <Compass className="w-4 h-4 text-accent-gold" />
            Obras para o seu percurso
          </h3>
          <p className="text-xs text-text-secondary">
            Uma curadoria que aproxima seus interesses, seu acervo e as trilhas que você já começou.
          </p>
        </div>
        <span className="text-[10px] font-semibold text-accent-gold uppercase tracking-widest bg-accent-gold/10 px-2.5 py-1 rounded-full border border-accent-gold/20">
          Curadoria pessoal
        </span>
      </div>

      {/* Recommendations Horizontal Carousel / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recommendations.map((rec) => {
          const inLib = isAlreadyInLibrary(rec.titulo) || addedIds.has(rec.id)

          return (
            <div
              key={rec.id}
              className="bg-bg-card border border-text-primary/10 hover:border-accent-gold/40 rounded-xl p-3.5 flex flex-col justify-between space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-black/30 group"
            >
              <div className="flex gap-3 items-start">
                <div className="w-16 flex-shrink-0 shadow-md">
                  <CoverImage url={rec.url_capa} title={rec.titulo} tipo={rec.tipo} />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-accent-gold/15 text-accent-gold border border-accent-gold/25 inline-block">
                    {rec.tipo}
                  </span>

                  <h4 className="font-serif font-bold text-sm text-text-primary line-clamp-1 group-hover:text-accent-gold transition-colors">
                    {rec.titulo}
                  </h4>

                  <p className="text-[11px] text-text-secondary truncate">
                    {rec.autor_criador} ({rec.ano})
                  </p>

                  <p className="text-[10px] text-slate-300/80 line-clamp-2 pt-0.5 italic">
                    {rec.motivoRecomendacao}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={(e) => handleAddRecommendation(rec, e)}
                disabled={inLib}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  inLib
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-bg-main hover:bg-accent-gold text-text-primary hover:text-bg-main border border-text-primary/15 hover:border-accent-gold'
                }`}
              >
                {inLib ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>No Acervo</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-accent-gold group-hover:text-bg-main" />
                    <span>Adicionar Obra</span>
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
