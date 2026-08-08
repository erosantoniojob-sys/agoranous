import React, { useMemo, useState } from 'react';
import {
  User,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Tag,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Image as ImageIcon,
  BookOpen,
  Compass,
} from 'lucide-react';
import { useAgoraStore } from '../store/useAgoraStore';
import { EventoRegressivo, MediaType } from '../types/agora';
import { convertFileToBase64 } from '../lib/fileUtils';
import { getErrorMessage } from '../lib/browserStorage';

export const Onboarding: React.FC = () => {
  const { userProfile, completeOnboarding, setActiveTab } = useAgoraStore();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State initialized from userProfile
  const [nome, setNome] = useState<string>(userProfile.nome || '');
  const [biografia, setBiografia] = useState<string>(userProfile.biografia || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(userProfile.avatar_url || '');
  const [capaUrl, setCapaUrl] = useState<string>(userProfile.capa_url || '');
  const [tags, setTags] = useState<string[]>(
    userProfile.tags_interesses || []
  );
  const [formatos, setFormatos] = useState<MediaType[]>(userProfile.formatos_preferidos || []);
  const [objetivo, setObjetivo] = useState(userProfile.objetivo_descoberta || 'Aprofundar ideias');
  const [ritmo, setRitmo] = useState(userProfile.ritmo_estudo || 'Contemplativo');
  const [eventos, setEventos] = useState<EventoRegressivo[]>(
    userProfile.eventos_regressivos || []
  );

  // UI Helper state
  const [tagInput, setTagInput] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Suggested Examples for Tags
  const GOALS = [
    { label: 'Aprofundar ideias', tags: ['Filosofia', 'Ensaios', 'Clássicos'] },
    { label: 'Viver grandes histórias', tags: ['Literatura', 'Drama', 'Narrativa'] },
    { label: 'Compreender o mundo', tags: ['História', 'Ciência', 'Sociedade'] },
    { label: 'Cultivar virtudes', tags: ['Ética', 'Espiritualidade', 'Biografias'] },
  ];
  const FORMATS: MediaType[] = ['Livro', 'Filme', 'Série', 'Jogo'];
  const suggestedTags = useMemo(() => {
    const goalTags = GOALS.find((item) => item.label === objetivo)?.tags || [];
    const formatTags = formatos.flatMap((format) => ({ Livro: ['Literatura'], Filme: ['Cinema'], Série: ['Séries'], Jogo: ['Jogos'], App: [], Podcast: [], Curso: [] }[format]));
    return [...new Set([...goalTags, ...formatTags, 'Filosofia', 'História', 'Teologia', 'Arte'])];
  }, [formatos, objetivo]);

  // Suggested Examples for Counters
  const SUGGESTED_EVENTS = [
    { titulo: 'Meta de Leitura', dataAlvo: '2026-12-31' },
    { titulo: 'Projeto de Estudos', dataAlvo: '2026-06-30' },
  ];

  // File Upload Handler with FileReader Base64 conversion
  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    try {
      const base64String = await convertFileToBase64(file);
      setAvatarUrl(base64String);
    } catch (err: unknown) {
      setUploadError(getErrorMessage(err, 'Erro ao carregar arquivo de imagem.'));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Tag Handlers
  const handleAddTag = (tagToAdd?: string) => {
    const val = (tagToAdd || tagInput).trim();
    if (!val) return;
    if (!tags.includes(val)) {
      setTags([...tags, val]);
    }
    if (!tagToAdd) setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const toggleFormat = (format: MediaType) => {
    setFormatos((current) => current.includes(format) ? current.filter((item) => item !== format) : [...current, format]);
  };

  // Event Handlers
  const handleAddSuggestedEvent = (ev: { titulo: string; dataAlvo: string }) => {
    if (eventos.some((e) => e.titulo === ev.titulo)) return;
    setEventos([
      ...eventos,
      { id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, ...ev },
    ]);
  };

  const handleAddCustomEvent = () => {
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    setEventos([
      ...eventos,
      {
        id: `ev_${Date.now()}`,
        titulo: 'Nova Meta / Evento',
        dataAlvo: nextMonth.toISOString().slice(0, 10),
      },
    ]);
  };

  const handleUpdateEvent = (id: string, field: 'titulo' | 'dataAlvo', value: string) => {
    setEventos(eventos.map((ev) => (ev.id === id ? { ...ev, [field]: value } : ev)));
  };

  const handleRemoveEvent = (id: string) => {
    setEventos(eventos.filter((ev) => ev.id !== id));
  };

  // Complete Onboarding
  const handleFinish = () => {
    completeOnboarding({
      nome: nome.trim(),
      biografia: biografia.trim(),
      avatar_url: avatarUrl,
      capa_url: capaUrl,
      tags_interesses: [...new Set([...tags, ...(GOALS.find((item) => item.label === objetivo)?.tags || [])])],
      formatos_preferidos: formatos,
      objetivo_descoberta: objetivo,
      ritmo_estudo: ritmo,
      eventos_regressivos: eventos,
    });
    setActiveTab('inicio');
  };

  const totalSteps = 5;
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg-base/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

      {/* Onboarding Container Card */}
      <div className="w-full max-w-2xl bg-bg-surface/90 border border-accent-gold/30 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative z-10 flex flex-col justify-between space-y-8 backdrop-blur-md">
        
        {/* Top Header & Progress Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent-gold/10 border border-accent-gold/40 rounded-xl text-accent-gold shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent-gold block">
                  Onboarding • Primeiro Acesso
                </span>
                <h1 className="font-serif font-bold text-xl sm:text-2xl text-text-primary">
                  Sintonização do Ágora
                </h1>
              </div>
            </div>
            <span className="text-xs font-serif font-bold text-accent-gold bg-bg-elevated px-3 py-1.5 rounded-full border border-text-primary/10">
              Etapa {currentStep} de {totalSteps}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden border border-text-primary/10 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-accent-gold/80 to-accent-gold-bright rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(212,175,55,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* STEP CONTENT BODY */}
        <div className="min-h-[320px] flex flex-col justify-center">

          {/* ETAPA 1: ABERTURA GLORIOSA */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="relative overflow-hidden rounded-3xl border border-accent-gold/30 bg-gradient-to-br from-bg-surface via-bg-base to-bg-elevated p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.18),_transparent_50%)]" />
                <div className="relative space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-accent-gold/30 bg-accent-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-accent-gold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Abertura Gloriosa
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-serif font-bold text-3xl sm:text-4xl text-text-primary leading-tight">
                      Bem-vindo à Ágora
                    </h2>
                    <p className="text-sm sm:text-base text-text-secondary max-w-2xl">
                      Aqui, leituras, memórias e trilhas se tornam uma jornada viva. Seu segundo cérebro se abre com dignidade, beleza e propósito.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-accent-gold/20 bg-bg-surface/80 p-3">
                      <div className="flex items-center gap-2 text-accent-gold">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">Leituras</span>
                      </div>
                      <p className="mt-2 text-xs text-text-secondary">Uma biblioteca viva para cada jornada.</p>
                    </div>
                    <div className="rounded-2xl border border-accent-gold/20 bg-bg-surface/80 p-3">
                      <div className="flex items-center gap-2 text-accent-gold">
                        <Compass className="w-4 h-4" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">Trilhas</span>
                      </div>
                      <p className="mt-2 text-xs text-text-secondary">Caminhos claros para estudar com paixão.</p>
                    </div>
                    <div className="rounded-2xl border border-accent-gold/20 bg-bg-surface/80 p-3">
                      <div className="flex items-center gap-2 text-accent-gold">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">Reflexão</span>
                      </div>
                      <p className="mt-2 text-xs text-text-secondary">Aprofunde ideias, memórias e projetos.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-accent-gold/20 bg-bg-base/70 p-4 text-sm text-text-secondary">
                <p className="font-semibold text-text-primary">Pronto para entrar?</p>
                <p className="mt-1">A próxima etapa personaliza seu perfil e prepara a Ágora para acolher sua presença.</p>
              </div>
            </div>
          )}

          {/* ETAPA 2: APRESENTAÇÃO */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <h2 className="font-serif font-bold text-2xl text-text-primary flex items-center gap-2">
                  <User className="w-6 h-6 text-accent-gold" />
                  Como devemos chamá-lo?
                </h2>
                <p className="text-xs text-text-secondary">
                  Defina seu nome de perfil e uma breve biografia para personalizar seu Segundo Cérebro.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent-gold uppercase tracking-wider block">
                    Nome Completo ou Alcunha
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Digite seu nome... (Ex: João da Silva)"
                    className="w-full p-3.5 bg-bg-base/80 text-text-primary border border-text-primary/20 rounded-xl text-sm font-semibold focus:border-accent-gold focus:ring-1 focus:ring-accent-gold focus:outline-none transition-all placeholder:text-text-secondary/50 shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent-gold uppercase tracking-wider block">
                    Biografia / Legenda
                  </label>
                  <textarea
                    rows={3}
                    value={biografia}
                    onChange={(e) => setBiografia(e.target.value)}
                    placeholder="Digite sua biografia ou lema pessoal..."
                    className="w-full p-3.5 bg-bg-base/80 text-text-primary border border-text-primary/20 rounded-xl text-sm focus:border-accent-gold focus:ring-1 focus:ring-accent-gold focus:outline-none transition-all placeholder:text-text-secondary/50 resize-none shadow-inner"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 3: IDENTIDADE VISUAL (UPLOAD DE FOTO) */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <h2 className="font-serif font-bold text-2xl text-text-primary flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-accent-gold" />
                  Identidade Visual do Erudito
                </h2>
                <p className="text-xs text-text-secondary">
                  Faça o upload de uma foto do seu dispositivo para salvar offline em seu perfil.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Circular Avatar Preview */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="relative group">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar Preview"
                        className="w-28 h-28 rounded-2xl object-cover border-2 border-accent-gold shadow-2xl"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-2xl bg-bg-elevated border-2 border-dashed border-accent-gold/50 flex flex-col items-center justify-center text-text-secondary p-2 text-center">
                        <User className="w-8 h-8 text-accent-gold mb-1" />
                        <span className="text-[10px]">Sem Foto</span>
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 p-1.5 bg-accent-gold rounded-lg text-bg-base shadow-md">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                    Pré-visualização
                  </span>
                </div>

                {/* Dropzone Upload Area */}
                <div className="flex-1 w-full">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                      isDragging
                        ? 'border-accent-gold bg-accent-gold/10 text-accent-gold scale-[1.02] shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                        : 'border-text-secondary/40 hover:border-accent-gold/70 bg-bg-base/60 text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="onboarding-avatar-file-input"
                    />

                    <div className="p-3 bg-bg-elevated rounded-full text-accent-gold border border-accent-gold/20 shadow-md">
                      <Upload className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-text-primary">
                        Clique para selecionar ou arraste uma foto aqui
                      </p>
                      <p className="text-[10px] text-text-secondary">
                        Formatos suportados: JPG, PNG, WEBP (Convertido para Base64 offline)
                      </p>
                    </div>
                  </div>

                  {uploadError && (
                    <p className="text-xs text-red-400 font-semibold mt-2">{uploadError}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 4: INTERESSES E TAGS */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <h2 className="font-serif font-bold text-2xl text-text-primary flex items-center gap-2">
                  <Tag className="w-6 h-6 text-accent-gold" />
                  Que percurso deseja construir?
                </h2>
                <p className="text-xs text-text-secondary">
                  Suas respostas orientam as primeiras obras indicadas. Você poderá mudar tudo depois.
                </p>
              </div>

              <div className="space-y-4">
                <fieldset className="space-y-2">
                  <legend className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">O que você procura agora?</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {GOALS.map((goal) => <button key={goal.label} type="button" onClick={() => setObjetivo(goal.label)} className={`rounded-xl border p-3 text-left text-xs transition-all ${objetivo === goal.label ? 'border-accent-gold bg-accent-gold/15 text-accent-gold shadow-[0_0_18px_rgba(212,175,55,.12)]' : 'border-text-primary/10 bg-bg-base/60 text-text-secondary hover:border-accent-gold/40'}`}>{goal.label}</button>)}
                  </div>
                </fieldset>

                <fieldset className="space-y-2">
                  <legend className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Quais formatos deseja descobrir?</legend>
                  <div className="flex flex-wrap gap-2">{FORMATS.map((format) => <button key={format} type="button" aria-pressed={formatos.includes(format)} onClick={() => toggleFormat(format)} className={`rounded-full border px-3 py-1.5 text-xs ${formatos.includes(format) ? 'border-accent-gold bg-accent-gold text-bg-base' : 'border-text-primary/15 bg-bg-base text-text-secondary'}`}>{format}</button>)}</div>
                </fieldset>

                <fieldset className="space-y-2">
                  <legend className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Qual ritmo combina com você?</legend>
                  <div className="grid grid-cols-3 gap-2">{['Contemplativo', 'Equilibrado', 'Intenso'].map((option) => <button key={option} type="button" onClick={() => setRitmo(option)} className={`rounded-lg border px-2 py-2 text-[11px] ${ritmo === option ? 'border-accent-gold text-accent-gold' : 'border-text-primary/10 text-text-secondary'}`}>{option}</button>)}</div>
                </fieldset>
              </div>

              {/* Tag Input Field */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Digite uma tag (ex: Teologia, Xadrez)..."
                    className="p-3.5 bg-bg-base/80 text-text-primary border border-text-primary/20 rounded-xl text-xs font-semibold flex-1 focus:border-accent-gold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag()}
                    className="px-4 py-3.5 bg-accent-gold hover:bg-accent-gold-bright text-bg-base font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar</span>
                  </button>
                </div>

                {/* Selected Chips */}
                <div className="min-h-[48px] p-3 bg-bg-base/50 border border-text-primary/10 rounded-xl flex flex-wrap gap-2 items-center">
                  {tags.length === 0 ? (
                    <span className="text-xs text-text-secondary italic">Nenhuma tag adicionada ainda...</span>
                  ) : (
                    tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-bg-elevated border border-accent-gold/30 text-accent-gold font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-sm"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-red-400 hover:text-red-300 font-bold ml-1 cursor-pointer hover:scale-125 transition-transform"
                          title="Remover tag"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Suggested Examples */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">
                    Sugestões Rápidas (Clique para adicionar):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddTag(sug)}
                        className="px-3 py-1 bg-bg-surface hover:bg-bg-elevated border border-text-primary/15 text-text-secondary hover:text-accent-gold rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 5: CONTADORES E EVENTOS */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <h2 className="font-serif font-bold text-2xl text-text-primary flex items-center gap-2">
                  <Clock className="w-6 h-6 text-accent-gold" />
                  Contadores Regressivos & Metas
                </h2>
                <p className="text-xs text-text-secondary">
                  Cadastre datas importantes que aparecerão com contagem de dias em seu Perfil.
                </p>
              </div>

              {/* Event List */}
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {eventos.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 bg-bg-base/80 border border-accent-gold/30 rounded-xl space-y-2 flex items-center gap-3 justify-between"
                  >
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={ev.titulo}
                        onChange={(e) => handleUpdateEvent(ev.id, 'titulo', e.target.value)}
                        placeholder="Nome do Evento (ex: Meta de Leitura)"
                        className="p-2 bg-bg-surface text-text-primary text-xs font-bold rounded-lg border border-text-primary/20 w-full focus:border-accent-gold focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={ev.dataAlvo}
                        onChange={(e) => handleUpdateEvent(ev.id, 'dataAlvo', e.target.value)}
                        className="p-2 bg-bg-surface text-text-primary text-xs rounded-lg border border-text-primary/20 focus:border-accent-gold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveEvent(ev.id)}
                        className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 cursor-pointer"
                        title="Remover contador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddCustomEvent}
                  className="w-full py-2.5 bg-bg-base hover:bg-bg-elevated border border-dashed border-accent-gold/40 text-accent-gold rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Novo Contador Personalizado</span>
                </button>
              </div>

              {/* Suggested Event Examples */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">
                  Exemplos Sugeridos:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_EVENTS.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddSuggestedEvent(sug)}
                      className="px-3 py-1.5 bg-bg-surface hover:bg-bg-elevated border border-text-primary/15 text-text-secondary hover:text-accent-gold rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Calendar className="w-3 h-3 text-accent-gold" />
                      <span>+ {sug.titulo}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM NAVIGATION FOOTER */}
        <div className="flex items-center justify-between pt-6 border-t border-text-primary/10">
          {/* Back Button */}
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className={`py-3 px-5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              currentStep === 1
                ? 'opacity-30 cursor-not-allowed text-text-secondary'
                : 'bg-bg-base hover:bg-bg-elevated text-text-primary border border-text-primary/15 cursor-pointer shadow-md'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          {/* Next / Finish Button */}
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
              className="py-3 px-6 bg-accent-gold hover:bg-accent-gold-bright text-bg-base font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-lg transition-all"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="py-3.5 px-7 bg-gradient-to-r from-accent-gold via-accent-gold-bright to-accent-gold text-bg-base font-serif font-bold text-sm uppercase tracking-widest rounded-xl flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:scale-[1.02] transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Adentrar o Ágora</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
