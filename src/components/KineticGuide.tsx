import { useEffect, useRef } from 'react'

type Point = { x: number; y: number }

const movementKeys: Record<string, Point> = {
  ArrowUp: { x: 0, y: -1 },
  w: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  s: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  a: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  d: { x: 1, y: 0 },
}

const isTypingTarget = (target: EventTarget | null) => {
  const element = target as HTMLElement | null
  return Boolean(element?.isContentEditable || element?.closest('input, textarea, select'))
}

export function KineticGuide() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!canvas || !context || reducedMotion.matches) return

    const pressed = new Set<string>()
    const trail: Point[] = []
    const position = { x: window.innerWidth * 0.24, y: window.innerHeight * 0.68 }
    const velocity = { x: 0, y: 0 }
    let width = window.innerWidth
    let height = window.innerHeight
    let lastTime = performance.now()
    let frame = 0

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio, 1.5)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      position.x = Math.min(position.x, width - 24)
      position.y = Math.min(position.y, height - 24)
    }

    const draw = () => {
      context.clearRect(0, 0, width, height)

      for (let index = 1; index < trail.length; index += 1) {
        const point = trail[index]
        const previous = trail[index - 1]
        context.beginPath()
        context.moveTo(previous.x, previous.y)
        context.lineTo(point.x, point.y)
        context.strokeStyle = `rgba(229, 193, 88, ${(index / trail.length) * 0.18})`
        context.lineWidth = 1 + (index / trail.length) * 1.5
        context.stroke()
      }

      const angle = Math.atan2(velocity.y, velocity.x) + Math.PI / 2
      context.save()
      context.translate(position.x, position.y)
      context.rotate(Number.isFinite(angle) ? angle : 0)
      context.shadowColor = 'rgba(229, 193, 88, 0.85)'
      context.shadowBlur = 18
      context.fillStyle = 'rgba(229, 193, 88, 0.9)'
      context.beginPath()
      context.moveTo(0, -7)
      context.lineTo(4.5, 5)
      context.lineTo(0, 2.5)
      context.lineTo(-4.5, 5)
      context.closePath()
      context.fill()
      context.restore()
    }

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.034)
      lastTime = time
      let inputX = 0
      let inputY = 0

      pressed.forEach((key) => {
        inputX += movementKeys[key]?.x ?? 0
        inputY += movementKeys[key]?.y ?? 0
      })

      const magnitude = Math.hypot(inputX, inputY) || 1
      velocity.x += (inputX / magnitude) * 420 * delta
      velocity.y += (inputY / magnitude) * 420 * delta
      velocity.x *= Math.pow(0.9, delta * 60)
      velocity.y *= Math.pow(0.9, delta * 60)

      const speed = Math.hypot(velocity.x, velocity.y)
      if (speed > 190) {
        velocity.x = (velocity.x / speed) * 190
        velocity.y = (velocity.y / speed) * 190
      }

      position.x += velocity.x * delta
      position.y += velocity.y * delta

      if (position.x < 18 || position.x > width - 18) {
        position.x = Math.max(18, Math.min(width - 18, position.x))
        velocity.x *= -0.62
      }
      if (position.y < 18 || position.y > height - 18) {
        position.y = Math.max(18, Math.min(height - 18, position.y))
        velocity.y *= -0.62
      }

      trail.push({ ...position })
      if (trail.length > 18) trail.shift()
      draw()

      if (pressed.size || Math.hypot(velocity.x, velocity.y) > 0.2) {
        frame = window.requestAnimationFrame(render)
      } else {
        frame = 0
      }
    }

    const start = () => {
      if (!frame) {
        lastTime = performance.now()
        frame = window.requestAnimationFrame(render)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      if (!movementKeys[key] || isTypingTarget(event.target)) return
      pressed.add(key)
      start()
    }
    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      pressed.delete(key)
    }
    const onBlur = () => pressed.clear()

    resize()
    draw()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return <canvas ref={canvasRef} className="kinetic-guide" aria-hidden="true" />
}
