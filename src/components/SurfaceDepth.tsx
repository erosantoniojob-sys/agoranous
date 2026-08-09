import { useEffect } from 'react'

const surfaceSelector = '[data-depth-surface]'

export function SurfaceDepth() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')

    let activeSurface: HTMLElement | null = null
    let activeBounds: DOMRect | null = null
    let frame = 0
    let boundsFrame = 0
    let pointerX = 0
    let pointerY = 0

    const reset = (surface: HTMLElement | null) => {
      surface?.classList.remove('depth-surface--active')
      surface?.style.removeProperty('--surface-rx')
      surface?.style.removeProperty('--surface-ry')
      surface?.style.removeProperty('--surface-light-x')
      surface?.style.removeProperty('--surface-light-y')
      surface?.style.removeProperty('--surface-x')
      surface?.style.removeProperty('--surface-y')
    }

    const render = () => {
      frame = 0
      if (!activeSurface || !activeBounds) return

      const mode = document.documentElement.dataset.effects ?? 'full'
      const strength = mode === 'subtle' ? 0.48 : mode === 'off' ? 0 : 1
      const x = Math.max(0, Math.min(1, (pointerX - activeBounds.left) / activeBounds.width))
      const y = Math.max(0, Math.min(1, (pointerY - activeBounds.top) / activeBounds.height))
      const normalizedX = (x - 0.5) * 2
      const normalizedY = (y - 0.5) * 2
      activeSurface.style.setProperty('--surface-rx', `${(-normalizedY * 2.4 * strength).toFixed(2)}deg`)
      activeSurface.style.setProperty('--surface-ry', `${(normalizedX * 3.2 * strength).toFixed(2)}deg`)
      activeSurface.style.setProperty('--surface-light-x', `${(x * 100).toFixed(1)}%`)
      activeSurface.style.setProperty('--surface-light-y', `${(y * 100).toFixed(1)}%`)
      activeSurface.style.setProperty('--surface-x', (normalizedX * strength).toFixed(3))
      activeSurface.style.setProperty('--surface-y', (normalizedY * strength).toFixed(3))
    }

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX
      pointerY = event.clientY
      if (
        reducedMotion.matches ||
        !finePointer.matches ||
        document.documentElement.dataset.effects === 'off' ||
        document.documentElement.classList.contains('reading-mode') ||
        document.querySelector('[aria-modal="true"]:not([aria-hidden="true"])')
      ) {
        reset(activeSurface)
        activeSurface = null
        activeBounds = null
        return
      }
      const nextSurface = (event.target as Element | null)?.closest<HTMLElement>(surfaceSelector) ?? null

      if (nextSurface !== activeSurface) {
        reset(activeSurface)
        activeSurface = nextSurface
        activeBounds = activeSurface?.getBoundingClientRect() ?? null
        if (activeSurface) activeSurface.classList.add('depth-surface--active')
      }
      if (activeSurface && !frame) frame = window.requestAnimationFrame(render)
    }

    const onPointerLeave = () => {
      reset(activeSurface)
      activeSurface = null
      activeBounds = null
    }

    const onViewportChange = () => {
      if (!activeSurface || boundsFrame) return
      boundsFrame = window.requestAnimationFrame(() => {
        boundsFrame = 0
        if (activeSurface) activeBounds = activeSurface.getBoundingClientRect()
      })
    }

    const onPreferenceChange = () => {
      if (
        reducedMotion.matches ||
        !finePointer.matches ||
        document.documentElement.dataset.effects === 'off' ||
        document.documentElement.classList.contains('reading-mode')
      ) onPointerLeave()
    }

    const preferenceObserver = new MutationObserver(onPreferenceChange)
    preferenceObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-effects'] })

    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('resize', onViewportChange, { passive: true })
    window.addEventListener('scroll', onViewportChange, { passive: true })
    reducedMotion.addEventListener('change', onPreferenceChange)
    finePointer.addEventListener('change', onPreferenceChange)
    return () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('scroll', onViewportChange)
      reducedMotion.removeEventListener('change', onPreferenceChange)
      finePointer.removeEventListener('change', onPreferenceChange)
      preferenceObserver.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
      if (boundsFrame) window.cancelAnimationFrame(boundsFrame)
      reset(activeSurface)
    }
  }, [])

  return null
}
