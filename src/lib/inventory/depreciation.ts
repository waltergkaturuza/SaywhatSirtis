/**
 * Shared depreciation math for inventory dashboards and reports.
 * Keeps charts and KPIs aligned with asset.depreciationMethod.
 */

export type DepreciableAsset = {
  procurementValue?: number
  currentValue?: number
  depreciationRate?: number
  depreciationMethod?: string | null
  procurementDate?: string | null
  expectedLifespan?: number | null
}

export function yearsOwned(procurementDate: string | null | undefined): number {
  if (!procurementDate) return 0
  const d = new Date(procurementDate)
  if (Number.isNaN(d.getTime())) return 0
  return Math.max(0, (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365))
}

function normalizeMethod(raw?: string | null): string {
  if (!raw) return "straight-line"
  const x = String(raw).toLowerCase().replace(/_/g, "-")
  if (x.includes("declin")) return "declining-balance"
  if (x.includes("sum") && x.includes("year")) return "sum-of-years"
  if (x.includes("unit")) return "units-of-production"
  return "straight-line"
}

function sumOfYearsBookValue(cost: number, lifeYears: number, yearsElapsed: number): number {
  const n = Math.max(1, Math.floor(lifeYears))
  const sum = (n * (n + 1)) / 2
  const t = Math.max(0, Math.min(yearsElapsed, n))
  const whole = Math.floor(t)
  const frac = t - whole
  let accumulated = 0
  for (let k = 1; k <= whole; k++) {
    accumulated += (cost * (n - k + 1)) / sum
  }
  if (frac > 0 && whole < n) {
    accumulated += ((cost * (n - whole)) / sum) * frac
  }
  return Math.max(0, cost - accumulated)
}

/**
 * Estimated book value after time-based depreciation.
 * Falls back to stored currentValue for units-of-production when it looks valid.
 */
export function calculateCurrentValue(asset: DepreciableAsset): number {
  const cost = Number(asset.procurementValue)
  if (!Number.isFinite(cost) || cost <= 0) return 0

  const ratePct = Math.min(Math.max(Number(asset.depreciationRate) || 0, 0), 100)
  const r = ratePct / 100
  const y = yearsOwned(asset.procurementDate ?? undefined)
  const method = normalizeMethod(asset.depreciationMethod)
  const life = Math.max(0, Math.floor(Number(asset.expectedLifespan) || 0))

  switch (method) {
    case "straight-line": {
      const dep = cost * r * y
      return Math.max(0, Math.min(cost, cost - dep))
    }
    case "declining-balance": {
      let book = cost
      const factor = Math.min(r, 0.999)
      const whole = Math.floor(y)
      const frac = y - whole
      for (let i = 0; i < whole; i++) {
        book *= 1 - factor
      }
      book *= 1 - factor * frac
      return Math.max(0, book)
    }
    case "sum-of-years": {
      const n = life > 0 ? life : r > 0 ? Math.max(1, Math.round(1 / r)) : 10
      return sumOfYearsBookValue(cost, n, y)
    }
    case "units-of-production":
    default: {
      const stored = Number(asset.currentValue)
      if (Number.isFinite(stored) && stored >= 0 && stored <= cost * 1.0001) {
        return Math.max(0, Math.min(cost, stored))
      }
      const dep = cost * r * y
      return Math.max(0, Math.min(cost, cost - dep))
    }
  }
}

export function depreciationPercentage(asset: DepreciableAsset): number {
  const cost = Number(asset.procurementValue)
  if (!Number.isFinite(cost) || cost <= 0) return 0
  const book = calculateCurrentValue(asset)
  return ((cost - book) / cost) * 100
}
