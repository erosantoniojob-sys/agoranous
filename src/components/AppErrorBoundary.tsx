import React from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

type State = { error: Error | null }

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Falha inesperada na interface da Ágora', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <main className="grid min-h-screen place-items-center bg-bg-base p-6 text-text-primary">
        <section role="alert" className="w-full max-w-md rounded-2xl border border-red-400/30 bg-bg-surface p-6 text-center shadow-2xl">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-300" />
          <h1 className="mt-4 font-serif text-2xl font-bold">A Ágora encontrou um problema</h1>
          <p className="mt-2 text-sm text-text-secondary">Seus dados continuam preservados. Recarregue a interface para tentar novamente.</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-gold px-4 py-2 text-sm font-bold text-bg-base">
            <RotateCcw className="h-4 w-4" /> Recarregar
          </button>
        </section>
      </main>
    )
  }
}
