import { formatDuration, formatMass, formatNumber } from '../lib/format'
import type { Hop } from '../lib/types'
import { Section } from './Section'

/** Only these land on the boil timeline; everything else is grouped below it. */
const TIMELINE_USES = new Set(['boil', 'first wort'])

function alpha(hop: Hop): string {
  return hop.alpha !== null ? `${formatNumber(hop.alpha)}% AA` : ''
}

function HopCard({ hop }: { hop: Hop }) {
  const meta = [hop.form, alpha(hop)].filter(Boolean).join(' · ')
  return (
    <div className="panel px-5 py-4">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[1.15rem] font-semibold">{hop.name}</span>
        <span className="num text-copper-bright text-[1.15rem]">{formatMass(hop.amount)}</span>
      </div>
      {meta && <p className="text-cream-faint mt-1 text-[0.9rem]">{meta}</p>}
    </div>
  )
}

function BoilTimeline({ hops, boilTime }: { hops: Hop[]; boilTime: number }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="relative min-w-[560px] pt-16 pb-12">
        <div className="bg-line-strong relative h-[3px] w-full">
          {hops.map((hop, i) => {
            // Boil runs left (start) to right (flameout), so a 60-minute
            // addition sits at 0% and a flameout addition at 100%.
            const time = hop.time ?? 0
            const position = boilTime > 0 ? (1 - Math.min(time, boilTime) / boilTime) * 100 : 100
            // Alternate sides so neighbouring additions don't overprint.
            const above = i % 2 === 0

            return (
              <div
                key={`${hop.name}-${i}`}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${position}%` }}
              >
                <span className="bg-copper-bright border-oak-raised block h-4 w-4 rounded-full border-2" />
                <div
                  className={`absolute left-1/2 w-[11rem] -translate-x-1/2 text-center ${
                    above ? 'bottom-full mb-4' : 'top-full mt-4'
                  }`}
                >
                  <p className="text-[1.05rem] leading-tight font-semibold">{hop.name}</p>
                  <p className="num text-copper-bright text-[1rem]">{formatMass(hop.amount)}</p>
                  <p className="num text-cream-faint text-[0.9rem]">{formatDuration(hop.time)}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="num text-cream-faint mt-3 flex justify-between text-[0.85rem]">
          <span>început fierbere · {formatDuration(boilTime)}</span>
          <span>flameout · 0 min</span>
        </div>
      </div>
    </div>
  )
}

export function HopsSection({ hops, boilTime }: { hops: Hop[]; boilTime: number | null }) {
  if (hops.length === 0) return null

  const onTimeline = hops.filter((h) => TIMELINE_USES.has(h.use.toLowerCase()))
  const rest = hops.filter((h) => !TIMELINE_USES.has(h.use.toLowerCase()))

  // Group the off-timeline additions by their raw USE string, preserving file
  // order so "Hop Stand" stays ahead of "Dry Hop" the way the brewer wrote it.
  const groups = new Map<string, Hop[]>()
  for (const hop of rest) {
    const key = hop.use || 'Alte adaosuri'
    const existing = groups.get(key)
    if (existing) existing.push(hop)
    else groups.set(key, [hop])
  }

  const total = hops.reduce((sum, h) => sum + h.amount, 0)

  return (
    <Section title="Hamei" aside={`${formatMass(total)} total`}>
      {onTimeline.length > 0 && boilTime !== null && boilTime > 0 && (
        <BoilTimeline hops={onTimeline} boilTime={boilTime} />
      )}

      {[...groups.entries()].map(([use, groupHops]) => {
        // Hop stands share one temperature across the group; show it once.
        const temp = groupHops.find((h) => h.temperature !== null)?.temperature ?? null
        const time = groupHops[0]?.time ?? null
        const detail = [
          temp !== null ? `${formatNumber(temp)} °C` : '',
          formatDuration(time),
        ]
          .filter(Boolean)
          .join(' · ')

        return (
          <div key={use} className="mt-8">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="eyebrow">{use}</h3>
              {detail && <span className="num text-cream-faint text-[0.95rem]">{detail}</span>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groupHops.map((hop, i) => (
                <HopCard key={`${hop.name}-${i}`} hop={hop} />
              ))}
            </div>
          </div>
        )
      })}
    </Section>
  )
}
