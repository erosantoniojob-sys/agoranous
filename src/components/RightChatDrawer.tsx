import React from 'react'
import { ArrowRight, BookOpen, Brain, CheckCircle2, Compass, LoaderCircle, Map, RotateCcw, Sparkles, Target, Timer, X } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { useModalAccessibility } from '../lib/useModalAccessibility'

type GuideAction = {
  title: string
  description: string
  icon: React.ElementType
  action: () => void
  actionLabel: string
}

type GuideInfo = {
  title: string
  description: string
  icon: React.ElementType
}

const PURPOSES: GuideInfo[] = [
  {
    title: 'Reunir',
    description: 'Organize livros, filmes, séries e jogos em um único acervo pessoal.',
    icon: BookOpen,
  },
  {
    title: 'Conectar',
    description: 'Transforme obras, temas e perguntas em trilhas de formação.',
    icon: Map,
  },
  {
    title: 'Praticar',
    description: 'Converta intenção em sessões de foco, registros e constância.',
    icon: Target,
  },
]

const GUIDE_STEPS: GuideInfo[] = [
  {
    title: 'Defina sua direção',
    description: 'Complete o perfil com seus interesses, formatos preferidos e objetivo de estudo.',
    icon: Compass,
  },
  {
    title: 'Adicione uma obra',
    description: 'Use “Adicionar” ou “Explorar”, pesquise o título, confira a ficha e salve no acervo.',
    icon: BookOpen,
  },
  {
    title: 'Registre o percurso',
    description: 'Atualize status, progresso, avaliação e aprendizados enquanto lê, assiste ou joga.',
    icon: Target,
  },
  {
    title: 'Conecte e aprofunde',
    description: 'Crie trilhas temáticas, use o Studium para investigar e a Poíesis para produzir.',
    icon: Map,
  },
  {
    title: 'Retome com intenção',
    description: 'Consulte a Memória, abra a Scholé para focar e use a Rotina para cultivar constância.',
    icon: Timer,
  },
]

export const RightChatDrawer: React.FC = () => {
  const {
    isRightChatOpen,
    setIsRightChatOpen,
    setActiveTab,
    mediaItems,
    customTrails,
    getEstatisticas,
    isVisitor,
    learningEnrichment,
    enrichExistingWorks,
  } = useAgoraStore()
  const drawerRef = useModalAccessibility<HTMLElement>(isRightChatOpen, () => setIsRightChatOpen(false))

  if (!isRightChatOpen) return null

  const stats = getEstatisticas()
  const currentWork = mediaItems.find((item) => ['Lendo', 'Assistindo', 'Jogando'].includes(item.status))
  const actions: GuideAction[] = [
    currentWork
      ? {
          title: `Retome “${currentWork.titulo}”`,
          description: `${currentWork.progresso_percentual || 0}% concluído. Uma sessão curta já mantém o fio da obra.`,
          icon: BookOpen,
          action: () => setActiveTab('inicio'),
          actionLabel: 'Ver acervo',
        }
      : {
          title: 'Escolha uma obra para começar',
          description: 'Seu acervo está pronto para receber uma nova jornada de estudo.',
          icon: BookOpen,
          action: () => setActiveTab('explorar'),
          actionLabel: 'Explorar acervo',
        },
    {
      title: 'Faça uma sessão de foco',
      description: 'Abra a Scholé, defina uma tarefa e avance sem distrações por um ciclo.',
      icon: Timer,
      action: () => setActiveTab('schole'),
      actionLabel: 'Abrir Scholé',
    },
    customTrails.length
      ? {
          title: 'Revise suas trilhas',
          description: `Você tem ${customTrails.length} ${customTrails.length === 1 ? 'trilha ativa' : 'trilhas ativas'} para organizar e aprofundar.`,
          icon: Map,
          action: () => setActiveTab('trilhas'),
          actionLabel: 'Ver trilhas',
        }
      : {
          title: 'Crie sua primeira trilha',
          description: 'Conecte obras e temas em uma jornada que tenha um propósito claro.',
          icon: Map,
          action: () => setActiveTab('trilhas'),
          actionLabel: 'Criar trilha',
        },
    {
      title: 'Cuide da constância',
      description: `${stats.totalItens} ${stats.totalItens === 1 ? 'obra catalogada' : 'obras catalogadas'} — organize uma prática pequena para hoje.`,
      icon: Target,
      action: () => setActiveTab('rotina'),
      actionLabel: 'Ver virtudes',
    },
  ]

  const navigate = (action: () => void) => {
    action()
    setIsRightChatOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" onClick={() => setIsRightChatOpen(false)} className="fixed inset-0 cursor-default bg-bg-base/80 backdrop-blur-sm animate-fadeIn" aria-label="Fechar guia" />
      <aside ref={drawerRef} role="dialog" aria-modal="true" aria-labelledby="guide-title" className="relative z-10 flex h-full w-96 max-w-[90vw] flex-col border-l border-text-primary/15 bg-bg-surface shadow-2xl animate-slideLeft">
        <header className="flex items-center justify-between border-b border-text-primary/10 bg-bg-elevated/80 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-accent-gold/40 bg-bg-base text-accent-gold"><Compass className="h-5 w-5" /></div>
            <div><h3 id="guide-title" className="flex items-center gap-1.5 font-serif text-sm font-bold text-text-primary">Guia da Ágora <Sparkles className="h-3.5 w-3.5 text-accent-gold" /></h3><p className="text-[10px] text-text-secondary">Orientação local · IA apenas na análise de obras</p></div>
          </div>
          <button type="button" onClick={() => setIsRightChatOpen(false)} className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-base hover:text-text-primary" aria-label="Fechar"><X className="h-5 w-5" /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <section aria-labelledby="guide-purpose-title" className="rounded-2xl border border-accent-gold/20 bg-gradient-to-br from-accent-gold/10 to-transparent p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-gold">Finalidade</p>
            <h4 id="guide-purpose-title" className="mt-2 font-serif text-xl font-bold text-text-primary">Transformar repertório em formação.</h4>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">A Ágora é um segundo cérebro para guardar obras, registrar o que elas despertam e construir uma vida intelectual com direção. Ela não substitui a leitura ou a contemplação: ajuda você a lembrá-las, conectá-las e praticá-las.</p>

            <div className="mt-4 grid gap-2">
              {PURPOSES.map((item) => {
                const Icon = item.icon
                return <div key={item.title} className="flex gap-3 rounded-xl border border-text-primary/10 bg-bg-base/35 p-3"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-bg-base text-accent-gold"><Icon className="h-4 w-4" /></div><div><h5 className="text-xs font-semibold text-text-primary">{item.title}</h5><p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">{item.description}</p></div></div>
              })}
            </div>
          </section>

          <section aria-labelledby="guide-steps-title" className="mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-gold">Instruções de uso</p>
            <h4 id="guide-steps-title" className="mt-1 font-serif text-lg font-bold text-text-primary">Um percurso simples</h4>
            <ol className="mt-3 space-y-3">
              {GUIDE_STEPS.map((step, index) => {
                const Icon = step.icon
                return <li key={step.title} className="flex gap-3"><div className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-accent-gold/30 bg-accent-gold/10 text-accent-gold"><Icon className="h-3.5 w-3.5" /><span className="sr-only">Etapa {index + 1}</span></div><div><h5 className="text-xs font-semibold text-text-primary">{index + 1}. {step.title}</h5><p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">{step.description}</p></div></li>
              })}
            </ol>
          </section>

          <section aria-labelledby="guide-analysis-title" aria-live="polite" className="mt-5 rounded-2xl border border-accent-gold/25 bg-gradient-to-br from-bg-elevated to-bg-base/70 p-4">
            <div className="flex gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-accent-gold/30 bg-accent-gold/10 text-accent-gold">
                {learningEnrichment.status === 'analyzing'
                  ? <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                  : learningEnrichment.status === 'done'
                    ? <CheckCircle2 className="h-4 w-4" />
                    : <Brain className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-gold">Análise do acervo</p>
                <h4 id="guide-analysis-title" className="mt-1 font-serif text-base font-bold text-text-primary">Lições vinculadas às obras</h4>

                {learningEnrichment.status === 'analyzing' ? (
                  <p className="mt-1.5 text-[11px] leading-relaxed text-text-secondary">Lendo as fichas do seu acervo e preparando lições sem alterar as obras nem apagar suas notas.</p>
                ) : learningEnrichment.status === 'done' ? (
                  <p className="mt-1.5 text-[11px] leading-relaxed text-text-secondary">
                    {learningEnrichment.added > 0
                      ? `${learningEnrichment.added} novas lições foram vinculadas a ${learningEnrichment.analyzedWorks} ${learningEnrichment.analyzedWorks === 1 ? 'obra' : 'obras'}.`
                      : 'As obras já estavam analisadas; nenhuma lição duplicada foi criada.'}
                  </p>
                ) : learningEnrichment.status === 'error' ? (
                  <p className="mt-1.5 text-[11px] leading-relaxed text-red-300">{learningEnrichment.error || 'Não foi possível concluir a análise agora.'}</p>
                ) : (
                  <p className="mt-1.5 text-[11px] leading-relaxed text-text-secondary">Cria duas lições concisas por obra usando as fichas reais da conta e preserva todos os aprendizados existentes.</p>
                )}

                {!isVisitor && mediaItems.length > 0 && ['idle', 'error'].includes(learningEnrichment.status) ? (
                  <button type="button" onClick={() => { void enrichExistingWorks() }} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-accent-gold/30 bg-accent-gold/10 px-3 py-2 text-[11px] font-semibold text-accent-gold hover:bg-accent-gold/15">
                    {learningEnrichment.status === 'error' ? <RotateCcw className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {learningEnrichment.status === 'error' ? 'Tentar novamente' : 'Analisar todas as obras'}
                  </button>
                ) : null}

                {isVisitor ? <p className="mt-2 text-[10px] text-text-secondary">Entre em uma conta para vincular lições com segurança.</p> : null}
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-accent-gold/20 bg-bg-elevated/45 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-gold">Orientação para agora</p>
            <h4 className="mt-2 font-serif text-xl font-bold text-text-primary">Uma direção por vez.</h4>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">Com base no acervo carregado, o Guia sugere uma ação concreta para você continuar.</p>
          </section>

          <section className="mt-5 space-y-2" aria-label="Sugestões do Guia">
            {actions.map((item) => {
              const Icon = item.icon
              return <article key={item.title} className="rounded-xl border border-text-primary/10 bg-bg-elevated/45 p-3.5 transition-colors hover:border-accent-gold/30"><div className="flex gap-3"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-bg-base text-accent-gold"><Icon className="h-4 w-4" /></div><div className="min-w-0"><h5 className="text-xs font-semibold text-text-primary">{item.title}</h5><p className="mt-1 text-[11px] leading-relaxed text-text-secondary">{item.description}</p><button type="button" onClick={() => navigate(item.action)} className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-accent-gold hover:text-accent-gold-bright">{item.actionLabel}<ArrowRight className="h-3.5 w-3.5" /></button></div></div></article>
            })}
          </section>

          <section aria-labelledby="guide-privacy-title" className="mt-5 rounded-xl border border-text-primary/10 bg-bg-base/45 p-3.5">
            <h4 id="guide-privacy-title" className="text-xs font-semibold text-text-primary">Dados e privacidade</h4>
            <p className="mt-1.5 text-[11px] leading-relaxed text-text-secondary">As sugestões de percurso são calculadas no navegador. A análise inteligente envia apenas a ficha bibliográfica das obras pela Function autenticada da Vercel ao Gemini e grava o resultado com o RLS da sua conta. Em uma conta, acervo, perfil, trilhas, notas e Studium são sincronizados com o Supabase; Scholé, Rotina e Poíesis permanecem neste dispositivo. No modo visitante, todos os dados ficam locais.</p>
          </section>
        </div>

        <footer className="border-t border-text-primary/10 bg-bg-elevated/60 p-4 text-center text-[10px] text-text-secondary">Guia local · análise autenticada · suas escolhas continuam sob seu controle.</footer>
      </aside>
    </div>
  )
}
