// Cache name must match SHARE_CACHE in public/sw.js.
const SHARE_CACHE = 'share-target-v1'

interface ShareTargetMeta {
  names: string[]
}

let sharedFiles: Promise<File[]> | null = null

/**
 * Picks up file(s) the service worker stashed in Cache Storage after intercepting
 * a share_target POST (see public/sw.js), or `[]` if there's nothing pending.
 *
 * Memoized per page load: React StrictMode runs effects twice in dev, and the
 * cache read is destructive (entries are deleted once consumed), so a second
 * call must reuse the first call's result rather than racing it.
 */
export function consumeSharedFiles(): Promise<File[]> {
  if (!sharedFiles) sharedFiles = readSharedFiles()
  return sharedFiles
}

async function readSharedFiles(): Promise<File[]> {
  if (!('caches' in window)) return []

  const cache = await caches.open(SHARE_CACHE)
  const metaResponse = await cache.match('/share-target-meta')
  if (!metaResponse) return []

  const { names } = (await metaResponse.json()) as ShareTargetMeta
  const files: File[] = []

  for (let i = 0; i < names.length; i++) {
    const fileResponse = await cache.match(`/share-target-file-${i}`)
    if (!fileResponse) continue
    const blob = await fileResponse.blob()
    files.push(new File([blob], names[i], { type: blob.type || 'application/xml' }))
  }

  await Promise.all(
    ['/share-target-meta', ...names.map((_, i) => `/share-target-file-${i}`)].map((key) =>
      cache.delete(key),
    ),
  )

  return files
}
