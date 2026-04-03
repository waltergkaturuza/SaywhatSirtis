import {
  indicatorRowProgressPercent,
  projectIndicatorProgressAggregate,
  type IndicatorProgressRow,
} from "./indicator-progress"

function parseNumeric(value: unknown): number {
  if (value === null || value === undefined) return 0
  const n = parseFloat(String(value).replace(/[^0-9.-]/g, ""))
  return Number.isFinite(n) ? n : 0
}

function extractYearNumber(label: string): number {
  if (!label) return 0
  const match = label.match(/\d+/)
  return match ? parseInt(match[0], 10) : 0
}

/** Same shape as Project Indicators: yearly targets from `targets` object. */
function getTargetsArrayFromRaw(targets: unknown): { label: string; value: number }[] {
  if (!targets || typeof targets !== "object" || Array.isArray(targets)) return []
  return Object.entries(targets as Record<string, unknown>)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([label, value]) => ({
      label,
      value: parseNumeric(value),
    }))
    .sort((a, b) => extractYearNumber(a.label) - extractYearNumber(b.label))
}

/**
 * Cumulative denominator aligned with `getCumulativeProgressDenominator` in project-indicators.tsx.
 */
function cumulativeTargetFromRawIndicator(ind: Record<string, unknown>): number {
  const totalTarget = ind.totalTarget
  if (typeof totalTarget === "number" && totalTarget > 0) return totalTarget
  const byYear = getTargetsArrayFromRaw(ind.targets)
  if (byYear.length > 0) {
    const sum = byYear.reduce((s, t) => s + t.value, 0)
    if (sum > 0) return sum
  }
  const t = parseNumeric(ind.target)
  return t > 0 ? t : 0
}

function pushIndicatorRows(ind: unknown, rows: IndicatorProgressRow[]) {
  if (!ind || typeof ind !== "object") return
  const o = ind as Record<string, unknown>
  const target = cumulativeTargetFromRawIndicator(o)
  const current = parseNumeric(o.current)
  rows.push({ current, target })
}

function walkFrameworkObjectives(framework: Record<string, unknown>, rows: IndicatorProgressRow[]) {
  const objectives = framework.objectives
  if (!Array.isArray(objectives)) return
  for (const objective of objectives) {
    if (!objective || typeof objective !== "object") continue
    const outcomes = (objective as { outcomes?: unknown }).outcomes
    if (!Array.isArray(outcomes)) continue
    for (const outcome of outcomes) {
      if (!outcome || typeof outcome !== "object") continue
      const oc = outcome as { indicators?: unknown; outputs?: unknown }
      if (Array.isArray(oc.indicators)) {
        for (const ind of oc.indicators) pushIndicatorRows(ind, rows)
      }
      if (Array.isArray(oc.outputs)) {
        for (const output of oc.outputs) {
          if (!output || typeof output !== "object") continue
          const outs = (output as { indicators?: unknown }).indicators
          if (Array.isArray(outs)) {
            for (const ind of outs) pushIndicatorRows(ind, rows)
          }
        }
      }
    }
  }
}

export function parseResultsFrameworkJson(framework: unknown): Record<string, unknown> | null {
  let fw = framework
  if (typeof fw === "string") {
    try {
      fw = JSON.parse(fw)
    } catch {
      return null
    }
  }
  if (!fw || typeof fw !== "object" || Array.isArray(fw)) return null
  const o = fw as Record<string, unknown>
  if (!Array.isArray(o.objectives)) return null
  return o
}

export function resolveProjectResultsFramework(project: {
  resultsFramework?: unknown
  objectives?: unknown
}): Record<string, unknown> | null {
  const direct = parseResultsFrameworkJson(project.resultsFramework)
  if (direct) return direct
  let obj = project.objectives
  if (typeof obj === "string") {
    try {
      obj = JSON.parse(obj)
    } catch {
      return null
    }
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null
  const inner = (obj as { resultsFramework?: unknown }).resultsFramework
  return parseResultsFrameworkJson(inner)
}

export function extractIndicatorRowsFromResultsFramework(
  framework: unknown
): IndicatorProgressRow[] {
  const parsed = parseResultsFrameworkJson(framework)
  if (!parsed) return []
  const rows: IndicatorProgressRow[] = []
  walkFrameworkObjectives(parsed, rows)
  return rows
}

export function aggregateResultsFrameworkProgress(framework: unknown): {
  percent: number
  hasData: boolean
  indicatorCount: number
} {
  const rows = extractIndicatorRowsFromResultsFramework(framework)
  const agg = projectIndicatorProgressAggregate(rows)
  const indicatorCount = rows.filter(
    (r) => indicatorRowProgressPercent(r.current, r.target) !== null
  ).length
  return {
    percent: agg.percent,
    hasData: agg.hasData,
    indicatorCount,
  }
}
