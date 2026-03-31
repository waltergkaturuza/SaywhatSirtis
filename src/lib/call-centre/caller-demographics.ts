/**
 * Caller age bands (stored on call_records.callerAge) and linkage to key population.
 * Legacy: "-14" meant "under 14"; use "1-14" and "ZERO" for unknown/invalid.
 */

export const STORED_AGE_ZERO = 'ZERO'
export const STORED_AGE_1_14 = '1-14'
/** Legacy DB value → maps to 1-14 bucket */
export const LEGACY_AGE_UNDER14 = '-14'

/** Display / analytics bucket order (charts & tables) */
export const DISPLAY_AGE_GROUP_ORDER = [
  'Zero',
  '1-14',
  '15-19',
  '20-24',
  '25+',
] as const

export type DisplayAgeGroup = (typeof DISPLAY_AGE_GROUP_ORDER)[number]

const ORDER_INDEX: Record<string, number> = Object.fromEntries(
  DISPLAY_AGE_GROUP_ORDER.map((g, i) => [g, i])
)

export function displayAgeGroupSortIndex(label: string): number {
  return ORDER_INDEX[label] ?? 999
}

/**
 * Map raw stored callerAge (form value or legacy) to a display bucket.
 */
export function mapStoredCallerAgeToBucket(
  stored: string | null | undefined
): DisplayAgeGroup | null {
  if (stored == null) return null
  const v = String(stored).trim()
  if (v === '') return null

  const u = v.toUpperCase()
  if (u === 'ZERO' || u === '0' || v === 'Zero') return 'Zero'
  if (v === LEGACY_AGE_UNDER14 || v === 'Under 14') return '1-14'
  if (v === '1-14' || v === '1–14') return '1-14'
  if (v === '15-19') return '15-19'
  if (v === '20-24') return '20-24'
  if (v === '25+') return '25+'
  // Legacy edit-form bands (all rolled into 25+ for summary charts)
  if (
    ['25-29', '30-34', '35-39', '40-44', '45-49', '50+'].includes(v)
  ) {
    return '25+'
  }

  const n = parseInt(v, 10)
  if (!Number.isNaN(n) && /^\d+$/.test(v)) {
    if (n === 0) return 'Zero'
    if (n >= 1 && n <= 14) return '1-14'
    if (n >= 15 && n <= 19) return '15-19'
    if (n >= 20 && n <= 24) return '20-24'
    if (n >= 25) return '25+'
  }

  return 'Zero'
}

/** Default key population when age band changes (operators can override). */
export function defaultKeyPopulationForStoredAge(stored: string): string {
  const b = mapStoredCallerAgeToBucket(stored)
  if (!b || b === 'Zero') return 'Invalid'
  if (b === '1-14') return 'Child'
  if (b === '15-19' || b === '20-24') return 'Young Person'
  return 'Adult'
}

export const KEY_POPULATION_COLUMNS = [
  'Child',
  'Young Person',
  'Adult',
  'N/A',
  'Invalid',
] as const

/** Split legacy combined purpose for reporting (DB migration also rewrites rows). */
export function normalizePurposeLabel(purpose: string | null | undefined): string {
  if (!purpose) return 'Unknown'
  if (purpose === 'Information and Counselling') return 'Information (legacy)'
  return purpose
}
