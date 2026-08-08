import React from 'react'
import { ArrowRight, BookOpen, Compass, Map, Sparkles, Target, Timer, X } from 'lucide-react'
import { useAgoraStore } from '../store/useAgoraStore'
import { useModalAccessibility } from '../lib/useModalAccessibility'

type GuideAction = {
  title: string
  description: string
  icon: React.ElementType
  action: () => void
  actionLabel: string
}

export const RightChatDrawer: React.FC = () => {
  const {
    isRightChatOpen,
    setIsRightChatOpen,
    setActiveTab,
    mediaItems,
    customTrails,
    getEstatisticas,
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
            <div><h3 id="guide-title" className="flex items-center gap-1.5 font-serif text-sm font-bold text-text-primary">Guia da Ágora <Sparkles className="h-3.5 w-3.5 text-accent-gold" /></h3><p className="text-[10px] text-text-secondary">Orientação local · sem IA ou token</p></div>
          </div>
          <button type="button" onClick={() => setIsRightChatOpen(false)} className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-base hover:text-text-primary" aria-label="Fechar"><X className="h-5 w-5" /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <section className="rounded-2xl border border-accent-gold/20 bg-gradient-to-br from-accent-gold/10 to-transparent p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-gold">Próximo passo</p>
            <h4 className="mt-2 font-serif text-xl font-bold text-text-primary">Uma direção por vez.</h4>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">O Guia organiza o que já está no seu acervo e sugere uma ação concreta. Nenhuma informação sai do seu navegador.</p>
          </section>

          <section className="mt-5 space-y-2" aria-label="Sugestões do Guia">
            {actions.map((item) => {
              const Icon = item.icon
              return <article key={item.title} className="rounded-xl border border-text-primary/10 bg-bg-elevated/45 p-3.5 transition-colors hover:border-accent-gold/30"><div className="flex gap-3"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-bg-base text-accent-gold"><Icon className="h-4 w-4" /></div><div className="min-w-0"><h5 className="text-xs font-semibold text-text-primary">{item.title}</h5><p className="mt-1 text-[11px] leading-relaxed text-text-secondary">{item.description}</p><button type="button" onClick={() => navigate(item.action)} className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-accent-gold hover:text-accent-gold-bright">{item.actionLabel}<ArrowRight className="h-3.5 w-3.5" /></button></div></div></article>
            })}
          </section>
        </div>

        <footer className="border-t border-text-primary/10 bg-bg-elevated/60 p-4 text-center text-[10px] text-text-secondary">Guia local — suas escolhas continuam sob seu controle.</footer>
      </aside>
    </div>
  )
}
