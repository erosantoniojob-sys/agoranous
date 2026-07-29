import React, { useEffect, useState } from 'react'
import { ArrowLeft, Feather, Music2, PenLine, Sparkles } from 'lucide-react'
import { readScholeValue, writeScholeValue } from '../lib/scholeStorage'
import { useAgoraStore } from '../store/useAgoraStore'

type CreativeMode = 'poesia' | 'composicoes'

const prompts = {
  poesia: 'Comece por uma imagem, uma memória ou uma pergunta que mereça ganhar ritmo.',
  composicoes: 'Escreva uma frase, um refrão ou uma progressão que queira continuar ouvindo.',
}

export const PoiesisView: React.FC = () => {
  const { setActiveTab, userProfile } = useAgoraStore()
  const [mode, setMode] = useState<CreativeMode>('poesia')
  const [poetry, setPoetry] = useState(() => readScholeValue('poiesis.poetry', ''))
  const [compositions, setCompositions] = useState(() => readScholeValue('poiesis.compositions', ''))

  useEffect(() => writeScholeValue('poiesis.poetry', poetry), [poetry])
  useEffect(() => writeScholeValue('poiesis.compositions', compositions), [compositions])

  const isPoetry = mode === 'poesia'
  const value = isPoetry ? poetry : compositions
  const setValue = isPoetry ? setPoetry : setCompositions
  const Icon = isPoetry ? Feather : Music2
  const name = userProfile.nome?.trim().split(' ')[0]

  return (
    <div className="space-y-6 pb-12 font-sans animate-fadeIn">
      <header className="flex items-center justify-between">
        <button type="button" onClick={() => setActiveTab('inicio')} className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary transition-colors hover:text-accent-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"><ArrowLeft className="h-4 w-4" />Voltar</button>
        <div className="text-right"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-gold">Oficina criativa</p><h1 className="font-serif text-2xl font-bold">Poíesis</h1></div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-accent-gold/25 bg-gradient-to-br from-bg-surface via-bg-elevated/60 to-bg-surface p-6 sm:p-8">
        <Sparkles className="h-5 w-5 text-accent-gold" />
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-gold">ποίησις · o ato de criar</p>
        <h2 className="mt-2 font-serif text-2xl font-bold text-text-primary">{name ? `${name}, dê forma ao que está vivo em você.` : 'Dê forma ao que está vivo em você.'}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">Um caderno livre para transformar referências em voz própria — entre versos, letras e esboços de canção.</p>
      </section>

      <section className="rounded-2xl border border-text-primary/10 bg-bg-surface p-5 sm:p-6">
        <div className="mb-5 flex gap-2 border-b border-text-primary/10 pb-3" role="tablist" aria-label="Formatos de criação">
          <button type="button" role="tab" aria-selected={isPoetry} onClick={() => setMode('poesia')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${isPoetry ? 'bg-accent-gold text-bg-base' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}><Feather className="h-3.5 w-3.5" />Poesia</button>
          <button type="button" role="tab" aria-selected={!isPoetry} onClick={() => setMode('composicoes')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${!isPoetry ? 'bg-accent-gold text-bg-base' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}><Music2 className="h-3.5 w-3.5" />Composições</button>
        </div>

        <div className="mb-3 flex items-start gap-2 rounded-xl border border-accent-gold/20 bg-accent-gold/5 p-3 text-xs text-text-secondary"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent-gold" /><p>{prompts[mode]}</p></div>
        <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-text-primary" htmlFor="poiesis-notebook"><PenLine className="h-3.5 w-3.5 text-accent-gold" />Seu caderno de {isPoetry ? 'poesia' : 'composições'}</label>
        <textarea id="poiesis-notebook" value={value} onChange={(event) => setValue(event.target.value)} rows={16} placeholder={isPoetry ? 'Versos, imagens, rascunhos…' : 'Letra, refrão, acordes, ideias de arranjo…'} className="w-full resize-y rounded-xl border border-text-primary/15 bg-bg-base/60 px-4 py-3 font-serif text-base leading-relaxed text-text-primary outline-none transition-colors placeholder:font-sans placeholder:text-sm placeholder:text-text-secondary/50 focus:border-accent-gold" />
        <p className="mt-2 text-right text-[10px] text-text-secondary">Salvo automaticamente neste navegador</p>
      </section>
    </div>
  )
}
