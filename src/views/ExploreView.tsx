import React, { useMemo, useState } from 'react';
import { Compass, Search, Star, Sparkles, Tags } from 'lucide-react';
import { useAgoraStore } from '../store/useAgoraStore';
import { MediaCard } from '../components/MediaCard';
import { PhilosopherPortrait } from '../components/PhilosopherPortrait';
import {
  genreFilter,
  getMediaFilterLabel,
  isAllMediaFilter,
  KNOWLEDGE_REALM_DEFINITIONS,
  knowledgeRealmFilter,
  MEDIA_FORMAT_DEFINITIONS,
  mediaMatchesFilter,
  mediaMatchesRealm,
  mediaTypeFilter,
  normalizeCategoryText,
} from '../lib/knowledgeRealms';

export const ExploreView: React.FC = () => {
  const {
    customCategories,
    mediaItems,
    selectedFilter,
    setSelectedFilter,
    setSelectedMedia,
    setIsSearchOpen,
  } = useAgoraStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState<number>(0);
  const normalizedSearch = normalizeCategoryText(searchTerm);
  const selectedFilterLabel = getMediaFilterLabel(selectedFilter);

  const formatOptions = useMemo(
    () => MEDIA_FORMAT_DEFINITIONS.filter((format) => mediaItems.some((item) => item.tipo === format.type)),
    [mediaItems],
  );
  const realmOptions = useMemo(
    () => KNOWLEDGE_REALM_DEFINITIONS.filter((realm) => mediaItems.some((item) => mediaMatchesRealm(item, realm))),
    [mediaItems],
  );
  const knownFilterValues = useMemo(() => new Set([
    'Todos',
    ...formatOptions.map((format) => mediaTypeFilter(format.type)),
    ...realmOptions.map((realm) => knowledgeRealmFilter(realm.id)),
    ...customCategories.map((category) => genreFilter(category.label)),
  ]), [customCategories, formatOptions, realmOptions]);

  const filteredItems = useMemo(
    () => mediaItems.filter((item) => {
      const searchableText = normalizeCategoryText([
        item.titulo,
        item.autor_criador || '',
        item.sinopse,
        ...(item.generos || []),
      ].join(' '));
      const matchesSearch = searchableText.includes(normalizedSearch);

      const matchesRating = item.avaliacao_numerica >= minRating;
      const matchesCategory = mediaMatchesFilter(item, selectedFilter);

      return matchesSearch && matchesRating && matchesCategory;
    }),
    [mediaItems, minRating, normalizedSearch, selectedFilter],
  );

  const clearFilters = () => {
    setSearchTerm('');
    setMinRating(0);
    setSelectedFilter('Todos');
  };

  return (
    <div className="explore-view space-y-4 pb-10">
      {/* Header */}
      <div className="explore-filter-panel modern-surface space-y-3 rounded-2xl border border-text-primary/10 bg-bg-card p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-accent-gold" />
            <h2 className="font-serif text-xl font-bold text-text-primary">Explorar Acervo</h2>
          </div>
          <PhilosopherPortrait philosopher="socrates" className="h-12 w-12 shrink-0 rounded-xl sm:h-14 sm:w-14" />
        </div>
        <p className="text-xs text-text-secondary">
          Pesquise por títulos, autores, palavras-chave da sinopse ou filtre por avaliações mínimas.
        </p>

        {/* Local Search Input & Rating Filter */}
        <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 relative">
            <input
              type="text"
              aria-label="Buscar no acervo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digitar para buscar no acervo local..."
              className="w-full pl-10 pr-4 py-2 bg-bg-main text-text-primary rounded-xl border border-text-primary/15 focus:border-accent-gold focus:outline-none text-xs"
            />
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 bg-bg-main px-3 py-2 rounded-xl border border-text-primary/15">
            <Tags className="w-4 h-4 text-accent-gold" />
            <select
              aria-label="Categoria do acervo"
              value={selectedFilter}
              onChange={(event) => setSelectedFilter(event.target.value)}
              className="w-full cursor-pointer bg-transparent text-xs font-semibold text-text-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
            >
              <option value="Todos" className="bg-bg-card">Todo o acervo</option>
              {!knownFilterValues.has(selectedFilter) && (
                <option value={selectedFilter} className="bg-bg-card">{selectedFilterLabel}</option>
              )}
              {formatOptions.length > 0 && (
                <optgroup label="Formatos" className="bg-bg-card">
                  {formatOptions.map((format) => (
                    <option key={format.type} value={mediaTypeFilter(format.type)}>{format.label}</option>
                  ))}
                </optgroup>
              )}
              {realmOptions.length > 0 && (
                <optgroup label="Domínios" className="bg-bg-card">
                  {realmOptions.map((realm) => (
                    <option key={realm.id} value={knowledgeRealmFilter(realm.id)}>{realm.name}</option>
                  ))}
                </optgroup>
              )}
              {customCategories.length > 0 && (
                <optgroup label="Coleções" className="bg-bg-card">
                  {customCategories.map((category) => (
                    <option key={category.id} value={genreFilter(category.label)}>{category.label}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-bg-main px-3 py-2 rounded-xl border border-text-primary/15">
            <Star className="w-4 h-4 text-accent-gold fill-accent-gold" />
            <span className="text-xs font-medium text-text-secondary whitespace-nowrap">Nota mín.:</span>
            <select
              aria-label="Avaliação mínima"
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="w-full cursor-pointer bg-transparent text-xs font-semibold text-text-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Resultados encontrados ({filteredItems.length})
            </span>
            {!isAllMediaFilter(selectedFilter) && (
              <p className="mt-0.5 text-[10px] font-semibold text-accent-gold">Categoria: {selectedFilterLabel}</p>
            )}
          </div>

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
            <p className="text-sm text-text-secondary">
              {mediaItems.length === 0
                ? 'Seu acervo está esperando a primeira obra.'
                : !isAllMediaFilter(selectedFilter)
                  ? `Nenhuma obra corresponde à categoria ${selectedFilterLabel}.`
                  : 'Nenhum resultado corresponde à sua pesquisa.'}
            </p>
            {mediaItems.length === 0 ? (
              <button type="button" onClick={() => setIsSearchOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-accent-gold px-4 py-2 text-xs font-bold text-bg-base transition-colors hover:bg-accent-gold-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold">
                <Sparkles className="h-3.5 w-3.5" /> Consultar o Oráculo
              </button>
            ) : (
              <button type="button" onClick={clearFilters} className="text-xs font-semibold text-accent-gold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold">
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="explore-media-grid grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item) => (
              <MediaCard key={item.id} item={item} onClick={() => setSelectedMedia(item)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
