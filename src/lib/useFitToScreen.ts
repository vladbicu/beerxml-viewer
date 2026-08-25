import { useCallback, useLayoutEffect, useRef, useState } from 'react'

/**
 * Scales content down until it fits its container in one screen.
 *
 * The content is laid out at its natural size, measured once, then given a
 * single uniform scale factor — no iteration, no guessing at font sizes. It only
 * ever shrinks: a small recipe stays at its designed size rather than being
 * blown up to fill a television.
 *
 * Re-measures whenever the container resizes or `key` changes (a new recipe).
 */
export function useFitToScreen(key: unknown) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const measure = useCallback(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    // Measure the content unscaled, otherwise each pass would compound the
    // previous one's transform.
    const { width, height } = content.getBoundingClientRect()
    const naturalWidth = width / scale
    const naturalHeight = height / scale
    if (naturalWidth === 0 || naturalHeight === 0) return

    const next = Math.min(
      1,
      container.clientHeight / naturalHeight,
      container.clientWidth / naturalWidth,
    )

    // Ignore sub-pixel churn so a ResizeObserver can't ping-pong forever.
    setScale((current) => (Math.abs(current - next) > 0.002 ? next : current))
  }, [scale])

  useLayoutEffect(() => {
    measure()

    const container = containerRef.current
    if (!container || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [measure, key])

  return { containerRef, contentRef, scale }
}
