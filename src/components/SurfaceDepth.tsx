import { useEffect } from 'react'

const surfaceSelector = '.journey-hero, .quote-landscape, .trail-landscape, .modern-surface'

export function SurfaceDepth() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(pointer: fine)')
    if (reducedMotion.matches || !finePointer.matches) return

    let activeSurface: HTMLElement | null = null
    let frame = 0
    let pointerX = 0
    let pointerY = 0

    const reset = (surface: HTMLElement | null) => {
      surface?.classList.remove('depth-surface--active')
      surface?.style.removeProperty('--surface-rx')
      surface?.style.removeProperty('--surface-ry')
      surface?.style.removeProperty('--surface-light-x')
      surface?.style.removeProperty('--surface-light-y')
    }

    const render = () => {
      frame = 0
      if (!activeSurface) return

      const bounds = activeSurface.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (pointerX - bounds.left) / bounds.width))
      const y = Math.max(0, Math.min(1, (pointerY - bounds.top) / bounds.height))
      activeSurface.style.setProperty('--surface-rx', `${((0.5 - y) * 5).toFixed(2)}deg`)
      activeSurface.style.setProperty('--surface-ry', `${((x - 0.5) * 6).toFixed(2)}deg`)
      activeSurface.style.setProperty('--surface-light-x', `${(x * 100).toFixed(1)}%`)
      activeSurface.style.setProperty('--surface-light-y', `${(y * 100).toFixed(1)}%`)
    }

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX
      pointerY = event.clientY
      const nextSurface = (event.target as Element | null)?.closest<HTMLElement>(surfaceSelector) ?? null

      if (nextSurface !== activeSurface) {
        reset(activeSurface)
        activeSurface = nextSurface
        activeSurface?.classList.add('depth-surface--active')
      }
      if (activeSurface && !frame) frame = window.requestAnimationFrame(render)
    }

    const onPointerLeave = () => {
      reset(activeSurface)
      activeSurface = null
    }

    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    return () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      if (frame) window.cancelAnimationFrame(frame)
      reset(activeSurface)
    }
  }, [])

  return null
}
