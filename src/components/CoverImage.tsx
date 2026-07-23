import React, { useState } from 'react';
import { BookOpen, Film, Tv, Gamepad2, Sparkles } from 'lucide-react';
import { MediaType } from '../types/agora';

interface CoverImageProps {
  url?: string | null;
  title: string;
  tipo?: MediaType;
  className?: string;
}

export const CoverImage: React.FC<CoverImageProps> = ({ url, title, tipo, className = '' }) => {
  const [error, setError] = useState(false);

  const getMediaIcon = () => {
    switch (tipo) {
      case 'Livro':
        return <BookOpen className="w-8 h-8 text-text-secondary stroke-[1.5]" />;
      case 'Filme':
        return <Film className="w-8 h-8 text-text-secondary stroke-[1.5]" />;
      case 'Série':
        return <Tv className="w-8 h-8 text-text-secondary stroke-[1.5]" />;
      case 'Jogo':
        return <Gamepad2 className="w-8 h-8 text-text-secondary stroke-[1.5]" />;
      default:
        return <Sparkles className="w-8 h-8 text-text-secondary stroke-[1.5]" />;
    }
  };

  const showFallback = !url || error;

  return (
    <div
      className={`relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-bg-card border border-text-primary/10 flex items-center justify-center transition-all duration-300 ${className}`}
    >
      {!showFallback ? (
        <img
          src={url}
          alt={`Capa de ${title}`}
          loading="lazy"
          onError={() => setError(true)}
          className="w-full h-full object-cover rounded-xl transition-transform duration-500 hover:scale-105"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-4 text-center gap-2 bg-bg-card w-full h-full">
          {getMediaIcon()}
          <span className="font-serif text-2xl font-bold text-accent-gold/80 select-none">
            {title ? title.charAt(0).toUpperCase() : '✦'}
          </span>
          <span className="text-[11px] text-text-secondary max-w-[90%] truncate font-medium">
            {title}
          </span>
        </div>
      )}
    </div>
  );
};
