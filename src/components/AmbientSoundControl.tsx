import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Music2, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { readScholeValue, writeScholeValue } from '../lib/scholeStorage'

export const AmbientSoundControl: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(() => readScholeValue('ambient-volume', 18))
  const contextRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const sourcesRef = useRef<AudioScheduledSourceNode[]>([])
  const phraseTimerRef = useRef<number | null>(null)

  const stop = useCallback((remember = true) => {
    if (phraseTimerRef.current) window.clearInterval(phraseTimerRef.current)
    phraseTimerRef.current = null
    sourcesRef.current.forEach(node => { try { node.stop() } catch { /* already stopped */ } })
    sourcesRef.current = []
    if (contextRef.current) void contextRef.current.close()
    contextRef.current = null
    masterRef.current = null
    setIsPlaying(false)
    if (remember) writeScholeValue('classical-adagio-enabled', false)
  }, [])

  const playPianoNote = (context: AudioContext, output: AudioNode, frequency: number, delay: number, strength = 1) => {
    const startAt = context.currentTime + delay
    const fundamental = context.createOscillator()
    const overtone = context.createOscillator()
    const gain = context.createGain()
    const tone = context.createBiquadFilter()

    fundamental.type = 'triangle'; fundamental.frequency.value = frequency
    overtone.type = 'sine'; overtone.frequency.value = frequency * 2; overtone.detune.value = 3
    tone.type = 'lowpass'; tone.frequency.value = 1750; tone.Q.value = .45
    gain.gain.setValueAtTime(.0001, startAt)
    gain.gain.exponentialRampToValueAtTime(.034 * strength, startAt + .055)
    gain.gain.exponentialRampToValueAtTime(.011 * strength, startAt + 1.15)
    gain.gain.exponentialRampToValueAtTime(.0001, startAt + 5.8)
    fundamental.connect(gain); overtone.connect(gain); gain.connect(tone); tone.connect(output)
    fundamental.start(startAt); overtone.start(startAt)
    fundamental.stop(startAt + 6); overtone.stop(startAt + 6)
    sourcesRef.current.push(fundamental, overtone)
  }

  const start = useCallback(async (remember = true) => {
    if (contextRef.current) return
    const context = new AudioContext()
    const master = context.createGain()
    const warmth = context.createBiquadFilter()
    const ambience = context.createDelay(.9)
    const ambienceGain = context.createGain()
    master.gain.value = volume / 100
    warmth.type = 'lowpass'; warmth.frequency.value = 2400; warmth.Q.value = .35
    ambience.delayTime.value = .42; ambienceGain.gain.value = .13
    master.connect(warmth); warmth.connect(context.destination)
    warmth.connect(ambience); ambience.connect(ambienceGain); ambienceGain.connect(context.destination)
    await context.resume()
    contextRef.current = context; masterRef.current = master
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
    setIsPlaying(true)
    if (remember) writeScholeValue('classical-adagio-enabled', true)
  }, [volume])

  useEffect(() => { writeScholeValue('ambient-volume', volume); if (masterRef.current) masterRef.current.gain.setTargetAtTime(volume / 100, contextRef.current?.currentTime || 0, .05) }, [volume])
  useEffect(() => {
    if (!readScholeValue('classical-adagio-enabled', false)) return
    const unlock = (event: PointerEvent | KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest('[data-ambient-control]')) return
      void start(false)
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [start])
  useEffect(() => () => stop(false), [stop])

  return <aside data-ambient-control className="ambient-surface fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-3 z-50 w-[min(88vw,13rem)] rounded-[1.3rem] p-3 lg:bottom-5 lg:right-5" aria-label="Ambiente sonoro">
    <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-gold/15 text-accent-gold"><Music2 className="h-4 w-4" /></span><div><p className="text-xs font-semibold text-text-primary">Adágio contemplativo</p><p className="text-[10px] text-text-secondary">piano clássico suave</p></div></div><button type="button" onClick={() => isPlaying ? stop() : void start()} className="grid h-8 w-8 place-items-center rounded-full bg-accent-gold text-bg-base shadow-[0_8px_18px_rgba(212,175,55,0.25)] transition-transform duration-200 hover:-translate-y-0.5" aria-label={isPlaying ? 'Desativar ambiente sonoro' : 'Ativar ambiente sonoro'}>{isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current translate-x-px" />}</button></div>
    <div className="mt-3 flex items-center gap-2 text-text-secondary"><button type="button" onClick={() => setVolume(value => value ? 0 : 18)} aria-label={volume ? 'Silenciar ambiente' : 'Ativar som'}>{volume ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}</button><input type="range" min="0" max="40" value={volume} onChange={event => setVolume(Number(event.target.value))} className="h-1 flex-1 accent-accent-gold" aria-label="Volume do ambiente" /><span className="w-7 text-right text-[10px]">{volume}%</span></div>
  </aside>
}
