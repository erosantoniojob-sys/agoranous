import { useEffect } from 'react'

const surfaceSelector = '.journey-hero, .quote-landscape, .trail-landscape, .modern-surface, .shadow-3d-card'

export function SurfaceDepth() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(pointer: fine)')
    if (reducedMotion.matches) return

    if (!finePointer.matches) {
      let mobileFrame = 0
      const renderMobileDepth = () => {
        mobileFrame = 0
        const viewportCenter = window.innerHeight / 2
        const surfaces = Array.from(document.querySelectorAll<HTMLElement>(surfaceSelector))

        surfaces.forEach((surface) => {
          const bounds = surface.getBoundingClientRect()
          const isVisible = bounds.bottom > 0 && bounds.top < window.innerHeight
          if (!isVisible) {
            surface.classList.remove('depth-surface--mobile')
            return
          }

          const center = bounds.top + bounds.height / 2
          const distance = Math.max(-1, Math.min(1, (center - viewportCenter) / window.innerHeight))
          surface.style.setProperty('--mobile-depth-rx', `${(-distance * 2.8).toFixed(2)}deg`)
          surface.style.setProperty('--mobile-depth-z', `${((1 - Math.abs(distance)) * 5).toFixed(1)}px`)
          surface.classList.add('depth-surface--mobile')
        })
      }

      const scheduleMobileDepth = () => {
        if (!mobileFrame) mobileFrame = window.requestAnimationFrame(renderMobileDepth)
      }

      renderMobileDepth()
      window.addEventListener('scroll', scheduleMobileDepth, { passive: true })
      window.addEventListener('resize', scheduleMobileDepth, { passive: true })
      return () => {
        window.removeEventListener('scroll', scheduleMobileDepth)
        window.removeEventListener('resize', scheduleMobileDepth)
        if (mobileFrame) window.cancelAnimationFrame(mobileFrame)
        document.querySelectorAll<HTMLElement>(surfaceSelector).forEach((surface) => {
          surface.classList.remove('depth-surface--mobile')
          surface.style.removeProperty('--mobile-depth-rx')
          surface.style.removeProperty('--mobile-depth-z')
        })
      }
    }

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
