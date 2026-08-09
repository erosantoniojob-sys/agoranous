import React, { useEffect, useState } from 'react'
import { BookOpenText, Palette, Sparkles } from 'lucide-react'
import { readBrowserValue, writeBrowserValue } from '../lib/browserStorage'

const themes = [['academia','Dark Academia'],['alexandria','Alexandria'],['roman','Estoicismo romano'],['monastery','Mosteiro medieval'],['renaissance','Renascimento'],['enlightenment','Iluminismo'],['modernism','Modernismo']] as const
const effectsModes = [['full', 'Completo'], ['subtle', 'Sutil'], ['off', 'Desativado']] as const
type EffectsMode = (typeof effectsModes)[number][0]

const readEffectsMode = (): EffectsMode => {
  const saved = readBrowserValue<string>('agora.effects', 'full')
  return effectsModes.some(([id]) => id === saved) ? saved as EffectsMode : 'full'
}

const initialTheme = readBrowserValue('agora.theme', 'academia')
const initialReading = readBrowserValue('agora.reading-mode', false)
const initialEffects = readEffectsMode()

if (typeof document !== 'undefined') {
  document.documentElement.dataset.theme = initialTheme
  document.documentElement.dataset.effects = initialEffects
  document.documentElement.classList.toggle('reading-mode', initialReading)
}

export const ExperienceSettings: React.FC = () => {
  const [theme, setTheme] = useState(() => readBrowserValue('agora.theme', initialTheme))
  const [reading, setReading] = useState(() => readBrowserValue('agora.reading-mode', initialReading))
  const [effects, setEffects] = useState<EffectsMode>(readEffectsMode)

  useEffect(() => { document.documentElement.dataset.theme = theme; writeBrowserValue('agora.theme', theme) }, [theme])
  useEffect(() => { document.documentElement.classList.toggle('reading-mode', reading); writeBrowserValue('agora.reading-mode', reading) }, [reading])
  useEffect(() => {
    document.documentElement.dataset.effects = effects
    writeBrowserValue('agora.effects', effects)
  }, [effects])

  return (
    <div className="space-y-2 rounded-xl border border-text-primary/10 bg-bg-base/35 p-3">
      <label className="flex items-center gap-2 text-[10px] font-semibold uppercase text-text-secondary">
        <Palette className="h-3.5 w-3.5" />
        Ambiente
        <select value={theme} onChange={(event) => setTheme(event.target.value)} className="ml-auto max-w-32 rounded-lg border border-text-primary/10 bg-bg-surface px-2 py-1 text-[10px] normal-case text-text-primary">
          {themes.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
      </label>

      <label className="flex items-center gap-2 text-[10px] font-semibold uppercase text-text-secondary">
        <Sparkles className="h-3.5 w-3.5" />
        Efeitos 3D
        <select value={effects} onChange={(event) => setEffects(event.target.value as EffectsMode)} className="ml-auto max-w-32 rounded-lg border border-text-primary/10 bg-bg-surface px-2 py-1 text-[10px] normal-case text-text-primary">
          {effectsModes.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
      </label>

      <button type="button" onClick={() => setReading((value) => !value)} aria-pressed={reading} className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] font-semibold ${reading ? 'bg-accent-gold text-bg-base' : 'text-text-secondary hover:bg-bg-elevated'}`}>
        <BookOpenText className="h-3.5 w-3.5" />
        Modo de leitura {reading ? 'ativo' : 'inativo'}
      </button>
    </div>
  )
}
