import React from 'react'
import { Star, Play, BookOpen, Film, Tv, Gamepad2 } from 'lucide-react'
import { MediaItem } from '../types/agora'
import { CoverImage } from './CoverImage'

interface NetflixMediaCardProps {
  item: MediaItem
  onClick: () => void
}

export const NetflixMediaCard: React.FC<NetflixMediaCardProps> = ({ item, onClick }) => {
  const coverUrl = item.url_capa_oficial || item.capa_oficial || item.url_capa || ''

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'bg-emerald-500/80 text-emerald-100'
      case 'Lendo':
      case 'Assistindo':
      case 'Jogando':
        return 'bg-amber-500/80 text-amber-100'
      default:
        return 'bg-slate-700/80 text-slate-200'
    }
  }

  return (
    <div
      data-depth-surface="cover"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Abrir ${item.titulo}`}
      className="group media-cover-depth relative aspect-[2/3] w-36 sm:w-44 flex-shrink-0 snap-start rounded-xl overflow-hidden cursor-pointer shadow-3d-card focus:outline-none focus:ring-2 focus:ring-accent-gold"
    >
      <span className="depth-glare" aria-hidden="true" />
      {/* Base Image Cover without title or thick borders */}
      <CoverImage url={coverUrl} title={item.titulo} tipo={item.tipo} />

      {/* Top right subtle status dot or rating badge */}
      <div className="absolute top-2 right-2 z-10 opacity-90 transition-opacity">
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase backdrop-blur-md bg-bg-base/80 border border-accent-gold/30 text-accent-gold flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5 fill-accent-gold" />
          <span>{item.avaliacao_numerica > 0 ? item.avaliacao_numerica.toFixed(1) : '-'}</span>
        </span>
      </div>

      {/* Overlay on hover/focus - title and quick info */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-bg-base via-bg-base/80 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end gap-1.5 backdrop-blur-[2px]">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-semibold text-accent-gold uppercase tracking-wider">
            {item.tipo}
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getStatusBadgeColor(item.status)}`}>
            {item.status}
          </span>
        </div>

        <h4 className="font-serif font-bold text-xs sm:text-sm text-text-primary leading-tight line-clamp-2">
          {item.titulo}
        </h4>

        {item.autor_criador && (
          <p className="text-[10px] text-text-secondary line-clamp-1">
            {item.autor_criador}
          </p>
        )}

        {item.progresso_percentual !== undefined && item.progresso_percentual > 0 && (
          <div className="w-full h-1 bg-bg-surface rounded-full overflow-hidden mt-1 border border-text-primary/10">
            <div
              className="h-full bg-accent-gold rounded-full transition-all"
              style={{ width: `${item.progresso_percentual}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
