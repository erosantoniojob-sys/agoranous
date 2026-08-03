import React, { useEffect, useRef, useState } from 'react'
import { Music2, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { readScholeValue, writeScholeValue } from '../lib/scholeStorage'

const LYRE_NOTES = [146.83, 164.81, 196, 220, 246.94, 293.66]

export const AmbientSoundControl: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(() => readScholeValue('ambient-volume', 28))
  const contextRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const droneRef = useRef<OscillatorNode[]>([])
  const melodyTimerRef = useRef<number | null>(null)

  const stop = () => {
    if (melodyTimerRef.current) window.clearInterval(melodyTimerRef.current)
    melodyTimerRef.current = null
    droneRef.current.forEach(node => { try { node.stop() } catch { /* already stopped */ } })
    droneRef.current = []
    if (contextRef.current) void contextRef.current.close()
    contextRef.current = null
    masterRef.current = null
    setIsPlaying(false)
  }

  const playNote = (context: AudioContext, output: GainNode, frequency: number, delay = 0, depth = 0.045, pan = 0) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const panner = context.createStereoPanner()
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(frequency, context.currentTime + delay)
    gain.gain.setValueAtTime(0.0001, context.currentTime + delay)
    gain.gain.exponentialRampToValueAtTime(depth, context.currentTime + delay + .025)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + delay + 1.85)
    panner.pan.setValueAtTime(pan, context.currentTime + delay)
    oscillator.connect(gain); gain.connect(panner); panner.connect(output)
    oscillator.start(context.currentTime + delay); oscillator.stop(context.currentTime + delay + 1.9)
  }

  const start = async () => {
    stop()
    const context = new AudioContext()
    const master = context.createGain()
    master.gain.value = volume / 100
    master.connect(context.destination)
    await context.resume()
    contextRef.current = context; masterRef.current = master
    droneRef.current = [73.42, 110].map((frequency, index) => {
      const oscillator = context.createOscillator(); const gain = context.createGain(); const panner = context.createStereoPanner()
      oscillator.type = 'sine'; oscillator.frequency.value = frequency; oscillator.detune.setValueAtTime(index === 0 ? -4 : 6, context.currentTime)
      gain.gain.value = .013; panner.pan.value = index === 0 ? -0.35 : 0.35
      oscillator.connect(gain); gain.connect(panner); panner.connect(master); oscillator.start(); return oscillator
    })
    let step = 0
    const phrase = () => {
      playNote(context, master, LYRE_NOTES[step % LYRE_NOTES.length], 0, 0.05, -0.3)
      playNote(context, master, LYRE_NOTES[(step + 2) % LYRE_NOTES.length], .42, 0.032, 0.3)
      playNote(context, master, LYRE_NOTES[(step + 4) % LYRE_NOTES.length] * 1.5, .2, 0.018, 0)
      step = (step + 3) % LYRE_NOTES.length
    }
    phrase()
    melodyTimerRef.current = window.setInterval(phrase, 3000)
    setIsPlaying(true)
  }

  useEffect(() => { writeScholeValue('ambient-volume', volume); if (masterRef.current) masterRef.current.gain.setTargetAtTime(volume / 100, contextRef.current?.currentTime || 0, .05) }, [volume])
  useEffect(() => () => stop(), [])

  return <aside className="ambient-surface fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-3 z-50 w-[min(88vw,13rem)] rounded-[1.3rem] p-3 lg:bottom-5 lg:right-5" aria-label="Ambiente sonoro">
    <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-gold/15 text-accent-gold"><Music2 className="h-4 w-4" /></span><div><p className="text-xs font-semibold text-text-primary">Ambiente helênico</p><p className="text-[10px] text-text-secondary">lira e harmonia</p></div></div><button type="button" onClick={() => isPlaying ? stop() : void start()} className="grid h-8 w-8 place-items-center rounded-full bg-accent-gold text-bg-base shadow-[0_8px_18px_rgba(212,175,55,0.25)] transition-transform duration-200 hover:-translate-y-0.5" aria-label={isPlaying ? 'Desativar ambiente sonoro' : 'Ativar ambiente sonoro'}>{isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current translate-x-px" />}</button></div>
    <div className="mt-3 flex items-center gap-2 text-text-secondary"><button type="button" onClick={() => setVolume(value => value ? 0 : 28)} aria-label={volume ? 'Silenciar ambiente' : 'Ativar som'}>{volume ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}</button><input type="range" min="0" max="60" value={volume} onChange={event => setVolume(Number(event.target.value))} className="h-1 flex-1 accent-accent-gold" aria-label="Volume do ambiente" /><span className="w-7 text-right text-[10px]">{volume}%</span></div>
  </aside>
}
