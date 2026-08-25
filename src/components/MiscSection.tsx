import { formatDuration } from '../lib/format'
import type { Misc } from '../lib/types'
import { Section } from './Section'

export function MiscSection({ miscs }: { miscs: Misc[] }) {
  if (miscs.length === 0) return null

  // Grouped by USE because a boil addition and a secondary addition happen days
  // apart — listing them together would be misleading on brew day.
  const groups = new Map<string, Misc[]>()
  for (const misc of miscs) {
    const key = misc.use || 'Alte adaosuri'
    const existing = groups.get(key)
    if (existing) existing.push(misc)
    else groups.set(key, [misc])
  }

  return (
    <Section title="Adaosuri">
      <div className="space-y-8">
        {[...groups.entries()].map(([use, groupMiscs]) => (
          <div key={use}>
            <h3 className="eyebrow mb-3">{use}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groupMiscs.map((misc, i) => (
                <div key={`${misc.name}-${i}`} className="panel px-5 py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[1.15rem] font-semibold">{misc.name}</span>
                    <span className="num text-copper-bright text-[1.15rem]">
                      {misc.displayAmount}
                    </span>
                  </div>
                  <p className="text-cream-faint mt-1 text-[0.9rem]">
                    {[misc.type, formatDuration(misc.time)].filter(Boolean).join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
