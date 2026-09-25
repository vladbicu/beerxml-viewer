/** Registers the share_target service worker (public/sw.js); a no-op if unsupported. */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker.register('/sw.js').catch(() => {
    // Share-target support just won't be available; manual upload still works.
  })
}
