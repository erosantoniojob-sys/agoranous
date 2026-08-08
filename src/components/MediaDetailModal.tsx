import React, { useState, useEffect } from 'react'
import { X, Calendar, User, Sparkles, BookOpen, Trash2, Send, Download, Edit3, Check } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { RatingStars } from './RatingStars'
import { CoverImage } from './CoverImage'
import { MediaStatus } from '../types/agora'
import { useModalAccessibility } from '../lib/useModalAccessibility'

export const MediaDetailModal: React.FC = () => {
  const {
    selectedMedia,
    setSelectedMedia,
    updateMedia,
    updateMediaStatusAndRating,
    addAprendizado,
    aprendizados,
    deleteMediaItem,
    userProfile,
    mediaItems,
  } = useAgoraStore()

  const [activeTab, setActiveTab] = useState<'detalhes' | 'aprendizados'>('detalhes')
  const [novoAprendizadoText, setNovoAprendizadoText] = useState('')
  const [novoTopicoText, setNovoTopicoText] = useState('')
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  // Editable fields for media details
  const [isEditingMedia, setIsEditingMedia] = useState(false)
  const [editableTitulo, setEditableTitulo] = useState('')
  const [editableAutor, setEditableAutor] = useState('')
  const [editableSinopse, setEditableSinopse] = useState('')
  const [editableCapaUrl, setEditableCapaUrl] = useState('')
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false)
  const modalRef = useModalAccessibility<HTMLDivElement>(Boolean(selectedMedia), () => setSelectedMedia(null))

  useEffect(() => {
    if (selectedMedia) {
      setEditableTitulo(selectedMedia.titulo || '')
      setEditableAutor(selectedMedia.autor_criador || '')
      setEditableSinopse(selectedMedia.sinopse || '')
      setEditableCapaUrl(
        selectedMedia.url_capa || selectedMedia.url_capa_oficial || selectedMedia.capa_oficial || ''
      )
      setIsEditingMedia(false)
      setSaveSuccessMsg(false)
    }
  }, [selectedMedia])

  if (!selectedMedia) return null

  const itemLearnings = aprendizados.filter((a) => a.mediaId === selectedMedia.id)

  const handleStatusChange = (newStatus: MediaStatus) => {
    updateMediaStatusAndRating(selectedMedia.id, newStatus, selectedMedia.avaliacao_numerica)
  }

  const handleRatingChange = (newRating: number) => {
    updateMediaStatusAndRating(selectedMedia.id, selectedMedia.status, newRating)
  }

  const handleSaveMediaEdits = () => {
    if (!selectedMedia) return
    updateMedia(selectedMedia.id, {
      titulo: editableTitulo,
      autor_criador: editableAutor,
      sinopse: editableSinopse,
      url_capa: editableCapaUrl,
      url_capa_oficial: editableCapaUrl,
      capa_oficial: editableCapaUrl,
    })
    setIsEditingMedia(false)
    setSaveSuccessMsg(true)
    setTimeout(() => setSaveSuccessMsg(false), 3000)
  }

  const handleSaveAprendizado = (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoAprendizadoText.trim()) return
    addAprendizado(selectedMedia.id, novoAprendizadoText, novoTopicoText)
    setNovoAprendizadoText('')
    setNovoTopicoText('')
  }

  const handleDelete = () => {
    deleteMediaItem(selectedMedia.id)
    setSelectedMedia(null)
  }

  const handleExportDossierPDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const abntAuthor = (selectedMedia.autor_criador || 'AUTOR').toUpperCase()
    const abntTitle = selectedMedia.titulo

    const learningsHTML = itemLearnings.length > 0
      ? itemLearnings
          .map(
            (l, idx) => `
          <div style="margin-bottom: 20px; padding: 12px 16px; border-left: 3px solid #D4AF37; background: #f9f9f6;">
            <h4 style="margin:0 0 6px 0; font-size: 13px; color: #111;">Capítulo ${idx + 1}: ${l.topico || 'Reflexão Pessoal'}</h4>
            <p style="margin:0 0 8px 0; font-size: 12px; font-style: italic; color: #222;">"${l.texto}"</p>
            <span style="font-size: 10px; color: #666;">Registrado em ${l.data}</span>
          </div>`
          )
          .join('')
      : '<p style="font-size: 12px; color: #666;">Nenhum aprendizado registrado para esta obra.</p>'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dossiê ABNT - ${selectedMedia.titulo}</title>
          <style>
            @page { size: A4; margin: 25mm 25mm 25mm 25mm; }
            body { font-family: "Times New Roman", Times, serif; color: #111; line-height: 1.5; font-size: 12pt; background: #fff; margin: 0; padding: 20px; }
            h1 { text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
            .subtitle { text-align: center; font-size: 11pt; color: #444; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 1px; }
            .meta-box { border: 1px solid #ccc; padding: 15px; margin-bottom: 25px; font-size: 11pt; }
            .meta-row { margin-bottom: 6px; }
            .meta-label { font-weight: bold; }
            h2 { font-size: 13pt; text-transform: uppercase; border-bottom: 1px solid #111; padding-bottom: 4px; margin-top: 25px; }
            .abnt-citation { background: #f0f0f0; padding: 12px; font-family: monospace; font-size: 10pt; border-left: 4px solid #111; margin-top: 20px; }
            .footer { margin-top: 40px; font-size: 9pt; text-align: center; color: #777; border-top: 1px solid #eee; pt: 10px; }
          </style>
        </head>
        <body>
          <h1>ÁGORA: SEGUNDO CÉREBRO</h1>
          <div class="subtitle">DOSSIÊ ACADÊMICO DE CONHECIMENTO & APRENDIZADOS</div>

          <div class="meta-box">
            <div class="meta-row"><span class="meta-label">TÍTULO DA OBRA:</span> ${selectedMedia.titulo}</div>
            <div class="meta-row"><span class="meta-label">AUTOR / CRIADOR:</span> ${selectedMedia.autor_criador || 'Não informado'}</div>
            <div class="meta-row"><span class="meta-label">CATEGORIA / TIPO:</span> ${selectedMedia.tipo} (${selectedMedia.ano || 'S.D.'})</div>
            <div class="meta-row"><span class="meta-label">DATA DE LANÇAMENTO OFICIAL:</span> ${selectedMedia.data_lancamento_oficial || selectedMedia.ano || 'N/D'}</div>
            <div class="meta-row"><span class="meta-label">AVALIAÇÃO NO SEGUNDO CÉREBRO:</span> ${selectedMedia.avaliacao_numerica} / 5.0 estrelas</div>
            <div class="meta-row"><span class="meta-label">PESQUISADOR / ERUDITO:</span> ${userProfile.nome}</div>
          </div>

          <h2>1. SINOPSE E RESUMO EXECUTIVO</h2>
          <p style="text-align: justify; text-indent: 15mm; margin-top: 10px;">
            ${selectedMedia.sinopse || 'Sem sinopse cadastrada.'}
          </p>

          <h2>2. TÓPICOS E APRENDIZADOS CENTRALIZADOS</h2>
          ${learningsHTML}

          <h2>3. REFERÊNCIA BIBLIOGRÁFICA REGULAMENTAR (ABNT)</h2>
          <div class="abnt-citation">
            ${abntAuthor}. <strong>${abntTitle}</strong>. ${selectedMedia.fonte || 'Edição Acadêmica'}: Ágora Segundo Cérebro, ${selectedMedia.ano || new Date().getFullYear()}.
          </div>

          <div class="footer">
            Dossiê gerado automaticamente pelo aplicativo Ágora em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}.
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  const coverDisplay = editableCapaUrl || selectedMedia.url_capa || selectedMedia.url_capa_oficial

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-base/80 backdrop-blur-md animate-fadeIn">
      <div ref={modalRef} role="dialog" aria-modal="true" aria-label={`Detalhes de ${selectedMedia.titulo}`} className="relative w-full max-w-2xl max-h-[90vh] bg-bg-surface border border-text-primary/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Close Button */}
        <button
          onClick={() => setSelectedMedia(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-bg-base/60 backdrop-blur-md text-text-secondary hover:text-text-primary hover:bg-bg-base transition-colors border border-text-primary/10"
          aria-label="Fechar detalhes"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header / Hero Image Section */}
        <div className="relative w-full h-48 sm:h-56 bg-gradient-to-b from-bg-surface to-bg-base overflow-hidden flex items-end p-6 border-b border-text-primary/10">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 filter blur-sm"
            style={{
              backgroundImage: coverDisplay ? `url(${coverDisplay})` : 'none',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-bg-surface/70 to-transparent" />

          <div className="relative z-10 flex gap-5 items-end w-full">
            <div className="w-24 sm:w-28 flex-shrink-0 shadow-xl rounded-xl overflow-hidden border border-accent-gold/30">
              <CoverImage url={coverDisplay} title={selectedMedia.titulo} tipo={selectedMedia.tipo} />
            </div>

            <div className="flex flex-col gap-1 text-text-primary flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-accent-gold/20 text-accent-gold border border-accent-gold/30">
                  {selectedMedia.tipo}
                </span>
                {selectedMedia.data_lancamento_oficial && (
                  <span className="text-xs text-text-secondary flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {selectedMedia.data_lancamento_oficial}
                  </span>
                )}
              </div>

              {!isEditingMedia ? (
                <>
                  <h2 id="media-detail-title" className="font-serif font-bold text-xl sm:text-2xl text-text-primary truncate">
                    {selectedMedia.titulo}
                  </h2>

                  {selectedMedia.autor_criador && (
                    <p className="text-xs sm:text-sm text-text-secondary flex items-center gap-1 truncate">
                      <User className="w-3.5 h-3.5" />
                      {selectedMedia.autor_criador}
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-1 w-full pt-1">
                  <input
                    type="text"
                    value={editableTitulo}
                    onChange={(e) => setEditableTitulo(e.target.value)}
                    placeholder="Título da obra"
                    className="p-1.5 bg-bg-base text-text-primary border border-accent-gold rounded text-sm font-serif font-bold w-full"
                  />
                  <input
                    type="text"
                    value={editableAutor}
                    onChange={(e) => setEditableAutor(e.target.value)}
                    placeholder="Autor / Criador"
                    className="p-1 bg-bg-base text-text-secondary border border-text-primary/20 rounded text-xs w-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Controls Bar: Status, Rating, Edit Toggle & PDF Export */}
        <div className="px-6 py-3 bg-bg-base/60 border-b border-text-primary/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-text-secondary font-semibold">
              Status:
            </span>
            <select
              value={selectedMedia.status}
              onChange={(e) => handleStatusChange(e.target.value as MediaStatus)}
              className="bg-bg-surface text-text-primary border border-text-primary/20 rounded-lg px-3 py-1 text-xs font-semibold focus:border-accent-gold focus:outline-none transition-colors"
            >
              <option value="Lendo">Lendo</option>
              <option value="Assistindo">Assistindo</option>
              <option value="Jogando">Jogando</option>
              <option value="Concluído">Concluído</option>
              <option value="Pendente">Pendente</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <RatingStars
              rating={selectedMedia.avaliacao_numerica}
              interactive={true}
              onRatingChange={handleRatingChange}
              size="md"
            />

            {!isEditingMedia ? (
              <button
                type="button"
                onClick={() => setIsEditingMedia(true)}
                className="py-1.5 px-3 bg-bg-surface hover:bg-bg-elevated text-text-primary border border-text-primary/20 hover:border-accent-gold/50 font-semibold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-accent-gold" />
                <span>Editar Obra</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveMediaEdits}
                className="py-1.5 px-3 bg-accent-gold hover:bg-accent-gold-bright text-bg-base font-bold text-xs rounded-lg uppercase tracking-wider transition-all flex items-center gap-1 shadow-md cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar Obra</span>
              </button>
            )}

            <button
              onClick={handleExportDossierPDF}
              className="py-1.5 px-3 bg-accent-gold hover:bg-accent-gold-bright text-bg-base font-bold text-xs rounded-lg uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Dossiê (PDF)</span>
            </button>
          </div>
        </div>

        {/* Success toast alert when saving edits */}
        {saveSuccessMsg && (
          <div className="px-6 py-2 bg-emerald-950/60 border-b border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Ficha técnica da obra atualizada e salva no seu Segundo Cérebro!</span>
          </div>
        )}

        {/* Navigation Tabs inside Details */}
        <div className="flex border-b border-text-primary/10 bg-bg-surface px-6">
          <button
            onClick={() => setActiveTab('detalhes')}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'detalhes'
                ? 'border-accent-gold text-accent-gold'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Sinopse & Ficha Técnica
          </button>
          <button
            onClick={() => setActiveTab('aprendizados')}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'aprendizados'
                ? 'border-accent-gold text-accent-gold'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Aprendizados ({itemLearnings.length})
          </button>
        </div>

        {/* Modal Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 max-h-[360px] space-y-6">
          {activeTab === 'detalhes' ? (
            <div className="space-y-4">
              {/* Editable Cover URL option when in edit mode */}
              {isEditingMedia && (
                <div className="p-3 bg-bg-base/80 border border-accent-gold/30 rounded-xl space-y-1 animate-fadeIn">
                  <label className="text-[10px] text-accent-gold font-bold uppercase block">
                    URL da Capa Oficial da Obra
                  </label>
                  <input
                    type="text"
                    value={editableCapaUrl}
                    onChange={(e) => setEditableCapaUrl(e.target.value)}
                    placeholder="https://exemplo.com/capa.jpg"
                    className="w-full p-2 bg-bg-surface text-text-primary text-xs rounded border border-text-primary/20 focus:border-accent-gold focus:outline-none"
                  />
                </div>
              )}

              {/* Editable Synopsis Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-accent-gold uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    Sinopse & Resumo (100% Editável)
                  </h3>
                  <span className="text-[10px] text-text-secondary">Pode apagar e reescrever à vontade</span>
                </div>

                <textarea
                  rows={5}
                  value={editableSinopse}
                  onChange={(e) => setEditableSinopse(e.target.value)}
                  placeholder="Escreva ou reescreva a sinopse com suas próprias palavras..."
                  className="w-full p-3.5 bg-bg-base/80 text-text-primary/90 text-xs sm:text-sm leading-relaxed rounded-xl border border-text-primary/20 focus:border-accent-gold focus:ring-1 focus:ring-accent-gold focus:outline-none transition-all resize-none font-sans"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveMediaEdits}
                    className="py-1.5 px-4 bg-accent-gold hover:bg-accent-gold-bright text-bg-base font-bold text-xs rounded-lg uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Sinopse</span>
                  </button>
                </div>
              </div>

              {selectedMedia.motivo_leitura ? <div className="rounded-xl border border-accent-gold/20 bg-accent-gold/5 p-3"><h3 className="text-[10px] font-semibold uppercase tracking-wider text-accent-gold">Por que esta obra está aqui</h3><p className="mt-1 text-xs text-text-secondary">{selectedMedia.motivo_leitura}</p></div> : null}
              {selectedMedia.progresso_detalhado ? <div className="rounded-xl border border-text-primary/10 bg-bg-base/70 p-3 text-xs"><b>Progresso:</b> {selectedMedia.progresso_detalhado.atual}{selectedMedia.progresso_detalhado.total ? ` de ${selectedMedia.progresso_detalhado.total}` : ''} {selectedMedia.progresso_detalhado.unidade}</div> : null}
              {selectedMedia.depende_de_ids?.length ? <div><h3 className="mb-2 text-[10px] font-semibold uppercase text-accent-gold">Leia antes</h3><div className="flex flex-wrap gap-1">{selectedMedia.depende_de_ids.map(id => <span key={id} className="rounded-full bg-bg-base px-2 py-1 text-[10px] text-text-secondary">{mediaItems.find(item => item.id === id)?.titulo || 'Obra não encontrada'}</span>)}</div></div> : null}

              {selectedMedia.generos && selectedMedia.generos.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-accent-gold uppercase tracking-wider mb-2">
                    Gêneros / Categoria
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMedia.generos.map((genero, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-xs bg-text-secondary/15 text-text-primary border border-text-primary/10"
                      >
                        {genero}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedMedia.data_lancamento_oficial && (
                <p className="text-xs text-text-secondary pt-1">
                  Lançamento Oficial: <span className="text-text-primary font-medium">{selectedMedia.data_lancamento_oficial}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Form to write and save new reflection/learning */}
              <form onSubmit={handleSaveAprendizado} className="flex flex-col gap-3">
                <label className="text-xs font-semibold text-accent-gold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Registrar Nova Reflexão / Aprendizado
                </label>

                <input
                  type="text"
                  value={novoTopicoText}
                  onChange={(e) => setNovoTopicoText(e.target.value)}
                  placeholder="Título do Tópico / Capítulo (ex: Análise de Dinâmica de Personagens)"
                  className="w-full p-2.5 bg-bg-base text-text-primary placeholder:text-text-secondary/50 rounded-xl border border-text-primary/15 focus:border-accent-gold focus:outline-none text-xs font-sans"
                />

                <textarea
                  rows={3}
                  value={novoAprendizadoText}
                  onChange={(e) => setNovoAprendizadoText(e.target.value)}
                  placeholder="Escreva aqui suas reflexões e citações com foco em ABNT..."
                  className="w-full p-3 bg-bg-base text-text-primary placeholder:text-text-secondary/60 rounded-xl border border-text-primary/15 focus:border-accent-gold focus:ring-1 focus:ring-accent-gold focus:outline-none transition-all text-sm resize-none font-sans"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!novoAprendizadoText.trim()}
                    className="px-4 py-2 bg-accent-gold text-bg-base hover:bg-accent-gold-bright disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs rounded-lg uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Salvar no Dossiê
                  </button>
                </div>
              </form>

              {/* List of saved learnings */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Histórico do Dossiê ({itemLearnings.length})
                </h3>
                {itemLearnings.length === 0 ? (
                  <p className="text-xs text-text-secondary italic text-center py-6 bg-bg-base/30 rounded-xl border border-dashed border-text-primary/10">
                    Nenhum aprendizado registrado ainda para esta obra.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {itemLearnings.map((learning) => (
                      <div
                        key={learning.id}
                        className="p-4 bg-bg-base/60 border border-accent-gold/20 rounded-xl space-y-2 relative"
                      >
                        {learning.topico && (
                          <span className="text-[10px] font-bold uppercase text-accent-gold block">
                            {learning.topico}
                          </span>
                        )}
                        <p className="text-sm text-text-primary leading-relaxed italic">
                          "{learning.texto}"
                        </p>
                        <p className="text-[11px] text-text-secondary font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-accent-gold" />
                          Registrado em {learning.data}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-bg-base/80 border-t border-text-primary/10 flex items-center justify-between">
          {!showConfirmDelete ? (
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remover Obra
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400 font-medium">Confirmar exclusão?</span>
              <button
                type="button"
                onClick={handleDelete}
                className="px-2.5 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-500"
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-2.5 py-1 bg-slate-700 text-slate-200 text-xs font-semibold rounded hover:bg-slate-600"
              >
                Não
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setSelectedMedia(null)}
            className="px-5 py-2 bg-text-secondary/20 text-text-primary hover:bg-text-secondary/30 font-semibold text-xs rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  )
}
