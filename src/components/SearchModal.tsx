import React, { useEffect, useRef, useState } from 'react';
import { searchCatalog } from '../lib/catalogSearch';
import type { CatalogItem } from '../types/catalog';
import { X, Search, Loader2, Check, Sparkles, Edit3, Plus } from 'lucide-react';
import { useAgoraStore } from '../store/useAgoraStore';
import { CoverImage } from './CoverImage';
import { MediaType, MediaItem, MediaStatus } from '../types/agora';
import { useModalAccessibility } from '../lib/useModalAccessibility';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, addMedia, setSelectedMedia, mediaItems } =
    useAgoraStore();

  const [query, setQuery] = useState('');
  const [tipo, setTipo] = useState<MediaType>('Filme');
  const [candidates, setCandidates] = useState<CatalogItem[]>([]);
  const request = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [previewResult, setPreviewResult] = useState<Omit<
    MediaItem,
    'id' | 'criadoEm' | 'status' | 'avaliacao_numerica'
  > | null>(null);
  const [statusInicial, setStatusInicial] = useState<MediaStatus>('Pendente');
  const [avaliacaoInicial, setAvaliacaoInicial] = useState<number>(0);
  const modalRef = useModalAccessibility<HTMLDivElement>(isSearchOpen, () => setIsSearchOpen(false));
  useEffect(() => {
    if (!isSearchOpen) { request.current?.abort(); setLoading(false); }
    return () => request.current?.abort();
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setCandidates([]);
    setLoading(true);
    setPreviewResult(null);
    setSearchError(null);
    setIsManualEntry(false);

    try {
      const result = await searchCatalog(query, tipo, controller.signal);
      if (controller.signal.aborted) return;
      setCandidates(result.items);
      if (!result.items.length) setSearchError('Nenhuma obra encontrada. Tente outro título ou adicione manualmente.');
    } catch (err) {
      if (controller.signal.aborted) return;
      setSearchError(err instanceof Error ? err.message : 'Não foi possível pesquisar a obra agora.');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const handleStartManualEntry = () => {
    request.current?.abort();
    setLoading(false);
    setCandidates([]);
    const currentYear = new Date().getFullYear();
    setPreviewResult({
      titulo: query.trim(),
      tipo,
      autor_criador: '',
      ano: currentYear,
      data_lancamento_oficial: '',
      sinopse: '',
      generos: [tipo],
      url_capa: '',
      url_capa_oficial: '',
      capa_oficial: '',
      fonte: 'Cadastro manual',
    });
    setIsManualEntry(true);
    setSearchError(null);
  };

  const handleConfirmAdd = () => {
    if (!previewResult?.titulo.trim()) return;

    const newItem = addMedia({
      ...previewResult,
      status: statusInicial,
      avaliacao_numerica: avaliacaoInicial,
    });

    setIsSearchOpen(false);
    setQuery('');
    setCandidates([]);
    setPreviewResult(null);
    setIsManualEntry(false);
    setSelectedMedia(newItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg-main/85 backdrop-blur-md animate-fadeIn lg:items-center lg:p-4">
      <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="search-modal-title" className="agora-dialog relative w-full bg-bg-card border border-text-primary/15 rounded-t-2xl lg:max-w-lg lg:rounded-2xl shadow-2xl overflow-hidden flex flex-col p-4 sm:p-6 space-y-5 max-h-[calc(100dvh-5.75rem-env(safe-area-inset-bottom))] lg:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-text-primary/10 pb-4">
          <div>
            <span className="text-[10px] font-semibold text-accent-gold uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Encontre sua próxima obra
            </span>
            <h2 id="search-modal-title" className="font-serif font-bold text-xl text-text-primary">
              Buscar obras e capas
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Fechar busca"
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-main/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="media-search-query" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Título da obra ou mídia
            </label>
            <div className="relative">
              <input
                id="media-search-query"
                type="text"
                data-autofocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex.: Os Irmãos Karamázov, FIFA, Matrix..."
                className="w-full pl-4 pr-10 py-2.5 bg-bg-main text-text-primary rounded-xl border border-text-primary/15 focus:border-accent-gold focus:outline-none text-sm"
              />
            </div>
          </div>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Formato
            </legend>
            <div className="grid grid-cols-4 gap-2">
              {(['Filme', 'Série', 'Música', 'Teatro', 'Livro', 'Podcast', 'Jogo'] as MediaType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tipo === t}
                  onClick={() => { request.current?.abort(); setLoading(false); setTipo(t); setCandidates([]); setPreviewResult(null); setSearchError(null); }}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all ${
                    tipo === t
                      ? 'bg-accent-gold/20 text-accent-gold border-accent-gold'
                      : 'bg-bg-main/50 text-text-secondary border-text-primary/10 hover:text-text-primary'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full py-2.5 bg-accent-gold text-bg-main hover:bg-accent-gold-bright disabled:opacity-50 font-semibold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Buscando obras…</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Buscar opções e capas</span>
              </>
            )}
          </button>
        </form>

        <button type="button" onClick={handleStartManualEntry} className="session-text-button">Adicionar manualmente</button>
        {candidates.length > 0 ? <section aria-label="Escolha a obra e a capa" className="catalog-candidates"><p>Escolha a obra e a edição pela capa, título e ano.</p><div>{candidates.map(item => <button key={item.catalogId} type="button" aria-pressed={previewResult?.url_capa === item.url_capa && previewResult?.titulo === item.titulo} onClick={() => { const { catalogId, sourceUrl, ...media } = item; setPreviewResult(media); setIsManualEntry(false); }}><CoverImage url={item.url_capa} title={item.titulo} tipo={item.tipo} /><strong>{item.titulo}</strong><small>{item.autor_criador} · {item.ano || 'Ano não informado'}</small><small>{item.fonte}</small></button>)}</div></section> : null}

        {searchError && (
          <div role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200 space-y-2.5">
            <p>{searchError}</p>
            <button
              type="button"
              onClick={handleStartManualEntry}
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent-gold/50 px-2.5 py-1.5 font-semibold uppercase tracking-wider text-accent-gold transition-colors hover:bg-accent-gold/10"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar manualmente
            </button>
          </div>
        )}

        {/* Preview Section */}
        {previewResult && (
          <div className="p-4 bg-bg-main/60 rounded-xl border border-accent-gold/30 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-text-primary/10 pb-2">
              <span className="text-xs font-bold uppercase text-accent-gold flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                {isManualEntry ? 'Cadastro manual da obra' : 'Detalhes da obra'}
              </span>
              <span className="text-[10px] text-text-secondary">Preencha os dados que tiver</span>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-20 flex-shrink-0 shadow-md">
                <CoverImage url={previewResult.url_capa} title={previewResult.titulo} tipo={previewResult.tipo} />
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <label className="text-[10px] text-text-secondary uppercase font-semibold block">Título</label>
                  <input
                    type="text"
                    value={previewResult.titulo}
                    onChange={(e) => setPreviewResult({ ...previewResult, titulo: e.target.value })}
                    className="w-full p-1.5 bg-bg-card text-text-primary font-serif font-bold text-sm rounded border border-text-primary/15 focus:border-accent-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary uppercase font-semibold block">Autor / Criador</label>
                  <input
                    type="text"
                    value={previewResult.autor_criador || ''}
                    onChange={(e) => setPreviewResult({ ...previewResult, autor_criador: e.target.value })}
                    className="w-full p-1.5 bg-bg-card text-text-secondary text-xs rounded border border-text-primary/15 focus:border-accent-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary uppercase font-semibold block">Ano</label>
                  <input
                    type="number"
                    value={previewResult.ano ?? ''}
                    onChange={(e) =>
                      setPreviewResult({
                        ...previewResult,
                        ano: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="Ex.: 2024"
                    className="w-full p-1.5 bg-bg-card text-text-secondary text-xs rounded border border-text-primary/15 focus:border-accent-gold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Editable Cover Image URL */}
            <div className="space-y-1">
              <label className="text-[10px] text-accent-gold font-semibold uppercase tracking-wider block">
                URL da Capa
              </label>
              <input
                type="text"
                value={previewResult.url_capa || ''}
                onChange={(e) =>
                  setPreviewResult({
                    ...previewResult,
                    url_capa: e.target.value,
                    url_capa_oficial: e.target.value,
                    capa_oficial: e.target.value,
                  })
                }
                placeholder="https://exemplo.com/capa.jpg"
                className="w-full p-2 bg-bg-card text-text-primary text-xs rounded-lg border border-text-primary/20 focus:border-accent-gold focus:outline-none"
              />
            </div>

            {/* Editable Synopsis Textarea */}
            <div className="space-y-1">
              <label className="text-[10px] text-accent-gold font-semibold uppercase tracking-wider block">
                Sinopse
              </label>
              <textarea
                rows={4}
                value={previewResult.sinopse || ''}
                onChange={(e) => setPreviewResult({ ...previewResult, sinopse: e.target.value })}
                placeholder="Adicione uma breve descrição da obra..."
                className="w-full p-2.5 bg-bg-card text-text-primary text-xs rounded-xl border border-text-primary/20 focus:border-accent-gold focus:outline-none leading-relaxed resize-none font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-accent-gold font-semibold uppercase tracking-wider block">Por que quero conhecer esta obra?</label>
              <textarea rows={2} value={previewResult.motivo_leitura || ''} onChange={(e) => setPreviewResult({ ...previewResult, motivo_leitura: e.target.value })} placeholder="Registre a intenção que trouxe esta obra ao seu acervo…" className="w-full p-2.5 bg-bg-card text-text-primary text-xs rounded-xl border border-text-primary/20 focus:border-accent-gold focus:outline-none leading-relaxed resize-none" />
            </div>

            {/* Custom Status & Rating Selection */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-text-primary/10">
              <div>
                <label className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider block mb-1">
                  Status Inicial
                </label>
                <select
                  value={statusInicial}
                  onChange={(e) => setStatusInicial(e.target.value as MediaStatus)}
                  className="w-full bg-bg-card text-text-primary border border-text-primary/20 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:border-accent-gold focus:outline-none"
                >
                  <option value="Concluído">Concluído</option>
                  <option value="Lendo">Lendo</option>
                  <option value="Assistindo">Assistindo</option>
                  <option value="Jogando">Jogando</option>
                  <option value="Pendente">Pendente</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider block mb-1">
                  Nota (0 a 5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  value={avaliacaoInicial}
                  onChange={(e) => setAvaliacaoInicial(parseFloat(e.target.value) || 0)}
                  className="w-full bg-bg-card text-text-primary border border-text-primary/20 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:border-accent-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2"><input type="number" min="0" value={previewResult.progresso_detalhado?.atual ?? 0} onChange={event => setPreviewResult({ ...previewResult, progresso_detalhado: { ...(previewResult.progresso_detalhado || { unidade: 'percentual' }), atual: Number(event.target.value) } })} className="w-full rounded-lg border border-text-primary/20 bg-bg-card px-2 py-1.5 text-xs" aria-label="Progresso atual" /><input type="number" min="0" value={previewResult.progresso_detalhado?.total ?? ''} onChange={event => setPreviewResult({ ...previewResult, progresso_detalhado: { ...(previewResult.progresso_detalhado || { atual: 0, unidade: 'percentual' }), total: event.target.value ? Number(event.target.value) : undefined } })} className="w-full rounded-lg border border-text-primary/20 bg-bg-card px-2 py-1.5 text-xs" aria-label="Progresso total" /><select value={previewResult.progresso_detalhado?.unidade || 'percentual'} onChange={event => setPreviewResult({ ...previewResult, progresso_detalhado: { ...(previewResult.progresso_detalhado || { atual: 0 }), unidade: event.target.value as 'páginas' | 'episódios' | 'minutos' | 'horas' | 'percentual' } })} className="rounded-lg border border-text-primary/20 bg-bg-card px-2 py-1.5 text-xs" aria-label="Unidade do progresso"><option>percentual</option><option>páginas</option><option>episódios</option><option>minutos</option><option>horas</option></select></div>
            {mediaItems.length ? <div><p className="mb-1 text-[10px] font-semibold uppercase text-text-secondary">Conhecimentos recomendados antes desta obra</p><div className="max-h-24 space-y-1 overflow-auto rounded-lg border border-text-primary/10 p-2">{mediaItems.map(item => <label key={item.id} className="flex items-center gap-2 text-[10px] text-text-secondary"><input type="checkbox" checked={previewResult.depende_de_ids?.includes(item.id) || false} onChange={() => setPreviewResult({ ...previewResult, depende_de_ids: previewResult.depende_de_ids?.includes(item.id) ? previewResult.depende_de_ids.filter(id => id !== item.id) : [...(previewResult.depende_de_ids || []), item.id] })} />{item.titulo}</label>)}</div></div> : null}

            <button
              type="button"
              onClick={handleConfirmAdd}
              disabled={!previewResult.titulo.trim()}
              className="w-full py-2.5 bg-accent-gold hover:bg-accent-gold-bright text-bg-base font-semibold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {isManualEntry ? 'Adicionar ao Acervo' : 'Adicionar à biblioteca'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
