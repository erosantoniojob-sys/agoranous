import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Music2, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { readScholeValue, writeScholeValue } from '../lib/scholeStorage'

export const AmbientSoundControl: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [wasEnabled, setWasEnabled] = useState(() => readScholeValue('classical-adagio-enabled', false))
  const [audioError, setAudioError] = useState('')
  const [volume, setVolume] = useState(() => readScholeValue('ambient-volume', 18))
  const [soundscape, setSoundscape] = useState<'piano' | 'strings' | 'lute'>(() => readScholeValue('ambient-soundscape', 'piano'))
  const contextRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const sourcesRef = useRef<AudioScheduledSourceNode[]>([])
  const phraseTimerRef = useRef<number | null>(null)
  const startAttemptRef = useRef(0)

  const stop = useCallback((remember = true) => {
    startAttemptRef.current += 1
    if (phraseTimerRef.current) window.clearInterval(phraseTimerRef.current)
    phraseTimerRef.current = null
    const activeSources = [...sourcesRef.current]
    activeSources.forEach(node => { try { node.stop() } catch { /* already stopped */ } })
    sourcesRef.current = []
    if (contextRef.current) void contextRef.current.close().catch(() => {})
    contextRef.current = null
    masterRef.current = null
    setIsStarting(false)
    setIsPlaying(false)
    if (remember) {
      setWasEnabled(false)
      writeScholeValue('classical-adagio-enabled', false)
    }
  }, [])

  const playPianoNote = (context: AudioContext, output: AudioNode, frequency: number, delay: number, strength = 1) => {
    const startAt = context.currentTime + delay
    const fundamental = context.createOscillator()
    const overtone = context.createOscillator()
    const gain = context.createGain()
    const tone = context.createBiquadFilter()

    fundamental.type = soundscape === 'strings' ? 'sine' : 'triangle'; fundamental.frequency.value = frequency
    overtone.type = soundscape === 'lute' ? 'triangle' : 'sine'; overtone.frequency.value = frequency * 2; overtone.detune.value = soundscape === 'strings' ? 7 : 3
    tone.type = 'lowpass'; tone.frequency.value = soundscape === 'strings' ? 1250 : soundscape === 'lute' ? 2100 : 1750; tone.Q.value = .45
    gain.gain.setValueAtTime(.0001, startAt)
    gain.gain.exponentialRampToValueAtTime(.034 * strength, startAt + .055)
    gain.gain.exponentialRampToValueAtTime(.011 * strength, startAt + 1.15)
    gain.gain.exponentialRampToValueAtTime(.0001, startAt + 5.8)
    fundamental.connect(gain); overtone.connect(gain); gain.connect(tone); tone.connect(output)
    fundamental.start(startAt); overtone.start(startAt)
    fundamental.stop(startAt + 6); overtone.stop(startAt + 6)
    sourcesRef.current.push(fundamental, overtone)
    const forgetSource = (node: AudioScheduledSourceNode) => {
      sourcesRef.current = sourcesRef.current.filter((source) => source !== node)
    }
    fundamental.addEventListener('ended', () => forgetSource(fundamental), { once: true })
    overtone.addEventListener('ended', () => forgetSource(overtone), { once: true })
  }

  const start = useCallback(async () => {
    if (contextRef.current) return
    const attemptId = startAttemptRef.current + 1
    startAttemptRef.current = attemptId
    setIsStarting(true)
    setAudioError('')
    let context: AudioContext
    try {
      context = new AudioContext()
    } catch {
      if (startAttemptRef.current === attemptId) {
        setIsStarting(false)
        setWasEnabled(false)
        setAudioError('O navegador não conseguiu iniciar o áudio.')
        writeScholeValue('classical-adagio-enabled', false)
      }
      return
    }
    const master = context.createGain()
    const warmth = context.createBiquadFilter()
    const ambience = context.createDelay(.9)
    const ambienceGain = context.createGain()
    master.gain.value = volume / 100
    contextRef.current = context
    masterRef.current = master
    warmth.type = 'lowpass'; warmth.frequency.value = 2400; warmth.Q.value = .35
    ambience.delayTime.value = .42; ambienceGain.gain.value = .13
    master.connect(warmth); warmth.connect(context.destination)
    warmth.connect(ambience); ambience.connect(ambienceGain); ambienceGain.connect(context.destination)
    try {
      await context.resume()
    } catch {
      const wasCancelled = contextRef.current !== context
      if (contextRef.current === context) {
        contextRef.current = null
        masterRef.current = null
      }
      void context.close().catch(() => {})
      if (startAttemptRef.current === attemptId) setIsStarting(false)
      if (!wasCancelled && startAttemptRef.current === attemptId) {
        setWasEnabled(false)
        setAudioError('Não foi possível iniciar o ambiente sonoro.')
        writeScholeValue('classical-adagio-enabled', false)
      }
      return
    }
    if (contextRef.current !== context || startAttemptRef.current !== attemptId) {
      return
    }
    const progression = [
      [130.81, 164.81, 196, 246.94],
      [110, 130.81, 164.81, 196],
      [87.31, 130.81, 164.81, 220],
      [98, 146.83, 196, 246.94],
    ]
    const melody = [329.63, 293.66, 261.63, 293.66]
    let measure = 0
    const playMeasure = () => {
      const chord = progression[measure % progression.length]
      chord.forEach((frequency, index) => playPianoNote(context, master, frequency, index * 1.35, index ? .72 : .9))
      playPianoNote(context, master, melody[measure % melody.length], 3.9, .48)
      measure += 1
    }
    playMeasure()
    phraseTimerRef.current = window.setInterval(playMeasure, 7200)
    setIsStarting(false)
    setIsPlaying(true)
    setWasEnabled(true)
    writeScholeValue('classical-adagio-enabled', true)
  }, [soundscape, volume])

  useEffect(() => { writeScholeValue('ambient-volume', volume); if (masterRef.current) masterRef.current.gain.setTargetAtTime(volume / 100, contextRef.current?.currentTime || 0, .05) }, [volume])
  useEffect(() => { writeScholeValue('ambient-soundscape', soundscape) }, [soundscape])
  useEffect(() => {
    const stopInReadingMode = () => {
      if (document.documentElement.classList.contains('reading-mode')) stop()
    }
    const observer = new MutationObserver(stopInReadingMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    stopInReadingMode()
    return () => observer.disconnect()
  }, [stop])
  useEffect(() => () => stop(false), [stop])

  return (
    <aside
      data-ambient-control
      className={`ambient-surface ambient-sound fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-3 z-50 w-[min(88vw,13rem)] rounded-[1.3rem] p-3 lg:bottom-5 lg:right-5 ${isExpanded ? 'ambient-sound--expanded' : ''}`}
      aria-label="Ambiente sonoro"
    >
      <div className="ambient-sound__layout flex items-start gap-2">
        <span className="ambient-sound__desktop-icon grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-gold/15 text-accent-gold">
          <Music2 className="h-4 w-4" />
        </span>
        <button
          type="button"
          className="ambient-sound__mobile-toggle h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-gold/15 text-accent-gold"
          onClick={() => setIsExpanded((value) => !value)}
          aria-expanded={isExpanded}
          aria-controls="ambient-sound-options"
          aria-label={`${isExpanded ? 'Recolher' : 'Abrir'} controles do ambiente sonoro${isPlaying ? ', tocando' : ''}`}
        >
          <Music2 className="h-5 w-5" />
        </button>
        <div id="ambient-sound-options" className="ambient-sound__panel min-w-0 flex-1">
          <div className="ambient-sound__header flex min-w-0 items-center justify-between gap-2">
            <div className="ambient-sound__copy min-w-0 flex-1">
              <p className="text-xs font-semibold text-text-primary">Adágio contemplativo</p>
              <select value={soundscape} onChange={(event) => { if (isPlaying || isStarting) stop(); setSoundscape(event.target.value as 'piano' | 'strings' | 'lute') }} className="max-w-full bg-transparent text-[10px] text-text-secondary outline-none" aria-label="Instrumentação">
                <option value="piano">Piano clássico</option>
                <option value="strings">Cordas de câmara</option>
                <option value="lute">Alaúde renascentista</option>
              </select>
            </div>
            <button type="button" onClick={() => isPlaying || isStarting ? stop() : void start()} className="ambient-sound__play grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-gold text-bg-base shadow-[0_8px_18px_rgba(212,175,55,0.25)] transition-transform duration-200 hover:-translate-y-0.5 sm:h-8 sm:w-8" aria-label={isStarting ? 'Cancelar início do ambiente sonoro' : isPlaying ? 'Desativar ambiente sonoro' : wasEnabled ? 'Retomar ambiente sonoro' : 'Ativar ambiente sonoro'} aria-busy={isStarting}>
              {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current translate-x-px" />}
            </button>
          </div>
          <div className="ambient-sound__controls mt-2 flex items-center gap-1 text-text-secondary">
            <button type="button" className="ambient-sound__mute grid h-9 w-9 shrink-0 place-items-center rounded-lg hover:bg-bg-elevated" onClick={() => setVolume((value) => value ? 0 : 18)} aria-label={volume ? 'Silenciar ambiente' : 'Ativar som'}>{volume ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</button>
            <input type="range" min="0" max="40" value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="h-10 min-w-0 flex-1 accent-accent-gold" aria-label="Volume do ambiente" />
            <span className="w-7 shrink-0 text-right text-[10px]">{volume}%</span>
          </div>
          {audioError && <p role="status" className="mt-1 text-[11px] leading-tight text-red-300">{audioError}</p>}
        </div>
      </div>
    </aside>
  )
}
