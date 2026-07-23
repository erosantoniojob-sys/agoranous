import React from 'react';
import { Star } from 'lucide-react';
import { MediaItem } from '../types/agora';
import { CoverImage } from './CoverImage';

interface MediaCardProps {
  item: MediaItem;
  onClick: () => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, onClick }) => {
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Lendo':
      case 'Assistindo':
      case 'Jogando':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Concluído':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Pendente':
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer bg-bg-card border border-text-primary/10 hover:border-accent-gold/50 rounded-xl p-3 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
    >
      {/* Cover Image Container */}
      <div className="relative">
        <CoverImage url={item.url_capa} title={item.titulo} tipo={item.tipo} />

        {/* Top subtle status badge */}
        <div className="absolute top-2 left-2 z-10">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase backdrop-blur-md border ${getStatusBadgeStyle(
              item.status
            )}`}
          >
            {item.status}
          </span>
        </div>

        {/* Top right rating badge visible outside */}
        <div className="absolute top-2 right-2 z-10">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-bg-main/80 backdrop-blur-md border border-accent-gold/30 text-accent-gold text-xs font-semibold">
            <Star className="w-3 h-3 fill-accent-gold text-accent-gold" />
            <span>{item.avaliacao_numerica > 0 ? item.avaliacao_numerica.toFixed(1) : '-'}</span>
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="flex flex-col flex-1 gap-1">
        <div className="flex items-center justify-between text-xs text-text-secondary font-medium">
          <span>{item.tipo}</span>
          {item.ano && <span>{item.ano}</span>}
        </div>

        <h3 className="font-serif font-bold text-base text-text-primary group-hover:text-accent-gold transition-colors line-clamp-1">
          {item.titulo}
        </h3>

        {item.autor_criador && (
          <p className="text-xs text-text-secondary line-clamp-1">{item.autor_criador}</p>
        )}

        <p className="text-xs text-slate-400/90 line-clamp-2 mt-1 leading-relaxed">
          {item.sinopse}
        </p>
      </div>
    </article>
  );
};
