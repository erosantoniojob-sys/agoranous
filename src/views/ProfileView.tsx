import React, { useState, useEffect } from 'react'
import {
  User,
  Sparkles,
  Award,
  Clock,
  Tag,
  LogOut,
  Edit3,
  Check,
  Plus,
  Trash2,
  Calendar,
  Upload,
  RotateCcw,
} from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { useAuth } from '../context/AuthContext'
import { EventoRegressivo } from '../types/agora'
import { convertFileToBase64 } from '../lib/fileUtils'

export const ProfileView: React.FC = () => {
  const { getEstatisticas, userProfile, updateProfile, resetOnboarding } = useAgoraStore()
  const { logout } = useAuth()
  const stats = getEstatisticas()

  const [isEditing, setIsEditing] = useState(false)
  const [nome, setNome] = useState(userProfile.nome)
  const [biografia, setBiografia] = useState(userProfile.biografia)
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatar_url)
  const [capaUrl, setCapaUrl] = useState(userProfile.capa_url)
  const [tags, setTags] = useState<string[]>(userProfile.tags_interesses || [])
  const [eventos, setEventos] = useState<EventoRegressivo[]>(userProfile.eventos_regressivos || [])
  const [newTagInput, setNewTagInput] = useState('')

  useEffect(() => {
    setNome(userProfile.nome)
    setBiografia(userProfile.biografia)
    setAvatarUrl(userProfile.avatar_url)
    setCapaUrl(userProfile.capa_url)
    setTags(userProfile.tags_interesses || [])
    setEventos(userProfile.eventos_regressivos || [])
  }, [userProfile])

  const handleSaveProfile = () => {
    updateProfile({
      nome,
      biografia,
      avatar_url: avatarUrl,
      capa_url: capaUrl,
      tags_interesses: tags,
      eventos_regressivos: eventos,
    })
    setIsEditing(false)
  }

  const handleAddTag = () => {
    if (!newTagInput.trim()) return
    if (!tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()])
    }
    setNewTagInput('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleAddEvento = () => {
    const nextMonth = new Date()
    nextMonth.setDate(nextMonth.getDate() + 30)
    const newEv: EventoRegressivo = {
      id: `ev_${Date.now()}`,
      titulo: 'Novo Evento / Meta',
      dataAlvo: nextMonth.toISOString().slice(0, 10),
    }
    setEventos([...eventos, newEv])
  }

  const handleUpdateEvento = (id: string, field: 'titulo' | 'dataAlvo', value: string) => {
    setEventos(
      eventos.map((ev) => (ev.id === id ? { ...ev, [field]: value } : ev))
    )
  }

  const handleRemoveEvento = (id: string) => {
    setEventos(eventos.filter((ev) => ev.id !== id))
  }

  // Calculate days remaining for countdowns
  const calculateDaysRemaining = (targetDateStr: string) => {
    if (!targetDateStr) return 0
    const target = new Date(targetDateStr)
    const now = new Date()
    // Reset hours to start of day for clean calculation
    target.setHours(0, 0, 0, 0)
    now.setHours(0, 0, 0, 0)
    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await convertFileToBase64(e.target.files[0]);
        setAvatarUrl(base64);
      } catch (err: any) {
        alert(err.message || 'Erro ao carregar imagem do avatar.');
      }
    }
  };

  const handleCapaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await convertFileToBase64(e.target.files[0]);
        setCapaUrl(base64);
      } catch (err: any) {
        alert(err.message || 'Erro ao carregar imagem da capa.');
      }
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Profile Banner & Cover */}
      <section className="bg-bg-surface border border-text-primary/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Cover Image */}
        <div
          className="w-full h-36 sm:h-48 bg-cover bg-center relative transition-all"
          style={{ backgroundImage: `url(${isEditing ? capaUrl : userProfile.capa_url})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-bg-surface/40 to-transparent" />
        </div>

        {/* Profile Content Box */}
        <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left w-full sm:w-auto">
              <div className="relative flex-shrink-0">
                {(isEditing ? avatarUrl : userProfile.avatar_url) ? (
                  <img
                    src={isEditing ? avatarUrl : userProfile.avatar_url}
                    alt={userProfile.nome || 'Convidado'}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-bg-surface shadow-2xl"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-bg-base border-4 border-bg-surface shadow-2xl flex flex-col items-center justify-center text-accent-gold font-serif font-bold text-2xl">
                    <User className="w-10 h-10 text-accent-gold/60" />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-accent-gold text-bg-base shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1 w-full sm:w-auto flex-1">
                <span className="text-[10px] font-bold text-accent-gold uppercase tracking-widest block">
                  Pergameno do Erudito
                </span>
                {!isEditing ? (
                  <h2 className="font-serif font-bold text-2xl sm:text-3xl text-text-primary">
                    {userProfile.nome || 'Convidado'}
                  </h2>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary uppercase font-semibold block">Nome</label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Digite seu nome... (Ex: João da Silva)"
                      className="p-2 bg-bg-base text-text-primary border border-accent-gold rounded-lg font-serif font-bold text-lg w-full focus:outline-none placeholder:text-text-secondary/50 placeholder:font-sans placeholder:text-xs"
                    />
                  </div>
                )}

                {!isEditing ? (
                  <p className="text-xs text-text-secondary italic max-w-xl">
                    {userProfile.biografia ? `"${userProfile.biografia}"` : 'Sem biografia informada'}
                  </p>
                ) : (
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] text-text-secondary uppercase font-semibold block">Legenda / Biografia</label>
                    <textarea
                      rows={3}
                      value={biografia}
                      onChange={(e) => setBiografia(e.target.value)}
                      placeholder="Digite sua biografia ou lema..."
                      className="p-2.5 bg-bg-base text-text-primary border border-text-primary/20 rounded-lg text-xs w-full focus:border-accent-gold focus:outline-none resize-none font-sans"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="py-2 px-3.5 bg-bg-base hover:bg-bg-elevated text-text-primary border border-text-primary/15 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-accent-gold" />
                    <span>Editar Perfil</span>
                  </button>

                  <button
                    onClick={() => resetOnboarding()}
                    className="py-2 px-3 bg-bg-base hover:bg-bg-elevated text-accent-gold border border-accent-gold/25 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    title="Refazer tutorial guiado de onboarding"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Refazer Onboarding</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSaveProfile}
                  className="py-2 px-3.5 bg-accent-gold hover:bg-accent-gold-bright text-bg-base font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Perfil</span>
                </button>
              )}

              <button
                onClick={() => logout()}
                className="py-2 px-3.5 bg-bg-base hover:bg-red-950/40 text-text-secondary hover:text-red-400 border border-text-primary/15 hover:border-red-500/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </div>

          {/* Edit Cover/Avatar Images & Local File Upload when in editing mode */}
          {isEditing && (
            <div className="p-4 bg-bg-base/90 border border-accent-gold/40 rounded-xl space-y-4 animate-fadeIn">
              <span className="text-xs font-bold uppercase text-accent-gold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Alterar Imagens do Perfil (Upload Local ou URL)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Avatar File Upload / URL */}
                <div className="p-3 bg-bg-surface border border-text-primary/15 rounded-xl space-y-2">
                  <span className="text-[10px] text-accent-gold uppercase font-bold block">
                    Foto do Avatar (Perfil)
                  </span>

                  <div className="flex items-center gap-2">
                    <label className="py-1.5 px-3 bg-accent-gold hover:bg-accent-gold-bright text-bg-base text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Local</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-text-secondary">ou edite a URL abaixo</span>
                  </div>

                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://exemplo.com/avatar.jpg ou data:image/..."
                    className="w-full p-2 bg-bg-base text-text-primary text-xs rounded-lg border border-text-primary/20 focus:border-accent-gold focus:outline-none"
                  />
                </div>

                {/* Capa File Upload / URL */}
                <div className="p-3 bg-bg-surface border border-text-primary/15 rounded-xl space-y-2">
                  <span className="text-[10px] text-accent-gold uppercase font-bold block">
                    Imagem da Capa
                  </span>

                  <div className="flex items-center gap-2">
                    <label className="py-1.5 px-3 bg-bg-elevated hover:bg-bg-base text-text-primary border border-accent-gold/40 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-accent-gold" />
                      <span>Upload Local</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCapaFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-text-secondary">ou edite a URL abaixo</span>
                  </div>

                  <input
                    type="text"
                    value={capaUrl}
                    onChange={(e) => setCapaUrl(e.target.value)}
                    placeholder="https://exemplo.com/capa.jpg ou data:image/..."
                    className="w-full p-2 bg-bg-base text-text-primary text-xs rounded-lg border border-text-primary/20 focus:border-accent-gold focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tags de Identidade & Contadores Regressivos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-text-primary/10">
            {/* Tags de Identidade */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-accent-gold uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Tags de Identidade & Interesses
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {(isEditing ? tags : userProfile.tags_interesses || []).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-bg-elevated/80 border border-text-primary/10 rounded-lg text-xs font-semibold text-text-primary hover:border-accent-gold/40 transition-colors flex items-center gap-1.5 group"
                  >
                    <span>{tag}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-red-400 hover:text-red-300 font-bold ml-1 cursor-pointer hover:scale-125 transition-transform"
                        title="Remover tag"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    placeholder="Digitar nova tag e pressionar Enter..."
                    className="p-2 bg-bg-base text-text-primary rounded-lg text-xs border border-text-primary/20 flex-1 focus:border-accent-gold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3.5 py-2 bg-accent-gold hover:bg-accent-gold-bright text-bg-base font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tag</span>
                  </button>
                </div>
              )}
            </div>

            {/* Contadores Regressivos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-accent-gold uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Contadores Regressivos do Perfil
                </h3>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleAddEvento}
                    className="text-xs text-accent-gold hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Novo Contador
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(userProfile.eventos_regressivos || []).map((ev) => {
                    const daysLeft = calculateDaysRemaining(ev.dataAlvo)
                    return (
                      <div
                        key={ev.id}
                        className="p-3.5 bg-bg-base/80 border border-accent-gold/25 rounded-xl space-y-1 shadow-md"
                      >
                        <span className="text-[10px] text-text-secondary font-bold uppercase block truncate">
                          {ev.titulo}
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-serif font-bold text-2xl text-accent-gold">
                            {daysLeft}
                          </span>
                          <span className="text-[10px] text-text-secondary font-medium">dias restantes</span>
                        </div>
                        {ev.dataAlvo && (
                          <span className="text-[9px] text-text-secondary/70 flex items-center gap-1 pt-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            Alvo: {ev.dataAlvo}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {eventos.map((ev) => {
                    const daysLeft = calculateDaysRemaining(ev.dataAlvo)
                    return (
                      <div
                        key={ev.id}
                        className="p-3 bg-bg-base/90 border border-accent-gold/30 rounded-xl space-y-2 relative"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={ev.titulo}
                            onChange={(e) => handleUpdateEvento(ev.id, 'titulo', e.target.value)}
                            placeholder="Nome do Contador (ex: Meta de Leitura)"
                            className="p-1.5 bg-bg-surface text-text-primary text-xs font-semibold rounded border border-text-primary/20 flex-1 focus:border-accent-gold focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveEvento(ev.id)}
                            className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-red-500/10 cursor-pointer"
                            title="Remover contador"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 flex-1">
                            <label className="text-[10px] text-text-secondary font-semibold uppercase">Data Alvo:</label>
                            <input
                              type="date"
                              value={ev.dataAlvo}
                              onChange={(e) => handleUpdateEvento(ev.id, 'dataAlvo', e.target.value)}
                              className="p-1 bg-bg-surface text-text-primary text-xs rounded border border-text-primary/20 focus:border-accent-gold focus:outline-none"
                            />
                          </div>
                          <span className="text-[11px] font-serif font-bold text-accent-gold">
                            {daysLeft} dias rest.
                          </span>
                        </div>
                      </div>
                    )
                  })}

                  <button
                    type="button"
                    onClick={handleAddEvento}
                    className="w-full py-2 bg-bg-surface hover:bg-bg-elevated text-accent-gold border border-dashed border-accent-gold/40 hover:border-accent-gold rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Novo Contador Regressivo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Estatísticas e Evolução */}
      <section className="space-y-4">
        <h3 className="font-serif font-bold text-xl text-text-primary flex items-center gap-2">
          <Award className="w-5 h-5 text-accent-gold" />
          Métricas e Evolução do Segundo Cérebro
        </h3>

        {/* Três Blocos Numéricos (Horas, Conteúdos, Aprendizados) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-bg-surface border border-text-primary/10 rounded-2xl space-y-1">
            <span className="text-xs font-semibold uppercase text-text-secondary">Horas de Imersão Estética</span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif font-bold text-3xl text-accent-gold">142h</span>
              <span className="text-xs text-emerald-400 font-semibold">+18h este mês</span>
            </div>
          </div>

          <div className="p-5 bg-bg-surface border border-text-primary/10 rounded-2xl space-y-1">
            <span className="text-xs font-semibold uppercase text-text-secondary">Conteúdos Catalogados</span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif font-bold text-3xl text-text-primary">{stats.totalItens}</span>
              <span className="text-xs text-text-secondary">mídias ativas</span>
            </div>
          </div>

          <div className="p-5 bg-bg-surface border border-text-primary/10 rounded-2xl space-y-1">
            <span className="text-xs font-semibold uppercase text-text-secondary">Aprendizados & Reflexões</span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif font-bold text-3xl text-accent-gold">{stats.totalAprendizados}</span>
              <span className="text-xs text-text-secondary">sínteses no dossiê</span>
            </div>
          </div>
        </div>

        {/* Category breakdown bar */}
        <div className="p-6 bg-bg-surface border border-text-primary/10 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Distribuição do Tempo por Categoria (Gráfico Analítico)
            </span>
            <span className="text-xs font-serif font-bold text-accent-gold">100% Acervo</span>
          </div>

          <div className="w-full h-4 bg-bg-base rounded-full overflow-hidden flex border border-text-primary/10">
            <div className="h-full bg-accent-gold" style={{ width: '45%' }} title="Livros (45%)" />
            <div className="h-full bg-amber-600" style={{ width: '25%' }} title="Jogos (25%)" />
            <div className="h-full bg-emerald-500" style={{ width: '15%' }} title="Cursos (15%)" />
            <div className="h-full bg-slate-500" style={{ width: '15%' }} title="Filmes & Séries (15%)" />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-secondary pt-2">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent-gold" /> Livros (45%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Jogos (25%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Cursos & Teologia (15%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Filmes & Séries (15%)</span>
          </div>
        </div>
      </section>
    </div>
  )
}
