import React, { useState } from 'react';
import { Compass, Search, Star, Sparkles } from 'lucide-react';
import { useAgoraStore } from '../store/useAgoraStore';
import { MediaCard } from '../components/MediaCard';
import { PhilosopherPortrait } from '../components/PhilosopherPortrait';

export const ExploreView: React.FC = () => {
  const { mediaItems, setSelectedMedia, setIsSearchOpen } = useAgoraStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState<number>(0);

  const filteredItems = mediaItems.filter((item) => {
    const matchesSearch =
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.autor_criador && item.autor_criador.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.sinopse.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating = item.avaliacao_numerica >= minRating;

    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="modern-surface bg-bg-card border border-text-primary/10 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-accent-gold" />
            <h2 className="font-serif font-bold text-2xl text-text-primary">Explorar Acervo</h2>
          </div>
          <PhilosopherPortrait philosopher="socrates" className="h-16 w-16 shrink-0 rounded-2xl sm:h-20 sm:w-20" />
        </div>
        <p className="text-xs text-text-secondary">
          Pesquise por títulos, autores, palavras-chave da sinopse ou filtre por avaliações mínimas.
        </p>

        {/* Local Search Input & Rating Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="sm:col-span-2 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digitar para buscar no acervo local..."
              className="w-full pl-10 pr-4 py-2 bg-bg-main text-text-primary rounded-xl border border-text-primary/15 focus:border-accent-gold focus:outline-none text-xs"
            />
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 bg-bg-main px-3 py-2 rounded-xl border border-text-primary/15">
            <Star className="w-4 h-4 text-accent-gold fill-accent-gold" />
            <span className="text-xs font-medium text-text-secondary whitespace-nowrap">Nota mín.:</span>
            <select
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="bg-transparent text-text-primary text-xs font-semibold focus:outline-none w-full cursor-pointer"
            >
              <option value={0} className="bg-bg-card">Todas as notas</option>
              <option value={4} className="bg-bg-card">4.0 ou mais ★</option>
              <option value={4.5} className="bg-bg-card">4.5 ou mais ★</option>
              <option value={5} className="bg-bg-card">Apenas 5.0 ★</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Resultados Encontrados ({filteredItems.length})
          </span>

          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="text-xs text-accent-gold hover:underline flex items-center gap-1 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Consultar Oráculo Externo
          </button>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-bg-card border border-text-primary/10 rounded-2xl space-y-3">
            <span className="text-2xl text-accent-gold block font-serif">✦</span>
            <p className="text-sm text-text-secondary">Nenhum resultado corresponde à sua pesquisa.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredItems.map((item) => (
              <MediaCard key={item.id} item={item} onClick={() => setSelectedMedia(item)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
