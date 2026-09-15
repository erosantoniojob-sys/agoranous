const WELCOME_EVENT = 'agora:replay-welcome'
const WELCOME_AUDIO_URL = '/audio/agora-welcome.pt-BR.v2.wav'

export const AGORA_WELCOME_EVENT = WELCOME_EVENT

export type EntranceNarrationState = 'idle' | 'loading' | 'playing' | 'ended' | 'unavailable'

type NarrationStateListener = (state: EntranceNarrationState) => void
type AudioContextConstructor = typeof AudioContext

let activeContext: AudioContext | null = null
let activeAudioElement: HTMLAudioElement | null = null
let audioBytesPromise: Promise<ArrayBuffer> | null = null
let closeContextTimer = 0
let playbackGeneration = 0

const getAudioContextConstructor = (): AudioContextConstructor | undefined => (
  window.AudioContext
  || (window as typeof window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext
)

const loadWelcomeAudio = () => {
  if (!audioBytesPromise) {
    audioBytesPromise = fetch(WELCOME_AUDIO_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Welcome narration returned ${response.status}`)
        return response.arrayBuffer()
      })
      .catch((error) => {
        audioBytesPromise = null
        throw error
      })
  }
  return audioBytesPromise
}

export function prepareEntranceVoice() {
  void loadWelcomeAudio().catch(() => {
    // The explicit action remains available so playback can retry.
  })
}

const createHallImpulse = (context: AudioContext, seconds = 2.7, decay = 3.4) => {
  const frameCount = Math.floor(context.sampleRate * seconds)
  const impulse = context.createBuffer(2, frameCount, context.sampleRate)

  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel)
    for (let frame = 0; frame < frameCount; frame += 1) {
      const envelope = Math.pow(1 - frame / frameCount, decay)
      data[frame] = (Math.random() * 2 - 1) * envelope
    }
  }

  return impulse
}

const addCosmicBed = (context: AudioContext, output: AudioNode, duration: number) => {
  const now = context.currentTime
  const filter = context.createBiquadFilter()
  const bedGain = context.createGain()

  filter.type = 'lowpass'
  filter.frequency.value = 720
  filter.Q.value = 0.65
  bedGain.gain.setValueAtTime(0.0001, now)
  bedGain.gain.exponentialRampToValueAtTime(0.026, now + 0.8)
  bedGain.gain.setValueAtTime(0.026, now + Math.max(1, duration - 2.4))
  bedGain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 1.9)
  filter.connect(bedGain)
  bedGain.connect(output)

  ;[65.41, 98, 146.83, 196].forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const voiceGain = context.createGain()
    const panner = context.createStereoPanner()

    oscillator.type = index === 0 ? 'triangle' : 'sine'
    oscillator.frequency.value = frequency
    oscillator.detune.value = index % 2 ? 5 : -5
    voiceGain.gain.value = index === 0 ? 0.76 : 0.33
    panner.pan.value = index % 2 ? 0.46 : -0.46

    oscillator.connect(voiceGain)
    voiceGain.connect(panner)
    panner.connect(filter)
    oscillator.start(now + index * 0.07)
    oscillator.stop(now + duration + 2)
  })
}

const connectCinematicVoice = (context: AudioContext, source: AudioNode, duration: number) => {
  const now = context.currentTime
  const master = context.createGain()
  const highPass = context.createBiquadFilter()
  const warmth = context.createBiquadFilter()
  const compressor = context.createDynamicsCompressor()
  const dry = context.createGain()
  const convolver = context.createConvolver()
  const reverb = context.createGain()
  const firstDelay = context.createDelay(1)
  const firstEcho = context.createGain()
  const firstPan = context.createStereoPanner()
  const secondDelay = context.createDelay(1)
  const secondEcho = context.createGain()
  const secondPan = context.createStereoPanner()

  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(0.82, now + 0.28)
  highPass.type = 'highpass'
  highPass.frequency.value = 62
  warmth.type = 'lowshelf'
  warmth.frequency.value = 175
  warmth.gain.value = 2.4
  compressor.threshold.value = -22
  compressor.knee.value = 16
  compressor.ratio.value = 3
  compressor.attack.value = 0.018
  compressor.release.value = 0.28
  dry.gain.value = 0.9
  convolver.buffer = createHallImpulse(context)
  reverb.gain.value = 0.13
  firstDelay.delayTime.value = 0.19
  firstEcho.gain.value = 0.075
  firstPan.pan.value = -0.38
  secondDelay.delayTime.value = 0.37
  secondEcho.gain.value = 0.045
  secondPan.pan.value = 0.42

  source.connect(highPass)
  highPass.connect(warmth)
  warmth.connect(compressor)
  compressor.connect(dry)
  dry.connect(master)
  compressor.connect(convolver)
  convolver.connect(reverb)
  reverb.connect(master)
  compressor.connect(firstDelay)
  firstDelay.connect(firstEcho)
  firstEcho.connect(firstPan)
  firstPan.connect(master)
  compressor.connect(secondDelay)
  secondDelay.connect(secondEcho)
  secondEcho.connect(secondPan)
  secondPan.connect(master)
  addCosmicBed(context, master, duration)
  master.connect(context.destination)
}

const closeActiveContext = (delay = 0, onClose?: () => void) => {
  if (closeContextTimer) window.clearTimeout(closeContextTimer)
  closeContextTimer = 0
  const context = activeContext
  if (!context) return

  const close = () => {
    if (activeContext === context) activeContext = null
    if (context.state !== 'closed') void context.close()
    onClose?.()
  }

  if (delay > 0) closeContextTimer = window.setTimeout(close, delay)
  else close()
}

const closeContextAttempt = (context: AudioContext) => {
  if (activeContext === context) activeContext = null
  if (context.state !== 'closed') void context.close()
}

const playRawRecording = async (generation: number, onStateChange?: NarrationStateListener) => {
  if (typeof Audio === 'undefined') return false

  const audio = new Audio(WELCOME_AUDIO_URL)
  activeAudioElement = audio
  audio.preload = 'auto'
  audio.onplaying = () => {
    if (generation === playbackGeneration) onStateChange?.('playing')
  }
  audio.onended = () => {
    if (generation === playbackGeneration) onStateChange?.('ended')
    if (activeAudioElement === audio) activeAudioElement = null
  }
  const markUnavailable = () => {
    if (generation === playbackGeneration) onStateChange?.('unavailable')
    if (activeAudioElement === audio) activeAudioElement = null
  }
  audio.onerror = markUnavailable
  audio.onabort = markUnavailable

  try {
    await audio.play()
    return true
  } catch {
    if (activeAudioElement === audio) activeAudioElement = null
    return false
  }
}

export function stopEntranceVoice() {
  playbackGeneration += 1
  if (activeAudioElement) {
    activeAudioElement.onplaying = null
    activeAudioElement.onended = null
    activeAudioElement.onerror = null
    activeAudioElement.onabort = null
    activeAudioElement.pause()
    activeAudioElement = null
  }
  closeActiveContext()
}

export async function playEntranceVoice(onStateChange?: NarrationStateListener) {
  stopEntranceVoice()
  const generation = playbackGeneration
  onStateChange?.('loading')

  const AudioContextClass = getAudioContextConstructor()
  if (!AudioContextClass) return playRawRecording(generation, onStateChange)

  let context: AudioContext
  try {
    context = new AudioContextClass()
  } catch {
    return playRawRecording(generation, onStateChange)
  }

  try {
    activeContext = context
    const resumePromise = context.resume()
    const [audioBytes] = await Promise.all([loadWelcomeAudio(), resumePromise])
    const buffer = await context.decodeAudioData(audioBytes.slice(0))
    if (generation !== playbackGeneration || activeContext !== context) return false

    const source = context.createBufferSource()
    const playbackRate = 0.985
    source.buffer = buffer
    source.playbackRate.value = playbackRate
    source.detune.value = -42
    const duration = buffer.duration / playbackRate
    connectCinematicVoice(context, source, duration)
    source.onended = () => {
      if (generation !== playbackGeneration) return
      closeActiveContext(2600, () => {
        if (generation === playbackGeneration) onStateChange?.('ended')
      })
    }
    source.start()
    onStateChange?.('playing')
    return true
  } catch {
    closeContextAttempt(context)
    if (generation === playbackGeneration) onStateChange?.('unavailable')
    return false
  }
}
