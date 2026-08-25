import { formatDuration, formatGravity, formatNumber } from './format'
import type { Recipe } from './types'

export interface Reading {
  label: string
  value: string
  unit?: string
  accent?: boolean
}

/**
 * The headline figures, in display order. Shared by both views so the detailed
 * ticket and the condensed one can never drift apart on the numbers.
 *
 * Anything that formats to an empty string is dropped rather than rendered as a
 * blank or a zero — which is how BOIL_SIZE=0 disappears instead of showing "0 L".
 */
export function readings(recipe: Recipe): Reading[] {
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
  push('Fierbere', formatNumber(recipe.boilSize), 'L')
  push('Timp fierbere', formatDuration(recipe.boilTime))
  push('Eficiență', formatNumber(recipe.efficiency, 0), '%')
  push('Calorii', formatNumber(recipe.calories, 0), 'kcal')

  return list
}

export function subtitle(recipe: Recipe): string {
  const styleParts = recipe.style
    ? [recipe.style.name, recipe.style.category, recipe.style.guide].filter(Boolean)
    : []
  return [...styleParts, recipe.type].filter(Boolean).join(' · ')
}

export function fermentationLabel(recipe: Recipe): string {
  const f = recipe.fermentation
  if (!f) return ''
  const parts: string[] = []
  if (f.primaryAge !== null) parts.push(formatDuration(f.primaryAge * 1440))
  if (f.primaryTemp !== null) parts.push(`${formatNumber(f.primaryTemp)} °C`)
  if (f.stages !== null) parts.push(f.stages === 1 ? '1 etapă' : `${f.stages} etape`)
  return parts.join(' · ')
}
