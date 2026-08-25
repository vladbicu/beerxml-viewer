import { formatDuration, formatGravity, formatNumber } from '../lib/format'
import { srmToRgb } from '../lib/srm'
import type { Recipe } from '../lib/types'
import { FermentablesSection } from './FermentablesSection'
import { HopsSection } from './HopsSection'
import { MashSection } from './MashSection'
import { MiscSection } from './MiscSection'
import { YeastSection } from './YeastSection'

interface Reading {
  label: string
  value: string
  unit?: string
  accent?: boolean
}

function readings(recipe: Recipe): Reading[] {
  const list: Reading[] = []
  const push = (label: string, value: string, unit?: string, accent?: boolean) => {
    if (value !== '') list.push({ label, value, unit, accent })
  }

  push('OG', formatGravity(recipe.og))
  push('FG', formatGravity(recipe.fg))
  push('ABV', formatNumber(recipe.abv), '%', true)
  push('IBU', formatNumber(recipe.ibu, 0), undefined, true)
  push('SRM', formatNumber(recipe.color))
  push('Volum', formatNumber(recipe.batchSize), 'L')
  // boilSize is null when the source wrote 0, so it simply drops out here.
  push('Fierbere', formatNumber(recipe.boilSize), 'L')
  push('Timp fierbere', formatDuration(recipe.boilTime))
  push('Eficiență', formatNumber(recipe.efficiency, 0), '%')
  push('Calorii', formatNumber(recipe.calories, 0), 'kcal')

  return list
}

function subtitle(recipe: Recipe): string {
  const styleParts = recipe.style
    ? [recipe.style.name, recipe.style.category, recipe.style.guide].filter(Boolean)
    : []
  return [...styleParts, recipe.type].filter(Boolean).join(' · ')
}

function fermentationLabel(recipe: Recipe): string {
  const f = recipe.fermentation
  if (!f) return ''
  const parts: string[] = []
  if (f.primaryAge !== null) parts.push(formatDuration(f.primaryAge * 1440))
  if (f.primaryTemp !== null) parts.push(`${formatNumber(f.primaryTemp)} °C`)
  if (f.stages !== null) parts.push(f.stages === 1 ? '1 etapă' : `${f.stages} etape`)
  return parts.join(' · ')
}

interface RecipeTicketProps {
  recipe: Recipe
  onReset: () => void
  /** Only rendered when a batch export held more than one recipe. */
  position: { index: number; total: number; onNext: () => void } | null
}

export function RecipeTicket({ recipe, onReset, position }: RecipeTicketProps) {
  const stats = readings(recipe)
  const fermentation = fermentationLabel(recipe)
  const beerColor = srmToRgb(recipe.color)

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="eyebrow">BeerXML Viewer</p>
        <div className="flex items-center gap-3">
          {position && (
            <>
              <span className="num text-cream-faint text-[0.95rem]">
                Rețeta {position.index + 1} / {position.total}
              </span>
              <button
                type="button"
                onClick={position.onNext}
                className="border-line-strong text-cream cursor-pointer rounded border px-4 py-2 text-[0.95rem] font-medium"
              >
                Următoarea →
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onReset}
            className="border-line-strong text-cream-dim cursor-pointer rounded border px-4 py-2 text-[0.95rem] font-medium"
          >
            Încarcă altă rețetă
          </button>
        </div>
      </div>

      <article className="bg-oak flex overflow-hidden rounded-md">
        {/* Vertical band carrying the beer's actual SRM colour. */}
        <div className="w-3 shrink-0 sm:w-5" style={{ backgroundColor: beerColor }} />

        <div className="min-w-0 flex-1">
          <header className="px-7 py-9 sm:px-10 sm:py-11">
            <h1 className="font-display text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.05] font-semibold">
              {recipe.name}
            </h1>
            {subtitle(recipe) && (
              <p className="text-copper-bright mt-3 text-[1.2rem]">{subtitle(recipe)}</p>
            )}
            {(recipe.brewer || recipe.date) && (
              <p className="text-cream-faint mt-2 text-[1.05rem]">
                {[recipe.brewer, recipe.date].filter(Boolean).join(' · ')}
              </p>
            )}
          </header>

          <div className="border-line grid grid-cols-2 gap-x-6 gap-y-8 border-t px-7 py-9 sm:px-10 md:grid-cols-4 lg:grid-cols-5">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className={`stat-value ${stat.accent ? 'text-copper-bright!' : ''}`}>
                  {stat.value}
                  {stat.unit && <span className="stat-unit">{stat.unit}</span>}
                </p>
                <p className="stat-label mt-3">{stat.label}</p>
              </div>
            ))}
          </div>

          {(recipe.ibuMethod || fermentation) && (
            <div className="border-line text-cream-faint flex flex-wrap gap-x-8 gap-y-2 border-t px-7 py-5 text-[1rem] sm:px-10">
              {recipe.ibuMethod && <span>IBU după {recipe.ibuMethod}</span>}
              {fermentation && <span>Fermentare: {fermentation}</span>}
            </div>
          )}

          <FermentablesSection fermentables={recipe.fermentables} />
          <HopsSection hops={recipe.hops} boilTime={recipe.boilTime} />
          <MashSection steps={recipe.mashSteps} mashName={recipe.mashName} />
          <YeastSection yeasts={recipe.yeasts} />
          <MiscSection miscs={recipe.miscs} />

          {recipe.notes && (
            <section className="border-line border-t px-7 py-9 sm:px-10">
              <h2 className="section-title mb-4">Note</h2>
              <p className="text-cream-dim max-w-[70ch] text-[1.1rem] whitespace-pre-wrap">
                {recipe.notes}
              </p>
            </section>
          )}
        </div>
      </article>
    </div>
  )
}
