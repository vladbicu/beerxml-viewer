import { useState } from 'react'
import { formatGravity, formatNumber } from '../lib/format'
import { hopNames, subtitle, yeastNames } from '../lib/recipeSummary'
import { srmToEbc, srmToRgb } from '../lib/srm'
import type { Tap } from '../lib/tapList'
import { useFitToScreen } from '../lib/useFitToScreen'
import type { Theme } from '../lib/useTheme'
import { Mark } from './Mark'
import { TapUpload } from './TapUpload'
import { ThemeToggle } from './ThemeToggle'

interface TapBoardProps {
  taps: Tap[]
  errors: string[]
  onAdd: (files: File[]) => void
  onRemove: (id: string) => void
  onMove: (from: number, to: number) => void
  onClear: () => void
  theme: Theme
  onToggleTheme: () => void
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  if (value === '') return null
  return (
    <div className="text-right">
      <p className={`num text-[2rem] leading-none font-medium ${accent ? 'text-copper-bright' : ''}`}>
        {value}
      </p>
      <p className="stat-label mt-1.5 text-[0.65rem]">{label}</p>
    </div>
  )
}

/** Six dots — the usual "drag me" affordance, no mouse-only tooltip needed. */
function Grip() {
  return (
    <svg viewBox="0 0 12 20" width="12" height="20" aria-hidden="true" className="fill-current">
      {[4, 10, 16].map((cy) =>
        [3, 9].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.4" />),
      )}
    </svg>
  )
}

/**
 * The whole tap list on one screen, for a television behind the bar. Same
 * approach as CondensedTicket: lay the rows out at their natural size, measure
 * once, scale the lot down to fit. No page scroll is possible — the viewport is
 * the frame.
 */
export function TapBoard({
  taps,
  errors,
  onAdd,
  onRemove,
  onMove,
  onClear,
  theme,
  onToggleTheme,
}: TapBoardProps) {
  const { containerRef, contentRef, scale } = useFitToScreen(taps)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const handleDrop = (target: number) => {
    if (dragIndex !== null && dragIndex !== target) onMove(dragIndex, target)
    setDragIndex(null)
    setOverIndex(null)
  }

  const clear = () => {
    if (window.confirm('Golești tot ce e la robinete?')) onClear()
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-6 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8">
            <Mark ink="var(--cream)" fill="var(--copper)" />
          </span>
          <span className="wordmark text-[1.05rem]">Robinete</span>
          <span className="num text-cream-faint text-[0.9rem]">{taps.length}</span>
        </div>

        <div className="flex items-center gap-3">
          <TapUpload onFiles={onAdd} />
          <button
            type="button"
            onClick={clear}
            className="border-line-strong text-cream-dim cursor-pointer rounded border px-4 py-2 text-[0.9rem] font-medium"
          >
            Golește
          </button>
          <a
            href="/index.html"
            className="border-line-strong text-cream-dim rounded border px-4 py-2 text-[0.9rem] font-medium no-underline"
          >
            ← Încarcă o rețetă
          </a>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>

      {errors.length > 0 && (
        <div role="alert" className="text-danger shrink-0 px-6 pb-2 text-[0.9rem]">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      <div ref={containerRef} className="min-h-0 flex-1 px-6 pb-5">
        <div
          ref={contentRef}
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
          className="mx-auto w-full max-w-[1400px]"
        >
          <ul className="divide-line divide-y">
            {taps.map((tap, i) => {
              const { recipe } = tap
              const gravity =
                formatGravity(recipe.og) && formatGravity(recipe.fg)
                  ? `${formatGravity(recipe.og)}→${formatGravity(recipe.fg)}`
                  : formatGravity(recipe.og) || formatGravity(recipe.fg)
              const hops = hopNames(recipe)
              const yeasts = yeastNames(recipe)
              const ebc = srmToEbc(recipe.color)

              return (
                <li
                  key={tap.id}
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragEnter={() => setOverIndex(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(i)}
                  onDragEnd={() => {
                    setDragIndex(null)
                    setOverIndex(null)
                  }}
                  className={`flex items-center gap-5 py-4 ${
                    dragIndex === i ? 'opacity-40' : ''
                  } ${overIndex === i && dragIndex !== i ? 'bg-oak-raised' : ''}`}
                >
                  <span className="text-cream-faint shrink-0 cursor-grab" aria-hidden="true">
                    <Grip />
                  </span>

                  <div className="flex shrink-0 flex-col items-center gap-1.5">
                    {/* A big square so a drinker can actually read the colour
                        across the room; the well behind it turns dark on the
                        light theme so pale beers don't vanish into paper. */}
                    <span
                      className="h-20 w-20"
                      style={{
                        backgroundColor: 'var(--stripe-well)',
                        padding: 'var(--stripe-well-pad)',
                      }}
                    >
                      <span
                        className="block h-full w-full"
                        style={{
                          backgroundColor: srmToRgb(recipe.color),
                          borderRadius: 'var(--stripe-radius)',
                        }}
                      />
                    </span>
                    {recipe.color !== null && (
                      <span className="num text-cream-faint text-[0.7rem] whitespace-nowrap">
                        SRM {formatNumber(recipe.color)} · EBC {formatNumber(ebc, 0)}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="display-title truncate text-[1.9rem] leading-tight">
                      {recipe.name}
                    </p>
                    {subtitle(recipe) && (
                      <p className="text-copper-bright truncate text-[0.95rem]">{subtitle(recipe)}</p>
                    )}
                    {(hops.length > 0 || yeasts.length > 0) && (
                      <dl className="mt-2 space-y-0.5 text-[0.95rem] leading-tight">
                        {hops.length > 0 && (
                          <div className="flex gap-2.5">
                            <dt className="eyebrow shrink-0 pt-[0.15rem] text-[0.65rem]">Hamei</dt>
                            <dd className="text-cream-dim min-w-0 truncate">{hops.join(' · ')}</dd>
                          </div>
                        )}
                        {yeasts.length > 0 && (
                          <div className="flex gap-2.5">
                            <dt className="eyebrow shrink-0 pt-[0.15rem] text-[0.65rem]">Drojdie</dt>
                            <dd className="text-cream-dim min-w-0 truncate">{yeasts.join(' · ')}</dd>
                          </div>
                        )}
                      </dl>
                    )}
                  </div>

                  <div className="flex shrink-0 items-end gap-7">
                    <Stat value={formatNumber(recipe.abv)} label="ABV" accent />
                    <Stat value={formatNumber(recipe.ibu, 0)} label="IBU" />
                    <Stat value={gravity} label="OG · FG" />
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(tap.id)}
                    aria-label={`Scoate ${recipe.name} de la robinet`}
                    className="text-cream-faint hover:text-danger shrink-0 cursor-pointer px-2 text-[1.5rem] leading-none"
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
