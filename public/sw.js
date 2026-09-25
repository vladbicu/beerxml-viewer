// Only job here is catching the share_target POST declared in manifest.webmanifest
// and handing the shared file(s) off to the page — no offline caching.
// Cache name must match SHARE_CACHE in src/lib/shareTarget.ts.
const SHARE_CACHE = 'share-target-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method === 'POST' && url.pathname === '/share-target/') {
    event.respondWith(handleShareTarget(event.request))
  }
})

// A shared File can't survive the redirect into a fresh page load, so it's
// stashed in Cache Storage and picked up by consumeSharedFiles() on the other side.
async function handleShareTarget(request) {
  const formData = await request.formData()
  const files = formData.getAll('files').filter((entry) => entry instanceof File)
  const cache = await caches.open(SHARE_CACHE)

  await cache.put(
    '/share-target-meta',
    new Response(JSON.stringify({ names: files.map((file) => file.name) })),
  )
  await Promise.all(files.map((file, i) => cache.put(`/share-target-file-${i}`, new Response(file))))

  return Response.redirect('/robinete.html?shared=1', 303)
}
