import { useEffect } from 'react'

/**
 * Holds a screen wake lock while a recipe is on display.
 *
 * A brew day runs for hours with nobody touching the machine, and if the laptop
 * driving the cast sleeps, the cast drops. Every call is guarded: the API needs
 * HTTPS (or localhost) and is missing on older Safari, where failing silently is
 * the right behaviour — the viewer still works, the screen just may sleep.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return

    let sentinel: WakeLockSentinel | null = null
    let released = false

    const acquire = async () => {
      try {
        sentinel = await navigator.wakeLock.request('screen')
      } catch {
        // Denied or unsupported — nothing to do, and nothing worth interrupting
        // the user over.
      }
    }

    // The lock is dropped whenever the tab goes to the background, so it has to
    // be taken again on the way back.
    const onVisibilityChange = () => {
      if (!released && document.visibilityState === 'visible') void acquire()
    }

    void acquire()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      released = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      void sentinel?.release().catch(() => {})
    }
  }, [active])
}
