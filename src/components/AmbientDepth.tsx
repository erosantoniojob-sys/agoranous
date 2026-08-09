import { useEffect, useRef } from 'react'

const motionQuery = '(prefers-reduced-motion: reduce)'
const pointerQuery = '(pointer: fine)'

export function AmbientDepth() {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    const reducedMotion = window.matchMedia(motionQuery)
    const finePointer = window.matchMedia(pointerQuery)

    if (!layer) return

    let frame = 0
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const resetMotion = () => {
      targetX = 0
      targetY = 0
      currentX = 0
      currentY = 0
      if (frame) window.cancelAnimationFrame(frame)
      frame = 0
      layer.style.setProperty('--depth-x', '0')
      layer.style.setProperty('--depth-y', '0')
      layer.style.setProperty('--light-x', '50vw')
      layer.style.setProperty('--light-y', '32vh')
    }

    const render = () => {
      currentX += (targetX - currentX) * 0.075
      currentY += (targetY - currentY) * 0.075
      layer.style.setProperty('--depth-x', currentX.toFixed(3))
      layer.style.setProperty('--depth-y', currentY.toFixed(3))

      const stillMoving = Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002
      frame = stillMoving ? window.requestAnimationFrame(render) : 0
    }

    const onPointerMove = (event: PointerEvent) => {
      if (
        document.hidden ||
        reducedMotion.matches ||
        !finePointer.matches ||
        document.documentElement.dataset.effects === 'off' ||
        document.documentElement.classList.contains('reading-mode') ||
        document.querySelector('[aria-modal="true"]:not([aria-hidden="true"])')
      ) {
        resetMotion()
        return
      }

      targetX = (event.clientX / window.innerWidth - 0.5) * 2
      targetY = (event.clientY / window.innerHeight - 0.5) * 2
      layer.style.setProperty('--light-x', `${event.clientX}px`)
      layer.style.setProperty('--light-y', `${event.clientY}px`)
      if (!frame) frame = window.requestAnimationFrame(render)
    }

    const onPreferenceChange = () => {
      if (reducedMotion.matches || !finePointer.matches) resetMotion()
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    reducedMotion.addEventListener('change', onPreferenceChange)
    finePointer.addEventListener('change', onPreferenceChange)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      reducedMotion.removeEventListener('change', onPreferenceChange)
      finePointer.removeEventListener('change', onPreferenceChange)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={layerRef} className="ambient-depth" aria-hidden="true">
      <div className="ambient-depth__architecture" />
      <div className="ambient-depth__beam" />
      <div className="ambient-depth__glow" />
      <div className="ambient-depth__orbit ambient-depth__orbit--near" />
      <div className="ambient-depth__orbit ambient-depth__orbit--far" />
      <div className="ambient-depth__dust" />
    </div>
  )
}
