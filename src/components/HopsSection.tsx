import { formatDuration, formatMass, formatNumber } from '../lib/format'
import { groupInOrder } from '../lib/group'
import type { Hop } from '../lib/types'
import { Section } from './Section'

/** Additions that happen during the boil, grouped by the minute they go in. */
const BOIL_USES = new Set(['boil', 'first wort'])

function hopMeta(hop: Hop): string {
  return [
    hop.form,
    hop.alpha !== null ? `${formatNumber(hop.alpha)}% AA` : '',
    // Only worth naming when it differs from the group it sits in.
    hop.use.toLowerCase() === 'first wort' ? hop.use : '',
  ]
    .filter(Boolean)
    .join(' · ')
}

interface HopGroupProps {
  title: string
  /** Timing or temperature shared by the whole group. */
  detail?: string
  /** Boil groups are titled by a duration, so they get the figure treatment. */
  mono?: boolean
  hops: Hop[]
}

/**
 * One block per moment of addition. Every hop that goes in at the same time
 * lives in the same block, which is what makes this immune to the collisions
 * the old horizontal timeline had when two additions shared a minute.
 */
function HopGroup({ title, detail, mono, hops }: HopGroupProps) {
  return (
    <div className="panel flex flex-col px-6 py-5">
      <div className="border-line flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b pb-4">
        <span
          className={
            mono
              ? 'num text-copper-bright text-[1.75rem] leading-none'
              : 'text-[1.35rem] leading-none font-semibold'
          }
        >
          {title}
        </span>
        {detail && <span className="num text-cream-faint text-[0.95rem]">{detail}</span>}
      </div>

      <ul className="mt-4 flex flex-col gap-4">
        {hops.map((hop, i) => {
          const meta = hopMeta(hop)
          return (
            <li key={`${hop.name}-${i}`} className="flex items-baseline justify-between gap-5">
              <span className="min-w-0">
                <span className="block text-[1.15rem] leading-tight font-semibold">{hop.name}</span>
                {meta && <span className="text-cream-faint block text-[0.9rem]">{meta}</span>}
              </span>
              <span className="num shrink-0 text-[1.2rem]">{formatMass(hop.amount)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function HopsSection({ hops, boilTime }: { hops: Hop[]; boilTime: number | null }) {
  if (hops.length === 0) return null

  const inBoil = hops.filter((h) => BOIL_USES.has(h.use.toLowerCase()))
  const rest = hops.filter((h) => !BOIL_USES.has(h.use.toLowerCase()))

  // Boil additions read as a countdown: the 60-minute charge first, flameout
  // last. Anything without a time sorts to the end rather than jumping ahead.
  const boilGroups = groupInOrder(inBoil, (h) => String(h.time ?? 0)).sort(
    (a, b) => Number(b[0]) - Number(a[0]),
  )

  const restGroups = groupInOrder(rest, (h) => h.use || 'Alte adaosuri')
  const total = hops.reduce((sum, h) => sum + h.amount, 0)

  return (
    <Section title="Hamei" aside={`${formatMass(total)} total`}>
      {boilGroups.length > 0 && (
        <div className="mb-9">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="eyebrow">Fierbere</h3>
            {boilTime !== null && boilTime > 0 && (
              <span className="num text-cream-faint text-[0.95rem]">
                {formatDuration(boilTime)} total
              </span>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boilGroups.map(([time, groupHops]) => (
              <HopGroup key={time} title={formatDuration(Number(time))} mono hops={groupHops} />
            ))}
          </div>
        </div>
      )}

      {restGroups.length > 0 && (
        <div>
          <h3 className="eyebrow mb-3">După fierbere</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restGroups.map(([use, groupHops]) => {
              // A hop stand shares one temperature and time across the group.
              const temp = groupHops.find((h) => h.temperature !== null)?.temperature ?? null
              const detail = [
                temp !== null ? `${formatNumber(temp)} °C` : '',
                formatDuration(groupHops[0]?.time ?? null),
              ]
                .filter(Boolean)
                .join(' · ')

              return <HopGroup key={use} title={use} detail={detail} hops={groupHops} />
            })}
          </div>
        </div>
      )}
    </Section>
  )
}
