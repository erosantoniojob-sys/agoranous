import React, { useState, useMemo } from 'react'
import {
  Bookmark,
  Calendar,
  Sparkles,
  CheckCircle2,
  Network,
  Download,
  Plus,
  BarChart3,
  Flame,
  FileText,
  X,
  Check,
  Send,
  User,
  BookOpen,
} from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { CoverImage } from '../components/CoverImage'
import { Trilhas } from '../components/Trilhas'
import { PhilosopherPortrait } from '../components/PhilosopherPortrait'

export const TimelineView: React.FC = () => {
  const {
    getTrilha,
    setSelectedMedia,
    mediaItems,
    aprendizados,
    addAprendizado,
    customTrails,
    getEstatisticas,
    userProfile,
  } = useAgoraStore()

  const [activeTab, setActiveTab] = useState<'memoria' | 'grafo' | 'trilhas' | 'analytics'>('memoria')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node_user_center')

  // Form states
  const [noteText, setNoteText] = useState('')
  const [noteTopic, setNoteTopic] = useState('')
  const [selectedMediaForNote, setSelectedMediaForNote] = useState<string>(mediaItems[0]?.id || '')

  const stats = getEstatisticas()

  // 1. DYNAMIC KNOWLEDGE GRAPH NODES BUILDER
  const dynamicGraph = useMemo(() => {
    const nodes: Array<{
      id: string
      label: string
      type: 'user' | 'tag' | 'media' | 'author' | 'trail'
      goldBorder?: boolean
      connectedTo: string[]
    }> = []

    // Central User Node (Always present)
    nodes.push({
      id: 'node_user_center',
      label: userProfile.nome || 'Convidado',
      type: 'user',
      goldBorder: true,
      connectedTo: [],
    })

    // User Interesses Tags
    const tags = userProfile.tags_interesses || []
    tags.forEach((tag, idx) => {
      const tagId = `tag_${idx}`
      nodes.push({
        id: tagId,
        label: tag,
        type: 'tag',
        goldBorder: false,
        connectedTo: ['node_user_center'],
      })
    })

    // Media Items
    mediaItems.forEach((m) => {
      const mediaId = `media_${m.id}`
      nodes.push({
        id: mediaId,
        label: m.titulo,
        type: 'media',
        goldBorder: m.status === 'Concluído',
        connectedTo: ['node_user_center'],
      })

      // Author Node
      if (m.autor_criador) {
        const authorId = `author_${m.autor_criador.replace(/\s+/g, '_')}`
        if (!nodes.some((n) => n.id === authorId)) {
          nodes.push({
            id: authorId,
            label: m.autor_criador,
            type: 'author',
            goldBorder: true,
            connectedTo: [mediaId],
          })
        } else {
          const existing = nodes.find((n) => n.id === authorId)
          if (existing && !existing.connectedTo.includes(mediaId)) {
            existing.connectedTo.push(mediaId)
          }
        }
      }
    })

    // Custom Trails Nodes
    customTrails.forEach((trail) => {
      const trailId = `trail_node_${trail.id}`
      const connectedMediaIds = trail.mediaIds.map((id) => `media_${id}`)
      nodes.push({
        id: trailId,
        label: trail.nome,
        type: 'trail',
        goldBorder: true,
        connectedTo: ['node_user_center', ...connectedMediaIds],
      })
    })

    return nodes
  }, [userProfile.nome, userProfile.tags_interesses, mediaItems, customTrails])

  const selectedNode = dynamicGraph.find((n) => n.id === selectedNodeId) || dynamicGraph[0]

  // 2. DYNAMIC ANALYTICS CALCULATIONS FROM MEDIA LIBRARY
  const totalCalculatedHours = useMemo(() => {
    let hours = 0
    mediaItems.forEach((item) => {
      const progressRatio = (item.progresso_percentual || (item.status === 'Concluído' ? 100 : 30)) / 100
      if (item.tipo === 'Filme') hours += 2 * progressRatio
      else if (item.tipo === 'Série') hours += 10 * progressRatio
      else if (item.tipo === 'Livro') hours += 12 * progressRatio
      else if (item.tipo === 'Jogo') hours += 20 * progressRatio
      else if (item.tipo === 'Curso') hours += 15 * progressRatio
      else hours += 5 * progressRatio
    })
    return Math.round(hours)
  }, [mediaItems])

  // Heatmap calculations for past 28 days
  const heatmapData = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const days = Array.from({ length: 28 }).map((_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (27 - i))
      return date
    })

    const activityMap: Record<string, number> = {}

    // Check media creation / update dates
    mediaItems.forEach((m) => {
      if (m.criadoEm) {
        const d = new Date(m.criadoEm)
        d.setHours(0, 0, 0, 0)
        const key = d.toISOString().slice(0, 10)
        activityMap[key] = (activityMap[key] || 0) + 2
      }
    })

    // Check learnings dates
    aprendizados.forEach((a) => {
      const todayKey = today.toISOString().slice(0, 10)
      activityMap[todayKey] = (activityMap[todayKey] || 0) + 1
    })

    return days.map((dateObj) => {
      const key = dateObj.toISOString().slice(0, 10)
      const count = activityMap[key] || 0
      return {
        dateStr: key,
        displayDate: dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        count,
      }
    })
  }, [mediaItems, aprendizados])

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteText.trim() || !selectedMediaForNote) return
    addAprendizado(selectedMediaForNote, noteText.trim(), noteTopic.trim() || 'Reflexão Pessoal')
    setNoteText('')
    setNoteTopic('')
  }

  const handleExportDossierPDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const notesHTML = aprendizados.length > 0
      ? aprendizados
          .map(
            (l, idx) => `
          <div style="margin-bottom: 20px; padding: 14px 18px; border-left: 3px solid #D4AF37; background: #f9f9f6;">
            <h4 style="margin:0 0 6px 0; font-size: 13px; color: #111; text-transform: uppercase;">Capítulo ${idx + 1}: ${l.topico || 'Reflexão Pessoal'}</h4>
            <p style="margin:0 0 8px 0; font-size: 12px; font-style: italic; color: #222;">"${l.texto}"</p>
            <span style="font-size: 10px; color: #666;">Registrado em ${l.data}</span>
          </div>`
          )
          .join('')
      : '<p style="font-size: 12px; color: #666;">Nenhuma reflexão registrada ainda no acervo.</p>'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dossiê Acadêmico ABNT - ${userProfile.nome || 'Convidado'}</title>
          <style>
            @page { size: A4; margin: 25mm 25mm 25mm 25mm; }
            body { font-family: "Times New Roman", Times, serif; color: #111; line-height: 1.6; font-size: 12pt; background: #fff; margin: 0; padding: 20px; }
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
          <div class="subtitle">DOSSIÊ COMPLETO DE CONHECIMENTO & APRENDIZADOS (ABNT)</div>

          <div class="meta-box">
            <div class="meta-row"><span class="meta-label">PESQUISADOR / ERUDITO:</span> ${userProfile.nome || 'Convidado'}</div>
            <div class="meta-row"><span class="meta-label">BIOGRAFIA / PERFIL:</span> ${userProfile.biografia || 'Sem biografia informada'}</div>
            <div class="meta-row"><span class="meta-label">TOTAL DE OBRAS CATALOGADAS:</span> ${stats.totalItens} mídias</div>
            <div class="meta-row"><span class="meta-label">TOTAL DE SÍNTESES E REFLEXÕES:</span> ${stats.totalAprendizados} notas</div>
            <div class="meta-row"><span class="meta-label">MÉDIA DE AVALIAÇÃO DO ACERVO:</span> ${stats.mediaAvaliacao} / 5.0 estrelas</div>
          </div>

          <h2>1. INTRODUÇÃO E ESTRUTURA DA MEMÓRIA</h2>
          <p style="text-align: justify; text-indent: 15mm; margin-top: 10px;">
            Este dossiê compila as reflexões, análises de personagens e notas de estudo consolidadas no aplicativo Ágora. As citações e referências bibliográficas observam as normas da ABNT NBR 6023.
          </p>

          <h2>2. TÓPICOS E CAPÍTULOS DE REFLEXÃO</h2>
          ${notesHTML}

          <h2>3. REFERÊNCIA BIBLIOGRÁFICA REGULAMENTAR (ABNT)</h2>
          <div class="abnt-citation">
            ÁGORA: SEGUNDO CÉREBRO. <strong>Compêndio de Mídias, Trilhas e Aprendizados</strong>. Curadoria de ${userProfile.nome || 'Convidado'}. Rio de Janeiro: Plataforma Netlify, ${new Date().getFullYear()}.
          </div>

          <div class="footer">
            Dossiê emitido automaticamente pelo aplicativo Ágora em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}.
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

  return (
    <div className="space-y-8 pb-12 font-sans animate-fadeIn">
      {/* Header Banner */}
      <section className="bg-bg-surface border border-white/5 rounded-2xl p-6 sm:p-8 shadow-3d-deep relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/15 text-accent-gold text-xs font-semibold uppercase tracking-widest border border-accent-gold/30">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Memória & Mapa do Conhecimento</span>
            </div>

            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-text-primary">
              Módulo de Memória e Dossiê ABNT
            </h2>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Consolidação de notas e reflexões, mapa interativo de grafos e métricas analíticas reais do seu Segundo Cérebro.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <PhilosopherPortrait philosopher="simone-de-beauvoir" className="h-14 w-14 rounded-2xl" />
            <button onClick={handleExportDossierPDF} className="py-2.5 px-4 bg-accent-gold hover:bg-accent-gold-bright text-bg-base font-bold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer whitespace-nowrap"><Download className="w-4 h-4" /><span>Exportar Dossiê (PDF)</span></button>
          </div>
        </div>

        {/* Sub-navigation Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-text-primary/10 mt-6">
          <button
            onClick={() => setActiveTab('memoria')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'memoria'
                ? 'bg-accent-gold text-bg-base shadow-md'
                : 'bg-bg-base text-text-secondary hover:text-text-primary border border-text-primary/10'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notas & Reflexões</span>
          </button>

          <button
            onClick={() => setActiveTab('trilhas')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'trilhas'
                ? 'bg-accent-gold text-bg-base shadow-md'
                : 'bg-bg-base text-text-secondary hover:text-text-primary border border-text-primary/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trilhas Personalizadas ({customTrails.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('grafo')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'grafo'
                ? 'bg-accent-gold text-bg-base shadow-md'
                : 'bg-bg-base text-text-secondary hover:text-text-primary border border-text-primary/10'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Grafo do Conhecimento</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-accent-gold text-bg-base shadow-md'
                : 'bg-bg-base text-text-secondary hover:text-text-primary border border-text-primary/10'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dashboard Analítico</span>
          </button>
        </div>
      </section>

      {/* TAB 1: NOTAS E REFLEXÕES */}
      {activeTab === 'memoria' && (
        <section className="space-y-6 animate-fadeIn">
          {/* Editor Box */}
          <div className="bg-bg-surface border border-white/5 rounded-2xl p-6 shadow-3d-card space-y-4">
            <div className="flex items-center justify-between border-b border-text-primary/10 pb-3">
              <h3 className="font-serif font-bold text-lg text-text-primary flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent-gold" />
                Novo Capítulo de Reflexão
              </h3>
              <span className="text-[10px] text-accent-gold uppercase tracking-widest font-semibold">
                Formatação ABNT NBR 6023
              </span>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary block mb-1.5">
                    Vincular à Obra
                  </label>
                  <select
                    value={selectedMediaForNote}
                    onChange={(e) => setSelectedMediaForNote(e.target.value)}
                    className="w-full p-2.5 bg-bg-base text-text-primary rounded-xl border border-text-primary/15 focus:border-accent-gold focus:outline-none text-xs font-semibold"
                  >
                    {mediaItems.length === 0 ? (
                      <option value="">Nenhuma obra catalogada (Cadastre via [+])</option>
                    ) : (
                      mediaItems.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.titulo} ({m.tipo})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary block mb-1.5">
                    Título do Tópico / Capítulo
                  </label>
                  <input
                    type="text"
                    value={noteTopic}
                    onChange={(e) => setNoteTopic(e.target.value)}
                    placeholder="Ex: Análise Filosófica e Cosmovisão"
                    className="w-full p-2.5 bg-bg-base text-text-primary placeholder:text-text-secondary/50 rounded-xl border border-text-primary/15 focus:border-accent-gold focus:outline-none text-xs font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary block mb-1.5">
                  Texto da Reflexão e Citação
                </label>
                <textarea
                  rows={4}
                  required
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Escreva sua síntese de conhecimento, análises e reflexões..."
                  className="w-full p-3.5 bg-bg-base text-text-primary placeholder:text-text-secondary/50 rounded-xl border border-text-primary/15 focus:border-accent-gold focus:outline-none text-sm resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  disabled={!noteText.trim() || !selectedMediaForNote}
                  className="py-2.5 px-5 bg-accent-gold text-bg-base hover:bg-accent-gold-bright disabled:opacity-50 font-bold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Salvar Reflexão no Dossiê</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Saved Notes */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Histórico do Dossiê ({aprendizados.length} sínteses)
            </h3>

            {aprendizados.length === 0 ? (
              <div className="p-12 text-center bg-bg-surface border border-white/5 rounded-2xl space-y-3 shadow-3d-card">
                <span className="text-3xl text-accent-gold block font-serif">✦</span>
                <h4 className="font-serif font-bold text-lg text-text-primary">Nenhuma reflexão registrada</h4>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Escreva sua primeira nota acima para compor seu Dossiê Acadêmico.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {aprendizados.map((learning) => {
                  const media = mediaItems.find((m) => m.id === learning.mediaId)
                  return (
                    <div
                      key={learning.id}
                      className="p-5 bg-bg-surface border border-accent-gold/20 rounded-2xl space-y-3 shadow-3d-card"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-text-primary/10 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-accent-gold">
                          {learning.topico || 'Reflexão Pessoal'}
                        </span>
                        {media && (
                          <span className="text-[11px] font-semibold text-text-secondary bg-bg-base px-2.5 py-1 rounded-md border border-text-primary/10">
                            Obra: {media.titulo} ({media.tipo})
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-text-primary leading-relaxed italic font-serif">
                        "{learning.texto}"
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-text-secondary pt-1">
                        <span>Registrado em {learning.data}</span>
                        <span className="text-accent-gold font-mono">Padrão ABNT NBR 6023</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 2: TRILHAS PERSONALIZADAS */}
      {activeTab === 'trilhas' && (
        <section className="space-y-6 animate-fadeIn">
          <Trilhas />
        </section>
      )}

      {/* TAB 3: GRAFO DINÂMICO DE CONHECIMENTO (REAL USER DATA) */}
      {activeTab === 'grafo' && (
        <section className="space-y-6 animate-fadeIn">
          <div className="bg-bg-surface border border-white/5 rounded-2xl p-6 shadow-3d-deep space-y-4">
            <div className="flex items-center justify-between border-b border-text-primary/10 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent-gold" />
                Mind Map Dinâmico (Cruzamento Real do Acervo)
              </span>

              <span className="text-[10px] text-accent-gold uppercase font-bold bg-accent-gold/10 px-2.5 py-1 rounded-full border border-accent-gold/20">
                {dynamicGraph.length} Nós Ativos
              </span>
            </div>

            {/* Interactive Mind Map Grid */}
            <div className="relative w-full min-h-[320px] bg-bg-base rounded-xl border border-text-primary/10 p-6 flex flex-col items-center justify-center overflow-hidden">
              <div className="text-center space-y-4 max-w-2xl w-full z-10">
                {/* User Central Node */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setSelectedNodeId('node_user_center')}
                    className={`px-5 py-3 rounded-2xl text-sm font-serif font-bold transition-all duration-300 cursor-pointer shadow-3d-gold flex items-center gap-2 ${
                      selectedNodeId === 'node_user_center'
                        ? 'bg-accent-gold text-bg-base scale-105'
                        : 'bg-bg-surface text-accent-gold border-2 border-accent-gold'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Nó Central: {userProfile.nome || 'Erudito'}</span>
                  </button>
                </div>

                {/* Sub-nodes list */}
                {dynamicGraph.length <= 1 ? (
                  <div className="p-6 bg-bg-surface/50 border border-white/5 rounded-xl space-y-2 mt-4">
                    <p className="text-xs text-text-secondary">
                      Seu acervo e tags estão vazios. Ao adicionar livros, filmes, autores ou trilhas, os nós do seu Grafo do Conhecimento acendem e se conectam automaticamente ao Nó Central!
                    </p>
                  </div>
                ) : (
                  <div className="pt-6 border-t border-text-primary/10 space-y-3">
                    <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest block">
                      Conexões Conectadas ao Nó Central ({dynamicGraph.length - 1} elementos)
                    </span>

                    <div className="flex flex-wrap items-center justify-center gap-2 max-h-56 overflow-y-auto p-2">
                      {dynamicGraph.filter((n) => n.type !== 'user').map((node) => (
                        <button
                          key={node.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm border ${
                            selectedNodeId === node.id
                              ? 'bg-accent-gold text-bg-base border-accent-gold'
                              : node.type === 'author'
                              ? 'bg-amber-950/40 text-amber-200 border-amber-500/40 hover:border-accent-gold'
                              : node.type === 'media'
                              ? 'bg-blue-950/40 text-blue-200 border-blue-500/40 hover:border-accent-gold'
                              : node.type === 'trail'
                              ? 'bg-purple-950/40 text-purple-200 border-purple-500/40 hover:border-accent-gold'
                              : 'bg-bg-surface text-text-primary border-white/10 hover:border-accent-gold'
                          }`}
                        >
                          <span className="opacity-60 text-[9px] uppercase font-bold mr-1">
                            [{node.type}]
                          </span>
                          <span>{node.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Node Details */}
            {selectedNode && (
              <div className="p-4 bg-bg-base/80 rounded-xl border border-accent-gold/30 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent-gold">
                    Detalhes do Nó Selecionado ({selectedNode.type.toUpperCase()})
                  </span>
                  <span className="text-xs text-text-secondary">
                    {selectedNode.connectedTo.length} conexões diretas
                  </span>
                </div>
                <h3 className="font-serif font-bold text-base text-text-primary">
                  {selectedNode.label}
                </h3>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 4: DASHBOARD ANALÍTICO (REAL CALCULATED NUMBERS) */}
      {activeTab === 'analytics' && (
        <section className="space-y-6 animate-fadeIn">
          {/* Real Numerical Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-bg-surface border border-white/5 rounded-2xl space-y-1 shadow-3d-card">
              <span className="text-xs font-semibold uppercase text-text-secondary">Horas de Imersão Calculadas</span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif font-bold text-3xl text-accent-gold">{totalCalculatedHours}h</span>
                <span className="text-xs text-text-secondary">no acervo</span>
              </div>
            </div>

            <div className="p-5 bg-bg-surface border border-white/5 rounded-2xl space-y-1 shadow-3d-card">
              <span className="text-xs font-semibold uppercase text-text-secondary">Conteúdos Catalogados</span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif font-bold text-3xl text-text-primary">{stats.totalItens}</span>
                <span className="text-xs text-text-secondary">mídias ativas</span>
              </div>
            </div>

            <div className="p-5 bg-bg-surface border border-white/5 rounded-2xl space-y-1 shadow-3d-card">
              <span className="text-xs font-semibold uppercase text-text-secondary">Aprendizados & Reflexões</span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif font-bold text-3xl text-accent-gold">{stats.totalAprendizados}</span>
                <span className="text-xs text-text-secondary">sínteses gravadas</span>
              </div>
            </div>
          </div>

          {/* Heatmap Diário e Gráfico de Rosca */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Heatmap Diário dos últimos 28 dias */}
            <div className="p-5 bg-bg-surface border border-white/5 rounded-2xl space-y-3 shadow-3d-card">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-accent-gold" />
                Heatmap de Engajamento Real (Últimos 28 Dias)
              </span>
              <p className="text-[11px] text-text-secondary">Mapeamento real do acervo. Se você cadastrou mídias ou notas hoje, o dia acende!</p>
              
              <div className="grid grid-cols-7 gap-1.5 pt-2">
                {heatmapData.map((item, idx) => {
                  let colorBg = 'bg-bg-base border-white/5'
                  if (item.count === 1) colorBg = 'bg-amber-900/40 border-amber-500/30'
                  else if (item.count >= 2) colorBg = 'bg-accent-gold border-accent-gold-bright shadow-sm shadow-accent-gold'

                  return (
                    <div
                      key={idx}
                      className={`h-8 rounded-md border flex items-center justify-center text-[9px] font-mono transition-transform hover:scale-110 ${colorBg}`}
                      title={`Dia ${item.displayDate}: ${item.count} atividades`}
                    >
                      {item.displayDate.slice(0, 2)}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Donut Chart (Gráfico de Rosca Real) */}
            <div className="p-5 bg-bg-surface border border-white/5 rounded-2xl space-y-3 shadow-3d-card">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Distribuição Real de Mídias (Gráfico de Rosca)
              </span>

              <div className="flex items-center justify-center py-3">
                <div className="relative w-32 h-32 rounded-full border-8 border-accent-gold flex items-center justify-center bg-bg-base shadow-inner">
                  <div className="text-center">
                    <span className="font-serif font-bold text-xl text-accent-gold block">{stats.totalItens}</span>
                    <span className="text-[9px] text-text-secondary uppercase">Total</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-around text-[10px] font-semibold text-text-secondary pt-1 gap-2">
                <span className="text-accent-gold">Livros: {stats.totalLivros}</span>
                <span className="text-amber-500">Filmes: {stats.totalFilmes}</span>
                <span className="text-blue-400">Séries: {stats.totalSeries}</span>
                <span className="text-emerald-400">Jogos: {stats.totalJogos}</span>
                <span className="text-purple-400">Outros: {stats.totalCursos || 0}</span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
