import React, { useMemo, useState } from 'react';
import { Compass, Search, Star, Sparkles, Tags } from 'lucide-react';
import { useAgoraStore } from '../store/useAgoraStore';
import { MediaCard } from '../components/MediaCard';

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
    isVisitor,
    isCloudReady,
    syncStatus,
    retryCloudSync,
  } = useAgoraStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState<number>(0);
  const normalizedSearch = normalizeCategoryText(searchTerm);
  const selectedFilterLabel = getMediaFilterLabel(selectedFilter);
  const awaitingCloud = !isVisitor && !isCloudReady;
  const hasFilters = Boolean(normalizedSearch || minRating > 0 || !isAllMediaFilter(selectedFilter));

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

      const matchesRating = minRating === 0 || item.avaliacao_numerica >= minRating;
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

  const handleRandomPick = () => {
    const pool = filteredItems.length > 0 ? filteredItems : mediaItems;
    if (pool.length === 0) return;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    setSelectedMedia(chosen);
  };

  return (
    <div className="explore-view space-y-4 pb-10">
      {awaitingCloud && (
        <div role="status" className="rounded-2xl border border-accent-gold/30 bg-bg-card p-4 text-sm text-text-secondary space-y-2">
          <p>{syncStatus === 'error'
            ? 'Não foi possível carregar sua biblioteca da conta. As obras exibidas abaixo são apenas as disponíveis neste navegador.'
            : 'Carregando a biblioteca da sua conta…'}</p>
          {syncStatus === 'error' && (
            <button type="button" onClick={retryCloudSync} className="min-h-11 rounded-xl border border-accent-gold/40 px-4 py-2 font-semibold text-accent-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold">
              Tentar carregar novamente
            </button>
          )}
        </div>
      )}
      {/* Header */}
      <div className="explore-filter-panel space-y-3 rounded-2xl border border-text-primary/10 bg-bg-card p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-accent-gold" />
            <h2 className="font-serif text-xl font-bold text-text-primary">Sua biblioteca</h2>
          </div>

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
              placeholder="Buscar título, autor ou ideia…"
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
              {filteredItems.length} de {mediaItems.length} obras{awaitingCloud ? ' disponíveis neste navegador' : ''}
            </span>
            {!isAllMediaFilter(selectedFilter) && (
              <p className="mt-0.5 text-[10px] font-semibold text-accent-gold">Categoria: {selectedFilterLabel}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="text-xs font-semibold text-accent-gold hover:underline">
                Limpar filtros
              </button>
            )}
            <button
              type="button"
              onClick={handleRandomPick}
              disabled={mediaItems.length === 0}
              className="flex items-center gap-1 text-xs font-semibold text-accent-gold hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Sortear obra
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="text-xs text-accent-gold hover:underline flex items-center gap-1 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Adicionar obra
            </button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-bg-card border border-text-primary/10 rounded-2xl space-y-3">
            <span className="text-2xl text-accent-gold block font-serif">✦</span>
            <p className="text-sm text-text-secondary">
              {mediaItems.length === 0
                ? awaitingCloud
                  ? 'A biblioteca da conta ainda não foi carregada. Isso não significa que suas obras foram apagadas.'
                  : isVisitor
                    ? 'Nenhuma obra salva como visitante neste endereço e navegador. As obras da sua conta aparecem ao entrar com seu e-mail.'
                    : 'Nenhuma obra encontrada nesta conta.'
                : !isAllMediaFilter(selectedFilter)
                  ? `Nenhuma obra corresponde à categoria ${selectedFilterLabel}.`
                  : 'Nenhum resultado corresponde à sua pesquisa.'}
            </p>
            {mediaItems.length === 0 ? !awaitingCloud && (
              <button type="button" onClick={() => setIsSearchOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-accent-gold px-4 py-2 text-xs font-bold text-bg-base transition-colors hover:bg-accent-gold-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold">
                <Sparkles className="h-3.5 w-3.5" /> Adicionar minha primeira obra
              </button>
            ) : (
              <button type="button" onClick={clearFilters} className="text-xs font-semibold text-accent-gold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold">
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="explore-media-grid grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <MediaCard key={item.id} item={item} onClick={() => setSelectedMedia(item)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
