import { useCallback, useEffect, useState } from 'react'

export type ViewMode = 'full' | 'condensed'

const STORAGE_KEY = 'cazan-view'

function readStoredView(): ViewMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'condensed' ? 'condensed' : 'full'
  } catch {
    return 'full'
  }
}

/**
 * Detailed or condensed, persisted across reloads.
 *
 * The detailed view stays the default so nothing changes unasked, but the
 * choice sticks: switch to condensed once and every later cast session opens
 * there, which is the point — reaching for the laptop to scroll is exactly what
 * the condensed view exists to avoid.
 */
export function useViewMode(): { view: ViewMode; toggleView: () => void } {
  const [view, setView] = useState<ViewMode>(readStoredView)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, view)
    } catch {
      // Preference just won't survive the reload; not worth surfacing.
    }
  }, [view])

  const toggleView = useCallback(() => {
    setView((current) => (current === 'full' ? 'condensed' : 'full'))
  }, [])

  return { view, toggleView }
}
