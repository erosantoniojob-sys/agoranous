import React, { useState } from 'react'
import {
  X,
  Edit3,
  Trash2,
  Plus,
  Check,
  BookOpen,
  FileText,
  Layers,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { CustomTrail } from '../types/agora'
import { useModalAccessibility } from '../lib/useModalAccessibility'

interface TrailDetailModalProps {
  trailId: string | null
  onClose: () => void
}

export const TrailDetailModal: React.FC<TrailDetailModalProps> = ({
  trailId,
  onClose,
}) => {
  const {
    customTrails,
    mediaItems,
    aprendizados,
    updateCustomTrail,
    deleteCustomTrail,
    addAprendizado,
    setSelectedMedia,
  } = useAgoraStore()

  const trail = customTrails.find((t) => t.id === trailId)

  const [isEditing, setIsEditing] = useState(false)
  const [isAddingMedia, setIsAddingMedia] = useState(false)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Edit fields
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')

  // New Note fields
  const [newNoteText, setNewNoteText] = useState('')
  const [newNoteTopic, setNewNoteTopic] = useState('')
  const [selectedMediaForNote, setSelectedMediaForNote] = useState('')
  const modalRef = useModalAccessibility<HTMLDivElement>(Boolean(trail), onClose)

  if (!trail) return null

  const trailMedia = mediaItems.filter((m) => trail.mediaIds.includes(m.id))
  const trailMediaIds = trail.mediaIds
  const trailNotes = aprendizados.filter((a) => trailMediaIds.includes(a.mediaId))

  const handleStartEdit = () => {
    setNome(trail.nome)
    setDescricao(trail.descricao || '')
    setCategoria(trail.categoria || 'Geral')
    setIsEditing(true)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) return
    updateCustomTrail(trail.id, {
      nome: nome.trim(),
      descricao: descricao.trim(),
      categoria: categoria.trim(),
    })
    setIsEditing(false)
  }

  const handleToggleMedia = (mediaId: string) => {
    const isPresent = trail.mediaIds.includes(mediaId)
    const updatedIds = isPresent
      ? trail.mediaIds.filter((id) => id !== mediaId)
      : [...trail.mediaIds, mediaId]

    const completedCount = mediaItems.filter(
      (m) => updatedIds.includes(m.id) && m.status === 'Concluído'
    ).length
    const newProg = updatedIds.length > 0 ? Math.round((completedCount / updatedIds.length) * 100) : 0

    updateCustomTrail(trail.id, {
      mediaIds: updatedIds,
      progresso_percentual: newProg,
    })
  }

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteText.trim() || !selectedMediaForNote) return
    addAprendizado(selectedMediaForNote, newNoteText.trim(), newNoteTopic.trim() || trail.nome)
    setNewNoteText('')
    setNewNoteTopic('')
    setIsAddingNote(false)
  }

  const handleDeleteTrail = () => {
    deleteCustomTrail(trail.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans">
      <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="trail-detail-title" className="w-full max-w-2xl bg-bg-surface border border-accent-gold/40 rounded-2xl shadow-3d-deep p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-text-primary/10 pb-4">
          <div className="space-y-1 pr-4">
            <span className="text-[10px] uppercase font-bold text-accent-gold px-2.5 py-0.5 rounded bg-accent-gold/15 border border-accent-gold/30">
              {trail.categoria || 'Trilha Temática'}
            </span>
            <h2 id="trail-detail-title" className="font-serif font-bold text-xl sm:text-2xl text-text-primary">
              {trail.nome}
            </h2>
            <p className="text-xs text-text-secondary">
              {trail.descricao || 'Sem descrição cadastrada'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes da trilha"
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-base rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trail Progress Bar & Counters */}
        <div className="p-4 bg-bg-base rounded-xl border border-text-primary/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-text-secondary">Progresso da Trilha</span>
            <span className="text-accent-gold font-serif font-bold text-sm">
              {trail.progresso_percentual || 0}%
            </span>
          </div>

          <div className="w-full bg-bg-surface h-2 rounded-full overflow-hidden border border-text-primary/10">
            <div
              className="bg-accent-gold h-full rounded-full transition-all duration-500 shadow-sm shadow-accent-gold/40"
              style={{ width: `${trail.progresso_percentual || 0}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1">
            <span>{trailMedia.length} conteúdos cadastrados</span>
            <span>{trailNotes.length} notas vinculadas</span>
          </div>
        </div>

        {/* Trail Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="p-4 bg-bg-base rounded-xl border border-accent-gold/40 space-y-3 animate-fadeIn">
            <h3 className="text-xs font-bold text-accent-gold uppercase">Editar Trilha</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-text-secondary uppercase font-semibold block mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-2 bg-bg-surface text-text-primary text-xs rounded-lg border border-text-primary/20 focus:border-accent-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-text-secondary uppercase font-semibold block mb-1">Categoria</label>
                <input
                  type="text"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full p-2 bg-bg-surface text-text-primary text-xs rounded-lg border border-text-primary/20 focus:border-accent-gold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-text-secondary uppercase font-semibold block mb-1">Descrição</label>
              <textarea
                rows={2}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full p-2 bg-bg-surface text-text-primary text-xs rounded-lg border border-text-primary/20 focus:border-accent-gold focus:outline-none resize-none font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 bg-bg-surface text-text-secondary text-xs rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-accent-gold text-bg-base font-bold text-xs rounded-lg uppercase tracking-wider"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <button
              onClick={handleStartEdit}
              className="py-1.5 px-3 bg-bg-base hover:bg-bg-elevated text-text-primary border border-text-primary/15 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-accent-gold" />
              <span>Editar Nome / Categoria / Descrição</span>
            </button>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="py-1.5 px-3 bg-bg-base hover:bg-red-950/40 text-text-secondary hover:text-red-400 border border-text-primary/15 hover:border-red-500/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Trilha</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-950/30 p-1.5 rounded-xl border border-red-500/40">
                <span className="text-[10px] text-red-300 font-bold uppercase">Confirmar exclusão?</span>
                <button
                  onClick={handleDeleteTrail}
                  className="px-2.5 py-1 bg-red-600 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Sim, Excluir
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2.5 py-1 bg-bg-base text-text-secondary text-xs rounded-lg cursor-pointer"
                >
                  Não
                </button>
              </div>
            )}
          </div>
        )}

        {/* Section A: Mídias na Trilha */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-text-primary/10 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-accent-gold" />
              Mídias Vinculadas ({trailMedia.length})
            </h3>

            <button
              onClick={() => setIsAddingMedia(!isAddingMedia)}
              className="text-xs text-accent-gold hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {isAddingMedia ? 'Fechar Seleção' : 'Adicionar / Gerenciar Mídias'}
            </button>
          </div>

          {/* Media Multi-select Box */}
          {isAddingMedia && (
            <div className="p-4 bg-bg-base rounded-xl border border-accent-gold/30 space-y-2 animate-fadeIn">
              <span className="text-[10px] font-bold text-accent-gold uppercase block">
                Marque/desmarque as mídias para incluir nesta trilha:
              </span>
              {mediaItems.length === 0 ? (
                <p className="text-xs text-text-secondary italic">Nenhuma mídia no acervo. Adicione pelo (+).</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {mediaItems.map((m) => {
                    const isChecked = trail.mediaIds.includes(m.id)
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleToggleMedia(m.id)}
                        className={`p-2 rounded-lg text-left text-xs font-medium border flex items-center justify-between transition-colors ${
                          isChecked
                            ? 'bg-accent-gold/20 text-accent-gold border-accent-gold'
                            : 'bg-bg-surface text-text-primary border-text-primary/10 hover:border-accent-gold/30'
                        }`}
                      >
                        <span className="truncate">{m.titulo} ({m.tipo})</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-accent-gold flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* List of Linked Media */}
          {trailMedia.length === 0 ? (
            <div className="p-6 text-center bg-bg-base rounded-xl border border-text-primary/10 text-xs text-text-secondary">
              0 conteúdos vinculados. Clique acima em "Adicionar / Gerenciar Mídias" para incluir obras nesta trilha.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trailMedia.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMedia(m)
                    onClose()
                  }}
                  className="p-3 bg-bg-base hover:bg-bg-elevated border border-text-primary/10 hover:border-accent-gold/40 rounded-xl transition-all cursor-pointer flex items-center gap-3 group"
                >
                  <img
                    src={m.url_capa_oficial || m.url_capa || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop'}
                    alt={m.titulo}
                    className="w-10 h-14 object-cover rounded-lg flex-shrink-0 bg-bg-surface border border-text-primary/10"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase font-bold text-accent-gold block">
                      {m.tipo} • {m.status}
                    </span>
                    <h4 className="font-serif font-bold text-xs text-text-primary group-hover:text-accent-gold truncate">
                      {m.titulo}
                    </h4>
                    <p className="text-[10px] text-text-secondary truncate">
                      {m.autor_criador || 'Criador'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section B: Notas e Aprendizados na Trilha */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-text-primary/10 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-accent-gold" />
              Notas e Reflexões da Trilha ({trailNotes.length})
            </h3>

            {trailMedia.length > 0 && (
              <button
                onClick={() => {
                  setSelectedMediaForNote(trailMedia[0]?.id || '')
                  setIsAddingNote(!isAddingNote)
                }}
                className="text-xs text-accent-gold hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Nota
              </button>
            )}
          </div>

          {/* Add Note Form */}
          {isAddingNote && (
            <form onSubmit={handleSaveNote} className="p-4 bg-bg-base rounded-xl border border-accent-gold/30 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-accent-gold">Nova Nota nesta Trilha</span>
                <button type="button" onClick={() => setIsAddingNote(false)} className="text-text-secondary">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-text-secondary uppercase font-semibold block mb-1">Obra Alvo</label>
                  <select
                    value={selectedMediaForNote}
                    onChange={(e) => setSelectedMediaForNote(e.target.value)}
                    className="w-full p-2 bg-bg-surface text-text-primary text-xs rounded-lg border border-text-primary/15 focus:border-accent-gold focus:outline-none font-semibold"
                  >
                    {trailMedia.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.titulo} ({m.tipo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary uppercase font-semibold block mb-1">Tópico</label>
                  <input
                    type="text"
                    value={newNoteTopic}
                    onChange={(e) => setNewNoteTopic(e.target.value)}
                    placeholder={trail.nome}
                    className="w-full p-2 bg-bg-surface text-text-primary text-xs rounded-lg border border-text-primary/15 focus:border-accent-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-text-secondary uppercase font-semibold block mb-1">Reflexão / Citação</label>
                <textarea
                  rows={3}
                  required
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Escreva sua reflexão sobre este capítulo..."
                  className="w-full p-2.5 bg-bg-surface text-text-primary text-xs rounded-lg border border-text-primary/15 focus:border-accent-gold focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-accent-gold text-bg-base font-bold text-xs rounded-lg uppercase tracking-wider shadow-md"
                >
                  Salvar Nota
                </button>
              </div>
            </form>
          )}

          {/* List of Notes */}
          {trailNotes.length === 0 ? (
            <div className="p-6 text-center bg-bg-base rounded-xl border border-text-primary/10 text-xs text-text-secondary">
              0 notas cadastradas para esta trilha.
            </div>
          ) : (
            <div className="space-y-3">
              {trailNotes.map((note) => {
                const media = mediaItems.find((m) => m.id === note.mediaId)
                return (
                  <div key={note.id} className="p-4 bg-bg-base rounded-xl border border-accent-gold/20 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-accent-gold uppercase">{note.topico || trail.nome}</span>
                      {media && <span className="text-text-secondary">{media.titulo}</span>}
                    </div>
                    <p className="text-xs text-text-primary italic font-serif leading-relaxed">
                      "{note.texto}"
                    </p>
                    <span className="text-[9px] text-text-secondary block text-right pt-0.5">{note.data}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
