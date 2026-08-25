export interface Fermentable {
  name: string
  type: string
  amount: number // kg
  yield: number | null // %
  color: number | null // °L
}

/**
 * `use` is kept as the raw string from the file rather than a union: BeerXML
 * apps invent their own values ("Hop Stand", "Whirlpool", "First Wort"), and a
 * union would reject files we could otherwise display fine.
 */
export interface Hop {
  name: string
  alpha: number | null // %
  amount: number // kg
  use: string
  time: number | null // min
  form: string
  temperature: number | null // °C, only on hop stand / whirlpool additions
}

export interface Yeast {
  name: string
  type: string
  form: string
  amount: number | null
  /** false means the AMOUNT is a volume per spec — but sources use it for "packets". */
  amountIsWeight: boolean
  attenuation: number | null // %
  laboratory: string
  productId: string
}

export interface Misc {
  name: string
  type: string
  use: string
  amount: number | null // kg
  /** Pre-formatted by the source app (e.g. "25 g"); preferred for display. */
  displayAmount: string
  time: number | null // min
}

export interface MashStep {
  name: string
  type: string
  stepTemp: number | null // °C
  stepTime: number | null // min
  rampTime: number | null // min
  endTemp: number | null // °C
}

export interface Style {
  name: string
  /** "21B" — composed from CATEGORY_NUMBER + STYLE_LETTER when CATEGORY is absent. */
  category: string
  guide: string
}

export interface Fermentation {
  stages: number | null
  primaryAge: number | null // days
  primaryTemp: number | null // °C
}

export interface Recipe {
  name: string
  type: string
  brewer: string
  date: string
  batchSize: number | null // L
  /** null when the source wrote 0 or omitted it — never render "0 L". */
  boilSize: number | null // L
  boilTime: number | null // min
  efficiency: number | null // %
  og: number | null
  fg: number | null
  abv: number | null // % — derived from og/fg when absent
  ibu: number | null
  ibuMethod: string
  color: number | null // SRM
  calories: number | null
  notes: string
  style: Style | null
  fermentables: Fermentable[]
  hops: Hop[]
  yeasts: Yeast[]
  miscs: Misc[]
  mashSteps: MashStep[]
  mashName: string
  fermentation: Fermentation | null
}

export interface ParseResult {
  recipes: Recipe[]
  /** One entry per recipe that failed to parse; valid siblings still come through. */
  errors: string[]
}
