import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, Sparkles, Volume2, VolumeX } from 'lucide-react'
import {
  AGORA_WELCOME_EVENT,
  type EntranceNarrationState,
  playEntranceVoice,
  prepareEntranceVoice,
  stopEntranceVoice,
} from '../lib/entranceVoice'
import { readSessionValue, writeSessionValue } from '../lib/browserStorage'
import { useModalAccessibility } from '../lib/useModalAccessibility'
import { ClassicArchLogoIcon } from './ClassicArchLogo'

const WELCOME_SESSION_KEY = 'agora.welcome.seen.v2'
const WELCOME_TEXT = 'Bem-vindo à Ágora. Entre o silêncio e as estrelas, este é o seu espaço. Aqui, o tempo se transforma em conhecimento; a memória, em caminho; e a curiosidade, em obra. Respire fundo. Os portais estão abertos. Sua jornada começa agora.'

type WelcomePhase = 'waiting' | 'departing'
const departureDelay = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1350

export function CosmicWelcome() {
  const [isOpen, setIsOpen] = useState(() => !readSessionValue(WELCOME_SESSION_KEY, false))
  const [phase, setPhase] = useState<WelcomePhase>('waiting')
  const [narrationState, setNarrationState] = useState<EntranceNarrationState>('idle')
  const departureTimer = useRef(0)
  const narrationRequest = useRef(0)

  const beginDeparture = useCallback(() => {
    if (departureTimer.current) window.clearTimeout(departureTimer.current)
    setPhase('departing')
    departureTimer.current = window.setTimeout(() => setIsOpen(false), departureDelay())
  }, [])

  const closeSilently = useCallback(() => {
    narrationRequest.current += 1
    stopEntranceVoice()
    setNarrationState('idle')
    writeSessionValue(WELCOME_SESSION_KEY, true)
    beginDeparture()
  }, [beginDeparture])
  const dialogRef = useModalAccessibility<HTMLDivElement>(isOpen, closeSilently)

  useEffect(() => {
    if (isOpen) prepareEntranceVoice()
  }, [isOpen])

  useEffect(() => {
    const replay = () => {
      if (departureTimer.current) window.clearTimeout(departureTimer.current)
      narrationRequest.current += 1
      stopEntranceVoice()
      setNarrationState('idle')
      setPhase('waiting')
      setIsOpen(true)
    }
    window.addEventListener(AGORA_WELCOME_EVENT, replay)
    return () => {
      window.removeEventListener(AGORA_WELCOME_EVENT, replay)
      if (departureTimer.current) window.clearTimeout(departureTimer.current)
      stopEntranceVoice()
    }
  }, [])

  const enterWithVoice = () => {
    const request = narrationRequest.current + 1
    narrationRequest.current = request
    writeSessionValue(WELCOME_SESSION_KEY, true)
    void playEntranceVoice((state) => {
      if (narrationRequest.current === request) setNarrationState(state)
    })
      .then(() => {
        if (narrationRequest.current === request) beginDeparture()
      })
      .catch(() => {
        if (narrationRequest.current !== request) return
        setNarrationState('unavailable')
        beginDeparture()
      })
  }

  const silenceNarration = () => {
    narrationRequest.current += 1
    stopEntranceVoice()
    setNarrationState('idle')
  }

  if (!isOpen) {
    if (narrationState !== 'playing' && narrationState !== 'loading') return null
    return (
      <button type="button" className="cosmic-narration-control" onClick={silenceNarration}>
        <span className="cosmic-narration-control__pulse" aria-hidden="true" />
        <VolumeX className="h-4 w-4" /> Silenciar narração
      </button>
    )
  }

  return (
    <div className="cosmic-welcome" data-phase={phase}>
      <div className="cosmic-welcome__veil" aria-hidden="true" />
      <div
        ref={dialogRef}
        className="cosmic-welcome__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cosmic-welcome-title"
        aria-describedby="cosmic-welcome-description"
      >
        <div className="cosmic-welcome__universe" aria-hidden="true">
          <span className="cosmic-welcome__orbit cosmic-welcome__orbit--outer" />
          <span className="cosmic-welcome__orbit cosmic-welcome__orbit--middle" />
          <span className="cosmic-welcome__orbit cosmic-welcome__orbit--inner" />
          <span className="cosmic-welcome__planet cosmic-welcome__planet--one" />
          <span className="cosmic-welcome__planet cosmic-welcome__planet--two" />
          <span className="cosmic-welcome__portal">
            <ClassicArchLogoIcon className="h-16 w-16" />
          </span>
        </div>

        <div className="cosmic-welcome__copy">
          <p className="cosmic-welcome__eyebrow"><Sparkles className="h-3.5 w-3.5" /> Uma constelação de ideias</p>
          <h1 id="cosmic-welcome-title">Bem-vindo à <em>Àgora</em></h1>
          <p id="cosmic-welcome-description">Seu espaço entre o silêncio e as estrelas, onde o tempo se transforma em conhecimento.</p>
          <blockquote>“Memória em caminho. Curiosidade em obra. Sua jornada começa agora.”</blockquote>

          <div className="cosmic-welcome__actions">
            <button data-autofocus type="button" onClick={enterWithVoice} className="cosmic-welcome__primary" disabled={narrationState === 'loading' || narrationState === 'playing'} aria-label={narrationState === 'loading' ? 'Preparando narração cinematográfica' : 'Entrar com narração cinematográfica'}>
              <Volume2 className="h-4 w-4" /> {narrationState === 'loading' ? 'Invocando a voz…' : 'Abrir os portais'} <ArrowRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={closeSilently} className="cosmic-welcome__quiet">
              <VolumeX className="h-4 w-4" /> Entrar em silêncio
            </button>
          </div>
          {narrationState === 'loading' && <p className="cosmic-welcome__notice" role="status">Preparando a voz do portal…</p>}
          {narrationState === 'unavailable' && <p className="cosmic-welcome__notice" role="status">A voz não está disponível neste navegador; o portal seguirá em silêncio.</p>}
          <details className="cosmic-welcome__transcript">
            <summary>Ver transcrição da narração</summary>
            <p>{WELCOME_TEXT}</p>
          </details>
          <p className="cosmic-welcome__hint">Locução brasileira com ambiência espacial — iniciada somente após seu toque.</p>
        </div>
      </div>
    </div>
  )
}
