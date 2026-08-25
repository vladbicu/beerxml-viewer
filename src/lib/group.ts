/**
 * Groups items by a key, preserving the order each key first appears in.
 *
 * File order is meaningful — it is the order the brewer wrote the additions —
 * so a plain object or a sorted map would lose information here.
 */
export function groupInOrder<T>(items: T[], keyOf: (item: T) => string): [string, T[]][] {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const key = keyOf(item)
    const existing = groups.get(key)
    if (existing) existing.push(item)
    else groups.set(key, [item])
  }
  return [...groups.entries()]
}
